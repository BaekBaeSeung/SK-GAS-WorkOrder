import { logout } from './utils.js';

export function createMenu(container) {
    // 기존 메뉴 제거
    container.innerHTML = '';

    // HTML 생성
    const menuHTML = `
        <button id="menu-toggle" class="tb-menu-toggle">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <ul id="menu" class="tb-mobile-menu">
            <li><a href="/">홈</a></li>
            <li><a href="/schedule">스케줄</a></li>
            <li><a href="/notice">공지사항</a></li>
            <li><a href="/previous">이전 점검 기록</a></li>
            <li><a href="#" id="logout-link">로그아웃</a></li>
        </ul>
    `;

    // HTML을 컨테이너에 삽입
    container.innerHTML = menuHTML;

    // CSS 스타일 추가
    const existingStyle = document.getElementById('menu-style');
    if (existingStyle) {
        existingStyle.remove();
    }
    const style = document.createElement('style');
    style.id = 'menu-style';
    style.textContent = `
        #menu-container {
            position: fixed;
            top: 3%;
            left: 3%;
            z-index: 1002;
        }
        .tb-menu-toggle {
            width: 30px;
            height: 25px;
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 0;
            position: relative;
            z-index: 1001;
        }
        .tb-menu-toggle span {
            display: block;
            position: absolute;
            height: 3px;
            width: 100%;
            background: orange;
            border-radius: 3px;
            opacity: 1;
            left: 0;
            transform: rotate(0deg);
            transition: .25s ease-in-out;
        }
        .tb-menu-toggle span:nth-child(1) { top: 0px; }
        .tb-menu-toggle span:nth-child(2) { top: 10px; }
        .tb-menu-toggle span:nth-child(3) { top: 20px; }
        .tb-menu-toggle.tb-active-toggle span:nth-child(1) {
            top: 10px;
            transform: rotate(45deg);
        }
        .tb-menu-toggle.tb-active-toggle span:nth-child(2) {
            opacity: 0;
        }
        .tb-menu-toggle.tb-active-toggle span:nth-child(3) {
            top: 10px;
            transform: rotate(-45deg);
        }
        .tb-mobile-menu {
            display: none;
            list-style: none;
            padding: 10px 0;
            margin: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            opacity: 0;
            transform: translateY(-20px);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .tb-mobile-menu.active {
            display: block;
            opacity: 1;
            transform: translateY(0);
        }
        .tb-mobile-menu li {
            padding: 10px 20px;
            border-bottom: 1px solid #eee;
        }
        .tb-mobile-menu li:last-child {
            border-bottom: none;
        }
        .tb-mobile-menu a {
            text-decoration: none;
            color: #333;
            display: block;
            transition: color 0.2s ease;
        }
        .tb-mobile-menu a:hover {
            color: orange;
        }
    `;
    document.head.appendChild(style);


    // JavaScript 기능 추가
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');

    menuToggle.addEventListener('click', (event) => {
        event.preventDefault();
        menuToggle.classList.toggle('tb-active-toggle');
        menu.classList.toggle('active');
        updateMenuVisibility(); // 메뉴 토글 시 가시성 업데이트
    });

    // 메뉴 항목 클릭 시 페이지 이동 및 메뉴 닫기
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', async (event) => {
            event.preventDefault();
            const href = link.getAttribute('href');
            if (href === '#' && link.id === 'logout-link') {
                // 로그아웃 처리
                await logout();
            } else {
                window.navigateTo(href);
            }
            menu.classList.remove('active');
            menuToggle.classList.remove('tb-active-toggle');
        });
    });

    // 현재 페이지에 따라 메뉴 항목 가시성 업데이트
    function updateMenuVisibility() {
        const currentPath = window.location.pathname;
        menu.querySelectorAll('li').forEach(item => {
            const link = item.querySelector('a');
            if (link && link.getAttribute('href') === currentPath) {
                item.style.display = 'none';
            } else {
                item.style.display = 'block';
            }
        });
    }

    // 초기 메뉴 가시성 설정
    updateMenuVisibility();

    // 메뉴 가시성 업데이트 함수를 외부에서 접근 가능하게 만듦
    container.updateMenuVisibility = updateMenuVisibility;
}

