import { getCurrentTime, getCurrentDate, getCurrentDay, checkLoginStatus, formatTime} from './utils.js';

export function renderLoginPage(container) {
    // // 로그인 상태 확인
    // if (!checkLoginStatus()) {
    //     return;
    // }

    container.innerHTML = `
        <head>
            <link rel="stylesheet" href="/styles/login.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        </head>
        <div class="login-container">
            <img src="./assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo" onclick="navigateTo('/')">
            <p class="title">시설관리 DX</p>
            <div class="time-container">
                <div class="time-date">
                    <span class="time" id="current-time">${formatTime(getCurrentTime())}</span>
                    <span class="date" id="current-date">${getCurrentDate()}</span>
                </div>
                <span class="day" id="current-day">${getCurrentDay()}</span>
            </div>
            <div class="login-form-container">
                <img src="./assets/img/common/avata.png" alt="Avatar" class="avatar">
                <form id="loginForm">
                    <input type="text" id="username" placeholder="아이디" required />
                    <input type="password" id="password" placeholder="비밀번호" required />
                    <button type="submit" class="login-button"><i class="fas fa-arrow-right"></i></button>
                </form>
            </div>
        </div>
    `;

function updateTime() {
    const currentTimeElem = document.querySelector('.time');
    const currentDateElem = document.querySelector('.date');
    const currentDayElem = document.querySelector('.day');


    if (currentTimeElem) {
        currentTimeElem.innerHTML = formatTime(getCurrentTime());
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

    let isSubmitting = false; // 제출 중인지 확인하는 플래그

    document.getElementById('loginForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        if (isSubmitting) return; // 이미 제출 중이면 추가 제출 방지
        isSubmitting = true; // 제출 시작

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const form = event.target;
        const submitButton = form.querySelector('button[type="submit"]');

        // 폼과 제출 버튼 비활성화
        form.disabled = true;
        submitButton.disabled = true;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            if (result.success) {

                    window.navigateTo('/schedule'); // 로그인 성공 시 스케줄 페이지로 이동

                document.cookie = `accessToken=${result.accessToken}; path=/; secure; HttpOnly`;
                document.cookie = `refreshToken=${result.refreshToken}; path=/; secure; HttpOnly`;
                document.cookie = `userRole=${result.userRole}; path=/; secure; HttpOnly`;
            } else {
                showModal('로그인 실패, 계정을 확인해주세요.');
                // 로그인 실패 시 폼과 버튼 다시 활성화
                form.disabled = false;
                submitButton.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            showModal('로그인 중 오류가 발생했습니다. 다시 시도해 주세요.');
            // 오류 발생 시 폼과 버튼 다시 활성화
            form.disabled = false;
            submitButton.disabled = false;
        } finally {
            isSubmitting = false; // 제출 종료
        }
    });

    

function showModal(message, onConfirm) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <p>${message}</p>
            <button class="confirm-button">확인</button>
        </div>
    `;
    document.body.appendChild(modal);

    const closeModal = () => {
        if (modal.parentNode) {
            modal.style.display = 'none';
            document.body.removeChild(modal);
            if (onConfirm) onConfirm();
        }
    };

    modal.querySelector('.confirm-button').addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';

    if (onConfirm) {
        let countdown = 3;
        const countdownElem = modal.querySelector('#countdown');
        const interval = setInterval(() => {
            countdown -= 1;
            if (countdownElem) {
                countdownElem.textContent = countdown;
            }
            if (countdown <= 0) {
                clearInterval(interval);
                closeModal();
            }
        }, 1000);
    }
}
};