(() => {
  const boot = document.querySelector('#boot');
  const button = document.querySelector('#presentationButton');
  const reveals = document.querySelectorAll('.reveal');

  const finishBoot = () => boot?.classList.add('is-done');
  window.addEventListener('load', () => setTimeout(finishBoot, 650));
  setTimeout(finishBoot, 1800);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    reveals.forEach((item) => observer.observe(item));
  } else {
    reveals.forEach((item) => item.classList.add('is-visible'));
  }

  button?.addEventListener('click', () => {
    document.body.classList.toggle('presentation-off');
    button.classList.toggle('is-off');
  });

  const hero = document.querySelector('.hero');
  const flare = document.querySelector('.hero__flare');
  if (hero && flare && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      flare.style.transform = `translate(${x * 18}px, ${y * 14}px)`;
    });
    hero.addEventListener('pointerleave', () => {
      flare.style.transform = 'translate(0,0)';
    });
  }
})();
