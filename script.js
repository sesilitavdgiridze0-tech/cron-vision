/**
 * ==========================================================================
 * Chronos - Landing Page Interactions & Functionality
 * Vanilla JavaScript (ES6+)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  initLucideIcons();

  // 2. Setup Sticky Header Effects
  setupHeaderScroll();

  // 3. Setup Mobile Navigation Menu
  setupMobileMenu();

  // 4. Setup Interactive Pomodoro Widget
  setupPomodoroWidget();

  // 5. Setup Interactive Task Checklist
  setupTaskChecklist();

  // 6. Setup Contact Form Validation & Submission
  setupContactForm();
});

/**
 * Initializes Lucide icons safely
 */
function initLucideIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Header dynamic background and shadow on scroll
 */
function setupHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('shadow-lg', 'shadow-purple-950/20', 'bg-chronos-bg/95');
      header.classList.remove('bg-chronos-bg/85');
    } else {
      header.classList.remove('shadow-lg', 'shadow-purple-950/20', 'bg-chronos-bg/95');
      header.classList.add('bg-chronos-bg/85');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Mobile Navigation Hamburger Menu Toggle
 */
function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');

  if (!mobileMenuBtn || !mobileMenu) return;

  let isOpen = false;

  const toggleMenu = (open) => {
    isOpen = typeof open === 'boolean' ? open : !isOpen;
    mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
      mobileMenu.classList.remove('hidden');
      if (menuIcon) menuIcon.setAttribute('data-lucide', 'x');
    } else {
      mobileMenu.classList.add('hidden');
      if (menuIcon) menuIcon.setAttribute('data-lucide', 'menu');
    }
    initLucideIcons();
  };

  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close when clicking any nav link
  document.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (isOpen && !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      toggleMenu(false);
    }
  });

  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      toggleMenu(false);
    }
  });
}

/**
 * Interactive Pomodoro Timer Widget
 */
function setupPomodoroWidget() {
  const timerDisplay = document.getElementById('timer-display');
  const timerStatusText = document.getElementById('timer-status-text');
  const timerToggleBtn = document.getElementById('timer-toggle-btn');
  const timerBtnLabel = document.getElementById('timer-btn-label');
  const timerToggleIcon = document.getElementById('timer-toggle-icon');
  const timerResetBtn = document.getElementById('timer-reset-btn');
  const progressRing = document.getElementById('timer-progress-ring');

  if (!timerDisplay || !timerToggleBtn) return;

  const DEFAULT_DURATION = 25 * 60; // 25 minutes in seconds
  let duration = DEFAULT_DURATION;
  let remainingSeconds = duration;
  let timerInterval = null;
  let isRunning = false;

  // Circumference of SVG circle (r = 50)
  const radius = 50;
  const circumference = 2 * Math.PI * radius; // approx 314.159

  // Initial Progress Ring setup
  if (progressRing) {
    progressRing.style.strokeDasharray = `${circumference}`;
    progressRing.style.strokeDashoffset = '0';
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function updateDisplay() {
    timerDisplay.textContent = formatTime(remainingSeconds);

    if (progressRing) {
      const progressFraction = (duration - remainingSeconds) / duration;
      const offset = circumference * progressFraction;
      progressRing.style.strokeDashoffset = `${offset}`;
    }
  }

  function playChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  function startTimer() {
    isRunning = true;
    timerBtnLabel.textContent = 'პაუზა';
    if (timerToggleIcon) timerToggleIcon.setAttribute('data-lucide', 'pause');

    timerStatusText.textContent = 'მიმდინარეობს ფოკუსირება...';
    timerStatusText.className = 'text-[11px] uppercase tracking-wider text-emerald-400 font-semibold mt-1';
    initLucideIcons();

    timerInterval = setInterval(() => {
      if (remainingSeconds > 0) {
        remainingSeconds--;
        updateDisplay();
      } else {
        clearInterval(timerInterval);
        isRunning = false;
        timerBtnLabel.textContent = 'დაწყება';
        if (timerToggleIcon) timerToggleIcon.setAttribute('data-lucide', 'play');

        timerStatusText.textContent = 'სესია დასრულდა! შესანიშნავია 🎉';
        timerStatusText.className = 'text-[11px] uppercase tracking-wider text-pink-400 font-bold mt-1';
        initLucideIcons();

        playChime();
        showToast('ფოკუს-სესია დასრულდა! 🎯', 'შესანიშნავი ნამუშევარია. დროა 5 წუთით დაისვენოთ.');
      }
    }, 1000);
  }

  function pauseTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    timerBtnLabel.textContent = 'გაგრძელება';
    if (timerToggleIcon) timerToggleIcon.setAttribute('data-lucide', 'play');

    timerStatusText.textContent = 'პაუზა';
    timerStatusText.className = 'text-[11px] uppercase tracking-wider text-yellow-400 font-semibold mt-1';
    initLucideIcons();
  }

  function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    remainingSeconds = duration;
    timerBtnLabel.textContent = 'დაწყება';
    if (timerToggleIcon) timerToggleIcon.setAttribute('data-lucide', 'play');

    timerStatusText.textContent = 'მზადაა ფოკუსისთვის';
    timerStatusText.className = 'text-[11px] uppercase tracking-wider text-pink-300 font-semibold mt-1';

    updateDisplay();
    initLucideIcons();
  }

  timerToggleBtn.addEventListener('click', () => {
    if (!isRunning) {
      startTimer();
    } else {
      pauseTimer();
    }
  });

  if (timerResetBtn) {
    timerResetBtn.addEventListener('click', resetTimer);
  }

  // Initial update
  updateDisplay();
}

/**
 * Interactive Task Checklist item toggle & counter
 */
function setupTaskChecklist() {
  const taskItems = document.querySelectorAll('.task-item');
  const taskCounter = document.getElementById('task-counter');

  function updateCounter() {
    if (!taskCounter) return;
    const total = taskItems.length;
    const completed = document.querySelectorAll('.task-item.completed').length;
    taskCounter.textContent = `${completed}/${total} დასრულებული`;
  }

  taskItems.forEach((item) => {
    item.addEventListener('click', () => {
      item.classList.toggle('completed');
      const checkIcon = item.querySelector('.task-checkbox-icon');
      if (checkIcon) {
        if (item.classList.contains('completed')) {
          checkIcon.classList.remove('hidden');
        } else {
          checkIcon.classList.add('hidden');
        }
      }
      updateCounter();
    });
  });

  updateCounter();
}

/**
 * Contact Form Validation & Feedback Logic
 */
function setupContactForm() {
  const form = document.getElementById('contact-form');
  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnIcon = document.getElementById('btn-icon');
  const btnSpinner = document.getElementById('btn-spinner');
  const successAlert = document.getElementById('form-success');

  if (!form || !nameInput || !emailInput || !messageInput) return;

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  };

  // Real-time error removal on typing
  nameInput.addEventListener('input', () => {
    if (nameInput.value.trim().length >= 2) {
      nameError.classList.add('hidden');
      nameInput.classList.remove('border-pink-500');
    }
  });

  emailInput.addEventListener('input', () => {
    if (validateEmail(emailInput.value.trim())) {
      emailError.classList.add('hidden');
      emailInput.classList.remove('border-pink-500');
    }
  });

  messageInput.addEventListener('input', () => {
    if (messageInput.value.trim().length >= 5) {
      messageError.classList.add('hidden');
      messageInput.classList.remove('border-pink-500');
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const msgVal = messageInput.value.trim();

    // Validate Name
    if (nameVal.length < 2) {
      nameError.classList.remove('hidden');
      nameInput.classList.add('border-pink-500');
      isValid = false;
    } else {
      nameError.classList.add('hidden');
      nameInput.classList.remove('border-pink-500');
    }

    // Validate Email
    if (!validateEmail(emailVal)) {
      emailError.classList.remove('hidden');
      emailInput.classList.add('border-pink-500');
      isValid = false;
    } else {
      emailError.classList.add('hidden');
      emailInput.classList.remove('border-pink-500');
    }

    // Validate Message
    if (msgVal.length < 5) {
      messageError.classList.remove('hidden');
      messageInput.classList.add('border-pink-500');
      isValid = false;
    } else {
      messageError.classList.add('hidden');
      messageInput.classList.remove('border-pink-500');
    }

    if (!isValid) return;

    // Show Loading Spinner State
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-90', 'cursor-not-allowed');
    btnText.textContent = 'იგზავნება...';
    if (btnIcon) btnIcon.classList.add('hidden');
    if (btnSpinner) btnSpinner.classList.remove('hidden');

    // Simulate Network Request
    setTimeout(() => {
      // Restore Button State
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-90', 'cursor-not-allowed');
      btnText.textContent = 'შეტყობინების გაგზავნა';
      if (btnIcon) btnIcon.classList.remove('hidden');
      if (btnSpinner) btnSpinner.classList.add('hidden');

      // Reset Form Inputs
      form.reset();

      // Show Inline Success Box
      if (successAlert) {
        successAlert.classList.remove('hidden');
        successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Display floating Toast Notification
      showToast('შეტყობინება წარმატებით გაიგზავნა! 🚀', `მადლობა ${nameVal}, Chronos-ის გუნდი მალე გიპასუხებთ.`);

      // Hide success notification after 8 seconds
      setTimeout(() => {
        if (successAlert) successAlert.classList.add('hidden');
      }, 8000);
    }, 700);
  });
}

/**
 * Global Toast Notification Display
 * @param {string} title
 * @param {string} desc
 * @param {number} duration
 */
function showToast(title, desc, duration = 4000) {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toast-title');
  const toastDesc = document.getElementById('toast-desc');

  if (!toast) return;

  if (title && toastTitle) toastTitle.textContent = title;
  if (desc && toastDesc) toastDesc.textContent = desc;

  toast.classList.remove('translate-y-24', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-24', 'opacity-0');
  }, duration);
}
