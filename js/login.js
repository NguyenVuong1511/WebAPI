(() => {
    const app = angular.module('travelApp', []);

    app.constant('API_CONFIG', {
        // Chọn 1 đường gọi API: Gateway hoặc AuthService trực tiếp
        USE_GATEWAY: false, // Để true nếu Gateway đã bật CORS
        GATEWAY_URL: 'http://localhost:18251/gateway',
        AUTH_SERVICE_URL: 'http://localhost:16787/api', // Nếu dùng HTTPS đổi thành https://localhost:44317/api
        ENDPOINTS: {
            LOGIN: '/auth/login'
        }
    });

    app.service('SessionService', ['$window', function ($window) {
        const STORAGE_KEY = 'user';

        this.bootstrapFromLocal = function () {
            const cachedUser = $window.localStorage.getItem(STORAGE_KEY);
            if (cachedUser && !$window.sessionStorage.getItem(STORAGE_KEY)) {
                $window.sessionStorage.setItem(STORAGE_KEY, cachedUser);
            }
        };

        this.saveUser = function (user, remember) {
            const payload = {
                email: user.email,
                role: user.role,
                accessToken: user.accessToken
            };

            $window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

            if (remember) {
                $window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            } else {
                $window.localStorage.removeItem(STORAGE_KEY);
            }
        };

        this.getStoredUser = function () {
            const raw = $window.sessionStorage.getItem(STORAGE_KEY) || $window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            try {
                return JSON.parse(raw);
            } catch (error) {
                return null;
            }
        };
    }]);

    // Helper đơn giản để chuẩn hóa response/data từ BE (camelCase hoặc PascalCase)
    function normalizeResponse(raw) {
        const success = raw?.success ?? raw?.Success ?? false;
        const message = raw?.message ?? raw?.Message ?? '';
        const data = raw?.data ?? raw?.Data ?? {};
        return {
            success,
            message,
            data: {
                email: data.email ?? data.Email ?? '',
                role: data.role ?? data.Role ?? '',
                accessToken: data.accessToken ?? data.AccessToken ?? ''
            }
        };
    }

    app.service('AuthService', ['$http', 'API_CONFIG', '$q', function ($http, API_CONFIG, $q) {
        this.login = function (payload) {
            const baseUrl = API_CONFIG.USE_GATEWAY ? API_CONFIG.GATEWAY_URL : API_CONFIG.AUTH_SERVICE_URL;
            const url = baseUrl + API_CONFIG.ENDPOINTS.LOGIN;

            return $http.post(url, {
                email: payload.email,
                password: payload.password
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            }).then(function (response) {
                return normalizeResponse(response.data);
            }).catch(function (error) {
                const norm = normalizeResponse(error?.data || {});
                const fallback = error?.status === 0
                    ? 'Không thể kết nối server. Kiểm tra API chạy & CORS.'
                    : (norm.message || error?.message || 'Đăng nhập thất bại');

                return $q.reject({
                    message: fallback,
                    data: norm.data,
                    status: error?.status
                });
            });
        };
    }]);

    app.factory('RedirectService', [function () {
        const redirectMap = {
            'Admin': 'admin-dashboard.html',
            'Khách Hàng': 'index.html'
        };

        return {
            getRedirectUrl(role) {
                return redirectMap[role] || 'customer-dashboard.html';
            }
        };
    }]);

    app.controller('LoginController', [
        '$timeout',
        '$window',
        'AuthService',
        'SessionService',
        'RedirectService',
        function ($timeout, $window, AuthService, SessionService, RedirectService) {
            const vm = this;
            vm.form = {
                email: '',
                password: '',
                remember: true
            };
            vm.loading = false;
            vm.showPassword = false;
            vm.feedback = {};

            SessionService.bootstrapFromLocal();
            const existingUser = SessionService.getStoredUser();
            if (existingUser && existingUser.email) {
                vm.form.email = existingUser.email;
                vm.form.remember = Boolean($window.localStorage.getItem('user'));
            }

            vm.togglePassword = function () {
                vm.showPassword = !vm.showPassword;
            };

            vm.submit = function (form) {
                if (form && form.$invalid) {
                    vm.feedback = { type: 'error', message: 'Vui lòng điền đầy đủ thông tin hợp lệ.' };
                    return;
                }

                vm.loading = true;
                vm.feedback = {};

                AuthService.login(vm.form)
                    .then(function(result) {
                        if (!result.success) {
                            vm.feedback = { type: 'error', message: result.message || 'Đăng nhập thất bại. Vui lòng thử lại.' };
                            return;
                        }

                        var data = result.data || {};
                        if (!data.email || !data.role || !data.accessToken) {
                            vm.feedback = { type: 'error', message: 'Dữ liệu đăng nhập không hợp lệ. Vui lòng thử lại.' };
                            return;
                        }

                        SessionService.saveUser({
                            email: data.email,
                            role: data.role,
                            accessToken: data.accessToken
                        }, vm.form.remember);

                        vm.feedback = { type: 'success', message: result.message || 'Đăng nhập thành công!' };

                        $timeout(function() {
                            var redirectUrl = RedirectService.getRedirectUrl(data.role);
                            $window.location.href = redirectUrl;
                        }, 800);
                    })
                    .catch(function(error) {
                        vm.feedback = {
                            type: 'error',
                            message: error.message || 'Không thể đăng nhập. Vui lòng kiểm tra email/mật khẩu.'
                        };
                    })
                    .finally(function() {
                        vm.loading = false;
                    });
            };
        }
    ]);
})();