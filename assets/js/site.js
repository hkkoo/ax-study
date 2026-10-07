(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');

  const updateThemeButton = () => {
    if (!themeButton) return;
    const isDark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-label', isDark ? '밝은 테마로 전환' : '어두운 테마로 전환');
    themeButton.innerHTML = `<span aria-hidden="true">${isDark ? '☼' : '◐'}</span>`;
  };

  updateThemeButton();
  themeButton?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('ax-study-theme', root.dataset.theme); } catch (error) {}
    updateThemeButton();
  });

  const filters = [...document.querySelectorAll('.filter-button')];
  const cards = [...document.querySelectorAll('.project-card')];
  const count = document.querySelector('.filter-count');

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      const selected = filter.dataset.filter;
      filters.forEach((button) => {
        const active = button === filter;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      let visible = 0;
      cards.forEach((card) => {
        const show = selected === 'all' || card.dataset.category === selected;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (count) count.textContent = `${visible}개 항목`;
    });
  });
})();
