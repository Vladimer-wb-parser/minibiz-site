(() => {
  // Класс .js включает мобильное меню. Без скрипта вёрстка остаётся
  // рабочей: ссылки навигации просто показываются списком (см. style.css).
  document.documentElement.classList.add('js');

  const button = document.querySelector('.menu');
  const nav = document.querySelector('#nav');
  if (button && nav) {
    button.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      button.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    }));
  }
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
