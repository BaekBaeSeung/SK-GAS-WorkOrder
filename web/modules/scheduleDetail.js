import { getCurrentTime, getCurrentDate, getCurrentDay, fetchUserProfile, fetchNoticeCount, logout, formatTime, showErrorModal } from './utils.js'; // 유틸 함수 임포트
import debounce from 'lodash/debounce';
import { downloadExcel } from './xlsx.js';

let isLoading = false;
let controller = new AbortController();

export const renderScheduleDetailPage = debounce(async function(container, scheduleData = {}, sections = []) {
    if (isLoading) return;
    isLoading = true;

    try {
        // 이전 요청 취소
        controller.abort();
        controller = new AbortController();

        // 로컬 스토리지에서 섹션 데이터와 스케줄 데이터 불러오기
        const storedData = JSON.parse(localStorage.getItem('scheduleData')) || {};
        const storedSections = JSON.parse(localStorage.getItem('scheduleSections')) || {};
        
        scheduleData = Object.keys(scheduleData).length > 0 ? scheduleData : storedData;
        sections = sections.length > 0 ? sections : storedSections;
        console.log("scheduleData : ",scheduleData);
        console.log("sections : ",sections);

        // 데이터를 로컬 스토리지에 저장
        localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
        localStorage.setItem('scheduleSections', JSON.stringify(sections));

        const sectionData = JSON.parse(localStorage.getItem('currentSectionData')) || {};

        const userProfile = await fetchUserProfile(controller.signal);
        const noticeCount = await fetchNoticeCount(controller.signal);
        console.log('User Profile:', userProfile); // 사용자 프로필 정보 출력 (디버깅용)
        console.log('Notice Count:', noticeCount); // 공지사항 개수 출력 (디버깅용)
        console.log("scheduleData.date : ", scheduleData.date); // 스케줄 데이터 출력 (디버깅용)

        // 서버에서 스케줄 데이터 가져오기
        let scheduleResponse;
        if (userProfile.isAdmin === 'ADMIN') {
            scheduleResponse = await fetch('/api/schedule/all', { signal: controller.signal }); // 모든 스케줄 데이터 가져오기
        } else {
            scheduleResponse = await fetch('/api/schedule', { signal: controller.signal });
        }

        if (!scheduleResponse.ok) {
            throw new Error('Failed to fetch schedules');
        }

        const schedules = await scheduleResponse.json();
        const initial = schedules.length > 0 ? schedules[0].schedule_type.toUpperCase() : '';

        // 스케줄 관련 데이터를 한 번에 조회
        const sectionNames = sections.map(section => section.section).join(',');
        console.log("sectionNames : ", sectionNames);
        let detailsData = {};
        try {
            const detailsResponse = await fetch(`/api/schedule-details?area_name=${scheduleData.area_name}&schedule_type=${scheduleData.schedule_type}&time=${scheduleData.time}&sections=${encodeURIComponent(sectionNames)}&user_id=${userProfile.userId}&date=${scheduleData.date}&isAdmin=${userProfile.isAdmin}`);
            console.log("detailsResponse59 : ",detailsResponse);
            if (detailsResponse.ok) {
                detailsData = await detailsResponse.json();
                // 여기에 scheduleDetails를 로컬 스토리지에 저장하는 코드 추가
                localStorage.setItem('scheduleDetails', JSON.stringify(detailsData.details));
            } else if (detailsResponse.status === 404) {
                console.warn('No working details found.');
            } else {
                console.warn('Failed to fetch schedule details:', detailsResponse.statusText);
            }
        } catch (fetchError) {
            console.warn('Error fetching schedule details:', fetchError);
        }

        const { areaId, workTimeId, details = [] } = detailsData; // details가 없을 경우 빈 배열로 초기화
        console.log("details : ", details); // 모든 행의 데이터를 출력

        container.innerHTML = `
            <head>
                <link rel="stylesheet" href="/styles/scheduleDetail.css">
            </head>
            <div class="grid-detail-container">
                <div class="sticky-header";> <!-- sticky-header 클래스 추가 -->
                    <img src="./assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo" id="logo">
                    <div class="header">
                        <img src="./assets/img/common/${userProfile.profile_pic}" alt="Avatar" class="avatar" id="avatar" style="object-fit: cover;">
                        <span class="initial" style="${userProfile.isAdmin === 'ADMIN' ? 'opacity: 0;' : ''}">${schedules[0].schedule_type.toUpperCase()}</span>
                        <div class="time-container">
                            <div class="time-date">
                                <span class="time">${formatTime(getCurrentTime())}</span>
                                <span class="date">${getCurrentDate()}</span> 
                            </div>
                            <span class="day">${getCurrentDay()}</span>
                        </div>
                    </div>
                    <div class="notice" id="notice">
                        <p>공지사항 [${noticeCount}] <span class="dash" >●</span></p>
                    </div>
                </div>
                <div class="schedule-detail">
                    <div class="schedule-item">
                        <div class="location-time">
                            <p class="location">${scheduleData.area_name || 'N/A'}</p>
                            <p class="time">${scheduleData.schedule_type === 'm' ? 'Morning' : scheduleData.schedule_type === 's' ? 'Swing' : 'Night'} ${scheduleData.time || 'N/A'}</p>
                        </div>
                        ${sections.map((section, index) => {
                            const isActive = details.some(detail => detail.section === section.section);
                            return `
                            <div class="task">
                                <div class="task-item" data-task-id="${section.section_id}">
                                    <span class="task-number ${isActive ? 'input-active' : ''}">${String(index + 1).padStart(2, '0')}</span>
                                    <p class="task-name">${section.section}</p>
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            <div id="modal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <button id="logout-button">로그아웃</button>
                </div>
            </div>
        `;

        document.getElementById('notice').addEventListener('click', () => {
            navigateTo('/notice');
        });

        document.querySelectorAll('.task-item').forEach(item => {
            item.addEventListener('click', async () => {
                const sectionId = item.dataset.taskId;
                console.log("sectionId : ",sectionId);
                const sectionName = item.querySelector('.task-name').textContent;
                
                try {
                    // SubSection 데이터 가져오기
                    const response = await fetch(`/api/subsections/${sectionId}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch subsections');
                    }
                    const subSections = await response.json();
                    
                    

                    // 현재 스케줄 데이터와 섹션 정보를 로컬 스토리지에 저장
                    localStorage.setItem('currentScheduleData', JSON.stringify(scheduleData));
                    localStorage.setItem('currentSectionData', JSON.stringify({
                        sectionId,
                        sectionName,
                        subSections
                    }));


                    // 스케줄 디테일 디테일 페이지로 이동
                    navigateTo(`/scheduleDetailDetail/${sectionId}`,{
                        initial: initial
                    });
                } catch (error) {
                    console.error('Error fetching subsections:', error);
                    alert('서브섹션 데이터를 가져오는데 실패했습니다.');
                }
            });
        });

        // 모달 관련 이벤트 리스너 추가
        const modal = document.getElementById('modal');
        const avatar = document.getElementById('avatar');
        const closeModal = document.querySelector('.close');
        const logoutButton = document.getElementById('logout-button');

        avatar.addEventListener('click', () => {
            modal.style.display = 'block';
        });

        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });

        logoutButton.addEventListener('click', () => {
            logout(); // 로그아웃 요청
            modal.style.display = 'none';
        });

        // 로고 클릭 시 스케줄 페이지로 이동
        document.getElementById('logo').addEventListener('click', () => {
            navigateTo('/schedule');
        });
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Fetch aborted');
        } else {
            console.error('Error details:', error);
            showErrorModal('사용자 정보 또는 공지사항 개수를 가져오는데 실패했습니다.');
        }
    } finally {
        isLoading = false;
    }
}, 0);  // 300ms 디바운스 적용

function updateTime() {
    const currentTimeElem = document.querySelector('.time');
    const currentDateElem = document.querySelector('.date');
    const currentDayElem = document.querySelector('.day');

    if (currentTimeElem) {
        currentTimeElem.innerHTML = formatTime(getCurrentTime());
    }
    if (currentDateElem) {
        currentDateElem.textContent = getCurrentDate();
    }
    if (currentDayElem) {
        currentDayElem.textContent = getCurrentDay();
    }
 

    requestAnimationFrame(updateTime);
}

updateTime();

function showConfirmModal(message) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        modal.innerHTML = `
            <div class="confirm-modal-content">
                <p>${message}</p>
                <button id="confirm-yes">확인</button>
                <button id="confirm-no">취소</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('confirm-yes').addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(true);
        });

        document.getElementById('confirm-no').addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(false);
        });
    });
}