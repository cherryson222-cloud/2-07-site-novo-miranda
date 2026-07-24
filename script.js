/* ── Header sticky ── */
const hdr = document.getElementById('hdr');
if (hdr) {
  window.addEventListener('scroll', () => {
    hdr.classList.toggle('fixa', window.scrollY > 60);
  }, { passive: true });
}

/* ── Rolagem suave nos links internos (âncoras) ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ── Menu mobile ── */
const burger   = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

if (burger && navLinks) {
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
      burger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    })
  );
}

/* ── Ticker loop ── */
(function(){
  const t = document.getElementById('ticker');
  if (t) t.innerHTML += t.innerHTML;
})();

/* ── Form → WhatsApp ── */
const btnSubmit = document.getElementById('formSubmit');
if (btnSubmit) {
  btnSubmit.addEventListener('click', () => {
    const cats     = [...document.querySelectorAll('.cat-chk:checked')].map(c => c.value);
    const email    = document.getElementById('fEmail').value.trim();
    const detalhes = document.getElementById('fDetalhes').value.trim();
    if (!cats.length) { alert('Por favor, selecione pelo menos um serviço.'); return; }
    if (!email)       { alert('Por favor, informe seu e-mail.');              return; }
    if (!document.getElementById('fEmail').checkValidity()) { alert('Por favor, informe um e-mail válido.'); return; }
    if (!detalhes)    { alert('Por favor, descreva um pouco o seu projeto.'); return; }
    const msg =
      `Olá! Vim pelo site do Miranda Studio Criativo 🌸\n\n` +
      `*Serviço(s):* ${cats.join(', ')}\n` +
      `*E-mail:* ${email}\n\n` +
      `*Projeto:*\n${detalhes}`;
    window.open(`https://wa.me/558499477550?text=${encodeURIComponent(msg)}`, '_blank');
  });
}
/* ── Showcase Adesivos — Slider ── */
(function () {
  const track   = document.getElementById('adsSliderTrack');
  const wrapper = document.getElementById('adsSliderWrapper');
  const dots    = document.querySelectorAll('.ads-dot');
  const btnPrev = document.getElementById('adsPrev');
  const btnNext = document.getElementById('adsNext');
  if (!track || !wrapper) return;

  // Configuration
  const slides = Array.from(track.children);
  const totalSlides = 3; // Mantemos a animação entre os 3 principais
  
  let currentIndex = 0; // Visual index
  let autoTimer;
  let startX = 0;
  let isTransitioning = false;

  function getMetrics() {
    const slide = slides[0];
    const gap = parseFloat(getComputedStyle(track).gap) || 24;
    return {
      slideW: slide.offsetWidth + gap,
      wrapW: wrapper.offsetWidth,
      slideOnly: slide.offsetWidth
    };
  }

  function updateTrack(animate = true) {
    const { slideW, wrapW, slideOnly } = getMetrics();
    // Calculate center offset to keep active slide in middle
    const center = (wrapW - slideOnly) / 2;
    const x = (currentIndex * slideW) - center;

    track.style.transition = animate ? 'transform 0.55s cubic-bezier(0.4,0,0.2,1)' : 'none';
    track.style.transform = `translateX(${-x}px)`;

    // Update dots based on real index (0, 1, 2)
    const realIndex = currentIndex % totalSlides;
    dots.forEach((d, i) => d.classList.toggle('ads-dot--active', i === realIndex));
  }

  function slideNext() {
    if (isTransitioning) return;
    currentIndex++;
    updateTrack(true);

    // Infinite loop: if we hit the clone of 0 (index 3)
    if (currentIndex === totalSlides) {
      isTransitioning = true;
      track.addEventListener('transitionend', function reset() {
        track.removeEventListener('transitionend', reset);
        currentIndex = 0; // Jump back to real 0
        updateTrack(false);
        isTransitioning = false;
      }, { once: true });
    }
  }

  function slidePrev() {
    if (isTransitioning) return;
    if (currentIndex === 0) {
      // Loop backward: Jump to clone of 0 (index 3), then slide to 2
      currentIndex = totalSlides;
      updateTrack(false);
      void track.offsetWidth; // Force reflow
      currentIndex = totalSlides - 1;
      updateTrack(true);
    } else {
      currentIndex--;
      updateTrack(true);
    }
  }

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(slideNext, 3600);
  }

  // Event Listeners
  btnNext?.addEventListener('click', () => { slideNext(); resetAuto(); });
  btnPrev?.addEventListener('click', () => { slidePrev(); resetAuto(); });
  
  dots.forEach((d, i) => d.addEventListener('click', () => {
    currentIndex = i;
    updateTrack(true);
    resetAuto();
  }));

  /* Touch swipe */
  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    resetAuto();
  }, { passive: true });
  
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (diff > 50) slideNext();
    else if (diff < -50) slidePrev();
    resetAuto();
  });

  /* Hover pause */
  wrapper.addEventListener('mouseenter', () => clearInterval(autoTimer));
  wrapper.addEventListener('mouseleave', resetAuto);

  /* Resize */
  window.addEventListener('resize', () => updateTrack(false), { passive: true });

  // Init
  updateTrack(false);
  resetAuto();
})();

/* ── Seção de Vídeos: prévia no card + modal em tela cheia ── */
(function () {
  const cards   = document.querySelectorAll('.vid-card');
  const modal   = document.getElementById('vidModal');
  if (!cards.length || !modal) return;

  const backdrop = document.getElementById('vidModalBackdrop');
  const closeBtn  = document.getElementById('vidModalClose');
  const player    = document.getElementById('vidModalPlayer');
  let lastFocused = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Prévia silenciosa toca só quando o card está visível na tela
     (desativada se o usuário/sistema pedir "reduzir movimento") */
  const previewObs = new IntersectionObserver(entries => {
    if (reduceMotion) return;
    entries.forEach(entry => {
      const vid = entry.target.querySelector('.vid-preview');
      if (!vid) return;
      if (entry.isIntersecting) {
        vid.play().catch(() => {});
      } else {
        vid.pause();
      }
    });
  }, { threshold: 0.35 });

  cards.forEach(card => previewObs.observe(card));

  function openModal(card) {
    const preview = card.querySelector('.vid-preview');
    if (preview) preview.pause();

    lastFocused = document.activeElement;
    player.src = card.dataset.src;
    player.currentTime = 0;
    player.muted = false;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    player.play().catch(() => {});
    closeBtn.focus();
  }

  function closeModal() {
    player.pause();
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    player.removeAttribute('src');
    player.load();
    if (lastFocused) lastFocused.focus();
  }

  cards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
  });

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();

const spSliderWrap = document.querySelector('.sp-slider-wrap');
if (spSliderWrap) {
  const spSlider = spSliderWrap.querySelector('.sp-slider');
  const spPrevBtn = spSliderWrap.querySelector('.sp-slider-btn--prev');
  const spNextBtn = spSliderWrap.querySelector('.sp-slider-btn--next');

  const scrollSpSlider = (direction) => {
    const scrollAmount = spSlider.clientWidth * 0.8; // Rola 80% da largura visível
    spSlider.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  };

  if (spPrevBtn && spNextBtn && spSlider) {
    spPrevBtn.addEventListener('click', () => scrollSpSlider(-1));
    spNextBtn.addEventListener('click', () => scrollSpSlider(1));
  }
}