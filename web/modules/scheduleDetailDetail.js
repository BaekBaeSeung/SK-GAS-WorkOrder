import { getCurrentTime, getCurrentDate, getCurrentDay, fetchUserProfile, fetchNoticeCount, logout, formatTime } from './utils.js'; // 유틸 함수 임포트

export async function renderScheduleDetailDetailPage(container, sectionId) {
    try {
        const userProfile = await fetchUserProfile();
        const noticeCount = await fetchNoticeCount();

        // 로컬 스토리지에서 섹션 데이터 불러오기
        const sections = JSON.parse(localStorage.getItem('scheduleSections')) || [];
        const currentSection = sections.find(section => section.section_id === sectionId);

        if (!currentSection) {
            throw new Error('섹션을 찾을 수 없습니다.'); 
        }

        container.innerHTML = `
            <head>
                <link rel="stylesheet" href="styles/scheduleDetailDetail.css">
            </head>
            <div class="schedule-detail-detail-container">
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
                    <p>공지사항 [${noticeCount}] <span class="dash">●</span></p>
                </div>
                <div class="schedule-detail">
                    <div class="schedule-item">
                        <div class="location-time">
                            <p class="location">C3/C4/부두</p>
                            <p class="time">Morning 12:00</p>
                        </div>
                        <div class="task-item">
                            <p class="task-name task-name-header">UAC C3 loading</p>
                        </div>
                        <div class="task">
                            <div class="task-item">
                                <div class="task-header">
                                    <span class="task-number">01</span>
                                    <p class="task-name">${currentSection.section_Info}</p>
                                    <span class="task-code">[${currentSection.section_id}]</span>
                                </div>
                                <div class="task-body">
                                    <img src="./assets/img/common/MPa.png" alt="Gauge" class="gauge">
                                    <div class="input-container">
                                        <input type="text" class="input-field">
                                        <span class="unit">℃</span>
                                    </div>
                                </div>
                            </div>
                            <div class="task-item">
                                <div class="task-header">
                                    <span class="task-number">02</span>
                                    <p class="task-name">P-707A/B Dis.</p>
                                    <span class="task-code">[PI-771A/B]</span>
                                </div>
                                <div class="task-body">
                                    <img src="./assets/img/common/MPa.png" alt="Gauge" class="gauge">
                                    <div class="input-container">
                                        <input type="text" class="input-field">
                                        <span class="unit">kg/cm²/amp</span>
                                    </div>
                                </div>
                            </div>
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
        document.querySelector('.logo').addEventListener('click', () => {
            navigateTo('/schedule');
        });

        // 뒤로 가기 버튼 추가
        const backButton = document.createElement('button');
        backButton.textContent = '뒤로 가기';
        backButton.addEventListener('click', () => {
            history.back();
        });
        container.appendChild(backButton);
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
