export function renderScheduleDetailDetailPage(container) {
    container.innerHTML = `
        <div class="schedule-detail-detail-container">
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
                    <div class="task-item">
                        <p class="task-name task-name-header">UAC C3 loading</p>
                    </div>
                    <div class="task">
                        <div class="task-item">
                            <div class="task-header">
                                <span class="task-number">01</span>
                                <p class="task-name">Loading Temp.</p>
                                <span class="task-code">[TI-776]</span>
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
    `;

    document.getElementById('notice').addEventListener('click', () => {
        navigateTo('/notice');
    });
}
