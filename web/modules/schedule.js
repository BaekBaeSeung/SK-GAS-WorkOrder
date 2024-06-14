import { renderNoticePage } from './notice.js';
import { renderPreviousPage } from './previous.js';
import { renderScheduleDetailPage } from './scheduleDetail.js'; // scheduleDetail.js 파일에서 스케줄 상세 페이지 정의

export function renderSchedulePage(container) {
    container.innerHTML = `
        <div class="schedule-container">
            <img src="./assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo">
            <div class="header">
                <img src="./assets/img/common/avata.png" alt="Avatar" class="avatar">
                <span class="initial">M</span>
                <div class="time-container">
                    <div class="time-date">
                        <span class="time">10:53</span>
                        <span class="date">240611</span>
                    </div>
                    <span class="day">火</span>
                </div>
            </div>
            <div class="notice" id="notice">
                <p>공지사항 [03]</p>
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
}
