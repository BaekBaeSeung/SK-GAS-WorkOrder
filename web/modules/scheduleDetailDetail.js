import { getCurrentTime, getCurrentDate, getCurrentDay, fetchUserProfile, fetchNoticeCount, logout, formatTime, formatDateTime, showErrorModal } from './utils.js';
import debounce from 'lodash/debounce';

let isLoading = false;
let controller = new AbortController();

function showModal(message, onConfirm) {
    const modalContent = document.querySelector('.modal-content');
    modalContent.innerHTML = `
        <span class="close">&times;</span>
        <p>${message}</p>
        ${onConfirm ? '<button id="confirm-button" class="submit-button">확인</button>' : ''}
    `;
    const modal = document.getElementById('modal');
    modal.style.display = 'block';

    const closeModal = () => {
        modal.style.display = 'none';
        navigateTo('/scheduleDetail'); // 모달을 닫을 때 스케줄 디테일 페이지로 이동
    };

    const closeModalButton = document.querySelector('.close');
    closeModalButton.addEventListener('click', closeModal);

    if (onConfirm) {
        const confirmButton = document.getElementById('confirm-button');
        confirmButton.addEventListener('click', () => {
            modal.style.display = 'none';
            onConfirm();
            navigateTo('/scheduleDetail'); // 확인 버튼을 클릭할 때 스케줄 디테일 페이지로 이동
        });
    }
}

export const renderScheduleDetailDetailPage = debounce(async function(container, sectionId) {
    if (isLoading) return;
    isLoading = true;

    try {
        // 이전 요청 취소
        controller.abort();
        controller = new AbortController();

        const userProfile = await fetchUserProfile(controller.signal);
        const noticeCount = await fetchNoticeCount(controller.signal);

        // 로컬 스토리지에서 스케줄 데이터와 섹션 데이터 불러오기
        const scheduleData = JSON.parse(localStorage.getItem('currentScheduleData')) || {};
        const sectionData = JSON.parse(localStorage.getItem('currentSectionData')) || {};

        // sectionData.subSections가 배열인지 확인하고, 배열이 아닌 경우 빈 배열로 초기화
        const subSections = Array.isArray(sectionData.subSections) ? sectionData.subSections : [];

        // 서버에서 스케줄 데이터 가져오기
        let scheduleResponse;
        if (userProfile.isAdmin === 'ADMIN') {
            scheduleResponse = await fetch('/api/schedule/all', { signal: controller.signal }); // 모든 스케줄 데이터 가져오기
        } else {
            scheduleResponse = await fetch('/api/schedule', { signal: controller.signal });
        }

        if (!scheduleResponse.ok) {
            throw new Error('Failed to fetch schedules');
        }

        const schedules = await scheduleResponse.json();
        const initial = schedules.length > 0 ? schedules[0].schedule_type.toUpperCase() : '';

        // WorkingDetail 데이터 조회
        const workingDetailResponse = await fetch(`/api/working-detail?section=${sectionData.sectionName}&user_id=${userProfile.userId}&time=${scheduleData.time}&schedule_type=${scheduleData.schedule_type}&date=${scheduleData.date}&isAdmin=${userProfile.isAdmin}`, { signal: controller.signal });
        console.log("scheduleData.time : ",scheduleData.time);
        const workingDetailData = await workingDetailResponse.json();

        // value 값을 구분자 ','로 분리하여 배열로 변환
        const inputValues = workingDetailData.value ? workingDetailData.value.split(',') : [];

        // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
        const today = new Date();
        const formattedToday = `${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()}`; // 형식을 scheduleData.date와 동일하게 변경
        console.log("formattedToday : ", formattedToday);


        console.log("formattedToday : ", formattedToday);
        console.log("scheduleData.date : ", scheduleData.date);
        // input 요소와 submit 버튼 비활성화 여부 결정
        const isEditable = scheduleData.date === formattedToday && userProfile.isAdmin !== 'ADMIN';
        console.log("isEditable : ", isEditable);
        const showButton = isEditable;

        container.innerHTML = `
            <head>
                <link rel="stylesheet" href="/styles/scheduleDetailDetail.css">
            </head>
            <div class="grid-detail-detail-container">
                <div class="sticky-header"> <!-- sticky-header 클래스 추가 -->
                    <img src="/assets/img/common/color_logo.png" alt="SK 가스 로고" class="logo" id="logo">
                    <div class="header">
                        <img src="/assets/img/common/${userProfile.profile_pic}" alt="Avatar" class="avatar" id="avatar" style="object-fit: cover;">
                        <span class="initial" style="${userProfile.isAdmin === 'ADMIN' ? 'opacity: 0;' : ''}">${schedules[0].schedule_type.toUpperCase()}</span>
                        <div class="time-container">
                            <div class="time-date">
                                <span class="time">${formatTime(getCurrentTime())}</span>
                                <span class="date">${getCurrentDate()}</span>
                            </div>
                            <span class="day">${getCurrentDay()}</span>
                        </div>
                    </div>
                    <div class="notice" id="notice">
                        <p>공지사항 [${noticeCount}] <span class="dash">●</span></p>
                    </div>
                </div>
                <div class="schedule-detail">
                    <div class="schedule-item">
                        <div class="location-time">
                            <p class="location">${scheduleData.area_name || 'N/A'}</p>
                            <p class="time">${scheduleData.schedule_type === 'm' ? 'Morning' : scheduleData.schedule_type === 's' ? 'Swing' : 'Night'} ${scheduleData.time || 'N/A'}</p>
                        </div>
                        <div class="task-item task-item-header">
                            <p class="task-name task-name-header">${sectionData.sectionName}</p>
                        </div>
                        <div class="task">
                            ${subSections.map((subSection, index) => {
                                const taskNumber = (index + 1).toString().padStart(2, '0'); // 2자리 숫자로 만들기
                                return `
                                <div class="task-item">
                                    <div class="task-header">
                                        <span class="task-number ${inputValues[index] ? 'input-active' : ''}">${taskNumber}</span>
                                        <p class="task-name">${subSection.subSection_name}</p>
                                        <span class="task-code">[${subSection.item_no}]</span>
                                    </div>
                                    <div class="task-body">
                                    <img src="/assets/img/common/p771.png" alt="Gauge" class="gauge">
                                    <!-- <img src="/assets/img/common/${subSection.item_pic}" alt="Gauge" class="gauge"> -->
                                    <div class="input-container">
                                            <input type="text" class="input-field" value="${inputValues[index] || ''}" ${isEditable ? '' : 'disabled'} ${isEditable ? '' : 'readonly'}>
                                            <span class="unit">${subSection.section_unit}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                            
                            }).join('')}
                            <div class="submit-container">
                                ${showButton ? `
                                    <button id="submit-button" class="submit-button">
                                        ${workingDetailData && workingDetailData.value ? '수정' : '제출'}
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="modal" class="modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <button id="logout-button">로그아웃</button>
                </div>
            </div>

        `;

        // 이벤트 리스너 추가
        document.getElementById('notice').addEventListener('click', () => {
            navigateTo('/notice');
        });

        document.getElementById('logo').addEventListener('click', () => {
            navigateTo('/schedule');
        });

        // 제출 버튼 이벤트 리스너 추가
        const submitButton = document.getElementById('submit-button');
        if (submitButton) {
            submitButton.addEventListener('click', async () => {
                const inputFields = document.querySelectorAll('.input-field');
                const emptyFields = [];
                const inputValues = [];

                inputFields.forEach((inputField, index) => {
                    if (inputField.value.trim() === '') {
                        const taskItem = inputField.closest('.task-item');
                        const taskName = taskItem.querySelector('.task-name').textContent;
                        emptyFields.push(taskName);
                    } else {
                        inputValues.push(inputField.value.trim());
                    }
                });

                if (emptyFields.length > 0) {
                    const modalContent = document.querySelector('.modal-content');
                    modalContent.innerHTML = `
                        <span class="close">&times;</span>
                        <p>다음 항목이 입력되지 않았습니다 :</p>
                        <ul>
                            ${emptyFields.map(field => `<li>${field}</li>`).join('')}
                        </ul>
                    `;
                    const modal = document.getElementById('modal');
                    modal.style.display = 'block';

                    // 모달의 x 버튼 이벤트 리스너 추가
                    const closeModal = document.querySelector('.close');
                    closeModal.addEventListener('click', () => {
                        modal.style.display = 'none';
                    });
                } else {
                    const value = inputValues.join(',');
                    const section = sectionData.sectionName;
                    const userId = userProfile.userId;
                    const time = scheduleData.time.slice(0, 5); // HH:MM 형식으로 포맷팅
                    const scheduleType = scheduleData.schedule_type;
                    const createAt = formatDateTime(new Date()); // 현재 시간을 YYYY-MM-DD HH:MM:SS 형식으로 포맷팅

                    if (workingDetailData && workingDetailData.value) {
                        showModal('정말로 수정하시겠습니까?', async () => {
                            try {
                                // WorkingDetail 테이블에 데이터 업데이트 요청 보내기
                                const response = await fetch('/api/updateWorkingDetail', {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ working_detail_id: workingDetailData.working_detail_id, value, section, user_id: userId, time, schedule_type: scheduleType }),
                                });

                                if (response.ok) {
                                    showModal('데이터가 성공적으로 수정되었습니다.');
                                } else {
                                    showModal('데이터 수정에 실패했습니다.');
                                }
                            } catch (error) {
                                console.error('Error updating data:', error);
                                showModal('데이터 수정 중 오류가 발생했습니다.');
                            }
                        });
                    } else {
                        try {
                            // WorkingTime ID를 생성하기 위해 API 호출
                            const workTimeResponse = await fetch(`/api/working-time?time=${time}&area_name=${scheduleData.area_name}`);
                            const workTimeData = await workTimeResponse.json();
                            const workTimeId = workTimeData[0].work_time_id;

                            // WorkingDetail 테이블에 데이터 인서트 요청 보내기
                            const response = await fetch('/api/insertWorkingDetail', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ work_time_id: workTimeId, value, create_at: createAt, section, user_id: userId, time, schedule_type: scheduleType }),
                            });

                            if (response.ok) {
                                showModal('데이터가 성공적으로 제출되었습니다.');
                                
                            } else {
                                showModal('데이터 제출에 실패했습니다.');
                            }
                        } catch (error) {
                            console.error('Error submitting data:', error);
                            showModal('데이터 제출 중 오류가 발생했습니다.');
                        }
                    }
                }
            });
        }

        // input 박스 이벤트 리스너 추가
        const inputFields = document.querySelectorAll('.input-field');
        inputFields.forEach(inputField => {
            inputField.addEventListener('input', (event) => {
                const taskNumber = event.target.closest('.task-item').querySelector('.task-number');
                if (taskNumber) {
                    if (event.target.value.trim() === '') {
                        taskNumber.classList.remove('input-active');
                    } else {
                        taskNumber.classList.add('input-active');
                    }
                }
            });

            // 텍스트 선택 방지
            inputField.addEventListener('selectstart', (event) => {
                if (!isEditable) {
                    event.preventDefault();
                }
            });

            // 드래그 방지
            inputField.addEventListener('dragstart', (event) => {
                if (!isEditable) {
                    event.preventDefault();
                }
            });
        });

        // 모달 관련 이벤트 리스너 추가
        const modal = document.getElementById('modal');
        const avatar = document.getElementById('avatar');
        const closeModal = document.querySelector('.close');
        const logoutButton = document.getElementById('logout-button');

        if (avatar) {
            avatar.addEventListener('click', () => {
                if (modal) modal.style.display = 'block';
            });
        }

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
            });
        }

        if (window) {
            window.addEventListener('click', (event) => {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', () => {
                logout(); // 로그아웃 요청
                if (modal) modal.style.display = 'none';
            });
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Fetch aborted');
        } else {
            console.error('Error details:', error);
            showErrorModal('사용자 정보 또는 공지사항 개수를 가져오는데 실패했습니다.');
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
