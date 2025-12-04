// Theme toggle with persistence
const themeToggleBtn = document.querySelector('.theme-toggle');
function setTheme(dark) {
  if (dark) {
    document.body.classList.add('dark-theme');
    themeToggleBtn.setAttribute('aria-pressed', 'true');
    localStorage.setItem('luna-theme', 'dark');
  } else {
    document.body.classList.remove('dark-theme');
    themeToggleBtn.setAttribute('aria-pressed', 'false');
    localStorage.setItem('luna-theme', 'light');
  }
}

themeToggleBtn.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-theme');
  setTheme(isDark);
});

if (localStorage.getItem('luna-theme') === 'dark') {
  setTheme(true);
} else {
  setTheme(false);
}

// IntersectionObserver for fade-in reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Video modal logic with orientation detection
const modal = document.getElementById('videoModal');
const modalContent = modal.querySelector('.video-modal-content');
const modalVideo = document.getElementById('modalVideo');
const modalSource = document.getElementById('modalSource');
let lastFocusedTrigger = null;

document.querySelectorAll('.video-thumb-btn').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    lastFocusedTrigger = btn;
    const src = btn.getAttribute('data-video');
    const poster = btn.getAttribute('data-poster');
    modalSource.src = src;
    modalVideo.poster = poster;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    modalContent.classList.remove('vertical', 'horizontal');

    // Load video metadata for orientation detection
    try {
      await modalVideo.load();
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, 800);
        modalVideo.addEventListener('loadedmetadata', function onMeta() {
          modalVideo.removeEventListener('loadedmetadata', onMeta);
          clearTimeout(timeout);
          resolve();
        });
      });
    } catch (err) {
      // ignored
    }

    // Determine orientation by video or fallback poster regex for vertical videos
    const isVertical = modalVideo.videoHeight > modalVideo.videoWidth || /serum|lipstick/i.test(poster);
    if (isVertical) {
      modalContent.classList.add('vertical');
    } else {
      modalContent.classList.add('horizontal');
    }

    modalVideo.muted = true;
    try { await modalVideo.play(); } catch (err) {
      modalVideo.muted = false;
    }
  });
});

// Close modal function
function closeVideoModal() {
  if (!modal.classList.contains('active')) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  modalVideo.pause();
  modalVideo.currentTime = 0;
  modalSource.src = '';
  modalVideo.load();
  document.body.style.overflow = '';
  if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
    lastFocusedTrigger.focus();
  }
  lastFocusedTrigger = null;
}

modal.addEventListener('click', e => {
  if (e.target.hasAttribute('data-close-modal')) {
    closeVideoModal();
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeVideoModal();
  }
});

window.addEventListener('pagehide', () => {
  try {
    modalVideo.pause();
  } catch { }
});
