document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const toggleConfirmPasswordBtn = document.getElementById('toggle-confirm-password');
    const feedback = document.getElementById('register-feedback');

    function showFeedback(message, type = 'success') {
        if (!feedback) return;
        feedback.textContent = message;
        feedback.className = `form-feedback ${type}`;
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

    if (toggleConfirmPasswordBtn && confirmPasswordInput) {
        toggleConfirmPasswordBtn.addEventListener('click', () => {
            const isHidden = confirmPasswordInput.type === 'password';
            confirmPasswordInput.type = isHidden ? 'text' : 'password';
            toggleConfirmPasswordBtn.textContent = isHidden ? '🙈' : '👁️';
            toggleConfirmPasswordBtn.setAttribute('aria-label', isHidden ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
        });
    }

    // Real-time password confirmation validation
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (this.value && this.value !== passwordInput.value) {
                this.setCustomValidity('Mật khẩu không khớp');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            
            // Validate all fields
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            // Check password match
            if (passwordInput.value !== confirmPasswordInput.value) {
                showFeedback('Mật khẩu xác nhận không khớp.', 'error');
                confirmPasswordInput.focus();
                return;
            }

            // Collect form data
            const formData = new FormData(form);
            const registerData = {
                // NguoiDung fields
                email: formData.get('email'),
                matKhau: formData.get('password'), // Sẽ được hash ở backend
                hoTen: formData.get('hoTen'),
                soDienThoai: formData.get('soDienThoai'),
                vaiTro: 'Khách Hàng', // Default role
                // KhachHang fields
                diaChi: formData.get('diaChi'),
                gioiTinh: formData.get('gioiTinh'),
                ngaySinh: formData.get('ngaySinh'),
                cmndHoChieu: formData.get('cmndHoChieu')
            };

            console.log('Register Data:', registerData);

            showFeedback('Đang xử lý đăng ký...', 'success');
            form.classList.add('is-loading');

            // TODO: Gửi dữ liệu đến API
            // Giả lập gọi API
            setTimeout(() => {
                form.classList.remove('is-loading');
                showFeedback('Đăng ký thành công! Đang chuyển hướng...', 'success');
                
                // Redirect to login after 1.5 seconds
                setTimeout(() => {
                    window.location.href = 'login.html?registered=true';
                }, 1500);
            }, 1500);
        });
    }
});
