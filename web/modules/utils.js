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

// 다른 유틸리티 함수들 추가 가능
