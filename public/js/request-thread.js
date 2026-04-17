/**
 * request-thread.js — Client-side enhancements for the request thread page
 * Auto-scrolls chat, handles message form submission.
 */
(function () {
  'use strict';

  var chatWindow = document.getElementById('chatWindow');
  var messageForm = document.getElementById('messageForm');

  // Auto-scroll chat to bottom
  function scrollToBottom() {
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }

  // Scroll on load
  scrollToBottom();

  // Handle form submission — standard POST for now
  // When Jaydon wires the /api/requests/:id/messages endpoint,
  // this can be upgraded to AJAX submission without a full page reload.
  if (messageForm) {
    messageForm.addEventListener('submit', function (e) {
      var body = messageForm.querySelector('[name="body"]');
      if (body && !body.value.trim()) {
        e.preventDefault();
        body.focus();
        return;
      }
      // Let the form submit normally via POST
    });
  }

  // Textarea enter-to-submit (Shift+Enter for newline)
  var textarea = messageForm ? messageForm.querySelector('textarea') : null;
  if (textarea) {
    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (textarea.value.trim()) {
          messageForm.requestSubmit();
        }
      }
    });
  }
})();
