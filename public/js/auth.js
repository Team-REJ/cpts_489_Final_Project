/**
 * auth.js — Client-side validation for login and register forms
 * Provides immediate feedback before server-side validation.
 */
(function () {
  'use strict';

  var WSU_EMAIL_REGEX = /@wsu\.edu$/i;
  var MIN_PASSWORD_LENGTH = 8;

  /**
   * Register form validation
   */
  var registerForm = document.getElementById('registerForm');
  if (registerForm) {
    var emailField = registerForm.querySelector('[name="email"]');
    var passwordField = registerForm.querySelector('[name="password"]');
    var confirmField = registerForm.querySelector('[name="confirmPassword"]');

    registerForm.addEventListener('submit', function (e) {
      clearErrors(registerForm);
      var valid = true;

      // Email check
      if (emailField && !WSU_EMAIL_REGEX.test(emailField.value.trim())) {
        showFieldError(emailField, 'Please use a valid @wsu.edu email address.');
        valid = false;
      }

      // Password length
      if (passwordField && passwordField.value.length < MIN_PASSWORD_LENGTH) {
        showFieldError(passwordField, 'Password must be at least 8 characters.');
        valid = false;
      }

      // Password match
      if (confirmField && passwordField && confirmField.value !== passwordField.value) {
        showFieldError(confirmField, 'Passwords do not match.');
        valid = false;
      }

      if (!valid) e.preventDefault();
    });
  }

  /**
   * Login form validation
   */
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    var loginEmail = loginForm.querySelector('[name="email"]');
    var loginPassword = loginForm.querySelector('[name="password"]');

    loginForm.addEventListener('submit', function (e) {
      clearErrors(loginForm);
      var valid = true;

      if (loginEmail && !loginEmail.value.trim()) {
        showFieldError(loginEmail, 'Email is required.');
        valid = false;
      }

      if (loginPassword && !loginPassword.value) {
        showFieldError(loginPassword, 'Password is required.');
        valid = false;
      }

      if (!valid) e.preventDefault();
    });
  }

  /**
   * Show an error message under a field
   */
  function showFieldError(field, message) {
    field.classList.add('is-invalid');
    var existing = field.parentNode.querySelector('.invalid-feedback');
    if (!existing) {
      var div = document.createElement('div');
      div.className = 'invalid-feedback';
      div.textContent = message;
      field.parentNode.appendChild(div);
    } else {
      existing.textContent = message;
    }
  }

  /**
   * Clear all validation errors in a form
   */
  function clearErrors(form) {
    var invalids = form.querySelectorAll('.is-invalid');
    invalids.forEach(function (el) { el.classList.remove('is-invalid'); });
    var feedbacks = form.querySelectorAll('.invalid-feedback');
    feedbacks.forEach(function (el) { el.remove(); });
  }
})();
