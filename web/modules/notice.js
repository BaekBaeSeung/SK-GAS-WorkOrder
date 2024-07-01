import { downloadExcel } from './xlsx.js';
import { getCurrentTime, getCurrentDate, getCurrentDay, fetchUserProfile, fetchNoticeCount, logout, formatTime } from './utils.js'; // 유틸 함수 임포트
import { renderNoticeDetailPage } from './noticeDetail.js'; // noticeDetail 임포트

export async function renderNoticePage(container) {
    try {
        const userProfile = await fetchUserProfile();
        const noticeCount = await fetchNoticeCount();

        // 서버에서 공지사항 데이터 가져오기
        const response = await fetch('/api/notice-data');
        let notices = await response.json();

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

        // notices가 배열이 아닌 경우 빈 배열로 초기화
        if (!Array.isArray(notices)) {
            notices = [];
        }

        // notices 배열을 importance 필드를 기준으로 정렬 (HIGH가 먼저 오도록)
        notices.sort((a, b) => {
            if (a.importance === b.importance) {
                return new Date(b.create_at) - new Date(a.create_at); // 최신 순으로 정렬
            }
            return a.importance === 'HIGH' ? -1 : 1; // HIGH가 먼저 오도록 정렬
        });

        container.innerHTML = `
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
                <link rel="stylesheet" href="styles/notice.css">
            </head>
            <div class="notice-container">
                <div class="sticky-header"> <!-- sticky-header 클래스 추가 -->
                    <img src="./assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo" id="logo">
                    <div class="header">
                        <img src="./assets/img/common/${userProfile.profile_pic}" alt="Avatar" class="avatar" id="avatar" style="object-fit: cover;">
                        <span class="initial" style="${userProfile.isAdmin === 'ADMIN' ? 'opacity: 0;' : ''}">${initial}</span>
                        <div class="time-container">
                            <div class="time-date">
                                <span class="time" id="current-time">${formatTime(getCurrentTime())}</span>
                                <span class="date" id="current-date">${getCurrentDate()}</span>
                            </div>
                            <span class="day" id="current-day">${getCurrentDay()}</span>
                        </div>
                    </div>
                    <div class="notice" id="notice">
                        <p>공지사항 [${noticeCount}] <span class="dash">-</span></p>
                    </div>
                </div>
                <div class="notices" id="notices">
                    ${notices.map(notice => `
                        <div class="notice-item ${notice.importance === 'HIGH' ? 'urgent' : 'normal'}" data-notice-id="${notice.notice_id}">
                            <div class="title-date-container">
                                <p class="title" style="color: ${notice.importance === 'HIGH' ? '#F08000' : 'inherit'};">
                                    ${notice.importance === 'HIGH' ? '긴급' : '일반'}
                                    ${notice.isNew ? '<span class="new">NEW!</span>' : ''}
                                </p>
                                <p class="date">${new Date(notice.create_at).toLocaleDateString()}</p>
                            </div>
                            <ul>
                                <li>${notice.content}</li>
                            </ul>
                        </div>
                    `).join('')}
                </div>
                ${userProfile.isAdmin === 'ADMIN' ? '<button id="download-excel"><img src="./assets/img/common/xls_pic.png" alt="엑셀 다운로드" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;"></button>' : ''}
                ${userProfile.isAdmin === 'ADMIN' ? '<button id="add-notice">+</button>' : ''}
            </div>
            <div id="modal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <button id="logout-button">로그아웃</button>
                </div>
            </div>
        `;
                // 두 번 터치 시 줌 방지


        function updateTime() {
            const currentTimeElement = document.getElementById('current-time');
            const currentDateElement = document.getElementById('current-date');
            const currentDayElement = document.querySelector('.day');

            if (currentTimeElement) {
                currentTimeElement.innerHTML = formatTime(getCurrentTime());
            }
            if (currentDateElement) {
                currentDateElement.textContent = getCurrentDate();
            }
            if (currentDayElement) {
                currentDayElement.textContent = getCurrentDay();
            }

            requestAnimationFrame(updateTime);
        }
        updateTime();

        document.getElementById('notice').addEventListener('click', () => {
            navigateTo('/schedule');
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

        if (userProfile.isAdmin === 'ADMIN') {
            document.getElementById('download-excel').addEventListener('click', async () => {
                await downloadExcel();
            });

            document.getElementById('add-notice').addEventListener('click', () => {
                navigateTo('/noticeAdmin');
            });
        }

        // 로고 클릭 시 스케줄 페이지로 이동
        document.getElementById('logo').addEventListener('click', () => {
            navigateTo('/schedule');
        });

        // 공지사항 항목 클릭 시 상세 페이지로 이동
        document.querySelectorAll('.notice-item').forEach(item => {
            item.addEventListener('click', () => {
                const noticeId = item.getAttribute('data-notice-id');
                navigateTo(`/noticeDetail/${noticeId}`);
            });
        });
    } catch (error) {
        console.error('Error fetching user profile or notice count:', error);
        alert('사용자 정보 또는 공지사항 개수를 가져오는데 실패했습니다.');
    }
}
