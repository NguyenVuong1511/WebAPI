// Login Page - Kết nối với AuthService API
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (AuthHelper.isAuthenticated()) {
        AuthHelper.redirectByRole();
        return;
    }

    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const feedback = document.getElementById('login-feedback');
    const submitButton = form?.querySelector('button[type="submit"]');

    // Khôi phục email nếu đã lưu
    const savedUser = AuthHelper.getUser();
    if (savedUser && emailInput) {
        emailInput.value = savedUser.email;
    }

    // Toggle password visibility
    if (togglePasswordBtn && passwordInput) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
        });
    }

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
            submitButton.textContent = isLoading ? 'Đang đăng nhập...' : 'Đăng nhập';
        }
        if (form) {
            form.classList.toggle('is-loading', isLoading);
        }
    }

    // Handle form submit
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            hideFeedback();

            // Validate
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const remember = rememberCheckbox?.checked || false;

            setLoading(true);

            try {
                // Call login API
                const url = API_CONFIG.buildUrl(API_CONFIG.ENDPOINTS.LOGIN);
                const response = await APIHelper.post(url, {
                    email: email,
                    password: password
                });

                if (response.success && response.data) {
                    // Lưu thông tin user và token
                    AuthHelper.saveUser(response.data, remember);

                    showFeedback(response.message || 'Đăng nhập thành công!', 'success');

                    // Redirect theo role sau 800ms
                    setTimeout(() => {
                        AuthHelper.redirectByRole();
                    }, 800);
                } else {
                    showFeedback(response.message || 'Đăng nhập thất bại. Vui lòng kiểm tra email/mật khẩu.', 'error');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Login error:', error);
                showFeedback('Không thể kết nối đến server. Vui lòng kiểm tra API đã chạy chưa.', 'error');
                setLoading(false);
            }
        });
    }

    // Check for registration success message
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
        showFeedback('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
    }
});