export function createLayout(content) {
    return `
        <div id="layout">
            <div id="menu-container"></div>
            <div id="content">${content}</div>
        </div>
    `;
}