import { downloadExcel } from './xlsx.js';
import { getCurrentTime, getCurrentDate, getCurrentDay } from './utils.js';

export async function renderNoticePage(container) {
    const userRole = localStorage.getItem('userRole'); // 사용자 역할 가져오기

    // 서버에서 공지사항 데이터 가져오기
    const response = await fetch('/api/notice-data');
    let notices = await response.json();

    // notices가 배열이 아닌 경우 빈 배열로 초기화
    if (!Array.isArray(notices)) {
        notices = [];
    }

    // notices 배열을 importance 필드를 기준으로 정렬 (HIGH가 먼저 오도록)
    notices.sort((a, b) => (a.importance === 'HIGH' ? -1 : 1));

    container.innerHTML = `
        <div class="notice-container">
            <img src="./assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo">
            <div class="header">
                <img src="./assets/img/common/avata.png" alt="Avatar" class="avatar" id="avatar">
                <span class="initial">M</span>
                <div class="time-container">
                    <div class="time-date">
                        <span class="time" id="current-time">${getCurrentTime()}</span>
                        <span class="date" id="current-date">${getCurrentDate()}</span>
                    </div>
                    <span class="day" id="current-day">${getCurrentDay()}</span>
                </div>
            </div>
            <div class="notice" id="notice">
                <p>공지사항 [${notices.length}] <span class="dash">-</span></p>
            </div>
            <div class="notices" id="notices">
                ${notices.map(notice => `
                    <div class="notice-item ${notice.importance === 'HIGH' ? 'urgent' : ''}">
                        <div class="title-date-container">
                            <p class="title" style="color: ${notice.importance === 'HIGH' ? '#F08000' : 'inherit'};">${notice.importance === 'HIGH' ? '긴급' : '일반'}</p>
                            <p class="date">${new Date(notice.create_at).toLocaleDateString()}</p>
                        </div>
                        <ul>
                            <li>${notice.content}</li>
                        </ul>
                    </div>
                `).join('')}
            </div>
            ${userRole === 'ADMIN' ? '<button id="download-excel">엑셀 다운로드</button>' : ''}
        </div>
        <div id="modal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <button id="logout-button">로그아웃</button>
            </div>
        </div>
    `;

    // 시간, 날짜, 요일 업데이트 함수
    function updateTime() {
        document.getElementById('current-time').textContent = getCurrentTime();
        document.getElementById('current-date').textContent = getCurrentDate();
        document.getElementById('current-day').textContent = getCurrentDay();
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
        // 로그아웃 로직 추가
        console.log('로그아웃');
        modal.style.display = 'none';
    });

    if (userRole === 'ADMIN') {
        document.getElementById('download-excel').addEventListener('click', async () => {
            await downloadExcel();
        });
    }
}
