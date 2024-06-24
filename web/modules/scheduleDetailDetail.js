import { getCurrentTime, getCurrentDate, getCurrentDay, fetchUserProfile, fetchNoticeCount, logout, formatTime, getScheduleTypeByTime } from './utils.js'; // 유틸 함수 임포트

export async function renderScheduleDetailDetailPage(container, sectionId) {
    try {
        const userProfile = await fetchUserProfile();
        const noticeCount = await fetchNoticeCount();

        // 로컬 스토리지에서 스케줄 데이터와 섹션 데이터 불러오기
        const scheduleData = JSON.parse(localStorage.getItem('currentScheduleData')) || {};
        const sectionData = JSON.parse(localStorage.getItem('currentSectionData')) || {};

        // sectionData.subSections가 배열인지 확인하고, 배열이 아닌 경우 빈 배열로 초기화
        const subSections = Array.isArray(sectionData.subSections) ? sectionData.subSections : [];
        console.table("subSections:"+subSections);

        container.innerHTML = `
            <head>
                <link rel="stylesheet" href="/styles/scheduleDetailDetail.css">
            </head>
            <div class="schedule-detail-detail-container">
                <img src="/assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo" id="logo">
                <div class="header">
                    <img src="/assets/img/common/${userProfile.profile_pic}" alt="Avatar" class="avatar" id="avatar" style="object-fit: cover;">
                    <span class="initial">${getScheduleTypeByTime()}</span>
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
                            <p class="location">${scheduleData.area_name || 'N/A'}</p>
                            <p class="time">${scheduleData.schedule_type === 'm' ? 'Morning' : scheduleData.schedule_type === 's' ? 'Swing' : 'Night'} ${scheduleData.time || 'N/A'}</p>
                        </div>
                        <div class="task-item">
                            <p class="task-name task-name-header">${sectionData.sectionName}</p>
                        </div>
                        <div class="task">
                            ${subSections.map((subSection, index) => {
                                const taskNumber = (index + 1).toString().padStart(2, '0'); // 2자리 숫자로 만들기
                                return `
                                <div class="task-item">
                                    <div class="task-header">
                                        <span class="task-number">${taskNumber}</span>
                                        <p class="task-name">${subSection.subSection_name}</p>
                                        <span class="task-code">[${subSection.item_no}]</span>
                                    </div>
                                    <div class="task-body">
                                        <img src="/assets/img/common/${subSection.item_pic}" alt="Gauge" class="gauge">
                                        <div class="input-container">
                                            <input type="text" class="input-field">
                                            <span class="unit">${subSection.section_unit}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                            }).join('')}
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

        // 이벤트 리스너 추가
        document.getElementById('notice').addEventListener('click', () => {
            navigateTo('/notice');
        });

        document.getElementById('logo').addEventListener('click', () => {
            navigateTo('/schedule');
        });



        // 모달 관련 이벤트 리스너 추가
        const modal = document.getElementById('modal');
        const avatar = document.getElementById('avatar');
        const closeModal = document.querySelector('.close');
        const logoutButton = document.getElementById('logout-button');

        if (avatar) {
            avatar.addEventListener('click', () => {
                if (modal) modal.style.display = 'block';
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
            });
        }

        if (window) {
            window.addEventListener('click', (event) => {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                logout(); // 로그아웃 요청
                if (modal) modal.style.display = 'none';
            });
        }

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

