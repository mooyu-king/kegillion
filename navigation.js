// 仅记录网站侧栏偏好，不读取或改写游戏存档。
const toggle = document.querySelector('.sidebar-toggle');
const applyCollapsed = collapsed => {
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  toggle.setAttribute('aria-expanded', String(!collapsed));
  toggle.title = toggle.ariaLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
  toggle.querySelector('span').textContent = collapsed ? 'Expand menu' : 'Collapse menu';
};
if (toggle) {
  toggle.hidden = false;
  try { applyCollapsed(localStorage.getItem('kegillion-sidebar-collapsed') === 'true'); } catch {}
  toggle.addEventListener('click', () => {
    const collapsed = !document.body.classList.contains('sidebar-collapsed');
    applyCollapsed(collapsed);
    try { localStorage.setItem('kegillion-sidebar-collapsed', String(collapsed)); } catch {}
  });
}
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
