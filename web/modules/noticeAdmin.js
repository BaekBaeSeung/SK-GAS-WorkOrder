import { getCurrentTime, getCurrentDate, getCurrentDay, fetchUserProfile, fetchNoticeCount, logout, formatTime, showErrorModal } from './utils.js'; // 유틸 함수 임포트
import debounce from 'lodash/debounce';

let isLoading = false;
let controller = new AbortController();

export const renderNoticeAdminPage = debounce(async function(container) {
    if (isLoading) return;
    isLoading = true;

    try {
        // 이전 요청 취소
        controller.abort();
        controller = new AbortController();



        const userProfile = await fetchUserProfile(controller.signal);
        console.log('User Profile:', userProfile); // 사용자 프로필 정보 출력 (디버깅용)

        if (userProfile.isAdmin !== 'ADMIN') {
            showErrorModal('권한을 확인하세요.');
            navigateTo('/schedule');
            return;
        }

        container.innerHTML = `
            <head>
                <link rel="stylesheet" href="/styles/noticeAdmin.css">
            </head>
            <div class="notice-admin-container">
                <img src="./assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo">
                <div class="header">
                    <img src="./assets/img/common/${userProfile.profile_pic}" alt="Avatar" class="avatar" id="avatar" style="object-fit: cover;">
                    <span class="initial"><span class="initial" style="${userProfile.isAdmin === 'ADMIN' ? 'opacity: 0;' : ''}">M</span></span>
                    <div class="time-container">
                        <div class="time-date">
                            <span class="time">${getCurrentTime()}</span>
                            <span class="date">${getCurrentDate()}</span>
                        </div>
                        <span class="day">${getCurrentDay()}</span>
                    </div>
                </div>
                <div class="notice-form">
                    <h2>공지 작성</h2>
                    <form id="notice-form">
                        <label for="importance">중요도:</label>
                        <select id="importance" name="importance">
                            <option value="HIGH">긴급</option>
                            <option value="MEDIUM">일반</option>
                        </select>
                        <label for="content">내용:</label>
                        <textarea id="content" name="content" rows="4" cols="50"></textarea>
                        <button type="submit">저장</button>
                    </form>
                </div>
            </div>
            <div id="modal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <button id="logout-button">로그아웃</button>
                </div>
            </div>
        `;

        // 모달 관련 이벤트 리스너 추가
        const modal = document.getElementById('modal');
        const avatar = document.getElementById('avatar');
        const closeModal = document.querySelector('.close');
        const logoutButton = document.getElementById('logout-button');

        avatar.addEventListener('click', () => {
            modal.style.display = 'block';
        });

        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });

        logoutButton.addEventListener('click', () => {
            logout(); // 로그아웃 요청
            modal.style.display = 'none';
        });

        // 공지 작성 폼 제출 이벤트 리스너 수정
        document.getElementById('notice-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const importance = document.getElementById('importance').value;
            const content = document.getElementById('content').value;

            try {
                const response = await fetch('/api/notice', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ importance, content }),
                    signal: controller.signal
                });

                if (response.ok) {
                    showErrorModal('공지사항이 성공적으로 저장되었습니다.');
                    navigateTo('/notice');
                } else {
                    showErrorModal('공지사항 저장에 실패했습니다.');
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    console.error('Error saving notice:', error);
                    showErrorModal('공지사항 저장 중 오류가 발생했습니다.');
                }
            }
        });
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Fetch aborted');
        } else {
            console.error('Error details:', error);
            showErrorModal('사용자 정보를 가져오는데 실패했습니다.');
        }
    } finally {
        isLoading = false;
    }
}, 0); 

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
