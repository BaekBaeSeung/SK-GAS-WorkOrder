/**
 *  @author XHI-NM
 *  @description
 *  index.js Sample
 */

// import { connect } from './database/connect/mariadb.js';
// connect();

//=================================================================
// Import Renderer, Component
//=================================================================
import { renderLoadingPage } from './loading.js';
import { renderLoginPage } from './login.js'; // login.js 파일에서 로그인 페이지 정의
import { renderSchedulePage } from './schedule.js'; // schedule.js 파일에서 스케줄 페이지 정의
import { renderNoticePage } from './notice.js'; // notice.js 파일에서 공지사항 페이지 정의
import { renderPreviousPage } from './previous.js'; // previous.js 파일에서 이전 점검 기록 페이지 정의
import { renderScheduleDetailPage } from './scheduleDetail.js'; // scheduleDetail.js 파일에서 스케줄 상세 페이지 정의
import { renderScheduleDetailDetailPage } from './scheduleDetailDetail.js'; // 추가
import { renderScheduleDetailAdminPage } from './scheduleDetailadmin.js'; // 추가
import { renderNoticeAdminPage } from './noticeAdmin.js'; // noticeAdmin.js 파일에서 공지 작성 페이지 정의

//=================================================================
// Element List
//=================================================================


// //=================================================================
// // Function & Class
// //=================================================================


// //=================================================================
// // Start Script
// //=================================================================
window.addEventListener("DOMContentLoaded", async() => {
    loadPage(window.location.pathname);
});

window.onload = () => {
    // Remove the global click and touchstart event listeners
};

window.addEventListener('popstate', () => {
    loadPage(window.location.pathname);
});

function navigateTo(path) {
    history.pushState({}, '', path);
    loadPage(path);
}

// navigateTo 함수를 전역으로 사용 가능하게 설정
window.navigateTo = navigateTo;

function loadCSS(filename) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = filename;
    link.setAttribute('data-page-style', 'true'); // 페이지별 CSS 파일임을 표시
    document.head.appendChild(link);
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`); // 쿠키 값을 기준으로 분할
    if (parts.length === 2) return parts.pop().split(';').shift(); // 마지막 부분만 반환
    return null; // 쿠키가 없으면 null 반환
}

// 브라우저 콘솔에서 실행
console.log(getCookie('accessToken'));

function loadPage(path) {
    const app = document.getElementById('app');
    // 기존 스타일 제거
    const existingLink = document.querySelector('link[data-page-style]');
    if (existingLink) {
        existingLink.remove();
    }

    // 로그인 페이지와 로딩 페이지를 제외한 모든 페이지에 대해 엑세스 토큰 확인
    if (path !== '/' && path !== '/login' && !getCookie('accessToken')) {
        alert('로그인이 필요합니다.');
        navigateTo('/login');
        return;
    }

    switch(path) {
        case '/':
            loadCSS('./styles/loading.css'); // 로딩 페이지 스타일 로드
            renderLoadingPage(app);
            break;
        case '/login':
            loadCSS('./styles/login.css'); // 로그인 페이지 스타일 로드
            renderLoginPage(app);
            break;
        case '/schedule':
            loadCSS('./styles/schedule.css'); // 스케줄 페이지 스타일 로드
            renderSchedulePage(app);
            break;
        case '/notice':
            loadCSS('./styles/notice.css'); // 공지사항 페이지 스타일 로드
            renderNoticePage(app);
            break;
        case '/previous':
            loadCSS('./styles/previous.css'); // 이전 점검 기록 페이지 스타일 로드
            renderPreviousPage(app);
            break;
        case '/scheduleDetail':
            loadCSS('./styles/scheduleDetail.css'); // 스케줄 상세 페이지 스타일 로드
            renderScheduleDetailPage(app);
            break;
        case '/scheduleDetailDetail': // 추가
            loadCSS('./styles/scheduleDetailDetail.css');
            renderScheduleDetailDetailPage(app);
            break;
        case '/scheduleDetailadmin': // 추가
            loadCSS('./styles/scheduleDetailadmin.css'); // 관리자 페이지 스타일 로드
            renderScheduleDetailAdminPage(app);
            break;
        case '/noticeAdmin': // 추가
            loadCSS('./styles/noticeAdmin.css'); // 공지 작성 페이지 스타일 로드
            renderNoticeAdminPage(app);
            break;
        default:
            app.innerHTML = `<h1>404 - Page Not Found</h1>`;
            break; 
    }
}
