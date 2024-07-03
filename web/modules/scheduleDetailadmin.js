import { getCurrentTime, getCurrentDate, getCurrentDay, fetchUserProfile, fetchNoticeCount, logout, formatTime} from './utils.js'; // 유틸 함수 임포트

export async function renderScheduleDetailAdminPage(container) {
    try {
        const userProfile = await fetchUserProfile();
        const noticeCount = await fetchNoticeCount();
        console.log('User Profile:', userProfile); // 사용자 프로필 정보 출력 (디버깅용)
        console.log('Notice Count:', noticeCount); // 공지사항 개수 출력 (디버깅용)
        
        container.innerHTML = `
            <head>
                <link rel="stylesheet" href="/styles/scheduleDetailadmin.css">
            </head>
            <div class="admin-container">
                <header class="header">
                    <img src="./assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo" id="logo">
                    <div class="user-info">
                        <img src="./assets/img/common/${userProfile.profile_pic}" alt="Avatar" class="avatar" id="avatar" style="object-fit: cover;">
                        <span class="initial" style="${userProfile.isAdmin === 'ADMIN' ? 'opacity: 0;' : ''}">M</span>
                        <div class="time-container">
                            <div class="time-date">
                                <span class="time">${formatTime(getCurrentTime())}</span>
                                <span class="date">${getCurrentDate()}</span>
                            </div>
                            <span class="day">${getCurrentDay()}</span>
                        </div>
                    </div>
                </header>
                <div class="notice" id="notice">
                    <p>공지사항 [${noticeCount}] <span class="dash">●</span></p>
                </div>
                <div class="schedule">
                    <div class="task-list">
                        <div class="location-time">
                            <p class="location">C3/C4/부두</p>
                            <p class="time">Morning 12:00</p>
                        </div>
                        <div class="task-item">
                            <span class="task-number">01</span>
                            <p class="task-name">Chemical</p>
                        </div>
                        <div class="task-item">
                            <span class="task-number">02</span>
                            <p class="task-name">회수시설</p>
                        </div>
                        <div class="task-item">
                            <span class="task-number">03</span>
                            <p class="task-name">AC I 831</p>
                        </div>
                        <div class="task-item">
                            <span class="task-number">04</span>
                            <p class="task-name">태광 C3 loading</p>
                        </div>
                        <div class="task-item">
                            <span class="task-number">05</span>
                            <p class="task-name">SKA/효성 #2 C3 loading</p>
                        </div>
                        <div class="task-item">
                            <span class="task-number">05</span>
                            <p class="task-name">효성 #1 C3 loading</p>
                        </div>
                        <div class="task-item">
                            <span class="task-number">06</span>
                            <p class="task-name">SKE C3 unloading</p>
                        </div>
                        <div class="task-item">
                            <span class="task-number">07</span>
                            <p class="task-name">SKE C4 unloading</p>
                        </div>
                        <div class="task-item">
                            <span class="task-number">08</span>
                            <p class="task-name">SKE C4 loading</p>
                        </div>
                        <div class="task-item">
                            <span class="task-number">09</span>
                            <p class="task-name">카프로 C3 loading</p>
                        </div>
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
        console.error('Error fetching user profile or notice count:', error);
        alert('사용자 정보 또는 공지사항 개수를 가져오는데 실패했습니다.');
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
