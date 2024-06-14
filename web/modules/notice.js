export function renderNoticePage(container) {
    container.innerHTML = `
        <div class="notice-container">
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
                <p>공지사항 [03] <span class="dash">-</span></p>
            </div>
            <div class="notices">
                <div class="notice-item urgent">
                    <div class="title-date-container">
                        <p class="title" style="color: #F08000;">긴급</p>
                        <p class="date">2024.06.11</p>
                    </div>
                    <ul>
                        <li>UAC C3 loading 온도 이상 발생</li>
                    </ul>
                </div>
                <div class="notice-item">
                    <div class="title-date-container">
                        <p class="title">일반</p>
                        <p class="date">2024.06.11</p>
                    </div>
                    <ul>
                        <li>노후 게이지 교체 일정 확인</li>
                        <li>방폭 스마트폰 시험 사용 참여</li>
                    </ul>
                </div>
                <div class="notice-item">
                    <div class="title-date-container">
                        <p class="title">일반</p>
                        <p class="date">2024.06.10</p>
                    </div>
                    <ul>
                        <li>시설 점검 전후, 무전기 배터리 용량확인</li>
                        <li>배터리 성능 저하 시, 운영실로 반납</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    document.getElementById('notice').addEventListener('click', () => {
        navigateTo('/schedule');
    });
}
