import { renderNoticePage } from './notice.js';
import { renderPreviousPage } from './previous.js';
import { renderScheduleDetailPage } from './scheduleDetail.js'; // scheduleDetail.js 파일에서 스케줄 상세 페이지 정의
import { getCurrentTime, getCurrentDate, getCurrentDay, fetchUserProfile, fetchNoticeCount } from './utils.js'; // 유틸 함수 임포트

export async function renderSchedulePage(container) {
    try {
        const userProfile = await fetchUserProfile();
        const noticeCount = await fetchNoticeCount();
        console.log('User Profile:', userProfile); // 사용자 프로필 정보 출력 (디버깅용)
        console.log('Notice Count:', noticeCount); // 공지사항 개수 출력 (디버깅용)

        container.innerHTML = `
            <div class="schedule-container">
                <img src="./assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo">
                <div class="header">
                    <img src="./assets/img/common/${userProfile.profile_pic}" alt="Avatar" class="avatar" id="avatar">
                    <span class="initial">M</span>
                    <div class="time-container">
                        <div class="time-date">
                            <span class="time">${getCurrentTime()}</span>
                            <span class="date">${getCurrentDate()}</span>
                        </div>
                        <span class="day">${getCurrentDay()}</span>
                    </div>
                </div>
                <div class="notice" id="notice">
                    <p>공지사항 [${noticeCount}]<span class="dash">●</span></p>
                </div>
                <div class="schedule">
                    <div class="schedule-item" data-shift="Morning" data-time="12:00">
                        <p class="location">C3/C4/부두</p>
                        <div class="shift-time">
                            <p class="shift">Morning</p>
                            <p class="time">12:00</p>
                        </div>
                    </div>
                    <div class="schedule-item" data-shift="Swing" data-time="16:00">
                        <p class="location">C3/C4/부두</p>
                        <div class="shift-time">
                            <p class="shift">Swing</p>
                            <p class="time">16:00</p>
                        </div>
                    </div>
                    <div class="schedule-item" data-shift="Swing" data-time="20:00">
                        <p class="location">C3/C4/부두</p>
                        <div class="shift-time">
                            <p class="shift">Swing</p>
                            <p class="time">20:00</p>
                        </div>
                    </div>
                </div>
                <div class="previous-records-container">
                    <div class="previous-records" id="previous-records-1">
                        <p>이전 점검 기록 [10]</p>
                    </div>
                    <div class="previous-records" id="previous-records-2">
                        <p>이전 점검 기록 [10]</p>
                    </div>
                    <div class="previous-records" id="previous-records-3">
                        <p>이전 점검 기록 [10]</p>
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
            el.addEventListener('click', () => {
                navigateTo('/scheduleDetail');
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
            // 로그아웃 로직 추가
            console.log('로그아웃');
            modal.style.display = 'none';
        });
    } catch (error) {
        console.error('Error fetching user profile or notice count:', error);
        alert('사용자 정보 또는 공지사항 개수를 가져오는데 실패했습니다.');
    }
}
