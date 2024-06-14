export function renderScheduleDetailPage(container) {
    container.innerHTML = `
        <div class="schedule-detail-container">
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
                <p>공지사항 [03] <span class="dash">●</span></p>
            </div>
            <div class="schedule-detail">
                <div class="schedule-item">
                    <div class="location-time">
                        <p class="location">C3/C4/부두</p>
                        <p class="time">Morning 12:00</p>
                    </div>
                    <div class="task">
                        <div class="task-item" data-task-id="1">
                            <span class="task-number">01</span>
                            <p class="task-name">UAC C3 loading</p>
                        </div>
                        <div class="task-item" data-task-id="2">
                            <span class="task-number">02</span>
                            <p class="task-name">석화사 출하 펌프</p>
                        </div>
                        <div class="task-item" data-task-id="3">
                            <span class="task-number">03</span>
                            <p class="task-name"></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('notice').addEventListener('click', () => {
        navigateTo('/notice');
    });

    document.querySelectorAll('.task-item').forEach(item => {
        item.addEventListener('click', () => {
            navigateTo('/scheduleDetailDetail');
        });
    });
}