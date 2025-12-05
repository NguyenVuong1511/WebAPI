// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('header');
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    // Header scroll effect
    function handleScroll() {
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }

    if (header) {
        window.addEventListener('scroll', handleScroll);
        handleScroll();
    }

    // Toggle mobile menu using max-height (no active class)
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            // Toggle menu visibility using max-height
            const computedStyle = window.getComputedStyle(mobileMenu);
            const currentMaxHeight = computedStyle.maxHeight;
            
            if (currentMaxHeight === '0px' || currentMaxHeight === '') {
                mobileMenu.style.maxHeight = '500px';
            } else {
                mobileMenu.style.maxHeight = '0px';
            }
        });
    }

    // Close mobile menu when clicking on a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (mobileMenu) mobileMenu.style.maxHeight = '0px';
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!mobileMenu || !hamburger) return;
        
        const isClickInsideNav = event.target.closest('.navbar') || event.target.closest('.mobile-menu');
        const isClickOnHamburger = event.target.closest('.hamburger');
        
        if (!isClickInsideNav && !isClickOnHamburger) {
            const computedStyle = window.getComputedStyle(mobileMenu);
            if (computedStyle.maxHeight !== '0px' && computedStyle.maxHeight !== '') {
                mobileMenu.style.maxHeight = '0px';
            }
        }
    });

    // Smooth scroll for anchor links on same page
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Handle smooth scroll for anchor links on same page
            if (href && href !== '#') {
                // Check if it's an anchor link (starts with #) on the same page
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        const headerOffset = 80;
                        const elementPosition = target.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                        window.scrollTo({
                            top: offsetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
                // If it's a link to another page with anchor (e.g., index.html#home),
                // let the browser handle it naturally
            }
        });
    });

    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('.newsletter-input').value;
            if (email) {
                alert('Cảm ơn bạn đã đăng ký nhận tin! Chúng tôi sẽ gửi email cho bạn sớm nhất.');
                this.querySelector('.newsletter-input').value = '';
            }
        });
    }

    // Countdown Timer Functionality
    function updateCountdown() {
        const countdownTimers = document.querySelectorAll('.countdown-timer');
        
        countdownTimers.forEach(timer => {
            const endTimeString = timer.getAttribute('data-end-time');
            if (!endTimeString) return;

            const endTime = new Date(endTimeString).getTime();
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                // Timer has expired
                timer.querySelectorAll('.countdown-value').forEach(value => {
                    value.textContent = '00';
                });
                return;
            }

            // Calculate time units
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Update display
            const daysElement = timer.querySelector('[data-unit="days"]');
            const hoursElement = timer.querySelector('[data-unit="hours"]');
            const minutesElement = timer.querySelector('[data-unit="minutes"]');
            const secondsElement = timer.querySelector('[data-unit="seconds"]');

            if (daysElement) daysElement.textContent = String(days).padStart(2, '0');
            if (hoursElement) hoursElement.textContent = String(hours).padStart(2, '0');
            if (minutesElement) minutesElement.textContent = String(minutes).padStart(2, '0');
            if (secondsElement) secondsElement.textContent = String(seconds).padStart(2, '0');
        });
    }

    // Update countdown every second
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Tours Carousel Functionality
    const toursCarousel = document.querySelector('.tours-carousel');
    if (toursCarousel) {
        const carouselTrack = toursCarousel.querySelector('.tours-carousel-track');
        const tourCards = carouselTrack.querySelectorAll('.tour-card');
        const prevBtn = document.querySelector('.carousel-btn-prev');
        const nextBtn = document.querySelector('.carousel-btn-next');
        const dotsContainer = document.querySelector('.carousel-dots');
        
        let currentIndex = 0;
        let cardsPerView = 1;
        let totalSlides = 0;

        // Calculate cards per view based on screen size
        function getCardsPerView() {
            const width = window.innerWidth;
            if (width >= 1024) {
                return 3; // Desktop: 3 cards
            } else if (width >= 768) {
                return 2; // Tablet: 2 cards
            } else {
                return 1; // Mobile: 1 card
            }
        }

        // Calculate total slides
        function calculateTotalSlides() {
            cardsPerView = getCardsPerView();
            totalSlides = Math.max(0, tourCards.length - cardsPerView);
            return totalSlides;
        }

        // Update carousel position
        function updateCarousel() {
            if (tourCards.length === 0) return;
            
            const carouselWidth = toursCarousel.offsetWidth;
            const gap = parseInt(getComputedStyle(carouselTrack).gap) || 24;
            const cardWidth = (carouselWidth - (gap * (cardsPerView - 1))) / cardsPerView;
            const translateX = -(currentIndex * (cardWidth + gap));
            
            carouselTrack.style.transform = `translateX(${translateX}px)`;
            
            // Update buttons
            if (prevBtn) {
                prevBtn.disabled = currentIndex === 0;
            }
            if (nextBtn) {
                nextBtn.disabled = currentIndex >= totalSlides;
            }
            
            // Update dots
            updateDots();
        }

        // Create dots
        function createDots() {
            if (!dotsContainer) return;
            
            dotsContainer.innerHTML = '';
            const totalDots = totalSlides + 1;
            
            for (let i = 0; i < totalDots; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                if (i === 0) dot.classList.add('active');
                dot.setAttribute('aria-label', `Chuyển đến slide ${i + 1}`);
                dot.addEventListener('click', () => goToSlide(i));
                dotsContainer.appendChild(dot);
            }
        }

        // Update dots active state
        function updateDots() {
            if (!dotsContainer) return;
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, index) => {
                if (index === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // Go to specific slide
        function goToSlide(index) {
            currentIndex = Math.max(0, Math.min(index, totalSlides));
            updateCarousel();
        }

        // Next slide
        function nextSlide() {
            if (currentIndex < totalSlides) {
                currentIndex++;
                updateCarousel();
            }
        }

        // Previous slide
        function prevSlide() {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        }

        // Initialize carousel
        function initCarousel() {
            calculateTotalSlides();
            createDots();
            updateCarousel();
        }

        // Event listeners
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }

        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                calculateTotalSlides();
                createDots();
                // Reset to first slide if current index is out of bounds
                if (currentIndex > totalSlides) {
                    currentIndex = totalSlides;
                }
                updateCarousel();
            }, 250);
        });

        // Touch/swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        carouselTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        carouselTrack.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next
                    nextSlide();
                } else {
                    // Swipe right - previous
                    prevSlide();
                }
            }
        }

        // Initialize on load
        initCarousel();
        
        // Recalculate on images load (in case images affect layout)
        const images = carouselTrack.querySelectorAll('img');
        let imagesLoaded = 0;
        images.forEach(img => {
            if (img.complete) {
                imagesLoaded++;
            } else {
                img.addEventListener('load', () => {
                    imagesLoaded++;
                    if (imagesLoaded === images.length) {
                        setTimeout(initCarousel, 100);
                    }
                });
            }
        });
        
        if (imagesLoaded === images.length) {
            setTimeout(initCarousel, 100);
        }
    }

    // ============================================
    // Destinations API Integration
    // ============================================
    
    // API Configuration
    const API_CONFIG = {
        // Thay đổi URL này thành API endpoint thực tế của bạn
        BASE_URL: 'http://localhost:3000/api', // hoặc 'https://your-api-domain.com/api'
        ENDPOINTS: {
            DESTINATIONS: '/destinations'
        }
    };

    // DOM Elements
    const destinationsContainer = document.getElementById('destinations-container');
    const destinationsLoading = document.getElementById('destinations-loading');
    const destinationsError = document.getElementById('destinations-error');
    const destinationsEmpty = document.getElementById('destinations-empty');
    const retryButton = document.getElementById('retry-destinations');

    // State Management
    let destinationsData = [];

    /**
     * Hiển thị loading state
     */
    function showLoading() {
        if (destinationsLoading) destinationsLoading.style.display = 'block';
        if (destinationsContainer) destinationsContainer.style.display = 'none';
        if (destinationsError) destinationsError.style.display = 'none';
        if (destinationsEmpty) destinationsEmpty.style.display = 'none';
    }

    /**
     * Hiển thị error state
     */
    function showError() {
        if (destinationsLoading) destinationsLoading.style.display = 'none';
        if (destinationsContainer) destinationsContainer.style.display = 'none';
        if (destinationsError) destinationsError.style.display = 'block';
        if (destinationsEmpty) destinationsEmpty.style.display = 'none';
    }

    /**
     * Hiển thị empty state
     */
    function showEmpty() {
        if (destinationsLoading) destinationsLoading.style.display = 'none';
        if (destinationsContainer) destinationsContainer.style.display = 'none';
        if (destinationsError) destinationsError.style.display = 'none';
        if (destinationsEmpty) destinationsEmpty.style.display = 'block';
    }

    /**
     * Hiển thị destinations
     */
    function showDestinations() {
        if (destinationsLoading) destinationsLoading.style.display = 'none';
        if (destinationsContainer) destinationsContainer.style.display = 'grid';
        if (destinationsError) destinationsError.style.display = 'none';
        if (destinationsEmpty) destinationsEmpty.style.display = 'none';
    }

    /**
     * Tạo HTML cho một destination card
     * @param {Object} destination - Dữ liệu destination
     * @returns {string} HTML string
     */
    function createDestinationCard(destination) {
        const {
            id,
            name,
            image,
            imageAlt = '',
            slug = '',
            description = '',
            location = '',
            rating = null,
            tourCount = null
        } = destination;

        // Tạo URL chi tiết (nếu có slug)
        const detailUrl = slug ? `/destinations/${slug}` : `#destinations?id=${id}`;

        return `
            <article class="destination-card" data-id="${id || ''}">
                <a href="${detailUrl}" class="destination-link">
                    <div class="destination-image">
                        <img 
                            src="${image || 'https://via.placeholder.com/800x600?text=No+Image'}" 
                            alt="${imageAlt || name}" 
                            loading="lazy"
                            onerror="this.src='https://via.placeholder.com/800x600?text=Error+Loading+Image'"
                        >
                        <div class="destination-overlay"></div>
                        ${rating ? `<div class="destination-rating">⭐ ${rating.toFixed(1)}</div>` : ''}
                    </div>
                    <h3 class="destination-name">${name || 'Không có tên'}</h3>
                    ${description ? `<p class="destination-description">${description}</p>` : ''}
                    ${location ? `<p class="destination-location">📍 ${location}</p>` : ''}
                    ${tourCount !== null ? `<p class="destination-tour-count">${tourCount} tour</p>` : ''}
                </a>
            </article>
        `;
    }

    /**
     * Render danh sách destinations
     * @param {Array} destinations - Mảng destinations
     */
    function renderDestinations(destinations) {
        if (!destinationsContainer) return;

        if (!destinations || destinations.length === 0) {
            showEmpty();
            return;
        }

        // Xóa nội dung cũ
        destinationsContainer.innerHTML = '';

        // Render từng destination
        destinations.forEach(destination => {
            const cardHTML = createDestinationCard(destination);
            destinationsContainer.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Thêm event listeners cho các cards
        const destinationCards = destinationsContainer.querySelectorAll('.destination-card');
        destinationCards.forEach(card => {
            card.addEventListener('click', function(e) {
                // Có thể thêm analytics tracking ở đây
                console.log('Destination clicked:', this.dataset.id);
            });
        });

        showDestinations();
    }

    /**
     * Fetch destinations từ API
     * @param {Object} options - Tùy chọn (limit, offset, etc.)
     * @returns {Promise<Array>}
     */
    async function fetchDestinations(options = {}) {
        const {
            limit = 6,
            offset = 0,
            featured = true,
            sortBy = 'popularity'
        } = options;

        try {
            // Tạo URL với query parameters
            const url = new URL(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DESTINATIONS}`);
            url.searchParams.append('limit', limit);
            url.searchParams.append('offset', offset);
            if (featured) url.searchParams.append('featured', 'true');
            if (sortBy) url.searchParams.append('sortBy', sortBy);

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Thêm Authorization header nếu cần
                    // 'Authorization': `Bearer ${token}`
                },
                // Timeout sau 10 giây
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Xử lý các format response khác nhau
            // Format 1: { data: [...], total: 10 }
            // Format 2: { destinations: [...], count: 10 }
            // Format 3: [...]
            if (data.data && Array.isArray(data.data)) {
                return data.data;
            } else if (data.destinations && Array.isArray(data.destinations)) {
                return data.destinations;
            } else if (Array.isArray(data)) {
                return data;
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error fetching destinations:', error);
            throw error;
        }
    }

    /**
     * Load destinations với error handling
     */
    async function loadDestinations() {
        try {
            showLoading();

            // Thử fetch từ API
            const destinations = await fetchDestinations({
                limit: 6,
                featured: true,
                sortBy: 'popularity'
            });

            destinationsData = destinations;
            renderDestinations(destinations);
        } catch (error) {
            console.error('Failed to load destinations:', error);
            
            // Nếu API chưa sẵn sàng, sử dụng dữ liệu mẫu
            if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
                console.warn('API không khả dụng, sử dụng dữ liệu mẫu');
                const mockDestinations = getMockDestinations();
                destinationsData = mockDestinations;
                renderDestinations(mockDestinations);
            } else {
                showError();
            }
        }
    }

    /**
     * Dữ liệu mẫu - Sử dụng khi API chưa sẵn sàng
     * Format này phù hợp với cấu trúc dữ liệu từ Backend
     */
    function getMockDestinations() {
        return [
            {
                id: 1,
                name: 'Vịnh Hạ Long',
                image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
                imageAlt: 'Vịnh Hạ Long',
                slug: 'vinh-ha-long',
                description: 'Kỳ quan thiên nhiên thế giới',
                location: 'Quảng Ninh',
                rating: 4.8,
                tourCount: 25
            },
            {
                id: 2,
                name: 'Sapa',
                image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
                imageAlt: 'Sapa',
                slug: 'sapa',
                description: 'Vẻ đẹp núi rừng Tây Bắc',
                location: 'Lào Cai',
                rating: 4.7,
                tourCount: 18
            },
            {
                id: 3,
                name: 'Phú Quốc',
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                imageAlt: 'Phú Quốc',
                slug: 'phu-quoc',
                description: 'Thiên đường biển đảo',
                location: 'Kiên Giang',
                rating: 4.9,
                tourCount: 30
            },
            {
                id: 4,
                name: 'Hội An',
                image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
                imageAlt: 'Hội An',
                slug: 'hoi-an',
                description: 'Phố cổ di sản văn hóa thế giới',
                location: 'Quảng Nam',
                rating: 4.6,
                tourCount: 22
            },
            {
                id: 5,
                name: 'Đà Lạt',
                image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
                imageAlt: 'Đà Lạt',
                slug: 'da-lat',
                description: 'Thành phố ngàn hoa',
                location: 'Lâm Đồng',
                rating: 4.5,
                tourCount: 20
            },
            {
                id: 6,
                name: 'Nha Trang',
                image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                imageAlt: 'Nha Trang',
                slug: 'nha-trang',
                description: 'Biển xanh cát trắng',
                location: 'Khánh Hòa',
                rating: 4.7,
                tourCount: 28
            }
        ];
    }

    // Event Listeners
    if (retryButton) {
        retryButton.addEventListener('click', loadDestinations);
    }

    // Initialize - Load destinations khi trang load
    if (destinationsContainer) {
        loadDestinations();
    }

    // Export functions để có thể sử dụng từ nơi khác (nếu cần)
    window.DestinationsAPI = {
        load: loadDestinations,
        render: renderDestinations,
        fetch: fetchDestinations,
        getData: () => destinationsData
    };

    // ============================================
    // Testimonials API Integration
    // ============================================
    
    // DOM Elements
    const testimonialsContainer = document.getElementById('testimonials-container');
    const testimonialsLoading = document.getElementById('testimonials-loading');
    const testimonialsError = document.getElementById('testimonials-error');
    const testimonialsEmpty = document.getElementById('testimonials-empty');
    const testimonialsPagination = document.getElementById('testimonials-pagination');
    const retryTestimonialsBtn = document.getElementById('retry-testimonials');
    const testimonialsPrevBtn = document.getElementById('testimonials-prev');
    const testimonialsNextBtn = document.getElementById('testimonials-next');
    const testimonialsPages = document.getElementById('testimonials-pages');

    // State Management
    let testimonialsData = [];
    let currentPage = 1;
    let totalPages = 1;
    const itemsPerPage = 3;
    const maxItemsToShow = 4; // Chỉ hiển thị tối đa 4 đánh giá trên 1 hàng

    /**
     * Hiển thị loading state
     */
    function showTestimonialsLoading() {
        if (testimonialsLoading) testimonialsLoading.style.display = 'block';
        if (testimonialsContainer) testimonialsContainer.style.display = 'none';
        if (testimonialsError) testimonialsError.style.display = 'none';
        if (testimonialsEmpty) testimonialsEmpty.style.display = 'none';
        if (testimonialsPagination) testimonialsPagination.style.display = 'none';
    }

    /**
     * Hiển thị error state
     */
    function showTestimonialsError() {
        if (testimonialsLoading) testimonialsLoading.style.display = 'none';
        if (testimonialsContainer) testimonialsContainer.style.display = 'none';
        if (testimonialsError) testimonialsError.style.display = 'block';
        if (testimonialsEmpty) testimonialsEmpty.style.display = 'none';
        if (testimonialsPagination) testimonialsPagination.style.display = 'none';
    }

    /**
     * Hiển thị empty state
     */
    function showTestimonialsEmpty() {
        if (testimonialsLoading) testimonialsLoading.style.display = 'none';
        if (testimonialsContainer) testimonialsContainer.style.display = 'none';
        if (testimonialsError) testimonialsError.style.display = 'none';
        if (testimonialsEmpty) testimonialsEmpty.style.display = 'block';
        if (testimonialsPagination) testimonialsPagination.style.display = 'none';
    }

    /**
     * Hiển thị testimonials
     */
    function showTestimonials() {
        if (testimonialsLoading) testimonialsLoading.style.display = 'none';
        if (testimonialsContainer) testimonialsContainer.style.display = 'grid';
        if (testimonialsError) testimonialsError.style.display = 'none';
        if (testimonialsEmpty) testimonialsEmpty.style.display = 'none';
    }

    /**
     * Tạo HTML cho một testimonial card
     * @param {Object} testimonial - Dữ liệu testimonial
     * @returns {string} HTML string
     */
    function createTestimonialCard(testimonial) {
        const {
            id,
            customerName,
            customerAvatar = '',
            customerInitials = '',
            rating = 5,
            comment = '',
            tourName = '',
            createdAt = '',
            verified = false
        } = testimonial;

        // Tạo avatar initials từ tên nếu không có
        const initials = customerInitials || (customerName ? customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'KH');
        
        // Tạo stars từ rating
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        let starsHTML = '⭐'.repeat(fullStars);
        if (hasHalfStar) starsHTML += '⭐';
        // Đảm bảo luôn có 5 sao
        while (starsHTML.length < 5) starsHTML += '☆';

        // Format date
        let dateText = '';
        if (createdAt) {
            try {
                const date = new Date(createdAt);
                dateText = date.toLocaleDateString('vi-VN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            } catch (e) {
                dateText = createdAt;
            }
        }

        return `
            <div class="testimonial-card" data-id="${id || ''}">
                <div class="testimonial-rating">
                    <span>${starsHTML}</span>
                    ${dateText ? `<span class="testimonial-date">${dateText}</span>` : ''}
                </div>
                <p class="testimonial-text">"${comment || 'Chưa có đánh giá'}"</p>
                ${tourName ? `<p class="testimonial-tour">Tour: <strong>${tourName}</strong></p>` : ''}
                <div class="testimonial-author">
                    ${customerAvatar ? 
                        `<img src="${customerAvatar}" alt="${customerName}" class="author-avatar-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : 
                        ''
                    }
                    <div class="author-avatar" ${customerAvatar ? 'style="display: none;"' : ''}>${initials}</div>
                    <div class="author-info">
                        <h4 class="author-name">
                            ${customerName || 'Khách hàng'}
                            ${verified ? '<span class="verified-badge">✓</span>' : ''}
                        </h4>
                        <p class="author-role">Khách hàng</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render danh sách testimonials - chỉ hiển thị tối đa 4 items trên 1 hàng
     * @param {Array} testimonials - Mảng testimonials
     * @param {number} page - Trang hiện tại (không dùng nữa, nhưng giữ để tương thích)
     */
    function renderTestimonials(testimonials, page = 1) {
        if (!testimonialsContainer) return;

        if (!testimonials || testimonials.length === 0) {
            showTestimonialsEmpty();
            return;
        }

        // Chỉ lấy tối đa 4 items đầu tiên (mới nhất)
        const itemsToShow = testimonials.slice(0, maxItemsToShow);

        // Xóa nội dung cũ
        testimonialsContainer.innerHTML = '';

        // Render từng testimonial
        itemsToShow.forEach(testimonial => {
            const cardHTML = createTestimonialCard(testimonial);
            testimonialsContainer.insertAdjacentHTML('beforeend', cardHTML);
        });

        showTestimonials();
        
        // Luôn ẩn pagination vì chỉ hiển thị 1 hàng
        if (testimonialsPagination) {
            testimonialsPagination.style.display = 'none';
        }
    }

    /**
     * Render pagination controls
     */
    function renderPagination() {
        if (!testimonialsPagination || !testimonialsPages) return;

        // Ẩn pagination nếu chỉ có 1 trang
        if (totalPages <= 1) {
            testimonialsPagination.style.display = 'none';
            return;
        }

        testimonialsPagination.style.display = 'flex';
        
        // Update prev/next buttons
        if (testimonialsPrevBtn) {
            testimonialsPrevBtn.disabled = currentPage === 1;
            testimonialsPrevBtn.classList.toggle('disabled', currentPage === 1);
        }
        
        if (testimonialsNextBtn) {
            testimonialsNextBtn.disabled = currentPage === totalPages;
            testimonialsNextBtn.classList.toggle('disabled', currentPage === totalPages);
        }

        // Render page numbers
        testimonialsPages.innerHTML = '';
        
        // Hiển thị tối đa 5 số trang
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        // Button "First" nếu không bắt đầu từ 1
        if (startPage > 1) {
            const firstBtn = document.createElement('button');
            firstBtn.className = 'pagination-page';
            firstBtn.textContent = '1';
            firstBtn.addEventListener('click', () => goToPage(1));
            testimonialsPages.appendChild(firstBtn);
            
            if (startPage > 2) {
                const dots = document.createElement('span');
                dots.className = 'pagination-dots';
                dots.textContent = '...';
                testimonialsPages.appendChild(dots);
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'pagination-page';
            if (i === currentPage) {
                pageBtn.classList.add('active');
            }
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => goToPage(i));
            testimonialsPages.appendChild(pageBtn);
        }

        // Button "Last" nếu không kết thúc ở totalPages
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const dots = document.createElement('span');
                dots.className = 'pagination-dots';
                dots.textContent = '...';
                testimonialsPages.appendChild(dots);
            }
            
            const lastBtn = document.createElement('button');
            lastBtn.className = 'pagination-page';
            lastBtn.textContent = totalPages;
            lastBtn.addEventListener('click', () => goToPage(totalPages));
            testimonialsPages.appendChild(lastBtn);
        }
    }

    /**
     * Điều hướng đến trang cụ thể
     * @param {number} page - Số trang
     */
    function goToPage(page) {
        if (page < 1 || page > totalPages || page === currentPage) return;
        
        renderTestimonials(testimonialsData, page);
        
        // Smooth scroll to testimonials section
        const testimonialsSection = document.querySelector('.testimonials');
        if (testimonialsSection) {
            const headerOffset = 80;
            const elementPosition = testimonialsSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Fetch testimonials từ API
     * @param {Object} options - Tùy chọn (limit, offset, sortBy)
     * @returns {Promise<Array>}
     */
    async function fetchTestimonials(options = {}) {
        const {
            limit = 100, // Lấy nhiều để phân trang phía client
            offset = 0,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = options;

        try {
            // Tạo URL với query parameters
            const url = new URL(`${API_CONFIG.BASE_URL}/testimonials`);
            url.searchParams.append('limit', limit);
            url.searchParams.append('offset', offset);
            url.searchParams.append('sortBy', sortBy);
            url.searchParams.append('sortOrder', sortOrder);

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Xử lý các format response khác nhau
            if (data.data && Array.isArray(data.data)) {
                return data.data;
            } else if (data.testimonials && Array.isArray(data.testimonials)) {
                return data.testimonials;
            } else if (data.reviews && Array.isArray(data.reviews)) {
                return data.reviews;
            } else if (Array.isArray(data)) {
                return data;
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            throw error;
        }
    }

    /**
     * Load testimonials với error handling
     */
    async function loadTestimonials() {
        try {
            showTestimonialsLoading();

            // Thử fetch từ API
            const testimonials = await fetchTestimonials({
                limit: 100,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            // Sắp xếp lại để đảm bảo mới nhất lên đầu
            const sortedTestimonials = testimonials.sort((a, b) => {
                const dateA = new Date(a.createdAt || a.date || 0);
                const dateB = new Date(b.createdAt || b.date || 0);
                return dateB - dateA;
            });
            
            testimonialsData = sortedTestimonials;
            // Chỉ lấy 4 items đầu tiên (mới nhất) để hiển thị trên 1 hàng
            renderTestimonials(sortedTestimonials.slice(0, maxItemsToShow), 1);
        } catch (error) {
            console.error('Failed to load testimonials:', error);
            
            // Nếu API chưa sẵn sàng, sử dụng dữ liệu mẫu
            if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
                console.warn('API không khả dụng, sử dụng dữ liệu mẫu');
                const mockTestimonials = getMockTestimonials();
                testimonialsData = mockTestimonials;
                // Chỉ lấy 4 items đầu tiên (mới nhất) để hiển thị trên 1 hàng
                renderTestimonials(mockTestimonials.slice(0, maxItemsToShow), 1);
            } else {
                showTestimonialsError();
            }
        }
    }

    /**
     * Dữ liệu mẫu - Sử dụng khi API chưa sẵn sàng
     */
    function getMockTestimonials() {
        return [
            {
                id: 1,
                customerName: 'Nguyễn Văn A',
                rating: 5,
                comment: 'Chuyến đi Hạ Long thật tuyệt vời! Hướng dẫn viên rất nhiệt tình, lịch trình hợp lý và dịch vụ chất lượng. Tôi sẽ quay lại đặt tour khác trong tương lai.',
                tourName: 'Vịnh Hạ Long - Kỳ Quan Thiên Nhiên',
                createdAt: new Date('2024-12-15').toISOString(),
                verified: true
            },
            {
                id: 2,
                customerName: 'Trần Thị B',
                rating: 5,
                comment: 'Tour Sapa vượt quá mong đợi của tôi. Cảnh đẹp, văn hóa đa dạng và trải nghiệm độc đáo. Cảm ơn đội ngũ đã tạo nên một kỷ niệm đáng nhớ!',
                tourName: 'Sapa - Núi Rừng Tây Bắc',
                createdAt: new Date('2024-12-14').toISOString(),
                verified: true
            },
            {
                id: 3,
                customerName: 'Lê Văn C',
                rating: 5,
                comment: 'Phú Quốc là điểm đến tuyệt vời! Bãi biển đẹp, hải sản tươi ngon và dịch vụ chuyên nghiệp. Đã giới thiệu cho nhiều bạn bè.',
                tourName: 'Phú Quốc - Thiên Đường Biển Đảo',
                createdAt: new Date('2024-12-13').toISOString(),
                verified: false
            },
            {
                id: 4,
                customerName: 'Phạm Thị D',
                rating: 4,
                comment: 'Hội An rất đẹp và cổ kính. Thích nhất là đêm phố cổ với đèn lồng. Tour guide nhiệt tình, giải thích rất rõ về lịch sử.',
                tourName: 'Hội An - Phố Cổ Di Sản',
                createdAt: new Date('2024-12-12').toISOString(),
                verified: true
            },
            {
                id: 5,
                customerName: 'Hoàng Văn E',
                rating: 5,
                comment: 'Đà Lạt mát mẻ, cảnh đẹp. Đặc biệt thích thác Datanla và cà phê ở đây. Sẽ quay lại vào mùa hoa dã quỳ.',
                tourName: 'Đà Lạt - Thành Phố Ngàn Hoa',
                createdAt: new Date('2024-12-11').toISOString(),
                verified: false
            },
            {
                id: 6,
                customerName: 'Võ Thị F',
                rating: 5,
                comment: 'Nha Trang có biển xanh, cát trắng. Vinpearl rất thú vị. Hải sản ở đây tươi và ngon lắm. Đáng giá từng đồng!',
                tourName: 'Nha Trang - Biển Xanh Cát Trắng',
                createdAt: new Date('2024-12-10').toISOString(),
                verified: true
            }
        ];
    }

    // Event Listeners
    if (retryTestimonialsBtn) {
        retryTestimonialsBtn.addEventListener('click', loadTestimonials);
    }

    if (testimonialsPrevBtn) {
        testimonialsPrevBtn.addEventListener('click', () => goToPage(currentPage - 1));
    }

    if (testimonialsNextBtn) {
        testimonialsNextBtn.addEventListener('click', () => goToPage(currentPage + 1));
    }

    // Initialize - Load testimonials khi trang load
    if (testimonialsContainer) {
        loadTestimonials();
    }

    // Export functions để có thể sử dụng từ nơi khác (nếu cần)
    window.TestimonialsAPI = {
        load: loadTestimonials,
        render: renderTestimonials,
        fetch: fetchTestimonials,
        getData: () => testimonialsData,
        goToPage: goToPage
    };
});

