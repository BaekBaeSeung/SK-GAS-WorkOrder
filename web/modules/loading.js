export function renderLoadingPage(container) {
    container.innerHTML = `
    <head>
        <link rel="stylesheet" href="/styles/loading.css">
    </head>
        <img src="./assets/img/common/white_logo.png" alt="SK 가스 로고">
        <p>시설 관리 DX</p>
        <button id="startButton"><span id="startText">시작하기 ></span></button>
    `;
    document.getElementById('startButton').addEventListener('click', () => {
        navigateTo('/login');
    });
}
