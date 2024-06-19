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

// 로그인 상태 확인 함수
export function checkLoginStatus() {
    if (localStorage.getItem('accessToken')) {
        const confirmLogout = confirm('이미 로그인된 상태입니다. 로그아웃하시겠습니까?');
        if (confirmLogout) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            alert('로그아웃 되었습니다.');
        } else {
            window.navigateTo('/schedule'); // 로그인 유지 시 스케줄 페이지로 이동
            return false;
        }
    }
    return true;
}

// 사용자 프로필 정보를 서버에서 가져오는 함수
export async function fetchUserProfile() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('로그인 토큰이 없습니다.');
    }

    const response = await fetch('/api/user-profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    console.log(response);

    if (!response.ok) {
        throw new Error('사용자 프로필 정보를 가져오는데 실패했습니다.');
    }

    return await response.json();
}

// 공지사항 개수를 서버에서 가져오는 함수
export async function fetchNoticeCount() {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('로그인 토큰이 없습니다.');
    }

    const response = await fetch('/api/notice-count', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error('공지사항 개수를 가져오는데 실패했습니다.');
    }

    const data = await response.json();
    return parseInt(data.count, 10); // 문자열을 숫자로 변환
}
