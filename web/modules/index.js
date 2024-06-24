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
import { renderNoticeDetailPage } from './noticeDetail.js'; // noticeDetail.js 파일에서 공지사항 상세 페이지 정의

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

function navigateTo(path, state = {}) {
    history.pushState(state, '', path);
    localStorage.setItem('pageState', JSON.stringify(state)); // 상태를 localStorage에 저장
    loadPage(path, state);
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

function showModal(message) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <p>${message}</p>
        </div>
    `;
    document.body.appendChild(modal);

    const closeModal = () => {
        modal.style.display = 'none';
        document.body.removeChild(modal);
    };

    modal.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    modal.style.display = 'block';
}

// 모달 스타일 추가
const style = document.createElement('style');
style.innerHTML = `
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.5);
        justify-content: center;
        align-items: center;
    }
    .modal-content {
        background-color: #fefefe;
        margin: auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        max-width: 500px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        animation: fadeIn 0.3s;
    }
    .close {
        color: #aaa;
        float: right;
        font-size: 28px;
        font-weight: bold;
    }
    .close:hover,
    .close:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);

function loadPage(path, state = {}) {
    const app = document.getElementById('app');
    // 기존 스타일 제거
    const existingLink = document.querySelector('link[data-page-style]');
    if (existingLink) {
        existingLink.remove();
    }

    const accessToken = getCookie('accessToken');

    // 로그인 페이지와 로딩 페이지를 제외한 모든 페이지에 대해 엑세스 토큰 확인
    if (path !== '/' && path !== '/login' && !accessToken) {
        showModal('로그인이 필요합니다.');
        navigateTo('/login');
        return;
    }

    // 로그인 상태에서 로그인 페이지로 접근 시도 시
    if (path === '/login' && accessToken) {
        showModal('이미 로그인된 상태입니다. 프로필을 눌러서 로그아웃 해주세요.');
        navigateTo('/schedule'); // 로그인 상태라면 스케줄 페이지로 리다이렉트
        return;
    }

    // localStorage에서 상태 복원
    const savedState = JSON.parse(localStorage.getItem('pageState')) || {};

    switch(true) {
        case path === '/':
            renderLoadingPage(app);
            // loadCSS('./styles/loading.css'); // 로딩 페이지 스타일 로드
            break;
        case path === '/login':
            renderLoginPage(app);
            loadCSS('./styles/login.css'); // 로그인 페이지 스타일 로드
            break;
        case path === '/schedule':
            renderSchedulePage(app);
            loadCSS('./styles/schedule.css'); // 스케줄 페이지 스타일 로드
            break;
        case path === '/notice':
            renderNoticePage(app);
            loadCSS('./styles/notice.css'); // 공지사항 페이지 스타일 로드
            break;
        case path === '/previous':
            renderPreviousPage(app);
            loadCSS('./styles/previous.css'); // 이전 점검 기록 페이지 스타일 로드
            break;
        case path === '/scheduleDetail':
            if ((!state.sections && !savedState.sections) || (!state.scheduleData && !savedState.scheduleData)) {
                const storedSections = JSON.parse(localStorage.getItem('scheduleSections'));
                const storedScheduleData = JSON.parse(localStorage.getItem('scheduleData'));
                if (!storedSections || storedSections.length === 0 || !storedScheduleData) {
                    showModal('잘못된 접근입니다.'); 
                    navigateTo('/schedule');
                    return;
                }
                renderScheduleDetailPage(app, storedScheduleData, storedSections);
            } else {
                renderScheduleDetailPage(app, state.scheduleData || savedState.scheduleData, state.sections || savedState.sections);
            }
            loadCSS('./styles/scheduleDetail.css'); // 스케줄 상세 페이지 스타일 로드
            break;
        case path.startsWith('/scheduleDetailDetail/'): // 수정된 부분
            const sectionId = path.split('/')[2];
            renderScheduleDetailDetailPage(app, sectionId);
            loadCSS('./styles/scheduleDetailDetail.css');
            break;
        case path === '/scheduleDetailadmin': // 추가
            renderScheduleDetailAdminPage(app);
            loadCSS('./styles/scheduleDetailadmin.css'); // 관리자 페이지 스타일 로드
            break;
        case path === '/noticeAdmin': // 추가
            renderNoticeAdminPage(app);
            loadCSS('./styles/noticeAdmin.css');
            break;
        case path.startsWith('/noticeDetail/'): // 추가
            const noticeId = path.split('/')[2];
            renderNoticeDetailPage(app, noticeId);
            break;
        default:
            app.innerHTML = `<h1>404 - Page Not Found</h1>`;
            break; 
    }
}
