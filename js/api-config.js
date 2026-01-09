// API Configuration
const API_CONFIG = {
    // Chọn sử dụng Gateway hoặc Direct Service
    USE_GATEWAY: false, // Đổi thành true nếu muốn dùng Gateway
    
    // API Gateway URL
    GATEWAY_URL: 'https://localhost:18251/gateway',
    
    // Direct Service URLs
    AUTH_SERVICE_URL: 'https://localhost:44317/api',
    USER_SERVICE_URL: 'https://localhost:44363/api',
    TOUR_SERVICE_URL: 'https://localhost:44360/api',
    BOOKING_SERVICE_URL: 'https://localhost:44312/api',
    GENERAL_SERVICE_URL: 'https://localhost:44362/api',
    
    // Endpoints
    ENDPOINTS: {
        // Auth
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        
        // User
        USER_GET_ALL: '/user/get-all',
        USER_GET_BY_ID: '/user/get-by-id',
        USER_CREATE: '/user/create',
        USER_UPDATE: '/user/update',
        USER_DELETE: '/user/delete',
        USER_UPDATE_PASSWORD: '/user/update-pass',
        USER_LOCK_UNLOCK: '/user/lock-unlock',
        
        // Tour
        TOUR_GET_ALL: '/tour/get-all',
        TOUR_GET_BY_ID: '/tour/get-by-id',
        TOUR_CREATE: '/tour/create',
        TOUR_UPDATE: '/tour/update',
        TOUR_DELETE: '/tour/delete',
        TOUR_USER_GET_ALL: '/tour/user/get-all',
        
        // LoaiTour
        LOAITOUR_GET_ALL: '/loaitour/get-all',
        LOAITOUR_GET_BY_ID: '/loaitour/get-by-id',
        LOAITOUR_CREATE: '/loaitour/create',
        LOAITOUR_UPDATE: '/loaitour/update',
        LOAITOUR_DELETE: '/loaitour/delete',
        
        // LichTrinh (Tour Schedule)
        LICHTRINH_GET_BY_TOUR: '/lichtrinh/get-by-tour',
        LICHTRINH_CREATE: '/lichtrinh/create',
        LICHTRINH_UPDATE: '/lichtrinh/update',
        LICHTRINH_DELETE: '/lichtrinh/delete',
        
        // AnhTour (Tour Images)
        ANHTOUR_GET_BY_TOUR: '/anhtour/get-by-tour',
        ANHTOUR_CREATE: '/anhtour/create',
        ANHTOUR_DELETE: '/anhtour/delete',
        ANHTOUR_SET_AVATAR: '/anhtour/set-avatar',
        
        // DiaDiem
        DIADIEM_GET_ALL: '/diadiem/get-all',
        DIADIEM_GET_BY_ID: '/diadiem/get-by-id',
        DIADIEM_CREATE: '/diadiem/create',
        DIADIEM_UPDATE: '/diadiem/update',
        DIADIEM_DELETE: '/diadiem/delete',
        
        // Booking
        BOOKING_CREATE: '/booking/create',
        BOOKING_MY_HISTORY: '/booking/history',
        BOOKING_CANCEL: '/booking/cancel',
        BOOKING_ADMIN_ALL: '/booking/admin/all',
        BOOKING_ADMIN_APPROVE: '/booking/admin/approve',
        BOOKING_DETAIL: '/booking/detail',
        
        // Booking Stats
        BOOKING_STATS: '/bookingthongke/stats',
        
        // Feedback
        FEEDBACK_GET_BY_TOUR: '/feedback/tour',
        FEEDBACK_CREATE: '/feedback',
        FEEDBACK_DELETE: '/feedback',
        
        // Contact
        CONTACT_CREATE: '/contact',
        CONTACT_GET_ALL: '/contact',
        CONTACT_MARK_READ: '/contact/mark-read',
        CONTACT_DELETE: '/contact',
        
        // TinTuc (News)
        TINTUC_GET_ALL: '/tintuc/get-all',
        TINTUC_GET_BY_ID: '/tintuc/get-by-id',
        TINTUC_CREATE: '/tintuc/create',
        TINTUC_UPDATE: '/tintuc/update',
        TINTUC_DELETE: '/tintuc/delete'
    },
    
    // Get base URL for specific service
    getServiceUrl: function(serviceName) {
        if (this.USE_GATEWAY) {
            return this.GATEWAY_URL;
        }
        
        const serviceUrls = {
            'auth': this.AUTH_SERVICE_URL,
            'user': this.USER_SERVICE_URL,
            'tour': this.TOUR_SERVICE_URL,
            'loaitour': this.TOUR_SERVICE_URL,
            'lichtrinh': this.TOUR_SERVICE_URL,
            'anhtour': this.TOUR_SERVICE_URL,
            'booking': this.BOOKING_SERVICE_URL,
            'bookingthongke': this.BOOKING_SERVICE_URL,
            'diadiem': this.GENERAL_SERVICE_URL,
            'feedback': this.GENERAL_SERVICE_URL,
            'contact': this.GENERAL_SERVICE_URL,
            'tintuc': this.GENERAL_SERVICE_URL
        };
        
        return serviceUrls[serviceName] || this.GENERAL_SERVICE_URL;
    },
    
    // Build full URL
    buildUrl: function(endpoint) {
        const serviceName = endpoint.split('/')[1];
        const baseUrl = this.getServiceUrl(serviceName);
        return baseUrl + endpoint;
    }
};
