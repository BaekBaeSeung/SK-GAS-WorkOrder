import { getCurrentTime, getCurrentDate, getCurrentDay, fetchUserProfile, fetchNoticeCount, logout, formatTime } from './utils.js'; // 유틸 함수 임포트

export async function renderScheduleDetailPage(container, scheduleData = {}, sections = []) {
    try {
        // 로컬 스토리지에서 섹션 데이터와 스케줄 데이터 불러오기
        const storedData = JSON.parse(localStorage.getItem('scheduleData')) || {};
        const storedSections = JSON.parse(localStorage.getItem('scheduleSections')) || [];
        
        scheduleData = Object.keys(scheduleData).length > 0 ? scheduleData : storedData;
        sections = sections.length > 0 ? sections : storedSections;

        // 데이터를 로컬 스토리지에 저장
        localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
        localStorage.setItem('scheduleSections', JSON.stringify(sections));

        const userProfile = await fetchUserProfile();
        const noticeCount = await fetchNoticeCount();
        console.log('User Profile:', userProfile); // 사용자 프로필 정보 출력 (디버깅용)
        console.log('Notice Count:', noticeCount); // 공지사항 개수 출력 (디버깅용)

        container.innerHTML = `
            <head>
                <link rel="stylesheet" href="styles/scheduleDetail.css">
            </head>
            <div class="schedule-detail-container">
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
                    <p>공지사항 [${noticeCount}] <span class="dash" >●</span></p>
                </div>
                <div class="schedule-detail">
                    <div class="schedule-item">
                        <div class="location-time">
                            <p class="location">${scheduleData.area_name || 'N/A'}</p>
                            <p class="time">${scheduleData.schedule_type === 'm' ? 'Morning' : scheduleData.schedule_type === 's' ? 'Swing' : 'Night'} ${scheduleData.time || 'N/A'}</p>
                        </div>
                        ${sections.map((section, index) => `
                        <div class="task">
                            <div class="task-item" data-task-id="${section.section_id}">
                                <span class="task-number">${String(index + 1).padStart(2, '0')}</span>
                                <p class="task-name">${section.section}</p>
                            </div>
                        </div>
                        `).join('')}
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
            item.addEventListener('click', () => {
                const sectionId = item.dataset.taskId;
                navigateTo(`/scheduleDetailDetail/${sectionId}`);
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