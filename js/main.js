// main.js
const API_URL = 'https://dta-backend-clean.onrender.com';
const socket = io(API_URL);


// Socket.IO error handling
socket.on('connect_error', (err) => {
    console.error('Socket.IO connection error:', err);
});

// Utility function for fetching JSON responses
async function fetchJSON(url, options) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        const contentType = response.headers.get('content-type');
        if (!response.ok) {
            const text = await response.text();
            console.error(`Fetch failed for ${url}: Status ${response.status}, Response: ${text}`);
            throw new Error(`HTTP error ${response.status}: ${text}`);
        }
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error(`Non-JSON response from ${url}: Content-Type: ${contentType}, Response: ${text}`);
            throw new Error('Server returned non-JSON response');
        }
        return response;
    } catch (err) {
        console.error(`Error fetching ${url}:`, err);
        throw err;
    }
}

// Helper function to retrieve the JWT token from local storage
function getToken() {
    return localStorage.getItem('token');
}

// Initialize hamburger menu toggle (used on all pages)
function initHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        const toggleMenu = () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            console.log('Hamburger toggled:', navMenu.classList.contains('active'));
        };
        hamburger.addEventListener('click', toggleMenu);
        hamburger.addEventListener('touchstart', (e) => {
            e.preventDefault();
            toggleMenu();
        });
    } else {
        console.error('Hamburger or nav-menu not found:', { hamburger, navMenu });
        const globalNotification = document.getElementById('global-notification');
        if (globalNotification) {
            globalNotification.textContent = 'Navigation menu failed to load. Please refresh.';
            globalNotification.classList.add('error');
            globalNotification.style.display = 'block';
            setTimeout(() => globalNotification.style.display = 'none', 3000);
        }
    }
}

// Dynamically update the footer year (used on all pages)
function updateFooterYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
}

// Initialize sidebar toggle (used on dashboard pages)
function initSidebarToggle() {
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    }
}

// Initialize user dropdown in the header (used on dashboard pages)
function initUserDropdown() {
    const userDropdown = document.getElementById('user-dropdown');
    if (userDropdown) {
        userDropdown.addEventListener('click', () => {
            const dropdown = userDropdown.querySelector('.user-dropdown');
            if (dropdown) {
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            } else {
                console.warn('Dropdown element not found in userDropdown');
            }
        });
    }
}

// Update user information in the header and sidebar
async function updateUserInfo() {
    const token = getToken();
    if (!token) return;
    try {
        const response = await fetchJSON(`${API_URL}/api/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const user = await response.json();
            const headerUserName = document.getElementById('header-user-name');
            const sidebarUserName = document.getElementById('sidebar-user-name');
            const sidebarUserLevel = document.getElementById('sidebar-user-level');
            const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
            if (headerUserName) headerUserName.textContent = `Welcome, ${user.fullName}`;
            if (sidebarUserName) sidebarUserName.textContent = user.fullName;
            if (sidebarUserLevel) sidebarUserLevel.textContent = `Level ${user.level || 1}`;
            if (sidebarUserAvatar) sidebarUserAvatar.src = user.avatar || 'https://via.placeholder.com/50';
        } else {
            console.error('Failed to fetch user info:', response.statusText);
        }
    } catch (err) {
        console.error('Error fetching user info:', err);
    }
}

// Home Page initialization
async function initHomePage() {
    const token = getToken();
    const welcomeMessage = document.getElementById('welcome-message');
    const notification = document.getElementById('home-notification');
    if (welcomeMessage && token) {
        try {
            const response = await fetchJSON(`${API_URL}/api/users/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const user = await response.json();
                welcomeMessage.textContent = `Welcome back, ${user.fullName}!`;
                welcomeMessage.style.display = 'block';
                setTimeout(() => welcomeMessage.style.display = 'none', 3000);
            } else {
                if (notification) {
                    notification.textContent = 'Failed to fetch user data.';
                    notification.classList.add('error');
                    notification.style.display = 'block';
                    setTimeout(() => notification.style.display = 'none', 3000);
                }
                console.error('Failed to fetch user data:', response.statusText);
            }
        } catch (err) {
            if (notification) {
                notification.textContent = 'Error fetching user data.';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => notification.style.display = 'none', 3000);
            }
            console.error('Error fetching user data:', err);
        }
    }
    const getStartedBtn = document.querySelector('.get-started');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            window.location.href = 'join.html';
        });
    }
}

// About Page initialization
function initAboutPage() {
    const learnMoreBtn = document.querySelector('.learn-more');
    const notification = document.getElementById('about-notification');
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', () => {
            window.location.href = 'join.html';
        });
    }
    const animateElements = document.querySelectorAll('[data-animate]');
    if (animateElements.length === 0 && notification) {
        notification.textContent = 'No animated elements found. Please check the page.';
        notification.classList.add('error');
        notification.style.display = 'block';
        setTimeout(() => notification.style.display = 'none', 3000);
        return;
    }
    if (animateElements.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('animate');
            });
        }, { threshold: 0.5 });
        animateElements.forEach(el => observer.observe(el));
    }
}

// Join Page initialization
async function initJoinPage() {
    const token = getToken();
    const joinNotification = document.getElementById('join-notification');
    const registerBtn = document.getElementById('register-now');
    if (joinNotification && token) {
        joinNotification.textContent = 'You’re already registered! Log in to access your dashboard.';
        joinNotification.classList.add('info');
        joinNotification.style.display = 'block';
        setTimeout(() => joinNotification.style.display = 'none', 3000);
    }
    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (token) {
                joinNotification.textContent = 'You’re already registered! Redirecting to login...';
                joinNotification.classList.add('info');
                joinNotification.style.display = 'block';
                setTimeout(() => window.location.href = 'login.html', 3000);
            } else {
                window.location.href = 'register.html';
            }
        });
    }
}

// FAQs Page initialization
function initFaqPage() {
    const questions = document.querySelectorAll('.faq-question');
    const notification = document.getElementById('faq-notification');
    if (questions.length === 0 && notification) {
        notification.textContent = 'No FAQ questions found. Please check the page.';
        notification.classList.add('error');
        notification.style.display = 'block';
        setTimeout(() => notification.style.display = 'none', 3000);
        return;
    }
    questions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            if (answer?.classList.contains('faq-answer')) {
                answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
                question.classList.toggle('active');
            }
        });
    });
    const contactSupport = document.querySelector('.contact-support a');
    if (contactSupport) {
        contactSupport.addEventListener('click', () => {
            console.log('Contact support link clicked');
        });
    }
}


// === Utility Toast Function ===
function showToast(message, type = 'info') {
  Toastify({
    text: message,
    duration: 3000,
    style: {
      background: type === 'success' ? 'green' :
                  type === 'error' ? 'red' :
                  type === 'warn' ? 'orange' : '#444'
    }
  }).showToast();
}

// === Login Page Init ===
function initLoginPage() {
  console.log("✅ initLoginPage loaded");

  const loginForm = document.getElementById('login-form');
  const forgotLink = document.getElementById('forgot-password');
  const togglePassword = document.querySelector('.toggle-password');

  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      const passwordInput = document.getElementById('login-password');
      const icon = togglePassword.querySelector('i');
      const isHidden = passwordInput.type === 'password';
      passwordInput.type = isHidden ? 'text' : 'password';
      icon.className = isHidden ? 'fa fa-eye-slash' : 'fa fa-eye';
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = loginForm.querySelector('button');
      const spinner = submitBtn.querySelector('.spinner');
      const btnText = submitBtn.querySelector('.btn-text');
      submitBtn.disabled = true;
      spinner.style.display = 'inline-block';
      btnText.textContent = 'Logging in...';

      const emailOrUsername = document.getElementById('login-emailOrUsername')?.value.trim();
      const password = document.getElementById('login-password')?.value.trim();

      console.log("Sending login request:", { emailOrUsername, password });
      console.log("Login API URL:", `${API_URL}/api/users/login`);

      if (!emailOrUsername || !password) {
        showToast("Please fill all required fields", 'error');
        spinner.style.display = 'none';
        btnText.textContent = 'Login';
        submitBtn.disabled = false;
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailOrUsername, password })
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          if (data.user && data.user.id) {
            localStorage.setItem('userId', data.user.id);
            socket.emit('join-room', data.user.id);
          }

          showToast("✅ Login successful!", 'success');
          setTimeout(() => window.location.href = 'dashboard.html', 2000);
        } else {
          showToast(data.message || "Invalid credentials", 'error');
          spinner.style.display = 'none';
          btnText.textContent = 'Login';
          submitBtn.disabled = false;
        }
      } catch (err) {
        console.error('Login error:', err);
        showToast("Server error. Try again later.", 'error');
        spinner.style.display = 'none';
        btnText.textContent = 'Login';
        submitBtn.disabled = false;
      }
    });
  }

  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      showToast("🔧 Password reset is not yet implemented.", 'info');
    });
  }
}

// === Register Page Stub (keep this if needed) ===
function initRegisterPage() {
  console.log("✅ initRegisterPage loaded");
  // Registration logic here...
}

// === Privacy Page Init ===
function initPrivacyPage() {
  console.log("✅ initPrivacyPage loaded");
  const backHome = document.querySelector('.back-home');
  if (backHome) {
    backHome.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
}

// === Page Router ===
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.getAttribute('data-page');

  switch (page) {
    case 'login':
      initLoginPage();
      break;
    case 'register':
      initRegisterPage();
      break;
    case 'privacy':
      initPrivacyPage();
      break;
    // Add other page inits here...
    default:
      console.warn("⚠️ No init function matched for:", page);
  }
});



// Terms Page initialization
function initTermsPage() {
    const backHome = document.querySelector('.back-home');
    if (backHome) {
        backHome.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}

// Dashboard Page initialization
async function initDashboardPage() {
    const token = getToken();
    if (!token) {
        alert('Please log in to access this page.');
        window.location.href = 'login.html';
        return;
    }
    let user;
    const lastTaskDate = localStorage.getItem('lastTaskDate');
    const today = new Date().toISOString().split('T')[0];
    const taskCompleted = lastTaskDate === today;
    const notification = document.getElementById('task-notification');

    try {
        const response = await fetchJSON(`${API_URL}/api/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        user = await response.json();
    } catch (err) {
        console.error('Error fetching user:', err);
        if (notification) {
            notification.textContent = 'Error loading profile. Please try again.';
            notification.classList.add('error');
            notification.style.display = 'block';
            setTimeout(() => notification.style.display = 'none', 3000);
        }
        return;
    }

    // Populate the user's available balance
    async function populateBalance() {
        try {
            const response = await fetchJSON(`${API_URL}/api/users/balance`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const balance = await response.json();
                const balanceElement = document.getElementById('available-balance');
                if (balanceElement) {
                    balanceElement.textContent = `₦${(balance.available || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
                }
            } else {
                throw new Error('Failed to fetch balance');
            }
        } catch (err) {
            console.error('Error fetching balance:', err);
            if (notification) {
                notification.textContent = 'Error loading balance. Please try again.';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => notification.style.display = 'none', 3000);
            }
        }
    }

    // Update task status UI based on completion and video watched state
    function updateTaskStatus(videoWatched = false) {
        const statusElement = document.getElementById('task-status');
        const taskButton = document.getElementById('complete-task-btn');
        if (statusElement && taskButton) {
            if (taskCompleted) {
                statusElement.textContent = 'Task Completed';
                statusElement.classList.remove('pending');
                statusElement.classList.add('completed');
                taskButton.disabled = true;
                taskButton.textContent = 'Task Completed';
            } else {
                statusElement.textContent = 'Task Pending';
                statusElement.classList.remove('completed');
                statusElement.classList.add('pending');
                taskButton.disabled = !videoWatched;
                taskButton.textContent = videoWatched ? 'Complete Task' : 'Watch Video to Complete';
            }
        }
    }

    // Start a countdown timer until midnight
    function startCountdown() {
        const timerElement = document.getElementById('countdown-timer');
        if (timerElement) {
            function updateTimer() {
                const now = new Date();
                const midnight = new Date(now).setHours(24, 0, 0, 0);
                const timeLeft = midnight - now;
                if (timeLeft <= 0) {
                    localStorage.removeItem('lastTaskDate');
                    updateTaskStatus(false);
                    startCountdown();
                    return;
                }
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                timerElement.textContent = `Time remaining: ${String(hours).padStart(2, '0')} - ${String(minutes).padStart(2, '0')} - ${String(seconds).padStart(2, '0')}`;
            }
            updateTimer();
            setInterval(updateTimer, 1000);
        }
    }

    let player, videoWatched = false;
    // Initialize YouTube player when API is ready
    window.onYouTubeIframeAPIReady = function() {
        const playerElement = document.getElementById('youtube-player');
        if (playerElement) {
            player = new YT.Player('youtube-player', {
                height: '315',
                width: '100%',
                videoId: user.videoId || 'dQw4w9WgXcQ', // Configurable video ID
                playerVars: { 'autoplay': 0, 'controls': 1, 'rel': 0 },
                events: { 'onStateChange': onPlayerStateChange }
            });
        }
    };

    // Handle YouTube player state changes
    function onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.ENDED && !taskCompleted) {
            videoWatched = true;
            updateTaskStatus(true);
        }
    }

    // Task completion event listener
    const taskButton = document.getElementById('complete-task-btn');
    if (taskButton && notification) {
        taskButton.addEventListener('click', async function(e) {
            e.preventDefault();
            if (taskCompleted) {
                notification.textContent = 'Task already completed today.';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                    taskButton.disabled = false;
                }, 3000);
                return;
            }
            if (!videoWatched) {
                notification.textContent = 'Please watch the video to complete the task.';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                    taskButton.disabled = false;
                }, 3000);
                return;
            }
            try {
                const response = await fetchJSON(`${API_URL}/api/users/tasks`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ reward: 300 })
                });
                if (response.ok) {
                    user = await response.json();
                    localStorage.setItem('lastTaskDate', today);
                    notification.textContent = 'Task completed! ₦300 added to your balance.';
                    notification.classList.add('success');
                    notification.style.display = 'block';
                    setTimeout(() => {
                        notification.style.display = 'none';
                        taskButton.disabled = true;
                    }, 3000);
                    populateBalance();
                    updateTaskStatus();
                } else {
                    throw new Error('Failed to complete task');
                }
            } catch (err) {
                console.error('Error completing task:', err);
                notification.textContent = 'Error completing task. Please try again.';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                    taskButton.disabled = false;
                }, 3000);
            }
        });
    }

    populateBalance();
    updateTaskStatus();
    startCountdown();
}

// Balance Page initialization
async function initBalancePage() {
    const token = getToken();
    if (!token) {
        alert('Please log in to access this page.');
        window.location.href = 'login.html';
        return;
    }
    const notification = document.getElementById('balance-notification');
    try {
        const response = await fetchJSON(`${API_URL}/api/users/balance`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const balance = await response.json();
            const totalBalance = document.getElementById('total-balance');
            const availableBalance = document.getElementById('available-balance');
            const pendingBalance = document.getElementById('pending-balance');
            const total = (balance.available || 0) + (balance.pending || 0);
            if (totalBalance) totalBalance.textContent = `₦${total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
            if (availableBalance) availableBalance.textContent = `₦${(balance.available || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
            if (pendingBalance) pendingBalance.textContent = `₦${(balance.pending || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
        } else {
            if (notification) {
                notification.textContent = 'Failed to fetch balance.';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => notification.style.display = 'none', 3000);
            }
            console.error('Failed to fetch balance:', response.statusText);
        }
    } catch (err) {
        if (notification) {
            notification.textContent = 'Error fetching balance.';
            notification.classList.add('error');
            notification.style.display = 'block';
            setTimeout(() => notification.style.display = 'none', 3000);
        }
        console.error('Error fetching balance:', err);
    }
    const transactionType = document.getElementById('transaction-type');
    const transactionList = document.getElementById('transaction-list');
    if (transactionType && transactionList) {
        transactionType.addEventListener('change', () => {
            const type = transactionType.value;
            transactionList.querySelectorAll('.transaction-item').forEach(item => {
                item.style.display = type === 'all' || item.dataset.type === type ? 'flex' : 'none';
            });
        });
    }
}

// Profile Page initialization
async function initProfilePage() {
    const token = getToken();
    if (!token) {
        alert('Please log in to access this page.');
        window.location.href = 'login.html';
        return;
    }
    let user = null, paymentMethods = [], transactions = [], referralStats = { count: 0, earnings: 0 };
    const notification = document.getElementById('profile-notification');

    // Fetch data with individual error handling
    try {
        const [profileRes, paymentRes, txRes, referralRes] = await Promise.all([
            fetchJSON(`${API_URL}/api/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } })
                .catch(err => ({ ok: false, error: err.message })),
            fetchJSON(`${API_URL}/api/users/payment-methods`, { headers: { 'Authorization': `Bearer ${token}` } })
                .catch(err => ({ ok: false, error: err.message })),
            fetchJSON(`${API_URL}/api/users/transactions`, { headers: { 'Authorization': `Bearer ${token}` } })
                .catch(err => ({ ok: false, error: err.message })),
            fetchJSON(`${API_URL}/api/users/referrals/stats`, { headers: { 'Authorization': `Bearer ${token}` } })
                .catch(err => ({ ok: false, error: err.message }))
        ]);

        if (profileRes.ok) {
            user = await profileRes.json();
        } else {
            console.error('Failed to fetch profile:', profileRes.error || 'Unknown error');
        }

        if (paymentRes.ok) {
            paymentMethods = await paymentRes.json();
        } else {
            console.error('Failed to fetch payment methods:', paymentRes.error || 'Unknown error');
        }

        if (txRes.ok) {
            transactions = await txRes.json();
        } else {
            console.error('Failed to fetch transactions:', txRes.error || 'Unknown error');
        }

        if (referralRes.ok) {
            referralStats = await referralRes.json();
        } else {
            console.error('Failed to fetch referral stats:', referralRes.error || 'Unknown error');
        }

        if (!user && notification) {
            notification.textContent = 'Error loading critical profile data. Please try again.';
            notification.classList.add('error');
            notification.style.display = 'block';
            setTimeout(() => notification.style.display = 'none', 3000);
            return;
        }
    } catch (err) {
        console.error('Unexpected error in initProfilePage:', err);
        if (notification) {
            notification.textContent = 'Error loading profile data. Please try again.';
            notification.classList.add('error');
            notification.style.display = 'block';
            setTimeout(() => notification.style.display = 'none', 3000);
        }
        return;
    }

    // Populate profile details in the UI
    function populateProfileDetails() {
        const profileUsername = document.getElementById('profile-username');
        const profileFullname = document.getElementById('profile-fullname');
        const profileEmail = document.getElementById('profile-email');
        const profilePhone = document.getElementById('profile-phone');
        const profileBank = document.getElementById('profile-bank');
        if (profileUsername) profileUsername.textContent = user?.username || 'N/A';
        if (profileFullname) profileFullname.textContent = user?.fullName || 'N/A';
        if (profileEmail) profileEmail.textContent = user?.email || 'N/A';
        if (profilePhone) profilePhone.textContent = user?.phone || 'N/A';
        if (profileBank) profileBank.textContent = user?.bank || 'N/A';
    }

    // Populate payment methods list and add edit/remove functionality
    function populatePaymentMethods() {
        const list = document.getElementById('payment-methods-list');
        if (list) {
            list.innerHTML = paymentMethods.length === 0 ? '<p>No payment methods available.</p>' : '';
            paymentMethods.forEach(method => {
                const div = document.createElement('div');
                div.className = 'payment-method';
                div.innerHTML = `
                    <p>${method.type}: ${method.type === 'Bank Account' ? `${method.bank} - ${method.accountNumber}` : method.email}</p>
                    <button class="btn edit" data-id="${method.id}">Edit</button>
                    <button class="btn remove" data-id="${method.id}">Remove</button>
                `;
                list.appendChild(div);
            });
            document.querySelectorAll('.payment-method .edit').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const methodId = btn.dataset.id;
                    const method = paymentMethods.find(m => m.id === methodId);
                    if (!method) return;
                    const type = prompt('Enter payment method type (Bank Account or PayPal):', method.type);
                    let details = {};
                    if (type === 'Bank Account') {
                        details.bank = prompt('Enter bank name:', method.bank);
                        details.accountNumber = prompt('Enter account number:', method.accountNumber);
                    } else if (type === 'PayPal') {
                        details.email = prompt('Enter PayPal email:', method.email);
                    } else {
                        alert('Invalid payment method type.');
                        return;
                    }
                    try {
                        const response = await fetchJSON(`${API_URL}/api/users/payment-methods/${methodId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ type, ...details })
                        });
                        if (response.ok) {
                            paymentMethods = paymentMethods.map(m => m.id === methodId ? { id: methodId, type, ...details } : m);
                            populatePaymentMethods();
                            populateWithdrawalMethods();
                            if (notification) {
                                notification.textContent = 'Payment method updated successfully';
                                notification.classList.add('success');
                                notification.style.display = 'block';
                                setTimeout(() => notification.style.display = 'none', 3000);
                            }
                        } else {
                            throw new Error('Failed to update payment method');
                        }
                    } catch (err) {
                        console.error('Error updating payment method:', err);
                        if (notification) {
                            notification.textContent = 'Error updating payment method. Please try again.';
                            notification.classList.add('error');
                            notification.style.display = 'block';
                            setTimeout(() => notification.style.display = 'none', 3000);
                        }
                    }
                });
            });
            document.querySelectorAll('.payment-method .remove').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const methodId = btn.dataset.id;
                    try {
                        const response = await fetchJSON(`${API_URL}/api/users/payment-methods/${methodId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (response.ok) {
                            paymentMethods = paymentMethods.filter(method => method.id !== methodId);
                            populatePaymentMethods();
                            populateWithdrawalMethods();
                            if (notification) {
                                notification.textContent = 'Payment method removed successfully';
                                notification.classList.add('success');
                                notification.style.display = 'block';
                                setTimeout(() => notification.style.display = 'none', 3000);
                            }
                        } else {
                            throw new Error('Failed to remove payment method');
                        }
                    } catch (err) {
                        console.error('Error removing payment method:', err);
                        if (notification) {
                            notification.textContent = 'Error removing payment method. Please try again.';
                            notification.classList.add('error');
                            notification.style.display = 'block';
                            setTimeout(() => notification.style.display = 'none', 3000);
                        }
                    }
                });
            });
        }
    }

    // Populate withdrawal method dropdown
    function populateWithdrawalMethods() {
        const select = document.getElementById('withdrawal-method');
        if (select) {
            select.innerHTML = '<option value="" disabled selected>Select a method</option>';
            paymentMethods.forEach(method => {
                const option = document.createElement('option');
                option.value = method.id;
                option.textContent = `${method.type} - ${method.type === 'Bank Account' ? method.accountNumber : method.email}`;
                select.appendChild(option);
            });
        }
    }

    // Populate transaction history table
    function populateTransactionHistory() {
        const tbody = document.getElementById('transaction-history-table');
        if (tbody) {
            tbody.innerHTML = transactions.length === 0 ? '<tr><td colspan="5">No transactions found.</td></tr>' : '';
            transactions.forEach(transaction => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${transaction.date || 'N/A'}</td>
                    <td>${transaction.type || 'Unknown'}</td>
                    <td>₦${Math.abs(transaction.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                    <td>${transaction.description || 'N/A'}</td>
                    <td>${transaction.status || 'N/A'}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    // Populate referral statistics
    function populateReferralStats() {
        const referralCount = document.getElementById('referral-count');
        const referralEarnings = document.getElementById('referral-earnings');
        if (referralCount) referralCount.textContent = referralStats.count || 0;
        if (referralEarnings) referralEarnings.textContent = `₦${(referralStats.earnings || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
    }

    const profileForm = document.getElementById('profile-form');
    if (profileForm && notification) {
        if (user?.profileSet) {
            profileForm.querySelectorAll('input').forEach(input => input.disabled = true);
            profileForm.querySelector('button').disabled = true;
            notification.textContent = 'Profile details are set and cannot be changed.';
            notification.classList.add('info');
            notification.style.display = 'block';
        } else {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = profileForm.querySelector('button');
                submitBtn.disabled = true;
                const username = document.getElementById('username')?.value.trim();
                const bankName = document.getElementById('bank-name')?.value.trim();
                const accountNumber = document.getElementById('account-number')?.value.trim();
                if (!username || !bankName || !accountNumber) {
                    notification.textContent = 'Please fill in all fields.';
                    notification.classList.add('error');
                    notification.style.display = 'block';
                    setTimeout(() => {
                        notification.style.display = 'none';
                        submitBtn.disabled = false;
                    }, 3000);
                    return;
                }
                try {
                    const response = await fetchJSON(`${API_URL}/api/users/profile`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ username, bank: `${bankName} - ${accountNumber}` })
                    });
                    if (response.ok) {
                        user = await response.json();
                        populateProfileDetails();
                        profileForm.querySelectorAll('input').forEach(input => input.disabled = true);
                        submitBtn.disabled = true;
                        notification.textContent = 'Profile details set successfully.';
                        notification.classList.add('success');
                        notification.style.display = 'block';
                        setTimeout(() => notification.style.display = 'none', 3000);
                    } else {
                        throw new Error('Failed to update profile');
                    }
                } catch (err) {
                    notification.textContent = 'Error updating profile. Please try again.';
                    notification.classList.add('error');
                    notification.style.display = 'block';
                    setTimeout(() => {
                        notification.style.display = 'none';
                        submitBtn.disabled = false;
                    }, 3000);
                }
            });
        }
    }

    const securityForm = document.getElementById('security-form');
    const securityNotification = document.getElementById('security-notification');
    if (securityForm && securityNotification) {
        securityForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = securityForm.querySelector('button');
            submitBtn.disabled = true;
            const newPassword = document.getElementById('new-password')?.value.trim();
            if (!newPassword) {
                securityNotification.textContent = 'Please enter a new password.';
                securityNotification.classList.add('error');
                securityNotification.style.display = 'block';
                setTimeout(() => {
                    securityNotification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
                return;
            }
            try {
                const response = await fetchJSON(`${API_URL}/api/users/security`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ newPassword })
                });
                if (response.ok) {
                    securityNotification.textContent = 'Security settings updated successfully.';
                    securityNotification.classList.add('success');
                    securityNotification.style.display = 'block';
                    setTimeout(() => {
                        securityNotification.style.display = 'none';
                        submitBtn.disabled = false;
                    }, 3000);
                } else {
                    throw new Error('Failed to update security settings');
                }
            } catch (err) {
                securityNotification.textContent = 'Error updating security settings. Please try again.';
                securityNotification.classList.add('error');
                securityNotification.style.display = 'block';
                setTimeout(() => {
                    securityNotification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }

    const addPaymentBtn = document.getElementById('add-payment-method');
    const paymentNotification = document.getElementById('payment-notification');
    if (addPaymentBtn && paymentNotification) {
        addPaymentBtn.addEventListener('click', async () => {
            const type = prompt('Enter payment method type (Bank Account or PayPal):');
            let details = {};
            if (type === 'Bank Account') {
                details.bank = prompt('Enter bank name:');
                details.accountNumber = prompt('Enter account number:');
            } else if (type === 'PayPal') {
                details.email = prompt('Enter PayPal email:');
            } else {
                paymentNotification.textContent = 'Invalid payment method type.';
                paymentNotification.classList.add('error');
                paymentNotification.style.display = 'block';
                setTimeout(() => paymentNotification.style.display = 'none', 3000);
                return;
            }
            try {
                const response = await fetchJSON(`${API_URL}/api/users/payment-methods`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ type, ...details })
                });
                if (response.ok) {
                    const data = await response.json();
                    paymentMethods.push(data.method);
                    populatePaymentMethods();
                    populateWithdrawalMethods();
                    paymentNotification.textContent = 'Payment method added successfully';
                    paymentNotification.classList.add('success');
                    paymentNotification.style.display = 'block';
                    setTimeout(() => paymentNotification.style.display = 'none', 3000);
                } else {
                    throw new Error('Failed to add payment method');
                }
            } catch (err) {
                console.error('Error adding payment method:', err);
                paymentNotification.textContent = 'Error adding payment method. Please try again.';
                paymentNotification.classList.add('error');
                paymentNotification.style.display = 'block';
                setTimeout(() => paymentNotification.style.display = 'none', 3000);
            }
        });
    }

    const withdrawalForm = document.getElementById('withdrawal-form');
    const withdrawalNotification = document.getElementById('withdrawal-notification');
    if (withdrawalForm && withdrawalNotification) {
        withdrawalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = withdrawalForm.querySelector('button');
            submitBtn.disabled = true;
            const methodId = document.getElementById('withdrawal-method')?.value;
            const amount = parseFloat(document.getElementById('withdrawal-amount')?.value);
            if (!methodId || !amount) {
                withdrawalNotification.textContent = 'Please select a method and enter an amount.';
                withdrawalNotification.classList.add('error');
                withdrawalNotification.style.display = 'block';
                setTimeout(() => {
                    withdrawalNotification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
                return;
            }
            if (amount < 1000) {
                withdrawalNotification.textContent = 'Amount must be at least ₦1,000.';
                withdrawalNotification.classList.add('error');
                withdrawalNotification.style.display = 'block';
                setTimeout(() => {
                    withdrawalNotification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
                return;
            }
            try {
                const response = await fetchJSON(`${API_URL}/api/users/withdrawals`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ amount })
                });
                if (response.ok) {
                    withdrawalNotification.textContent = `Withdrawal request submitted for ₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
                    withdrawalNotification.classList.add('success');
                    withdrawalNotification.style.display = 'block';
                    setTimeout(() => {
                        withdrawalNotification.style.display = 'none';
                        populateTransactionHistory();
                        submitBtn.disabled = false;
                    }, 3000);
                } else {
                    const data = await response.json();
                    withdrawalNotification.textContent = data.message || 'Error submitting withdrawal request.';
                    withdrawalNotification.classList.add('error');
                    withdrawalNotification.style.display = 'block';
                    setTimeout(() => {
                        withdrawalNotification.style.display = 'none';
                        submitBtn.disabled = false;
                    }, 3000);
                }
            } catch (err) {
                withdrawalNotification.textContent = 'Server error. Please try again.';
                withdrawalNotification.classList.add('error');
                withdrawalNotification.style.display = 'block';
                setTimeout(() => {
                    withdrawalNotification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }

    populateProfileDetails();
    populatePaymentMethods();
    populateWithdrawalMethods();
    populateTransactionHistory();
    populateReferralStats();
}

// Debounce utility for username validation
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check username availability
async function checkUsername(username) {
    if (!username) return false;
    try {
        const response = await fetchJSON(`${API_URL}/api/users/check-username?username=${encodeURIComponent(username)}`);
        if (!response.ok) throw new Error('Failed to check username');
        const data = await response.json();
        return data.available;
    } catch (err) {
        console.error('Error checking username:', err);
        return false;
    }
}


// Registration Page initialization
function initRegisterPage() {
  console.log('✅ initRegisterPage loaded');

  const form = document.getElementById('signup-form');
  const nameInput = document.getElementById('signup-name');
  const usernameInput = document.getElementById('signup-username');
  const emailInput = document.getElementById('signup-email');
  const phoneInput = document.getElementById('signup-phone');
  const passwordInput = document.getElementById('signup-password');
  const referralInput = document.getElementById('signup-referral');
  const levelInput = document.getElementById('signup-level');
  const usernameError = document.getElementById('username-error');
  const submitBtn = form.querySelector('button[type="submit"]');

  if (!form) {
    console.error('❌ signup-form not found');
    return;
  }

  // 🔍 Username availability check
  usernameInput.addEventListener('blur', async () => {
    const username = usernameInput.value.trim();
    if (username.length < 3) return;

    try {
      const res = await fetch(`${API_URL}/api/users/check-username/${username}`);
      const data = await res.json();
      if (!data.available) {
        usernameError.style.display = 'block';
        usernameInput.classList.add('error');
      } else {
        usernameError.style.display = 'none';
        usernameInput.classList.remove('error');
      }
    } catch (err) {
      console.error('Error checking username:', err);
    }
  });

  // 🧾 Form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Registering...`;

    const fullName = nameInput.value.trim();
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const password = passwordInput.value.trim();
    const referralCode = referralInput.value.trim().replace(/^@/, '');
    const level = parseInt(levelInput.value);
    const amount = level * 15000;

    if (!fullName || !username || !email || !phone || !password || !level) {
      Toastify({
        text: "Please fill in all required fields",
        style: { background: "linear-gradient(to right, #f00, #a00)" },
        duration: 3000
      }).showToast();
      resetButton();
      return;
    }

    const payload = {
      fullName,
      username,
      email,
      phone,
      password,
      referralCode,
      level,
      amount
    };

    console.log('🟡 Sending registration payload:', payload);

    try {
      const res = await fetch(`${API_URL}/api/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log('🟢 Signup response:', data);

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        socket.emit('join-room', data.user.id);

        Toastify({
          text: `🎉 Registration successful! Proceed to login.`,
          style: { background: "linear-gradient(to right, #00b09b, #96c93d)" },
          duration: 4000
        }).showToast();

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 3500);
      } else {
        Toastify({
          text: data.message || '⚠️ Registration failed',
          style: { background: "linear-gradient(to right, #f00, #a00)" },
          duration: 3000
        }).showToast();
        resetButton();
      }
    } catch (err) {
      console.error('❌ Signup error:', err);
      Toastify({
        text: 'Network or server error. Try again later.',
        style: { background: "linear-gradient(to right, #f00, #a00)" },
        duration: 3000
      }).showToast();
      resetButton();
    }
  });

  function resetButton() {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fas fa-user-plus"></i> Register`;
  }
}

// 📦 Call it after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  initRegisterPage();
});


// Referrals Page initialization
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  switch (page) {
    case 'referrals':
      initReferralsPage();
      break;
    case 'dashboard':
    case 'balance':
    case 'upgrade':
    case 'withdraw':
    case 'transactions':
    case 'profile':
      initCommonUI();
      break;
    // Add more as needed
  }
});

// 🔁 Shared: Populate user info in header/sidebar
async function initCommonUI() {
  try {
    const user = await getProfile();
    if (!user) return;

    const name = user.fullName || user.username || 'User';
    document.getElementById('header-user-name').textContent = `Welcome, ${name}`;
    document.getElementById('sidebar-user-name').textContent = name;
    document.getElementById('sidebar-user-level').textContent = `Level ${user.level || 1}`;
    socket.emit('join-room', user._id || user.id);
  } catch (err) {
    console.error('❌ initCommonUI error:', err);
  }
}

// 🌟 Referral Page Setup
function initReferralsPage() {
  console.log('📢 Referrals page initialized');
  initCommonUI();
  generateReferralLink();
  initReferralCopyButton();
  // Optionally load referral stats, list, etc...
}

// 🔗 Generate referral link based on user profile
async function generateReferralLink() {
  const token = localStorage.getItem('token');
  const referralLinkInput = document.getElementById('referral-link');

  if (!token || !referralLinkInput) {
    console.error('🚫 Missing token or referral-link input field');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(`Status ${res.status}`);
    const user = await res.json();

    const code = user.referralCode || user.username || 'yourusername';
    const fullLink = `https://dailytaskacademy.vercel.app/ref/${code}`;
    referralLinkInput.value = fullLink;
    console.log('✅ Referral link set to:', fullLink);
  } catch (err) {
    console.error('❌ Failed to generate referral link:', err);
    referralLinkInput.value = 'Error loading link';
  }
}

// 📋 Copy Referral Link Button
function initReferralCopyButton() {
  const copyBtn = document.getElementById('copy-link-btn');
  const referralLinkInput = document.getElementById('referral-link');

  if (!copyBtn || !referralLinkInput) return;

  copyBtn.addEventListener('click', () => {
    referralLinkInput.select();
    document.execCommand('copy');

    Toastify({
      text: "Referral link copied!",
      style: { background: "linear-gradient(to right, #00b09b, #96c93d)" },
      duration: 2000
    }).showToast();
  });
}

// 👤 Fetch user profile using token
async function getProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('⚠️ No token found');
    return null;
  }

  try {
    const res = await fetch(`${API_URL}/api/users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('❌ Failed to fetch profile:', err);
    return null;
  }
}


// Withdraw Page initialization
async function initWithdrawPage() {
    const token = getToken();
    if (!token) {
        alert('Please log in to access this page.');
        window.location.href = 'login.html';
        return;
    }
    let user, paymentMethods;
    const notification = document.getElementById('withdraw-notification');
    try {
        const [userRes, paymentRes] = await Promise.all([
            fetchJSON(`${API_URL}/api/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetchJSON(`${API_URL}/api/users/payment-methods`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (!userRes.ok || !paymentRes.ok) throw new Error('Failed to fetch data');
        user = await userRes.json();
        paymentMethods = await paymentRes.json();
    } catch (err) {
        console.error('Error fetching data:', err);
        if (notification) {
            notification.textContent = 'Error loading withdrawal data. Please try again.';
            notification.classList.add('error');
            notification.style.display = 'block';
            setTimeout(() => notification.style.display = 'none', 3000);
        }
        return;
    }

    // Populate available balance
    function populateBalance() {
        const availableBalance = document.getElementById('available-balance');
        if (availableBalance) {
            availableBalance.textContent = `₦${(user.balance?.available || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
        }
    }

    // Populate payment methods for withdrawal
    function populatePaymentMethods() {
        const select = document.getElementById('withdrawal-method');
        if (select) {
            select.innerHTML = '<option value="" disabled selected>Select a method</option>';
            paymentMethods.forEach(method => {
                const option = document.createElement('option');
                option.value = method.id;
                option.textContent = `${method.type} - ${method.type === 'Bank Account' ? method.accountNumber : method.email}`;
                select.appendChild(option);
            });
        }
    }

    const withdrawForm = document.getElementById('withdraw-form');
    if (withdrawForm && notification) {
        withdrawForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = withdrawForm.querySelector('button');
            submitBtn.disabled = true;
            const methodId = document.getElementById('withdrawal-method')?.value;
            const amount = parseFloat(document.getElementById('amount')?.value);
            if (!methodId || !amount) {
                notification.textContent = 'Please select a method and enter an amount.';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
                return;
            }
            if (amount < 1000) {
                notification.textContent = 'Amount must be at least ₦1,000.';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
                return;
            }
            try {
                const response = await fetchJSON(`${API_URL}/api/users/withdrawals`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ amount })
                });
                if (response.ok) {
                    notification.textContent = `Withdrawal request of ₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })} submitted successfully!`;
                    notification.classList.add('success');
                    notification.style.display = 'block';
                    setTimeout(() => {
                        notification.style.display = 'none';
                        populateBalance();
                        withdrawForm.reset();
                        submitBtn.disabled = false;
                    }, 3000);
                } else {
                    const data = await response.json();
                    notification.textContent = data.message || 'Failed to submit withdrawal request.';
                    notification.classList.add('error');
                    notification.style.display = 'block';
                    setTimeout(() => {
                        notification.style.display = 'none';
                        submitBtn.disabled = false;
                    }, 3000);
                }
            } catch (err) {
                notification.textContent = 'Server error. Please try again.';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }

    populateBalance();
    populatePaymentMethods();
}

// Deposit Page initialization
async function initDepositPage() {
    const token = getToken();
    if (!token) {
        alert('Please log in to access this page.');
        window.location.href = 'login.html';
        return;
    }
    const paymentForm = document.getElementById('payment-form');
    const notification = document.getElementById('payment-notification');
    const actionLink = document.getElementById('action');
    const amountSpan = document.getElementById('amount');
    const levelSpan = document.getElementById('level');
    let data;
    try {
        const response = await fetchJSON(`${API_URL}/api/users/pending-payment`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No payment data found');
        data = await response.json();
    } catch (err) {
        console.error('Error fetching pending payment data:', err);
        if (notification) {
            notification.textContent = 'No pending payment found. Please try again.';
            notification.classList.add('error');
            notification.style.display = 'block';
            setTimeout(() => window.location.href = data?.isUpgrade ? 'upgrade.html' : 'register.html', 3000);
        }
        return;
    }

    if (actionLink && amountSpan && levelSpan) {
        actionLink.textContent = data.isUpgrade ? 'Upgrade to' : '';
        levelSpan.textContent = `Level ${data.level}`;
        amountSpan.textContent = `₦${(data.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
    }

    if (paymentForm && notification) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = paymentForm.querySelector('button');
            submitBtn.disabled = true;
            try {
                const response = await fetchJSON(`${API_URL}/api/users/deposits`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        amount: data.amount,
                        type: data.isUpgrade ? 'upgrade' : 'registration',
                        level: data.level
                    })
                });
                if (response.ok) {
                    notification.textContent = 'Payment confirmation received.';
                    notification.classList.add('success');
                    notification.style.display = 'block';
                    setTimeout(() => window.location.href = 'dashboard.html', 3000);
                } else {
                    const resData = await response.json();
                    notification.textContent = resData.message || 'Payment confirmation failed';
                    notification.classList.add('error');
                    notification.style.display = 'block';
                    setTimeout(() => {
                        notification.style.display = 'none';
                        submitBtn.disabled = false;
                    }, 3000);
                }
            } catch (err) {
                notification.textContent = 'Server error. Please try again.';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }
}

// Logout Page initialization
function initLogoutPage() {
    const logoutForm = document.getElementById('logout-form');
    const notification = document.getElementById('logout-notification');
    const returnLink = document.getElementById('return-dashboard'); // ✅ fixed the ID

    if (logoutForm && notification) {
        logoutForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = logoutForm.querySelector('button');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging out...';

            // Remove stored auth data
            localStorage.removeItem('token');
            localStorage.removeItem('userId');

            // Notify user
            notification.textContent = 'Logged out successfully!';
            notification.classList.add('success');
            notification.style.display = 'block';

            // Redirect to homepage after delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        });
    }

    if (returnLink && notification) {
        returnLink.addEventListener('click', (e) => {
            e.preventDefault();
            notification.textContent = 'Returning to dashboard...';
            notification.classList.add('info');
            notification.style.display = 'block';

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        });
    }
}

// Make sure it runs only on logout page
document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.getAttribute('data-page');
    if (page === 'logout') {
        initLogoutPage();
    }
});

// Forgot Password Page initialization
function initForgotPasswordPage() {
    const forgotForm = document.getElementById('forgot-password-form');
    const notification = document.getElementById('forgot-notification');

    if (forgotForm && notification) {
        forgotForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const emailInput = document.getElementById('forgot-email');
            const email = emailInput.value.trim();

            if (!email) return;

            try {
                const res = await fetch('https://dailytaskacademy.onrender.com/api/users/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });

                const data = await res.json();

                if (res.ok) {
                    notification.textContent = '✅ Reset link sent to your email.';
                    notification.className = 'notification success';
                } else {
                    notification.textContent = data.message || '❌ Failed to send reset link.';
                    notification.className = 'notification error';
                }

                notification.style.display = 'block';
            } catch (err) {
                notification.textContent = '❌ Network error.';
                notification.className = 'notification error';
                notification.style.display = 'block';
            }
        });
    }
}

// Reset Password Page initialization
function initResetPage() {
    const resetForm = document.getElementById('reset-password-form');
    const notification = document.getElementById('global-notification');

    if (resetForm && notification) {
        resetForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const newPassword = document.getElementById('reset-password').value;
            const params = new URLSearchParams(window.location.search);
            const token = params.get('token'); // Assuming reset link looks like: reset.html?token=xxx

            if (!token || !newPassword) return;

            try {
                const res = await fetch('https://dailytaskacademy.onrender.com/api/users/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token, newPassword })
                });

                const data = await res.json();

                if (res.ok) {
                    notification.textContent = '✅ Password reset successful!';
                    notification.className = 'notification success';
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    notification.textContent = data.message || '❌ Failed to reset password.';
                    notification.className = 'notification error';
                }

                notification.style.display = 'block';
            } catch (err) {
                notification.textContent = '❌ Network error.';
                notification.className = 'notification error';
                notification.style.display = 'block';
            }
        });
    }
}


// Transactions Page initialization
async function initTransactionsPage() {
    const token = getToken();
    if (!token) {
        alert('Please log in to access this page.');
        window.location.href = 'login.html';
        return;
    }
    let transactions = [];
    const notification = document.getElementById('transaction-notification');
    try {
        const response = await fetchJSON(`${API_URL}/api/users/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch transactions');
        transactions = await response.json();
    } catch (err) {
        console.error('Error fetching transactions:', err);
        if (notification) {
            notification.textContent = 'Error loading transactions. Please try again later.';
            notification.classList.add('error');
            notification.style.display = 'block';
            setTimeout(() => notification.style.display = 'none', 3000);
        }
        return;
    }

    // Populate transaction list
    function populateTransactions() {
        const list = document.getElementById('transaction-list');
        if (list) {
            list.innerHTML = transactions.length === 0 ? '<p>No transactions found.</p>' : '';
            transactions.forEach(tx => {
                const div = document.createElement('div');
                div.className = 'transaction-list-item';
                div.innerHTML = `
                    <i class="fas fa-${tx.type === 'Deposit' ? 'plus-circle' : 'minus-circle'}"></i>
                    <div>
                        <div class="label">${tx.date} - ${tx.type}</div>
                        <span class="value">₦${Math.abs(tx.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })} | ${tx.description} | Status: ${tx.status}</span>
                    </div>
                `;
                list.appendChild(div);
            });
        }
    }

    populateTransactions();
}

// Verify Email Page initialization
async function initVerifyEmailPage() {
    const verifyForm = document.getElementById('verify-form');
    const notification = document.getElementById('verify-notification');
    if (verifyForm && notification) {
        verifyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = verifyForm.querySelector('button');
            submitBtn.disabled = true;
            const code = document.getElementById('verify-code')?.value.trim();
            if (!code) {
                notification.textContent = 'Please enter the verification code.';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
                return;
            }
            try {
                const response = await fetchJSON(`${API_URL}/api/users/verify-email`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code })
                });
                const data = await response.json();
                if (response.ok) {
                    notification.textContent = 'Email verified successfully! Redirecting to deposit...';
                    notification.classList.add('success');
                    notification.style.display = 'block';
                    setTimeout(() => window.location.href = 'deposit.html', 2000);
                } else {
                    notification.textContent = data.message || 'Verification failed';
                    notification.classList.add('error');
                    notification.style.display = 'block';
                    setTimeout(() => {
                        notification.style.display = 'none';
                        submitBtn.disabled = false;
                    }, 3000);
                }
            } catch (err) {
                notification.textContent = 'Server error. Please try again';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }
}

// Initialize the appropriate page based on the data-page attribute
document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.getAttribute('data-page');
    initHamburgerMenu();
    updateFooterYear();
    if (['dashboard', 'balance', 'profile', 'referrals', 'upgrade', 'withdraw', 'logout', 'transactions'].includes(page)) {
        initSidebarToggle();
        initUserDropdown();
        updateUserInfo();
    }

    const pageInit = {
        home: initHomePage,
        about: initAboutPage,
        join: initJoinPage,
        faq: initFaqPage,
        login: initLoginPage,
        privacy: initPrivacyPage,
        terms: initTermsPage,
        dashboard: initDashboardPage,
        balance: initBalancePage,
        profile: initProfilePage,
        referrals: initReferralsPage,
        upgrade: initUpgradePage,
        withdraw: initWithdrawPage,
        deposit: initDepositPage,
        logout: initLogoutPage,
        reset: initResetPage,
        forgot: initForgotPasswordPage,
        transactions: initTransactionsPage,
        verify: initVerifyEmailPage,
        signup: initRegisterPage
    };
    if (pageInit[page]) pageInit[page]();
});