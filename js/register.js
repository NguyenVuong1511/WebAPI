// Register Page - Kết nối với AuthService API
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const toggleConfirmPasswordBtn = document.getElementById('toggle-confirm-password');
    const feedback = document.getElementById('register-feedback');
    const submitButton = form?.querySelector('button[type="submit"]');

    // Show feedback message
    function showFeedback(message, type = 'success') {
        if (!feedback) return;
        feedback.textContent = message;
        feedback.className = `form-feedback ${type}`;
        feedback.style.display = 'block';
    }

    function hideFeedback() {
        if (feedback) {
            feedback.style.display = 'none';
        }
    }

    // Set loading state
    function setLoading(isLoading) {
        if (submitButton) {
            submitButton.disabled = isLoading;
            submitButton.textContent = isLoading ? 'Đang đăng ký...' : 'Đăng ký';
        }
        if (form) {
            form.classList.toggle('is-loading', isLoading);
        }
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

    // Handle form submit
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            hideFeedback();

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
            
            // Chuẩn bị dữ liệu theo DTO của backend (NguoiDungRegisterDTO)
            const registerData = {
                email: formData.get('email'),
                matKhau: formData.get('password'),
                hoTen: formData.get('hoTen')
            };

            console.log('Register Data:', registerData);
            setLoading(true);

            try {
                // Call register API
                const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.REGISTER);
                const response = await APIHelper.post(url, registerData);

                if (response.success) {
                    showFeedback(response.message || 'Đăng ký thành công! Đang chuyển hướng...', 'success');
                    
                    // Redirect to login after 1.5 seconds
                    setTimeout(() => {
                        window.location.href = 'login.html?registered=true';
                    }, 1500);
                } else {
                    showFeedback(response.message || 'Đăng ký thất bại. Vui lòng thử lại.', 'error');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Register error:', error);
                showFeedback('Không thể kết nối đến server. Vui lòng kiểm tra API đã chạy chưa.', 'error');
                setLoading(false);
            }
        });
    }
});
