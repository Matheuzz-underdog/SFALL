
const btnSonido = document.getElementById('btnSonido');
const iconoSon  = document.getElementById('iconoSonido');
let   sonActivo = true; // el HTML arranca mostrando bocina.png (sonido activado)

const audio = new Audio('assets/cancion.mp3');
audio.loop = true;

const INICIO_SEGUNDOS = 75; //  segundo donde arranca

audio.addEventListener('loadedmetadata', () => {
    audio.currentTime = INICIO_SEGUNDOS;
});

function actualizarIcono(activo) {
    sonActivo = activo;
    iconoSon.src = activo ? 'assets/sonido.png' : 'assets/sin-sonido.png';
    iconoSon.alt = activo ? 'Sonido activado' : 'Sonido silenciado';
}

function intentarAutoplay() {
    audio.play()
        .then(() => actualizarIcono(true))
        .catch(() => {
            actualizarIcono(false);
            const activarConPrimerToque = () => {
                audio.play().then(() => actualizarIcono(true));
                document.removeEventListener('click', activarConPrimerToque);
                document.removeEventListener('touchstart', activarConPrimerToque);
            };
            document.addEventListener('click', activarConPrimerToque, { once: true });
            document.addEventListener('touchstart', activarConPrimerToque, { once: true });
        });
}

window.addEventListener('DOMContentLoaded', intentarAutoplay);

btnSonido.addEventListener('click', (e) => {
    e.stopPropagation(); // evita que dispare el listener de "primer toque" de arriba
    if (audio.paused) {
        audio.play();
        actualizarIcono(true);
    } else {
        audio.pause();
        actualizarIcono(false);
    }
});


let noBaseRect = null; 

function medirBase(btn) {
    // Importante: esto solo da un resultado correcto si se llama
    // ANTES de que el botón tenga algún transform aplicado.
    const r = btn.getBoundingClientRect();
    noBaseRect = { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
}

window.addEventListener('resize', () => { noBaseRect = null; });

function esquivarNo(btn) {
    const margin = 16; 

    if (!noBaseRect) {
        const prevTransition = btn.style.transition;
        const prevTransform  = btn.style.transform;
        btn.style.transition = 'none';      
        btn.style.transform  = 'none';
        void btn.offsetWidth;                
        medirBase(btn);
        btn.style.transform  = prevTransform || 'translate(0px, 0px)';
        void btn.offsetWidth;                
        btn.style.transition = prevTransition;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const minDx = margin - noBaseRect.left;
    const maxDx = vw - margin - noBaseRect.right;
    const minDy = margin - noBaseRect.top;
    const maxDy = vh - margin - noBaseRect.bottom;

    const dx = Math.random() * (maxDx - minDx) + minDx;
    const dy = Math.random() * (maxDy - minDy) + minDy;

    btn.style.transform = `translate(${dx}px, ${dy}px)`;
}


(function () {
    const wrapper   = document.getElementById('carruselWrapper');
    const track     = document.getElementById('carrusel');
    const dots      = document.querySelectorAll('.dot');

    if (!wrapper || !track) return;

    const SLIDE_W   = 320;   // px — ancho de cada foto
    const TOTAL     = track.querySelectorAll('.foto-card').length;
    const AUTO_MS   = 3500;  // ms entre slides automáticos
    const THRESHOLD = SLIDE_W * 0.18; // mínimo drag para cambiar slide

    let current    = 0;
    let timer      = null;
    let dragging   = false;
    let startX     = 0;
    let deltaX     = 0;

    function goTo(index) {
        current = ((index % TOTAL) + TOTAL) % TOTAL;
        track.style.transform = `translateX(-${current * SLIDE_W}px)`;
        // Actualizar dots
        dots.forEach((d, i) => d.classList.toggle('dot--activo', i === current));
    }

    /* ---- Auto-advance ---- */
    function startAuto() {
        stopAuto();
        timer = setInterval(() => goTo(current + 1), AUTO_MS);
    }
    function stopAuto() {
        clearInterval(timer);
        timer = null;
    }
    // Retoma el auto después de un respiro de 1s
    function resumeAuto() {
        stopAuto();
        setTimeout(startAuto, 1000);
    }

    function onStart(x) {
        dragging = true;
        startX   = x;
        deltaX   = 0;
        stopAuto();
        track.style.transition = 'none'; // sin animación mientras arrastras
    }

    function onMove(x) {
        if (!dragging) return;
        deltaX = x - startX;
        const base = -current * SLIDE_W;
        let offset = deltaX;
        if ((current === 0 && deltaX > 0) || (current === TOTAL - 1 && deltaX < 0)) {
            offset = deltaX * 0.25; // resistencia
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

    //arranque
    goTo(0);
    startAuto();
})();
