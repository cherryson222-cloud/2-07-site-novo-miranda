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