import { renderNoticePage } from './notice.js';
import { renderPreviousPage } from './previous.js';
import { renderScheduleDetailPage } from './scheduleDetail.js'; // scheduleDetail.js 파일에서 스케줄 상세 페이지 정의
import { getCurrentTime, getCurrentDate, getCurrentDay, fetchUserProfile, fetchNoticeCount, logout, formatTime } from './utils.js'; // 유틸 함수 임포트

export async function renderSchedulePage(container) {
    try {
        const userProfile = await fetchUserProfile();
        const noticeCount = await fetchNoticeCount();
        console.log('User Profile:', userProfile); // 사용자 프로필 정보 출력 (디버깅용)
        console.log('Notice Count:', noticeCount); // 공지사항 개수 출력 (디버깅용)

        // 서버에서 스케줄 데이터 가져오기
        const response = await fetch('/api/schedule');
        const schedules = await response.json();
        console.log('Schedules:', schedules); // 스케줄 데이터 출력 (디버깅용)

        const today = new Date();
        const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

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

        container.innerHTML = `
            <head>
                <link rel="stylesheet" href="styles/schedule.css">
            </head>
            <div class="schedule-container">
                <img src="./assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo" id="logo">
                <div class="header">
                    <img src="./assets/img/common/${userProfile.profile_pic}" alt="Avatar" class="avatar" id="avatar" style="object-fit: cover;">
                    <span class="initial">M</span>
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
                <div class="schedule">
                    ${todaySchedules.map(schedule => `
                        <div class="schedule-item" data-shift="${schedule.schedule_type}" data-time="${schedule.time}">
                            <p class="location">${schedule.area_name}</p>
                            <div class="shift-time">
                                <p class="shift">${schedule.schedule_type === 'm' ? 'Morning' : schedule.schedule_type === 's' ? 'Swing' : 'Night'}</p>
                                <p class="time">${schedule.time}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="previous-records-container">
                    <div class="previous-records" id="previous-records-1">
                        <p>이전 점검 기록 [${previousSchedules.length}]</p>
                    </div>
                    <div class="previous-records" id="previous-records-2">
                        <p>이전 점검 기록 [${previousSchedules.length}]</p>
                    </div>
                    <div class="previous-records" id="previous-records-3">
                        <p>이전 점검 기록 [${previousSchedules.length}]</p>
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

        document.querySelectorAll('.previous-records').forEach(el => {
            el.addEventListener('click', () => {
                navigateTo('/previous');
            });
        });

        document.querySelectorAll('.schedule-item').forEach(el => {
            el.addEventListener('click', async () => {
                const areaName = el.querySelector('.location').textContent;
                try {
                    const response = await fetch(`/api/sections-by-area/${encodeURIComponent(areaName)}`);
                    console.log('response:', response);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const sections = await response.json();
                    console.log('Sections:', sections); // 디버깅용 로그

                    // scheduleDetail 페이지로 이동하면서 sections 데이터를 전달
                    navigateTo('/scheduleDetail', { sections: Array.isArray(sections) ? sections : [] });
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
    } catch (error) {
        console.error('Error fetching user profile, notice count, or schedules:', error);
        alert('사용자 정보, 공지사항 개수 또는 스케줄을 가져오는데 실패했습니다.');
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

