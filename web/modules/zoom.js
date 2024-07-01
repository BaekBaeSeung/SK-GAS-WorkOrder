let lastTouchEnd = 0;

function preventZoom(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
}

document.addEventListener('touchstart', preventZoom, { passive: false });
document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);
document.addEventListener('gesturestart', (event) => {
    event.preventDefault();
});