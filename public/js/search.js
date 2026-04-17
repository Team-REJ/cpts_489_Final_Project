/**
 * search.js — Client-side filtering and sorting for the listings page
 * Works entirely on the DOM (no API calls) since listings are server-rendered.
 * Filters by category, type, condition and sorts by price/date.
 */
(function () {
  'use strict';

  var searchInput = document.getElementById('searchInput');
  var searchBtn = document.getElementById('searchBtn');
  var filterCategory = document.getElementById('filterCategory');
  var filterCondition = document.getElementById('filterCondition');
  var sortSelect = document.getElementById('sortSelect');
  var applyBtn = document.getElementById('applyFilters');
  var clearBtn = document.getElementById('clearFilters');
  var grid = document.getElementById('listingsGrid');

  if (!grid) return; // Not on the listings page

  var items = Array.from(grid.querySelectorAll('.listing-item'));

  /**
   * Get checked type values
   */
  function getCheckedTypes() {
    var checks = document.querySelectorAll('.filter-type:checked');
    var types = [];
    checks.forEach(function (c) { types.push(c.value); });
    return types;
  }

  /**
   * Apply all filters and sorting
   */
  function applyFilters() {
    var query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    var category = filterCategory ? filterCategory.value : '';
    var condition = filterCondition ? filterCondition.value : '';
    var types = getCheckedTypes();
    var sortBy = sortSelect ? sortSelect.value : 'newest';

    // Filter
    var visible = items.filter(function (item) {
      var title = (item.querySelector('.item-title') || {}).textContent || '';
      var itemCat = item.getAttribute('data-category') || '';
      var itemType = item.getAttribute('data-type') || '';
      var itemCond = item.getAttribute('data-condition') || '';

      // Text search
      if (query && title.toLowerCase().indexOf(query) === -1) return false;

      // Category filter
      if (category && itemCat !== category) return false;

      // Type filter
      if (types.length > 0 && types.indexOf(itemType) === -1) return false;

      // Condition filter
      if (condition && itemCond !== condition) return false;

      return true;
    });

    // Sort
    visible.sort(function (a, b) {
      if (sortBy === 'price-asc') {
        return parseFloat(a.getAttribute('data-price') || 0) - parseFloat(b.getAttribute('data-price') || 0);
      } else if (sortBy === 'price-desc') {
        return parseFloat(b.getAttribute('data-price') || 0) - parseFloat(a.getAttribute('data-price') || 0);
      } else {
        // newest first (default)
        return (b.getAttribute('data-created') || '').localeCompare(a.getAttribute('data-created') || '');
      }
    });

    // Update DOM
    items.forEach(function (item) { item.style.display = 'none'; });
    visible.forEach(function (item) { item.style.display = ''; });

    // Reorder visible items
    visible.forEach(function (item) { grid.appendChild(item); });

    // Update count
    var countEl = grid.closest('.col-lg-9');
    if (countEl) {
      var countText = countEl.querySelector('.text-muted.small strong');
      if (countText) countText.textContent = visible.length;
    }
  }

  /**
   * Clear all filters
   */
  function clearAllFilters() {
    if (searchInput) searchInput.value = '';
    if (filterCategory) filterCategory.value = '';
    if (filterCondition) filterCondition.value = '';
    if (sortSelect) sortSelect.value = 'newest';
    document.querySelectorAll('.filter-type').forEach(function (c) { c.checked = true; });
    applyFilters();
  }

  // Event listeners
  if (applyBtn) applyBtn.addEventListener('click', applyFilters);
  if (clearBtn) clearBtn.addEventListener('click', clearAllFilters);
  if (sortSelect) sortSelect.addEventListener('change', applyFilters);
  if (searchBtn) searchBtn.addEventListener('click', applyFilters);

  // Enter key in search input
  if (searchInput) {
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyFilters();
      }
    });

    // Debounced live search
    var debounceTimer;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(applyFilters, 300);
    });
  }
})();
