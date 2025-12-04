// ===================================
// Luna Essence Portfolio - Interactive Scripts
// ===================================

// === Theme Toggle ===
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('luna-theme') || 'light';
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    updateThemeIcon(true);
}

themeToggle.addEventListener('click', () => {
    const isDark = body.classList.toggle('dark-mode');
    localStorage.setItem('luna-theme', isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
});

function updateThemeIcon(isDark) {
    const icon = themeToggle.querySelector('.theme-icon');
    icon.textContent = isDark ? '☀️' : '🌙';
}

// === Scroll Animation ===
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// === Video Modal ===
const modal = document.getElementById('videoModal');
const modalContent = modal.querySelector('.video-modal-content');
const modalVideo = document.getElementById('modalVideo');
const modalSource = document.getElementById('modalSource');
const modalBackdrop = modal.querySelector('.video-modal-backdrop');
const modalCloseBtn = modal.querySelector('.video-modal-close');

let lastFocusedElement = null;

// Open modal function
async function openVideoModal(videoSrc, posterSrc, orientation) {
    // Store the element that triggered the modal
    lastFocusedElement = document.activeElement;
    
    // Set video source and poster
    modalSource.src = videoSrc;
    modalVideo.poster = posterSrc;
    
    // Reset orientation classes
    modalContent.classList.remove('vertical', 'landscape');
    
    // Add appropriate orientation class
    if (orientation === 'vertical') {
        modalContent.classList.add('vertical');
    } else {
        modalContent.classList.add('landscape');
    }
    
    // Show modal
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Load video
    try {
        modalVideo.load();
        
        // Wait for metadata to load (with timeout)
        await Promise.race([
            new Promise((resolve) => {
                modalVideo.addEventListener('loadedmetadata', resolve, { once: true });
            }),
            new Promise((resolve) => setTimeout(resolve, 1000))
        ]);
        
        // Try to autoplay muted for better UX
        modalVideo.muted = true;
        try {
            await modalVideo.play();
            // Unmute after successful autoplay
            modalVideo.muted = false;
        } catch (err) {
            // Autoplay failed, user will need to click play
            modalVideo.muted = false;
        }
    } catch (err) {
        console.error('Error loading video:', err);
    }
    
    // Focus close button for accessibility
    setTimeout(() => modalCloseBtn.focus(), 100);
}

// Close modal function
function closeVideoModal() {
    if (!modal.classList.contains('active')) return;
    
    // Pause and reset video
    try {
        modalVideo.pause();
        modalVideo.currentTime = 0;
    } catch (err) {
        console.error('Error pausing video:', err);
    }
    
    // Clear source to stop network usage
    modalSource.src = '';
    modalVideo.load();
    
    // Hide modal
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Return focus to the button that opened the modal
    if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
    }
}

// Add click handlers to all play buttons
document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const videoSrc = btn.getAttribute('data-video');
        const posterSrc = btn.getAttribute('data-poster');
        
        // Get orientation from parent card
        const card = btn.closest('.project-card');
        const orientation = card.getAttribute('data-orientation') || 'landscape';
        
        openVideoModal(videoSrc, posterSrc, orientation);
    });
});

// Close modal on backdrop click
modalBackdrop.addEventListener('click', closeVideoModal);

// Close modal on close button click
modalCloseBtn.addEventListener('click', closeVideoModal);

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeVideoModal();
    }
});

// Pause video when page is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden && modal.classList.contains('active')) {
        try {
            modalVideo.pause();
        } catch (err) {
            console.error('Error pausing video:', err);
        }
    }
});

// Pause video before page unload
window.addEventListener('pagehide', () => {
    try {
        modalVideo.pause();
    } catch (err) {
        // Ignore errors on page hide
    }
});

// === Smooth Scroll (Optional Enhancement) ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// === Performance: Lazy load video posters ===
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
}

// === Console Easter Egg ===
console.log('%c🌙 Luna Essence Portfolio', 'color: #9b7ddb; font-size: 20px; font-weight: bold;');
console.log('%cLooking for something? Feel free to reach out!', 'color: #b89fea; font-size: 14px;');
console.log('%c📧 celestialdraco6@gmail.com', 'color: #e0c3fc; font-size: 12px;');
