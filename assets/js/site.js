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
})();
