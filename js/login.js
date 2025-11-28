document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const feedback = document.getElementById('login-feedback');

    function showFeedback(message, type = 'success') {
        if (!feedback) return;
        feedback.textContent = message;
        feedback.className = `form-feedback ${type}`;
    }

    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isHidden = passwordInput.type === 'password';
            passwordInput.type = isHidden ? 'text' : 'password';
            togglePasswordBtn.textContent = isHidden ? '🙈' : '👁️';
            togglePasswordBtn.setAttribute('aria-label', isHidden ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
        });
    }

    if (form && emailInput && passwordInput) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!emailInput.checkValidity()) {
                showFeedback('Vui lòng nhập email hợp lệ.', 'error');
                emailInput.focus();
                return;
            }

            if (!passwordInput.checkValidity()) {
                showFeedback('Mật khẩu cần ít nhất 6 ký tự.', 'error');
                passwordInput.focus();
                return;
            }

            showFeedback('Đăng nhập thành công! Đang chuyển hướng...', 'success');
            form.classList.add('is-loading');

            // Giả lập gọi API
            setTimeout(() => {
                form.classList.remove('is-loading');
                window.location.href = 'index.html';
            }, 1500);
        });
    }
});

