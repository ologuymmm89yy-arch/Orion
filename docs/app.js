const body = document.body;
const themeToggle = document.querySelector('#themeToggle');
const apiSearch = document.querySelector('#apiSearch');
const apiCards = [...document.querySelectorAll('.api-card')];
const emptyState = document.querySelector('#emptyState');

const savedTheme = localStorage.getItem('orion-site-theme');
if (savedTheme === 'light') body.classList.add('light');

themeToggle.addEventListener('click', () => {
  body.classList.toggle('light');
  localStorage.setItem('orion-site-theme', body.classList.contains('light') ? 'light' : 'dark');
});

apiSearch.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  let visible = 0;
  apiCards.forEach((card) => {
    const matches = !query || card.dataset.search.includes(query);
    card.hidden = !matches;
    if (matches) visible += 1;
  });
  emptyState.hidden = visible !== 0;
});

document.querySelectorAll('[data-copy-target]').forEach((button) => {
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copyTarget);
    const text = target.innerText;
    try {
      await navigator.clipboard.writeText(text);
      const original = button.innerHTML;
      button.textContent = 'Copied';
      setTimeout(() => { button.innerHTML = original; }, 1300);
    } catch {
      button.textContent = 'Select the snippet';
    }
  });
});
