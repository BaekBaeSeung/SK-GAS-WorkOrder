export function renderPreviousPage(container) {
    container.innerHTML = `
        <div class="previous-container">
            <img src="./assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo">
            <div class="header">
                <img src="./assets/img/common/avata.png" alt="Avatar" class="avatar" id="avatar">
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
                <p>공지사항 [03] <span class="dash" style="font-size: 1.5vh;">●</span></p>
            </div>
            <div class="previous-records" id="previous-records">
                <p>이전 점검 기록 [03] <span class="dash">-</span></p>
            </div>
            <div class="schedule">
                <div class="schedule-item" data-shift="Morning" data-time="08:00">
                    <p class="location">C3/C4/부두</p>
                    <div class="shift-time">
                        <p class="shift">Morning</p>
                        <p class="time">08:00</p>
                    </div>
                    <p class="date">2024.06.11</p>
                </div>
                <div class="schedule-item" data-shift="Swing" data-time="20:00">
                    <p class="location">C3/C4/부두</p>
                    <div class="shift-time">
                        <p class="shift">Swing</p>
                        <p class="time">20:00</p>
                    </div>
                    <p class="date">2024.06.10</p>
                </div>
                <div class="schedule-item" data-shift="Swing" data-time="16:00">
                    <p class="location">C3/C4/부두</p>
                    <div class="shift-time">
                        <p class="shift">Swing</p>
                        <p class="time">16:00</p>
                    </div>
                    <p class="date">2024.06.10</p>
                </div>
                <div class="schedule-item" data-shift="Morning" data-time="12:00">
                    <p class="location">C3/C4/부두</p>
                    <div class="shift-time">
                        <p class="shift">Morning</p>
                        <p class="time">12:00</p>
                    </div>
                    <p class="date">2024.06.10</p>
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

    document.getElementById('previous-records').addEventListener('click', () => {
        navigateTo('/previous');
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
}
