// Authentication Helper
const AuthHelper = {
    STORAGE_KEY: 'user',
    
    // Lưu thông tin user và token
    saveUser: function(userData, remember = false) {
        const user = {
            nguoiDungId: userData.nguoiDungId || userData.NguoiDungId,
            email: userData.email || userData.Email,
            hoTen: userData.hoTen || userData.HoTen,
            role: userData.vaiTro || userData.VaiTro || userData.role || userData.Role,
            accessToken: userData.accessToken || userData.AccessToken || userData.token
        };
        
        // Lưu vào sessionStorage
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        
        // Lưu vào localStorage nếu "Ghi nhớ đăng nhập"
        if (remember) {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(this.STORAGE_KEY);
        }
        
        return user;
    },
    
    // Lấy thông tin user
    getUser: function() {
        const sessionData = sessionStorage.getItem(this.STORAGE_KEY);
        const localData = localStorage.getItem(this.STORAGE_KEY);
        
        if (sessionData) {
            return JSON.parse(sessionData);
        }
        
        if (localData) {
            // Khôi phục từ localStorage sang sessionStorage
            sessionStorage.setItem(this.STORAGE_KEY, localData);
            return JSON.parse(localData);
        }
        
        return null;
    },
    
    // Lấy token
    getToken: function() {
        const user = this.getUser();
        return user ? user.accessToken : null;
    },
    
    // Kiểm tra đã đăng nhập chưa
    isAuthenticated: function() {
        return this.getToken() !== null;
    },
    
    // Kiểm tra role
    hasRole: function(role) {
        const user = this.getUser();
        return user && user.role === role;
    },
    
    // Đăng xuất
    logout: function() {
        sessionStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.STORAGE_KEY);
    },
    
    // Redirect nếu chưa đăng nhập
    requireAuth: function(requiredRole = null) {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        
        if (requiredRole && !this.hasRole(requiredRole)) {
            alert('Bạn không có quyền truy cập trang này!');
            window.location.href = 'index.html';
            return false;
        }
        
        return true;
    },
    
    // Redirect theo role sau khi đăng nhập
    redirectByRole: function() {
        const user = this.getUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        switch(user.role) {
            case 'Admin':
                window.location.href = 'admin-dashboard.html';
                break;
            case 'Khách Hàng':
                window.location.href = 'customer-dashboard.html';
                break;
            default:
                window.location.href = 'index.html';
        }
    }
};

// API Helper - Hàm gọi API với JWT token
const APIHelper = {
    // Gọi API với fetch
    call: async function(url, options = {}) {
        const token = AuthHelper.getToken();
        
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };
        
        // Thêm Authorization header nếu có token
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...(options.headers || {})
            }
        };
        
        try {
            const response = await fetch(url, config);
            
            // Kiểm tra status code
            if (!response.ok) {
                // Xử lý lỗi 401 (Unauthorized) - redirect về login
                if (response.status === 401) {
                    AuthHelper.logout();
                    window.location.href = 'login.html';
                    throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                }
                
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData?.message || errorData?.Message || errorMessage;
                } catch (e) {
                    // Nếu không parse được JSON, dùng status text
                }
                throw new Error(errorMessage);
            }
            
            // Parse JSON response
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    throw new Error('Response is not valid JSON');
                }
            }
            
            // Xử lý response từ backend (camelCase hoặc PascalCase)
            return this.normalizeResponse(data);
        } catch (error) {
            console.error('API Error:', error);
            // Nếu là lỗi network hoặc CORS
            if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
                throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra API đã chạy chưa.');
            }
            throw error;
        }
    },
    
    // GET request
    get: async function(url) {
        return await this.call(url, {
            method: 'GET'
        });
    },
    
    // POST request
    post: async function(url, data) {
        return await this.call(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // PUT request
    put: async function(url, data) {
        return await this.call(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    // DELETE request
    delete: async function(url) {
        return await this.call(url, {
            method: 'DELETE'
        });
    },
    
    // Chuẩn hóa response từ backend
    normalizeResponse: function(data) {
        return {
            success: data?.success ?? data?.Success ?? false,
            message: data?.message ?? data?.Message ?? '',
            code: data?.code ?? data?.Code ?? '',
            data: data?.data ?? data?.Data ?? null
        };
    },
    
    // Xử lý lỗi và hiển thị
    handleError: function(error, defaultMessage = 'Có lỗi xảy ra!') {
        let message = defaultMessage;
        
        if (error?.message) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
        
        alert(message);
        console.error('Error:', error);
    }
};

// Format helper
const FormatHelper = {
    // Format tiền tệ VND
    currency: function(amount) {
        if (!amount && amount !== 0) return '0 đ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    },
    
    // Format số
    number: function(num) {
        if (!num && num !== 0) return '0';
        return new Intl.NumberFormat('vi-VN').format(num);
    },
    
    // Format ngày
    date: function(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    },
    
    // Format ngày giờ
    datetime: function(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    },
    
    // Tạo initials từ tên
    getInitials: function(fullName) {
        if (!fullName) return '?';
        const parts = fullName.trim().split(' ');
        if (parts.length >= 2) {
            return parts[0][0] + parts[parts.length - 1][0];
        }
        return fullName[0];
    }
};
