const btnSonido = document.getElementById('btnSonido');
const iconoSon  = document.getElementById('iconoSonido');
let   sonActivo = true;

btnSonido.addEventListener('click', () => {
    sonActivo = !sonActivo;
    iconoSon.src = sonActivo ? 'assets/bocina.png' : 'assets/sin-sonido.png';
    iconoSon.alt = sonActivo ? 'Sonido activado' : 'Sonido silenciado';
});

function esquivarNo(btn) {
    const margin = 16;

    const prevTransform = btn.style.transform;
    btn.style.transform = 'translate(0px, 0px)';
    const bRect = btn.getBoundingClientRect();
    btn.style.transform = prevTransform;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const minDx = margin - bRect.left;
    const maxDx = vw - margin - bRect.right;
    const minDy = margin - bRect.top;
    const maxDy = vh - margin - bRect.bottom;

    const dx = Math.random() * (maxDx - minDx) + minDx;
    const dy = Math.random() * (maxDy - minDy) + minDy;

    btn.style.transform = `translate(${dx}px, ${dy}px)`;
}

(function () {
    const wrapper   = document.getElementById('carruselWrapper');
    const track     = document.getElementById('carrusel');
    const dots      = document.querySelectorAll('.dot');

    if (!wrapper || !track) return;

    const SLIDE_W   = 320;
    const TOTAL     = track.querySelectorAll('.foto-card').length;
    const AUTO_MS   = 3500;
    const THRESHOLD = SLIDE_W * 0.18;

    let current    = 0;
    let timer      = null;
    let dragging   = false;
    let startX     = 0;
    let deltaX     = 0;

    function goTo(index) {
        current = ((index % TOTAL) + TOTAL) % TOTAL;
        track.style.transform = `translateX(-${current * SLIDE_W}px)`;
        dots.forEach((d, i) => d.classList.toggle('dot--activo', i === current));
    }

    function startAuto() {
        stopAuto();
        timer = setInterval(() => goTo(current + 1), AUTO_MS);
    }
    function stopAuto() {
        clearInterval(timer);
        timer = null;
    }
    function resumeAuto() {
        stopAuto();
        setTimeout(startAuto, 1000);
    }

    function onStart(x) {
        dragging = true;
        startX   = x;
        deltaX   = 0;
        stopAuto();
        track.style.transition = 'none';
    }

    function onMove(x) {
        if (!dragging) return;
        deltaX = x - startX;
        const base = -current * SLIDE_W;
        let offset = deltaX;
        if ((current === 0 && deltaX > 0) || (current === TOTAL - 1 && deltaX < 0)) {
            offset = deltaX * 0.25;
        }
        track.style.transform = `translateX(${base + offset}px)`;
    }

    function onEnd() {
        if (!dragging) return;
        dragging = false;
        track.style.transition = 'transform 0.45s ease';

        if (Math.abs(deltaX) >= THRESHOLD) {
            goTo(deltaX < 0 ? current + 1 : current - 1);
        } else {
            goTo(current);
        }

        deltaX = 0;
        resumeAuto();
    }

    wrapper.addEventListener('mousedown', e => {
        e.preventDefault();
        onStart(e.clientX);
    });
    window.addEventListener('mousemove', e => onMove(e.clientX));
    window.addEventListener('mouseup',   ()  => onEnd());
    window.addEventListener('mouseleave', () => { if (dragging) onEnd(); });

    wrapper.addEventListener('touchstart', e => {
        onStart(e.touches[0].clientX);
    }, { passive: true });

    wrapper.addEventListener('touchmove', e => {
        if (Math.abs(e.touches[0].clientX - startX) > 10) e.preventDefault();
        onMove(e.touches[0].clientX);
    }, { passive: false });

    wrapper.addEventListener('touchend',   () => onEnd());
    wrapper.addEventListener('touchcancel',() => onEnd());

    goTo(0);
    startAuto();
})();
