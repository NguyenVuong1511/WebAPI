document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const toggleConfirmPasswordBtn = document.getElementById('toggle-confirm-password');
    const feedback = document.getElementById('register-feedback');
    const termsCheckbox = document.querySelector('input[name="terms"]');

    function showFeedback(message, type = 'success') {
        if (!feedback) return;
        feedback.textContent = message;
        feedback.className = `form-feedback ${type}`;
        // Auto hide after 5 seconds
        setTimeout(() => {
            if (feedback.textContent === message) {
                feedback.textContent = '';
                feedback.className = 'form-feedback';
            }
        }, 5000);
    }

    // Toggle password visibility
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isHidden = passwordInput.type === 'password';
            passwordInput.type = isHidden ? 'text' : 'password';
            togglePasswordBtn.textContent = isHidden ? '🙈' : '👁️';
            togglePasswordBtn.setAttribute('aria-label', isHidden ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
        });
    }

    // Toggle confirm password visibility
    if (toggleConfirmPasswordBtn && confirmPasswordInput) {
        toggleConfirmPasswordBtn.addEventListener('click', () => {
            const isHidden = confirmPasswordInput.type === 'password';
            confirmPasswordInput.type = isHidden ? 'text' : 'password';
            toggleConfirmPasswordBtn.textContent = isHidden ? '🙈' : '👁️';
            toggleConfirmPasswordBtn.setAttribute('aria-label', isHidden ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
        });
    }

    // Real-time password match validation
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            if (confirmPasswordInput.value && passwordInput.value) {
                if (confirmPasswordInput.value !== passwordInput.value) {
                    confirmPasswordInput.setCustomValidity('Mật khẩu không khớp');
                } else {
                    confirmPasswordInput.setCustomValidity('');
                }
            }
        });

        passwordInput.addEventListener('input', () => {
            if (confirmPasswordInput.value && passwordInput.value) {
                if (confirmPasswordInput.value !== passwordInput.value) {
                    confirmPasswordInput.setCustomValidity('Mật khẩu không khớp');
                } else {
                    confirmPasswordInput.setCustomValidity('');
                }
            }
        });
    }

    // Phone number validation
    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            const phone = phoneInput.value.replace(/\D/g, '');
            if (phone.length < 10 || phone.length > 11) {
                phoneInput.setCustomValidity('Số điện thoại phải có 10-11 chữ số');
            } else {
                phoneInput.setCustomValidity('');
            }
        });
    }

    // Form submission
    if (form && fullnameInput && emailInput && phoneInput && passwordInput && confirmPasswordInput) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            // Validate fullname
            if (!fullnameInput.checkValidity()) {
                showFeedback('Vui lòng nhập họ tên (ít nhất 2 ký tự).', 'error');
                fullnameInput.focus();
                return;
            }

            // Validate email
            if (!emailInput.checkValidity()) {
                showFeedback('Vui lòng nhập email hợp lệ.', 'error');
                emailInput.focus();
                return;
            }

            // Validate phone
            if (!phoneInput.checkValidity()) {
                showFeedback('Vui lòng nhập số điện thoại hợp lệ (10-11 chữ số).', 'error');
                phoneInput.focus();
                return;
            }

            // Validate password
            if (!passwordInput.checkValidity()) {
                showFeedback('Mật khẩu cần ít nhất 6 ký tự.', 'error');
                passwordInput.focus();
                return;
            }

            // Validate confirm password
            if (!confirmPasswordInput.checkValidity()) {
                showFeedback('Vui lòng xác nhận mật khẩu.', 'error');
                confirmPasswordInput.focus();
                return;
            }

            // Check password match
            if (passwordInput.value !== confirmPasswordInput.value) {
                showFeedback('Mật khẩu xác nhận không khớp.', 'error');
                confirmPasswordInput.focus();
                return;
            }

            // Check terms agreement
            if (!termsCheckbox || !termsCheckbox.checked) {
                showFeedback('Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật.', 'error');
                if (termsCheckbox) termsCheckbox.focus();
                return;
            }

            // Show loading state
            showFeedback('Đang xử lý đăng ký...', 'success');
            form.classList.add('is-loading');

            // Simulate API call
            setTimeout(() => {
                form.classList.remove('is-loading');
                showFeedback('Đăng ký thành công! Đang chuyển đến trang đăng nhập...', 'success');
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }, 1500);
        });
    }
});

