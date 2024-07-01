import { getCurrentTime, getCurrentDate, getCurrentDay, fetchUserProfile, fetchNoticeCount, logout, formatTime } from './utils.js'; // 유틸 함수 임포트

export async function renderPreviousPage(container) {
    try {
        const userProfile = await fetchUserProfile();
        const noticeCount = await fetchNoticeCount();
        console.log('User Profile:', userProfile); // 사용자 프로필 정보 출력 (디버깅용)
        console.log('Notice Count:', noticeCount); // 공지사항 개수 출력 (디버깅용)

        const storedData = JSON.parse(localStorage.getItem('scheduleData')) || {};

        // 서버에서 스케줄 데이터 가져오기
        let response;
        if (userProfile.isAdmin === 'ADMIN') {
            response = await fetch('/api/schedule/all'); // 모든 스케줄 데이터 가져오기
        } else {
            response = await fetch('/api/schedule');
        }
        const schedules = await response.json();
        console.log('Schedules:', schedules); // 스케줄 데이터 출력 (디버깅용)

        const today = new Date();
        const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        const previousSchedules = schedules.filter(schedule => {
            const scheduleDate = new Date(schedule.create_at);
            const scheduleDateString = `${scheduleDate.getFullYear()}-${String(scheduleDate.getMonth() + 1).padStart(2, '0')}-${String(scheduleDate.getDate()).padStart(2, '0')}`;
            return scheduleDateString < todayDateString;
        });

        // 중복된 스케줄 타임 제거
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
        console.log('uniquePreviousSchedules:', uniquePreviousSchedules);

        // 날짜순으로 정렬 (가장 최근 날짜가 위로 오도록)
        uniquePreviousSchedules.sort((a, b) => new Date(b.create_at) - new Date(a.create_at));

        const previousSchedulesCount = uniquePreviousSchedules.length < 10 ? `0${uniquePreviousSchedules.length}` : uniquePreviousSchedules.length;

        container.innerHTML = `
            <head>
                <link rel="stylesheet" href="styles/previous.css">
            </head>
            <div class="previous-container">
                <div class="sticky-header"> <!-- sticky-header 클래스 추가 -->
                    <img src="./assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo">
                    <div class="header">
                        <img src="./assets/img/common/${userProfile.profile_pic}" alt="Avatar" class="avatar" id="avatar" style="object-fit: cover;">
                        <span class="initial" style="${userProfile.isAdmin === 'ADMIN' ? 'opacity: 0;' : ''}">${storedData.initial}</span>
                        <div class="time-container">
                            <div class="time-date">
                                <span class="time">${formatTime(getCurrentTime())}</span>
                                <span class="date">${getCurrentDate()}</span>
                            </div>
                            <span class="day">${getCurrentDay()}</span>
                        </div>
                    </div>
                    <div class="notice" id="notice">
                        <p>공지사항 [${noticeCount}] <span class="dash" style="font-size: 1.5vh;">●</span></p>
                    </div>
                </div>
                <div class="previous-records" id="previous-records">
                    <p>이전 점검 기록 [${previousSchedulesCount}] <span style="margin-right: 1.25lvh;" class="dash">-</span></p>
                </div>
                <div class="schedule">
                    ${uniquePreviousSchedules.map(schedule => `
                        <div class="schedule-item" data-shift="${schedule.schedule_type}" data-time="${schedule.time}">
                            <div class="location-date-container">
                                <p class="location">${schedule.area_name}</p>
                                <p class="date">${new Date(schedule.create_at).toLocaleDateString().replace(/\.$/, '')}</p>
                            </div>
                            <div class="shift-time">
                                <p class="shift">${schedule.schedule_type === 'm' ? 'Morning' : schedule.schedule_type === 's' ? 'Swing' : 'Night'}</p>
                                <p class="time">${schedule.time}</p>
                            </div>
                            ${userProfile.isAdmin === 'ADMIN' ? `
                            <ul class="worker-info" style="text-align: left;">
                                <li>교대 반장: ${schedule.foremanName}</li>
                                <li>작업자: ${schedule.workerName}</li>
                            </ul>
                            ` : ''}
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

        document.getElementById('notice').addEventListener('click', () => {
            navigateTo('/notice');
        });

        document.getElementById('previous-records').addEventListener('click', () => {
            navigateTo('/schedule'); // 이전 점검 기록 클릭 시 스케줄 페이지로 이동
        });

        document.querySelectorAll('.schedule-item').forEach(el => {
            el.addEventListener('click', async () => {
                const areaName = el.querySelector('.location').textContent;
                console.log('areaNameareaNameareaName:', areaName); // 디버깅용 로그
                const scheduleType = el.dataset.shift;
                const time = el.querySelector('.time').textContent;
                const date = el.querySelector('.date').textContent; // date 정보 추가
                try {
                    const response = await fetch(`/api/sections-by-area/${encodeURIComponent(areaName)}`);
                    console.log('ResponseResponseResponse:', response); // 디버깅용 로그
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const sections = await response.json();
                    console.log('Sectionssectionssections:', sections); // 디버깅용 로그

                    const scheduleData = {
                        area_name: areaName,
                        schedule_type: scheduleType,
                        time: time,
                        date: date, // date 정보 추가
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

        // 로고 이미지를 클릭하면 스케줄 페이지로 이동
        document.querySelector('.logo').addEventListener('click', () => {
            navigateTo('/schedule');
        });
    } catch (error) {
        console.error('Error fetching user profile, notice count, or schedules:', error);
        alert('사용자 정보 또는 공지사항 개수를 가져오는데 실패했습니다.');
    }
}

function updateTime() {
    const currentTimeElem = document.querySelector('.time');
    const currentDateElem = document.querySelector('.date');
    const currentDayElem = document.querySelector('.day');
    const initialElem = document.querySelector('.initial');

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
