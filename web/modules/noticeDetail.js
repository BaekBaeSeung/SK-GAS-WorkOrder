import { getCurrentTime, getCurrentDate, getCurrentDay, fetchUserProfile, logout, formatTime } from './utils.js'; // 유틸 함수 임포트

export async function renderNoticeDetailPage(container, noticeId) {
    try {
        const userProfile = await fetchUserProfile();
        console.log('User Profile:', userProfile); // 사용자 프로필 정보 출력 (디버깅용)

        // 서버에서 공지사항 데이터 가져오기
        const response = await fetch(`/api/notice-data/${noticeId}`);
        const notice = await response.json();

        // 서버에서 스케줄 데이터 가져오기
        let scheduleResponse;
        if (userProfile.isAdmin === 'ADMIN') {
            scheduleResponse = await fetch('/api/schedule/all'); // 모든 스케줄 데이터 가져오기
        } else {
            scheduleResponse = await fetch('/api/schedule');
        }

        if (!scheduleResponse.ok) {
            throw new Error('Failed to fetch schedules');
        }

        const schedules = await scheduleResponse.json();
        const initial = schedules.length > 0 ? schedules[0].schedule_type.toUpperCase() : '';

        // NoticeRead 테이블에 데이터 삽입 요청
        await fetch('/api/notice-read', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ noticeId })
        });

        container.innerHTML = `
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
                <link rel="stylesheet" href="/styles/noticeDetail.css">
            </head>
            <div class="grid-container">

                <div class="notice-container">
                    <div class="sticky-header">
                    <img src="/assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo" id="logo">
                    <div class="header">
                        <img src="/assets/img/common/${userProfile.profile_pic}" alt="Avatar" class="avatar" id="avatar" style="object-fit: cover;">
                        <span class="initial" style="${userProfile.isAdmin === 'ADMIN' ? 'opacity: 0;' : ''}">${schedules[0].schedule_type.toUpperCase()}</span>
                        <div class="time-container">
                            <div class="time-date">
                                <span class="time" id="current-time">${formatTime(getCurrentTime())}</span>
                                <span class="date" id="current-date">${getCurrentDate()}</span>
                            </div>
                            <span class="day" id="current-day">${getCurrentDay()}</span>
                        </div>
                    </div>
                    <div class="notice" id="notice">
                        <p>공지사항 게시판 보기. <span class="dash">-</span></p>
                    </div>
                </div>
                    <div class="notice-item ${notice.importance === 'HIGH' ? 'urgent' : 'normal'}">
                        <div class="title-date-container">
                            <p class="title" style="color: ${notice.importance === 'HIGH' ? '#F08000' : 'inherit'};">
                                ${notice.importance === 'HIGH' ? '긴급' : '일반'}
                            </p>
                            <p class="date">${new Date(notice.create_at).toLocaleDateString()}</p>
                        </div>
                        <ul>
                            <li>${notice.content}</li>
                        </ul>
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

        // 공지사항 클릭 시 공지사항 페이지로 이동
        document.getElementById('notice').addEventListener('click', () => {
            navigateTo('/notice');
        });
    } catch (error) {
        console.error('Error fetching notice detail:', error);
        alert('공지사항 세부 정보를 가져오는데 실패했습니다.');
    }
}

