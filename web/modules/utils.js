// 현재 시간을 구하는 함수
export function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 현재 날짜를 구하는 함수
export function getCurrentDate() {
    const now = new Date();
    const year = String(now.getFullYear()).slice(2); // 연도의 마지막 두 자리
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 월 (0부터 시작하므로 +1)
    const day = String(now.getDate()).padStart(2, '0'); // 일
    return `${year}${month}${day}`;
}

// 현재 요일을 한자로 구하는 함수
export function getCurrentDay() {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const now = new Date();
    return days[now.getDay()];
}

import { showModal } from './index.js'; // showModal 함수 가져오기

// 로그아웃 요청 함수
export async function logout() {
    try {
        // 서버에 로그아웃 요청
        const response = await fetch('/logout', {
            method: 'POST',
            credentials: 'include' // 쿠키를 포함하여 요청
        });

        if (response.ok) {
            // 모든 쿠키 삭제
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            
            // 로컬 스토리지 클리어
            localStorage.clear();

            // 캐시를 무시하고 로그인 페이지로 리다이렉트
            window.location.href = '/login?t=' + new Date().getTime();
        } else {
            console.error('로그아웃 실패');
            showModal('로그아웃에 실패했습니다. 다시 시도해주세요.');
        }
    } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
        showModal('로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}

// 로그인 상태 확인 함수
export function checkLoginStatus() {
    const accessToken = getCookie('accessToken');
    if (accessToken) {
        const confirmLogout = confirm('이미 로그인된 상태입니다. 로그아웃하시겠습니까?');
        if (confirmLogout) {
            logout();
        } else {
            window.navigateTo('/schedule'); // 로그인 유지 시 스케줄 페이지로 이동
            return false;
        }
    }
    return true;
}


// 쿠키를 읽어오는 함수
export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`); 
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// 사용자 프로필 정보를 서버에서 가져오는 함수
export async function fetchUserProfile(signal) {
    const accessToken = getCookie('accessToken');
    if (!accessToken) {
        throw new Error('로그인 토큰이 없습니다.');
    }

    const response = await fetch('/api/user-profile', { signal });
    console.log(response);

    if (!response.ok) {
        throw new Error('사용자 프로필 정보를 가져오는데 실패했습니다.');
    }

    return await response.json();
}

// 공지사항 개수를 서버에서 가져오는 함수
export async function fetchNoticeCount(signal) {
    const accessToken = getCookie('accessToken');
    if (!accessToken) {
        throw new Error('로그인 토큰이 없습니다.');
    }

    const response = await fetch('/api/notice-count', { signal });

    if (!response.ok) {
        throw new Error('공지사항 개수를 가져오는데 실패했습니다.');
    }

    const data = await response.json();
    const count = parseInt(data.count, 10); // 문자열을 숫자로 변환
    return count < 10 ? `0${count}` : String(count); // 숫자가 10보다 작으면 앞에 0을 붙여서 반환
}

export function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const separator = new Date().getSeconds() % 2 === 0 ? ':' : '<span style="visibility:hidden">:</span>';
    return `${hours}${separator}${minutes}`;
}

export function formatDateTime(date) {
    const pad = (num) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function showErrorModal(message) {
    const modal = document.createElement('div');
    modal.className = 'error-modal';
    modal.innerHTML = `
        <div class="error-modal-content">
            <p>${message}</p>
            <button id="error-modal-close">확인</button>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('error-modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}