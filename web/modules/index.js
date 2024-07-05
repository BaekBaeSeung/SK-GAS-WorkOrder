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
// import { renderScheduleDetailAdminPage } from './scheduleDetailadmin.js'; // 추가
import { renderNoticeAdminPage } from './noticeAdmin.js'; // noticeAdmin.js 파일에서 공지 작성 페이지 정의
import { renderNoticeDetailPage } from './noticeDetail.js'; // noticeDetail.js 파일에서 공지사항 상세 페이지 정의
import { renderScheduleSelectPage } from './scheduleSelect.js'; // 추가
import { createMenu } from './menu.js';

//=================================================================
// Element List
//=================================================================


// //=================================================================
// // Function & Class
// //=================================================================


// //=================================================================
// // Start Script
// //=================================================================

function loadCSS(filename) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = filename;
    link.setAttribute('data-page-style', 'true');
    document.head.appendChild(link);
}

function applyFadeEffect(container) {
    container.classList.add('fade-in');
    setTimeout(() => {
        container.classList.add('active');
    }, 50);

    setTimeout(() => {
        container.classList.remove('fade-in', 'active');
    }, 500);
}

// 전역 변수로 메뉴 컨테이너와 로딩 상태 선언
let menuContainer;
let isLoading = false;
let isMenuCreated = false;

function createMenuIfNeeded() {
    if (!isMenuCreated) {
        menuContainer = document.getElementById('menu-container');
        if (!menuContainer) {
            menuContainer = document.createElement('div');
            menuContainer.id = 'menu-container';
            document.body.insertBefore(menuContainer, document.body.firstChild);
        }
        createMenu(menuContainer);
        isMenuCreated = true;
    }
}

function loadPage(path, state = {}) {
    // 이미 로딩 중이면 함수 실행을 중단
    if (isLoading) return;
    isLoading = true;

    const app = document.getElementById('app');
    
    // 페이드 아웃 효과 적용
    app.classList.add('fade-in');
    app.classList.remove('active');

    setTimeout(() => {
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
            isLoading = false;
            return;
        }

        // localStorage에서 상태 복원
        const savedState = JSON.parse(localStorage.getItem('pageState')) || {};

        // 햄버거 메뉴 처리
        if (path === '/' || path === '/login') {
            // 로딩 페이지와 로그인 페이지에서는 메뉴 숨김
            if (menuContainer) {
                menuContainer.style.display = 'none';
            }
        } else {
            // 다른 페이지에서는 메뉴 표시
            createMenuIfNeeded();
            if (menuContainer) {
                menuContainer.style.display = 'block';
            }
        }

        // 기존 컨텐츠 제거
        app.innerHTML = '';

        switch(true) {
            case path === '/':
                renderLoadingPage(app);
                loadCSS('/styles/loading.css'); // 로딩 페이지 스타일 로드
                break;
            case path === '/login':
                renderLoginPage(app);
                loadCSS('/styles/login.css'); // 로그인 페이지 스타일 로드
                break;
            case path === '/schedule':
                renderSchedulePage(app);
                loadCSS('/styles/schedule.css'); // 스케줄 페이지 스타일 로드
                break;
            case path === '/scheduleSelect': // 추가
                renderScheduleSelectPage(app);
                loadCSS('/styles/scheduleSelect.css'); // 스케줄 선택 페이지 스타일 로드
                break;
            case path === '/notice':
                renderNoticePage(app);
                loadCSS('/styles/notice.css'); // 공지사항 페이지 스타일 로드
                break;
            case path === '/previous':
                renderPreviousPage(app);
                loadCSS('/styles/previous.css'); // 이전 점검 기록 페이지 스타일 로드
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
                loadCSS('/styles/scheduleDetail.css'); // 스케줄 상세 페이지 스타일 로드
                break;
            case path.startsWith('/scheduleDetailDetail/'): // 수정된 부분
                const sectionId = path.split('/')[2];
                renderScheduleDetailDetailPage(app, sectionId);
                loadCSS('/styles/scheduleDetailDetail.css');
                break;
            // case path === '/scheduleDetailadmin': // 추가
            //     renderScheduleDetailAdminPage(app);
            //     loadCSS('/styles/scheduleDetailadmin.css'); // 관리자 페이지 스타일 로드
            //     break;
            case path === '/noticeAdmin': // 추가
                renderNoticeAdminPage(app);
                loadCSS('/styles/noticeAdmin.css');
                break;
            case path.startsWith('/noticeDetail/'): // 추가 
                const noticeId = path.split('/')[2];
                renderNoticeDetailPage(app, noticeId);
                loadCSS('/styles/noticeDetail.css');
                break;
            default:
                app.innerHTML = `<h1>404 - Page Not Found</h1>`;
                break; 
        }

        // 페이드인 효과 적용
        applyFadeEffect(app);

        // 페이지 로딩 완료 후 상태 리셋
        isLoading = false;
    }, 250); // 페이드 아웃을 위한 짧은 지연
}

// DOMContentLoaded 이벤트 리스너 수정
window.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById('app');
    applyFadeEffect(app);
    
    // 초기 페이지 로드 시 메뉴 생성
    if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
        createMenuIfNeeded();
    }
    
    loadPage(window.location.pathname);
});

window.addEventListener('popstate', (event) => {
    loadPage(window.location.pathname, event.state);
});

function navigateTo(path, state = {}) {
    // 이미 로딩 중이면 함수 실행을 중단
    if (isLoading) return;

    const app = document.getElementById('app');
    
    // 페이드 아웃 효과 적용
    app.classList.add('fade-in');
    app.classList.remove('active');

    setTimeout(() => {
        history.pushState(state, '', path);
        localStorage.setItem('pageState', JSON.stringify(state));
        loadPage(path, state);
    }, 150); // 페이드 아웃을 위한 짧은 지연
}

// navigateTo 함수를 전역으로 사용 가능하게 설정
window.navigateTo = navigateTo;



function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`); // 쿠키 값을 기준으로 분할
    if (parts.length === 2) return parts.pop().split(';').shift(); // 마지막 부분만 반환
    return null; // 쿠키가 없으면 null 반환
}

// 브라우저 콘솔에서 실행
console.log(getCookie('accessToken'));

// 모달 표시 함수 수정
let modalVisible = false;

export function showModal(message) {
    if (modalVisible) return; // 이미 모달이 표시 중이면 함수 실행을 중단

    modalVisible = true;
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
        modalVisible = false;
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
        z-index: 1001;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.5);
        justify-content: center;
        align-items: center;
        animation: fadeIn 0.3s;
    }
    .modal-content {
        background-color: #fff;
        margin: auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        max-width: 25rem; /* 최대 너비를 rem 단위로 설정 */
        border-radius: 0.625rem; /* 모서리 반경을 rem 단위로 설정 */
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s;
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
    @keyframes slideIn {
        from { transform: translateY(-50px); }
        to { transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// 전역 스타일 추가
const globalStyle = document.createElement('style');
globalStyle.textContent = `
    #menu-container {
        position: fixed;
        top: 10px;
        left: 10px;
        z-index: 1000;
    }
`;
document.head.appendChild(globalStyle);


