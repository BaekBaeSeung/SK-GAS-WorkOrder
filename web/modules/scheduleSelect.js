import { renderNoticePage } from './notice.js';
import { renderPreviousPage } from './previous.js';
import { renderScheduleDetailPage } from './scheduleDetail.js'; // scheduleDetail.js 파일에서 스케줄 상세 페이지 정의
import { getCurrentTime, getCurrentDate, getCurrentDay, fetchUserProfile, logout, formatTime } from './utils.js'; // 유틸 함수 임포트

export async function renderScheduleSelectPage(container) {
    try {
        const userProfile = await fetchUserProfile();
        console.log('User ProfileProfileProfile:', userProfile.userId); // 사용자 프로필 정보 출력 (디버깅용)


        // workingtime 데이터를 조회
        const workingTimesResponse = await fetch('/api/working-times');
        const workingTimes = await workingTimesResponse.json();
        console.log('Working Times:', workingTimes); // workingtime 데이터 출력 (디버깅용)

        // area_id로 workingarea 데이터를 조회하여 area_name을 가져옴
        const areaNames = await Promise.all(workingTimes.map(async (schedule) => {
            
            const response = await fetch(`/api/working-area/${schedule.area_id}`);
            const area = await response.json();
            return area.area_name;
        }));


        // foreman을 조회하여 user_id를 가져옴
        const foremanResponse = await fetch('/api/foreman');
        const foremanData = await foremanResponse.json();
        const foremanId = foremanData.user_id;

        // 시간순서대로 정렬
        workingTimes.sort((a, b) => {
            const timeA = a.time.split(':').map(Number);
            const timeB = b.time.split(':').map(Number);
            return timeA[0] - timeB[0] || timeA[1] - timeB[1];
        });

        // 서버에서 스케줄 데이터 가져오기
        let response;
        if (userProfile.isAdmin === 'ADMIN') {
            response = await fetch('/api/schedule/all'); // 모든 스케줄 데이터 가져오기
        } else {
            response = await fetch('/api/schedule/today');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch schedules');
        }

        const schedules = await response.json();
        console.log('Today\'s Schedules:', schedules); // 오늘 날짜의 스케줄 데이터 출력 (디버깅용)

        // uniqueSchedules 생성
        const uniqueSchedules = schedules.reduce((acc, schedule) => {
            if (!acc.some(item => item.time === schedule.time)) {
                acc.push(schedule);
            }
            return acc;
        }, []);

        // 오늘 날짜와 같은 스케줄만 필터링
        const today = new Date();
        const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const todaySchedules = uniqueSchedules.filter(schedule => {
            console.log("schedule.create_at : ", schedule.create_at);
            const scheduleDate = new Date(schedule.create_at.replace(' ', 'T')); // 공백을 'T'로 대체하여 Date 객체로 변
            const scheduleDateString = `${scheduleDate.getFullYear()}-${String(scheduleDate.getMonth() + 1).padStart(2, '0')}-${String(scheduleDate.getDate()).padStart(2, '0')}`;
            return scheduleDateString === todayDateString;
        });

        // 스케줄 페이지 숫자 표시 (10보다 작을 때 앞에 0 추가)
        const scheduleCount = todaySchedules.length < 10 ? `0${todaySchedules.length}` : todaySchedules.length;
        console.log("scheduleCount : ", scheduleCount);

        // 어드민 사용자와 일반 사용자에 따라 다른 HTML 렌더링
        container.innerHTML = `
            <head>
                <link rel="stylesheet" href="/styles/schedule.css">
            </head>
            <div class="schedule-container">
                <div class="sticky-header"> <!-- sticky-header 클래스 추가 -->
                    <img src="./assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo" id="logo">
                    <div class="header">
                        <img src="./assets/img/common/${userProfile.profile_pic}" alt="Avatar" class="avatar" id="avatar" style="object-fit: cover;">
                        <span class="initial" style="visibility: hidden;">M</span>
                        <div class="time-container">
                            <div class="time-date">
                                <span class="time">${formatTime(getCurrentTime())}</span>
                                <span class="date">${getCurrentDate()}</span>
                            </div>
                            <span class="day">${getCurrentDay()}</span>
                        </div> 
                    </div>
                    <div class="notice" id="go-to-schedule">
                        <p>스케줄 페이지 [${scheduleCount}]<span class="dash">●</span></p>
                    </div>
                </div>
                
                <div class="schedule">
                    ${workingTimes.map((schedule, index) => `
                        <div class="schedule-item" data-shift="${schedule.schedule_type}" data-time="${schedule.time}" data-area-name="${areaNames[index]}" data-schedule-type="${schedule.schedule_type}">
                            <p class="location">${areaNames[index] || 'Unknown'}</p>
                            <div class="shift-time">
                                <p class="shift">${schedule.schedule_type === 'm' ? 'Morning' : schedule.schedule_type === 's' ? 'Swing' : 'Night'}</p>
                                <p class="time">${schedule.time}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

            </div>
            <div id="modal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <button id="logout-button">로그아웃</button>
                </div>
            </div>
        `;


        // 스케줄 아이템 클릭 이벤트 리스너 추가
        document.querySelectorAll('.schedule-item').forEach(item => {
            item.addEventListener('click', async () => {
                const areaName = item.getAttribute('data-area-name');
                const section = 'All';
                const scheduleType = item.getAttribute('data-schedule-type');
                const time = item.getAttribute('data-time');
                const createAt = new Date().toISOString();
                const userId = userProfile.userId;
                const foreman = foremanId;
                const worker = userProfile.userId;
                

                const data = {
                    area_name: areaName,
                    section: section,
                    schedule_type: scheduleType,
                    time: time,
                    create_at: createAt,
                    user_id: userId,
                    foreman: foreman,
                    worker: worker
                };
                console.log("data : ", data);
                

                // 스케줄 중복 확인
                const isDuplicate = uniqueSchedules.some(schedule => {
                    const scheduleDate = new Date(schedule.create_at);
                    const scheduleDateString = `${scheduleDate.getFullYear()}-${String(scheduleDate.getMonth() + 1).padStart(2, '0')}-${String(scheduleDate.getDate()).padStart(2, '0')}`;
                    return schedule.area_name === areaName && 
                           schedule.schedule_type === scheduleType && 
                           schedule.time === time &&
                           scheduleDateString === todayDateString;
                });

                if (isDuplicate) {
                    showModal('이미 존재하는 스케줄입니다.');
                    return;
                }

                try {
                    const response = await fetch('/api/insert-schedule', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    if (result.success) {
                        showModal('선택하신 스케줄이 배정되었습니다.');
                        // 스케줄 데이터를 다시 가져와서 숫자 업데이트
                        await updateScheduleCount();
                    } else {
                        showModal('스케줄이 배정에 실패했습니다.');
                    }
                } catch (error) {
                    console.error('Error inserting schedule:', error);
                    showModal('데이터 저장 중 오류가 발생했습니다.');
                }
            });
        });

        // 스케줄 데이터를 다시 가져와서 숫자 업데이트하는 함수
        async function updateScheduleCount() {
            try {
                const response = await fetch('/api/schedule/today');
                if (!response.ok) {
                    throw new Error('Failed to fetch schedules');
                }
                const schedules = await response.json();
                const uniqueSchedules = schedules.reduce((acc, schedule) => {
                    if (!acc.some(item => item.time === schedule.time)) {
                        acc.push(schedule);
                    }
                    return acc;
                }, []);
                const today = new Date();
                const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const todaySchedules = uniqueSchedules.filter(schedule => {
                    const scheduleDate = new Date(schedule.create_at.replace(' ', 'T'));
                    const scheduleDateString = `${scheduleDate.getFullYear()}-${String(scheduleDate.getMonth() + 1).padStart(2, '0')}-${String(scheduleDate.getDate()).padStart(2, '0')}`;
                    return scheduleDateString === todayDateString;
                });
                const scheduleCount = todaySchedules.length < 10 ? `0${todaySchedules.length}` : todaySchedules.length;
                const goToScheduleElement = document.querySelector('#go-to-schedule p');
                goToScheduleElement.innerHTML = `스케줄 페이지 [${scheduleCount}]<span class="dash">●</span>`;
            } catch (error) {
                console.error('Error updating schedule count:', error);
            }
        }

        // 모달 관련 이벤트 리스너 추가
        const modal = document.getElementById('modal');
        const avatar = document.getElementById('avatar');
        const closeModal = document.querySelector('.close');
        const logoutButton = document.getElementById('logout-button');

        avatar.addEventListener('click', () => {
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <button id="logout-button">로그아웃</button>
                </div>
            `;
            modal.style.display = 'block';

            document.querySelector('.close').addEventListener('click', () => {
                modal.style.display = 'none';
            });

            document.getElementById('logout-button').addEventListener('click', () => {
                logout(); // 로그아웃 요청
                modal.style.display = 'none';
            });
        });

        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });

        // 로고 클릭 시 스케줄 페이지로 이동
        document.getElementById('logo').addEventListener('click', () => {
            navigateTo('/schedule');
        });
        
        // 스케줄 페이지로 이동 버튼 클릭 이벤트 리스너 추가
        document.getElementById('go-to-schedule').addEventListener('click', () => {
            navigateTo('/schedule');
        });
    } catch (error) {
        console.error('Error fetching user profile or working times:', error);
        alert('사용자 정보 또는 스케줄을 가져오는데 실패했습니다.');
    }
}

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

// 모달 표시 함수
function showModal(message) {
    const modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = `
        <span class="close">&times;</span>
        <p>${message}</p>
    `;
    modal.style.display = 'block';
    document.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
}
