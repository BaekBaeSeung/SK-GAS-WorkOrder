import { renderNoticePage } from './notice.js';
import { renderPreviousPage } from './previous.js';
import { renderScheduleDetailPage } from './scheduleDetail.js'; // scheduleDetail.js 파일에서 스케줄 상세 페이지 정의
import { getCurrentTime, getCurrentDate, getCurrentDay, fetchUserProfile, fetchNoticeCount, logout, formatTime} from './utils.js'; // 유틸 함수 임포트
import debounce from 'lodash/debounce';
import { downloadExcel } from './xlsx.js'; // xlsx.js에서 downloadExcel 함수 import

// AbortController 인스턴스를 모듈 스코프에 선언
let controller = new AbortController();

let isLoading = false;

export const renderSchedulePage = debounce(async function(container) {
    if (isLoading) return;
    isLoading = true;

    try {
        // 이전 요청 취소
        controller.abort();
        controller = new AbortController();



        const userProfile = await fetchUserProfile(controller.signal);
        const noticeCount = await fetchNoticeCount(controller.signal);
        console.log('User Profile:', userProfile); // 사용자 프로필 정보 출력 (디버깅용)
        console.log('Notice Count:', noticeCount); // 공지사항 개수 출력 (디버깅용)

        // 서버에서 스케줄 데이터 가져오기
        let response;
        if (userProfile.isAdmin === 'ADMIN') {
            response = await fetch('/api/schedule/all', { signal: controller.signal }); // 모든 스케줄 데이터 가져오기
        } else {
            response = await fetch('/api/schedule', { signal: controller.signal });
        }

        if (!response.ok) {
            throw new Error('Failed to fetch schedules');
        }

        const schedules = await response.json();
        console.log('Schedules:', schedules); // 스케줄 데이터 출력 (디버깅용)

        const today = new Date();
        const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // 스케줄 데이터가 없거나, 모든 스케줄의 create_at이 오늘 날짜가 아닌 경우 스케줄 선택 페이지로 이동
        const hasTodaySchedule = schedules.some(schedule => {
            const scheduleDate = new Date(schedule.create_at);
            const scheduleDateString = `${scheduleDate.getFullYear()}-${String(scheduleDate.getMonth() + 1).padStart(2, '0')}-${String(scheduleDate.getDate()).padStart(2, '0')}`;
            return scheduleDateString === todayDateString;
        });

        if (schedules.length === 0 || (!hasTodaySchedule && userProfile.isAdmin !== 'ADMIN')) {
            navigateTo('/scheduleSelect');
            return;
        }

        const formattedDate = `${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()}`;

        const todaySchedules = schedules.filter(schedule => {
            const scheduleDate = new Date(schedule.create_at);
            const scheduleDateString = `${scheduleDate.getFullYear()}-${String(scheduleDate.getMonth() + 1).padStart(2, '0')}-${String(scheduleDate.getDate()).padStart(2, '0')}`;
            return scheduleDateString === todayDateString;
        });

        const previousSchedules = schedules.filter(schedule => {
            const scheduleDate = new Date(schedule.create_at);
            const scheduleDateString = `${scheduleDate.getFullYear()}-${String(scheduleDate.getMonth() + 1).padStart(2, '0')}-${String(scheduleDate.getDate()).padStart(2, '0')}`;
            return scheduleDateString !== todayDateString;
        });

        // 중복 제거 및 카운트
        const uniquePreviousSchedules = previousSchedules.reduce((acc, schedule) => {
            const scheduleDate = new Date(schedule.create_at);
            const scheduleDateString = `${scheduleDate.getFullYear()}-${String(scheduleDate.getMonth() + 1).padStart(2, '0')}-${String(scheduleDate.getDate()).padStart(2, '0')}`;
            if (!acc.some(item => {
                const itemDate = new Date(item.create_at);
                const itemDateString = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}-${String(itemDate.getDate()).padStart(2, '0')}`;
                return item.time === schedule.time && itemDateString === scheduleDateString;
            })) {
                acc.push(schedule);
            }
            return acc;
        }, []);

        // 이전 점검 기록 카드 스택 생성
        let previousRecordsHTML = '';
        const uniquePreviousSchedulesCount = uniquePreviousSchedules.length;
        for (let i = 0; i < Math.min(uniquePreviousSchedulesCount, 3); i++) {
            const recordCount = uniquePreviousSchedulesCount < 10 ? `0${uniquePreviousSchedulesCount}` : uniquePreviousSchedulesCount;
            previousRecordsHTML += `
                <div class="previous-records" id="previous-records-${i + 1}">
                    <p>이전 점검 기록 [${recordCount}]</p>
                </div>
            `;
        }

        // 현재 시간을 기준으로 스케줄 정렬
        const currentHour = today.getHours();
        const timeSlots = [
            { start: 0, end: 3, label: '00:00' },
            { start: 4, end: 7, label: '04:00' },
            { start: 8, end: 11, label: '08:00' },
            { start: 12, end: 15, label: '12:00' },
            { start: 16, end: 19, label: '16:00' },
            { start: 20, end: 23, label: '20:00' }
        ];

        const currentSlot = timeSlots.find(slot => currentHour >= slot.start && currentHour <= slot.end);
        if (currentSlot) {
            todaySchedules.sort((a, b) => {
                const aTime = new Date(`1970-01-01T${a.time}:00`);
                const bTime = new Date(`1970-01-01T${b.time}:00`);
                const currentTime = new Date(`1970-01-01T${currentSlot.label}:00`);
                return Math.abs(aTime - currentTime) - Math.abs(bTime - currentTime);
            });
        } else {
            // 현재 시간에 일치하는 슬롯이 없을 경우, 시간이 높은 순서대로 정렬
            todaySchedules.sort((a, b) => {
                const aTime = new Date(`1970-01-01T${a.time}:00`);
                const bTime = new Date(`1970-01-01T${b.time}:00`);
                return bTime - aTime;
            });
        }

        // uniqueSchedules 생성
        const uniqueSchedules = todaySchedules.reduce((acc, schedule) => {
            if (!acc.some(item => item.time === schedule.time)) {
                acc.push(schedule);
            }
            return acc;
        }, []);

        // 스케줄 항목에 inactive 클래스 추가
        uniqueSchedules.forEach(schedule => {
            const scheduleTime = new Date(`1970-01-01T${schedule.time}:00`);
            const currentTime = new Date(`1970-01-01T${currentSlot ? currentSlot.label : '00:00'}:00`);
            if (Math.abs(scheduleTime - currentTime) > 0) {
                schedule.inactive = true;
            }
        });

        // 어드민 사용자와 일반 사용자에 따라 다른 HTML 렌더링
        if (userProfile.isAdmin === 'ADMIN') {
            container.innerHTML = `
                <head>
                    <link rel="stylesheet" href="/styles/schedule.css">
                </head>
                <div class="grid-container">
                    <div class="sticky-header"> <!-- sticky-header 클래스 추가 -->
                        <img src="/assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo" id="logo">
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
                            <p>공지사항 [${noticeCount}]<span class="dash">●</span></p>
                        </div>
                        <button id="download-excel"><img src="./assets/img/common/xls_pic.png" alt="엑셀 다운로드" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;"></button>
                    </div>
                    <div class="schedule-container">
                        <div class="schedule-detail">
                            <div class="schedule-item-container">
                                <div class="location-time">
                                    <p class="location">${schedules[0].area_name || 'N/A'}</p>
                                    <p class="global-time">${formattedDate}</p>
                                </div>
                                ${uniqueSchedules.map(schedule => `
                                    <div class="schedule-item ${schedule.inactive ? 'inactive' : ''}" data-shift="${schedule.schedule_type}" data-time="${schedule.time}" style="background-color: #EAEAEA;">
                                        <p class="location" style="display: none;">${schedule.area_name}</p>
                                        <div class="shift-time">
                                            <p class="shift">${schedule.schedule_type === 'm' ? 'Morning' : schedule.schedule_type === 's' ? 'Swing' : 'Night'}</p>
                                            <p class="time">${schedule.time}</p>
                                        </div>
                                        <ul class="worker-info" style="text-align: left;">
                                            <li>교대 반장: ${schedule.foremanName}</li>
                                            <li>작업자: ${schedule.workerName}</li>
                                        </ul>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="previous-records-container">
                            ${previousRecordsHTML}
                        </div>
                        <div class="margin-bottom"></div>
                    </div>
                </div>
                <div id="modal" class="modal">
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <button id="logout-button">로그아웃</button>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <head>
                    <link rel="stylesheet" href="styles/schedule.css">
                </head>
                <div class="grid-container">
                    <div class="sticky-header"> <!-- sticky-header 클래스 추가 -->
                        <img src="./assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo" id="logo">
                        <div class="header">
                            <img src="./assets/img/common/${userProfile.profile_pic}" alt="Avatar" class="avatar" id="avatar" style="object-fit: cover;">
                            <span class="initial">${schedules[0].schedule_type.toUpperCase()}</span>
                            <div class="time-container">
                                <div class="time-date">
                                    <span class="time">${formatTime(getCurrentTime())}</span>
                                    <span class="date">${getCurrentDate()}</span>
                                </div>
                                <span class="day">${getCurrentDay()}</span>
                            </div>
                        </div>
                        <div class="notice" id="notice">
                            <p>공지사항 [${noticeCount}]<span class="dash">●</span></p>
                        </div>
                    </div>
                    <div class="schedule-container">
                        ${uniqueSchedules.map(schedule => `
                            <div class="schedule-item ${schedule.inactive ? 'inactive' : ''}" data-shift="${schedule.schedule_type}" data-time="${schedule.time}">
                                <p class="location">${schedule.area_name}</p>
                                <div class="shift-time">
                                    <p class="shift">${schedule.schedule_type === 'm' ? 'Morning' : schedule.schedule_type === 's' ? 'Swing' : 'Night'}</p>
                                    <p class="time">${schedule.time}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="previous-records-container">
                        ${previousRecordsHTML}
                    </div>
                </div>
                <div id="modal" class="modal">
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <button id="logout-button">로그아웃</button>
                    </div>
                </div>
            `;
        }
console.count("몇개나 찍힐까");
        document.getElementById('notice').addEventListener('click', () => {
            navigateTo('/notice');
        });

        document.querySelectorAll('.previous-records').forEach(el => {
            el.addEventListener('click', () => {
                navigateTo('/previous');
            });
        });
        console.log("uniqueSchedules : ",uniqueSchedules);

        document.querySelectorAll('.schedule-item').forEach(el => {
            el.addEventListener('click', async () => {
                const areaName = el.querySelector('.location').textContent;
                const scheduleType = el.dataset.shift;
                const time = el.querySelector('.time').textContent;
                try {
                    const response = await fetch(`/api/sections-by-area/${encodeURIComponent(areaName)}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const sections = await response.json();
                    console.log('Sections:', sections); // 디버깅용 로그

                    const scheduleData = {
                        area_name: areaName,
                        schedule_type: scheduleType,
                        time: time,
                        date: formattedDate, // 오늘 날짜를 연월일 형식으로 설정
                        initial: schedules[0].schedule_type.toUpperCase()
                    };

                    // scheduleDetail 페이지로 이동하면서 scheduleData와 sections 데이터를 전달
                    navigateTo('/scheduleDetail', { scheduleData, sections: Array.isArray(sections) ? sections : [] });
                } catch (error) {
                    console.error('Error fetching sections:', error);
                    alert('섹션 데이터를 가져오는데 실패했습니다.');
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

        // 엑셀 다운로드 버튼 이벤트 리스너 추가
        const downloadExcelButton = document.getElementById('download-excel');
        if (downloadExcelButton) {
            downloadExcelButton.addEventListener('click', async () => {
                try {
                    await downloadExcel(uniqueSchedules);
                } catch (error) {
                    console.error('엑셀 다운로드 중 오류 발생:', error);
                    alert('엑셀 다운로드 중 오류가 발생했습니다.');
                }
            });
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Fetch aborted');
        } else {
            console.error('Error details:', error);
            container.innerHTML = '<div class="error">데이터를 가져오는데 실패했습니다. 다시 시도해주세요.</div>';
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


