export function renderScheduleDetailAdminPage(container) {
    container.innerHTML = `
        <div class="admin-container">
            <header class="header">
                <img src="./assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo">
                <div class="user-info">
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
            </header>
            <div class="notice" id="notice">
                <p>공지사항 [03] <span class="dash">●</span></p>
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
    `;
}
