import { getCurrentTime, getCurrentDate, getCurrentDay, checkLoginStatus } from './utils.js';

export function renderLoginPage(container) {
    // 로그인 상태 확인
    if (!checkLoginStatus()) {
        return;
    }

    container.innerHTML = `
        <head>
            <link rel="stylesheet" href="styles/login.css">
        </head>
        <div class="login-container">
            <img src="./assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo">
            <p class="title">시설관리 DX</p>
            <div class="time-container">
                <div class="time-date">
                    <span class="time" id="current-time">${getCurrentTime()}</span>
                    <span class="date" id="current-date">${getCurrentDate()}</span>
                </div>
                <span class="day" id="current-day">${getCurrentDay()}</span>
            </div>
            <div class="login-form-container">
                <img src="./assets/img/common/avata.png" alt="Avatar" class="avatar">
                <form id="loginForm">
                    <input type="text" id="username" placeholder="아이디" required />
                    <input type="password" id="password" placeholder="비밀번호" required />
                    <button type="submit" class="login-button"><span>></span></button>
                </form>
            </div>
        </div>
    `;

    function updateTime() {
        const currentTimeElem = document.getElementById('current-time');
        const currentDateElem = document.getElementById('current-date');
        const currentDayElem = document.getElementById('current-day');

        if (currentTimeElem) {
            currentTimeElem.textContent = getCurrentTime();
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

    document.getElementById('loginForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (result.success) {
            alert('로그인 성공');
            document.cookie = `accessToken=${result.accessToken}; path=/; secure; HttpOnly`;
            document.cookie = `refreshToken=${result.refreshToken}; path=/; secure; HttpOnly`;
            document.cookie = `userRole=${result.userRole}; path=/; secure; HttpOnly`;

            window.navigateTo('/schedule'); // 로그인 성공 시 스케줄 페이지로 이동
        } else {
            alert('로그인 실패: ' + result.message);
        }
    });
}
