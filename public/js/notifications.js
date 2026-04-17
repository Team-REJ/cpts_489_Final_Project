/**
 * notifications.js — Client-side notification polling and read-state management
 * Polls /api/notifications/unread-count every 30s and updates the navbar badge.
 * Also handles marking individual notifications as read.
 */
(function () {
  'use strict';

  var POLL_INTERVAL = 30000; // 30 seconds
  var badge = document.getElementById('navBellBadge');
  var csrfMeta = document.querySelector('meta[name="csrf-token"]');
  var csrfToken = csrfMeta ? csrfMeta.getAttribute('content') : '';

  /**
   * Fetch unread count and update the navbar badge
   */
  function pollUnreadCount() {
    fetch('/api/notifications/unread-count', {
      credentials: 'same-origin',
      headers: { 'Accept': 'application/json' }
    })
      .then(function (res) {
        if (!res.ok) return null;
        return res.json();
      })
      .then(function (data) {
        if (!data || typeof data.count === 'undefined') return;
        updateBadge(data.count);
      })
      .catch(function () {
        // Silently ignore — server may be down or user logged out
      });
  }

  /**
   * Update the badge display
   */
  function updateBadge(count) {
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  /**
   * Mark a single notification as read via API
   */
  function markAsRead(notificationId, element) {
    fetch('/api/notifications/' + notificationId + '/read', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken
      }
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success && element) {
          element.classList.remove('bg-light');
          element.setAttribute('data-read', '1');
          var newBadge = element.querySelector('.badge.bg-crimson');
          if (newBadge) newBadge.remove();
        }
        // Re-poll to update navbar count
        pollUnreadCount();
      })
      .catch(function () { /* ignore */ });
  }

  /**
   * Mark all notifications as read
   */
  function markAllRead() {
    fetch('/api/notifications/read-all', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': csrfToken
      }
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          // Update UI
          var items = document.querySelectorAll('.notification-item');
          items.forEach(function (item) {
            item.classList.remove('bg-light');
            item.setAttribute('data-read', '1');
            var nb = item.querySelector('.badge.bg-crimson');
            if (nb) nb.remove();
          });
          pollUnreadCount();
        }
      })
      .catch(function () { /* ignore */ });
  }

  // Attach click handlers for notification items on the notifications page
  var notifList = document.getElementById('notificationList');
  if (notifList) {
    notifList.addEventListener('click', function (e) {
      var item = e.target.closest('.notification-item');
      if (item && item.getAttribute('data-read') === '0') {
        markAsRead(item.getAttribute('data-id'), item);
      }
    });
  }

  // Attach mark-all-read button
  var markAllBtn = document.getElementById('markAllReadBtn');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', function (e) {
      e.preventDefault();
      markAllRead();
    });
  }

  // Start polling (only if badge element exists = user is logged in)
  if (badge) {
    pollUnreadCount();
    setInterval(pollUnreadCount, POLL_INTERVAL);
  }
})();
