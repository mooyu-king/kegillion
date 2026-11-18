// 网站偏好与收藏使用独立存储键，不改写游戏存档。
const toggles = document.querySelectorAll('[data-sidebar-toggle]');
function applyCollapsed(collapsed) {
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  toggles.forEach(toggle => {
    toggle.setAttribute('aria-expanded', String(!collapsed));
    const label = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    const text = toggle.querySelector('span');
    if (text) text.textContent = collapsed ? 'Expand menu' : 'Collapse menu';
  });
}
try { applyCollapsed(localStorage.getItem('kegillion-sidebar-collapsed') === 'true'); } catch { applyCollapsed(false); }
toggles.forEach(toggle => toggle.addEventListener('click', () => {
  const collapsed = !document.body.classList.contains('sidebar-collapsed');
  applyCollapsed(collapsed);
  try { localStorage.setItem('kegillion-sidebar-collapsed', String(collapsed)); } catch {}
}));
document.querySelectorAll('header details').forEach(menu => {
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') { menu.open = false; menu.querySelector('summary').focus(); }
  });
  document.addEventListener('click', event => {
    if (!menu.contains(event.target)) menu.open = false;
  });
});

const filters = document.querySelector('.region-filters');
if (filters) {
  filters.hidden = false;
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-region-filter]');
    if (!button) return;
    const region = button.dataset.regionFilter;
    filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    document.querySelectorAll('[data-region]').forEach(card => {
      card.hidden = region !== 'all' && card.dataset.region !== region;
      if (!card.hidden) count++;
    });
    document.querySelector('.filter-status').textContent = `${count} ${count === 1 ? 'collection' : 'collections'} shown. Planned collections are not playable.`;
  });
}
document.querySelectorAll('input[name="score-mode"]').forEach(input => input.addEventListener('change', () => {
  document.getElementById('score-example').textContent = input.value === 'rare'
    ? 'Rare: 10 → Very nice. Lower valid scores win.'
    : 'Popular: 10 → Keep trying. Higher scores win.';
}));

const favoritesKey = 'kegillion-favorites-v1';
function parseFavorites(raw) {
  try { const data = JSON.parse(raw); return new Set(Array.isArray(data) ? data.filter(id => typeof id === 'string' && /^[a-z0-9-]{1,60}$/.test(id)) : []); }
  catch { return new Set(); }
}
let favorites = new Set();
try { favorites = parseFavorites(localStorage.getItem(favoritesKey)); } catch {}
function renderFavorites() {
  document.querySelectorAll('[data-favorite]').forEach(button => {
    const saved = favorites.has(button.dataset.favorite);
    button.setAttribute('aria-pressed', String(saved));
    button.title = saved ? 'Remove from favorites' : 'Add to favorites';
    button.setAttribute('aria-label', button.title);
    button.querySelector('span').textContent = saved ? 'Saved' : 'Save';
  });
  const cards = document.querySelectorAll('[data-saved-card]');
  cards.forEach(card => { card.hidden = !favorites.has(card.dataset.savedCard); });
  const empty = document.querySelector('.favorites-empty');
  if (empty) empty.hidden = [...cards].some(card => !card.hidden);
}
renderFavorites();
document.querySelectorAll('[data-favorite]').forEach(button => button.addEventListener('click', () => {
  const id = button.dataset.favorite;
  const saved = !favorites.has(id);
  if (saved) favorites.add(id); else favorites.delete(id);
  let persisted = true;
  try { localStorage.setItem(favoritesKey, JSON.stringify([...favorites])); } catch { persisted = false; }
  renderFavorites();
  const notice = document.querySelector('.favorite-notice');
  if (notice) notice.textContent = persisted
    ? saved ? 'Added to Favorites. Find it in the sidebar.' : 'Removed from Favorites.'
    : 'Browser storage is unavailable. This change lasts only on this page.';
  if (button.closest('[data-saved-card]')?.hidden) {
    const next = document.querySelector('[data-saved-card]:not([hidden]) .favorite-button') || document.querySelector('.favorites-empty a');
    next?.focus();
  }
}));
window.addEventListener('storage', event => {
  if (event.key === favoritesKey || event.key === null) { favorites = parseFavorites(event.newValue); renderFavorites(); }
  if (event.key === 'kegillion-sidebar-collapsed' || event.key === null) applyCollapsed(event.newValue === 'true');
});

const updatesPause = document.querySelector('[data-updates-pause]');
updatesPause?.addEventListener('click', () => {
  const paused = updatesPause.closest('.euro-updates').classList.toggle('updates-paused');
  updatesPause.setAttribute('aria-pressed', String(paused));
  updatesPause.setAttribute('aria-label', paused ? 'Resume updates' : 'Pause updates');
  updatesPause.title = paused ? 'Resume updates' : 'Pause updates';
  updatesPause.textContent = paused ? '▶' : 'Ⅱ';
});

const draftLab = document.querySelector('[data-kabloom-lab]');
if (draftLab) {
  draftLab.addEventListener('submit', event => event.preventDefault());
  draftLab.addEventListener('change', () => {
    const a = Number(draftLab.elements.first.value);
    const b = Number(draftLab.elements.second.value);
    const spendA = a + 4 * b;
    const saveA = b + 4 * a;
    const difference = saveA - spendA;
    const recommendation = difference === 0
      ? 'Both orders score the same.'
      : `Saving Pick ${difference > 0 ? 'A' : 'B'} earns ${Math.abs(difference)} more.`;
    draftLab.querySelector('output').textContent = `A at ×1 and B at ×4: ${spendA} points. B at ×1 and A at ×4: ${saveA} points. ${recommendation}`;
  });
}

const draftFullscreen = document.querySelector('[data-kabloom-fullscreen]');
if (draftFullscreen) {
  const frame = document.getElementById('kabloom-player');
  const status = document.querySelector('[data-kabloom-status]');
  draftFullscreen.hidden = false;
  draftFullscreen.addEventListener('click', async () => {
    status.textContent = '';
    try {
      if (document.fullscreenElement === frame) await document.exitFullscreen();
      else await frame.requestFullscreen();
    } catch {
      status.textContent = 'Full screen is unavailable here. Open the game in a new tab for more space.';
    }
  });
}
