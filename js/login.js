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

            // Demo accounts - Dựa trên database schema
            const demoAccounts = {
                'admin@dulich.com': {
                    password: 'admin123',
                    role: 'Quản Trị Viên',
                    name: 'Nguyễn Văn A',
                    redirect: 'admin-dashboard.html'
                },
                'manager@dulich.com': {
                    password: 'manager123',
                    role: 'Quản Lý',
                    name: 'Trần Thị B',
                    redirect: 'admin-dashboard.html'
                },
                'khachhang1@email.com': {
                    password: 'kh123456',
                    role: 'Khách Hàng',
                    name: 'Lê Văn C',
                    redirect: 'index.html'
                },
                'khachhang2@email.com': {
                    password: 'kh123456',
                    role: 'Khách Hàng',
                    name: 'Phạm Thị D',
                    redirect: 'index.html'
                },
                'khachhang3@email.com': {
                    password: 'kh123456',
                    role: 'Khách Hàng',
                    name: 'Hoàng Minh E',
                    redirect: 'index.html'
                }
            };

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Kiểm tra tài khoản demo
            const account = demoAccounts[email];
            
            if (!account) {
                showFeedback('Email không tồn tại trong hệ thống.', 'error');
                emailInput.focus();
                return;
            }

            if (account.password !== password) {
                showFeedback('Mật khẩu không chính xác.', 'error');
                passwordInput.focus();
                return;
            }

            // Lưu thông tin đăng nhập vào sessionStorage (tạm thời)
            sessionStorage.setItem('user', JSON.stringify({
                email: email,
                name: account.name,
                role: account.role
            }));

            showFeedback(`Đăng nhập thành công! Chào mừng ${account.name}`, 'success');
            form.classList.add('is-loading');

            // Redirect sau 1.5 giây
            setTimeout(() => {
                form.classList.remove('is-loading');
                window.location.href = account.redirect;
            }, 1500);
        });
    }
});

