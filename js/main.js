// main.js
const API_URL = 'https://dta-backend-clean.onrender.com';
const socket = io(API_URL);

// Centralized API endpoints
const API_ENDPOINTS = {
  login: `${API_URL}/api/users/login`,
  signup: `${API_URL}/api/users/signup`,
  profile: `${API_URL}/api/users/profile`,
  balance: `${API_URL}/api/users/balance`,
  tasks: `${API_URL}/api/users/tasks`,
  paymentMethods: `${API_URL}/api/users/payment-methods`,
  transactions: `${API_URL}/api/users/transactions`,
  referrals: `${API_URL}/api/users/referrals`,
  referralStats: `${API_URL}/api/users/referrals/stats`,
  verifyEmail: `${API_URL}/api/users/verify-email`,
  upgrade: `${API_URL}/api/users/upgrade`,
  withdrawals: `${API_URL}/api/users/withdrawals`,
  deposits: `${API_URL}/api/users/deposits`,
  pendingPayment: `${API_URL}/api/users/pending-payment`,
  security: `${API_URL}/api/users/security`,
  checkUsername: `${API_URL}/api/users/check-username`
};

// Socket.IO error handling
socket.on('connect_error', (err) => {
  console.error('Socket.IO connection error:', err);
  showNotification('Connection error. Please check your network.', 'error', document.getElementById('notification'));
});

// Socket.IO event listeners
socket.on('status-update', ({ status }) => {
  showNotification(`Account status updated: ${status}`, 'info', document.getElementById('notification'));
});

socket.on('balance-update', ({ balance }) => {
  const balanceElement = document.getElementById('available-balance');
  if (balanceElement) {
    balanceElement.textContent = `₦${(balance.available || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  }
  showNotification('Balance updated', 'success', document.getElementById('notification'));
});

socket.on('task-update', ({ tasksCompleted }) => {
  showNotification(`Task completed! Total tasks: ${tasksCompleted}`, 'success', document.getElementById('task-notification'));
});

socket.on('upgrade-update', ({ level }) => {
  const levelElement = document.getElementById('current-level') || document.getElementById('sidebar-user-level');
  if (levelElement) {
    levelElement.textContent = `Level ${level}`;
  }
  showNotification(`Upgraded to Level ${level}`, 'success', document.getElementById('notification'));
});

// Utility function for fetching JSON responses
async function fetchJSON(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(getToken() ? { 'Authorization': `Bearer ${getToken()}` } : {})
      }
    });
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
      const data = contentType?.includes('application/json') ? await response.json() : {};
      let message = data.message || `HTTP error ${response.status}`;
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = 'login.html';
        message = 'Session expired. Please log in again.';
      } else if (response.status === 400) {
        message = data.message || 'Bad request. Please check your input.';
      } else if (response.status === 404) {
        message = data.message || 'Resource not found.';
      } else if (response.status === 500) {
        message = data.message || 'Server error. Please try again later.';
      }
      console.error(`Fetch failed for ${url}: ${message}`);
      throw new Error(message);
    }
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error(`Non-JSON response from ${url}: Content-Type: ${contentType}, Response: ${text}`);
      throw new Error('Server returned non-JSON response');
    }
    return response.json();
  } catch (err) {
    console.error(`Error fetching ${url}:`, err);
    throw err;
  }
}

// Reusable notification function
function showNotification(message, type, notificationElement, duration = 3000) {
  if (!notificationElement) {
    console.warn('Notification element not found');
    return;
  }
  notificationElement.textContent = message;
  notificationElement.className = `notification ${type}`;
  notificationElement.style.display = 'block';
  setTimeout(() => {
    notificationElement.style.display = 'none';
  }, duration);
}

// Sanitize input to prevent XSS
function sanitizeInput(input) {
  if (!input) return '';
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
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
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
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
    const user = await fetchJSON(API_ENDPOINTS.profile);
    const headerUserName = document.getElementById('header-user-name');
    const sidebarUserName = document.getElementById('sidebar-user-name');
    const sidebarUserLevel = document.getElementById('sidebar-user-level');
    const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
    if (headerUserName) headerUserName.textContent = `Welcome, ${sanitizeInput(user.fullName)}`;
    if (sidebarUserName) sidebarUserName.textContent = sanitizeInput(user.fullName);
    if (sidebarUserLevel) sidebarUserLevel.textContent = `Level ${user.level || 1}`;
    if (sidebarUserAvatar) sidebarUserAvatar.src = user.avatar || 'https://via.placeholder.com/50';
  } catch (err) {
    showNotification(err.message, 'error', document.getElementById('notification'));
  }
}

// Home Page initialization
async function initHomePage() {
  const token = getToken();
  const welcomeMessage = document.getElementById('welcome-message');
  const notification = document.getElementById('home-notification');
  if (welcomeMessage && token) {
    try {
      const user = await fetchJSON(API_ENDPOINTS.profile);
      welcomeMessage.textContent = `Welcome back, ${sanitizeInput(user.fullName)}!`;
      welcomeMessage.style.display = 'block';
      setTimeout(() => welcomeMessage.style.display = 'none', 3000);
    } catch (err) {
      showNotification(err.message, 'error', notification);
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
    showNotification('No animated elements found. Please check the page.', 'error', notification);
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
    showNotification('You’re already registered! Log in to access your dashboard.', 'info', joinNotification);
  }
  if (registerBtn) {
    registerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (token) {
        showNotification('You’re already registered! Redirecting to login...', 'info', joinNotification);
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
    showNotification('No FAQ questions found. Please check the page.', 'error', notification);
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

// Login Page initialization
async function initLoginPage() {
  const loginForm = document.getElementById('login-form');
  const notification = document.getElementById('login-notification');
  const forgotLink = document.getElementById('forgot-password');

  if (loginForm && notification) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = loginForm.querySelector('button');
      submitBtn.disabled = true;
      const email = sanitizeInput(document.getElementById('login-email')?.value.trim());
      const password = document.getElementById('login-password')?.value.trim();

      if (!email || !password) {
        showNotification('Please fill all required fields', 'error', notification);
        submitBtn.disabled = false;
        return;
      }

      try {
        const data = await fetchJSON(API_ENDPOINTS.login, {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        socket.emit('join-room', data.user.id);
        showNotification('Login successful!', 'success', notification);
        setTimeout(() => window.location.href = 'dashboard.html', 3000);
      } catch (err) {
        showNotification(err.message, 'error', notification);
        submitBtn.disabled = false;
      }
    });
  }

  if (forgotLink && notification) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      showNotification('Password reset is not yet implemented.', 'info', notification, 2000);
    });
  }
}

// Privacy Page initialization
function initPrivacyPage() {
  const backHome = document.querySelector('.back-home');
  if (backHome) {
    backHome.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
}

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
    user = await fetchJSON(API_ENDPOINTS.profile);
  } catch (err) {
    showNotification(err.message, 'error', notification);
    return;
  }

  async function populateBalance() {
    try {
      const balance = await fetchJSON(API_ENDPOINTS.balance);
      const balanceElement = document.getElementById('available-balance');
      if (balanceElement) {
        balanceElement.textContent = `₦${(balance.available || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
      }
    } catch (err) {
      showNotification(err.message, 'error', notification);
    }
  }

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
  window.onYouTubeIframeAPIReady = function() {
    const playerElement = document.getElementById('youtube-player');
    if (playerElement) {
      player = new YT.Player('youtube-player', {
        height: '315',
        width: '100%',
        videoId: user.videoId || 'dQw4w9WgXcQ',
        playerVars: { 'autoplay': 0, 'controls': 1, 'rel': 0 },
        events: { 'onStateChange': onPlayerStateChange }
      });
    }
  };

  function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED && !taskCompleted) {
      videoWatched = true;
      updateTaskStatus(true);
    }
  }

  const taskButton = document.getElementById('complete-task-btn');
  if (taskButton && notification) {
    taskButton.addEventListener('click', async function(e) {
      e.preventDefault();
      if (taskCompleted) {
        showNotification('Task already completed today.', 'error', notification);
        return;
      }
      if (!videoWatched) {
        showNotification('Please watch the video to complete the task.', 'error', notification);
        return;
      }
      try {
        const user = await fetchJSON(API_ENDPOINTS.tasks, {
          method: 'POST',
          body: JSON.stringify({ reward: 300 })
        });
        localStorage.setItem('lastTaskDate', today);
        showNotification('Task completed! ₦300 added to your balance.', 'success', notification);
        populateBalance();
        updateTaskStatus();
      } catch (err) {
        showNotification(err.message, 'error', notification);
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
    const balance = await fetchJSON(API_ENDPOINTS.balance);
    const totalBalance = document.getElementById('total-balance');
    const availableBalance = document.getElementById('available-balance');
    const pendingBalance = document.getElementById('pending-balance');
    const total = (balance.available || 0) + (balance.pending || 0);
    if (totalBalance) totalBalance.textContent = `₦${total.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
    if (availableBalance) availableBalance.textContent = `₦${(balance.available || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
    if (pendingBalance) pendingBalance.textContent = `₦${(balance.pending || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  } catch (err) {
    showNotification(err.message, 'error', notification);
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
  let user, paymentMethods, transactions, referralStats = { count: 0, earnings: 0 };
  const notification = document.getElementById('profile-notification');

  try {
    [user, paymentMethods, transactions, referralStats] = await Promise.all([
      fetchJSON(API_ENDPOINTS.profile),
      fetchJSON(API_ENDPOINTS.paymentMethods),
      fetchJSON(API_ENDPOINTS.transactions),
      fetchJSON(API_ENDPOINTS.referralStats)
    ]);
  } catch (err) {
    showNotification(err.message, 'error', notification);
    return;
  }

  function populateProfileDetails() {
    const profileUsername = document.getElementById('profile-username');
    const profileFullname = document.getElementById('profile-fullname');
    const profileEmail = document.getElementById('profile-email');
    const profilePhone = document.getElementById('profile-phone');
    const profileBank = document.getElementById('profile-bank');
    if (profileUsername) profileUsername.textContent = sanitizeInput(user?.username || 'N/A');
    if (profileFullname) profileFullname.textContent = sanitizeInput(user?.fullName || 'N/A');
    if (profileEmail) profileEmail.textContent = sanitizeInput(user?.email || 'N/A');
    if (profilePhone) profilePhone.textContent = sanitizeInput(user?.phone || 'N/A');
    if (profileBank) profileBank.textContent = sanitizeInput(user?.bank || 'N/A');
  }

  function populatePaymentMethods() {
    const list = document.getElementById('payment-methods-list');
    if (list) {
      list.innerHTML = paymentMethods.length === 0 ? '<p>No payment methods available.</p>' : '';
      paymentMethods.forEach(method => {
        const div = document.createElement('div');
        div.className = 'payment-method';
        div.innerHTML = `
          <p>${sanitizeInput(method.type)}: ${method.type === 'Bank Account' ? `${sanitizeInput(method.bank)} - ${sanitizeInput(method.accountNumber)}` : sanitizeInput(method.email)}</p>
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
            showNotification('Invalid payment method type.', 'error', notification);
            return;
          }
          try {
            const response = await fetchJSON(`${API_ENDPOINTS.paymentMethods}/${methodId}`, {
              method: 'PUT',
              body: JSON.stringify({ type, ...details })
            });
            paymentMethods = paymentMethods.map(m => m.id === methodId ? { id: methodId, type, ...details } : m);
            populatePaymentMethods();
            populateWithdrawalMethods();
            showNotification(response.message, 'success', notification);
          } catch (err) {
            showNotification(err.message, 'error', notification);
          }
        });
      });
      document.querySelectorAll('.payment-method .remove').forEach(btn => {
        btn.addEventListener('click', async () => {
          const methodId = btn.dataset.id;
          try {
            const response = await fetchJSON(`${API_ENDPOINTS.paymentMethods}/${methodId}`, { method: 'DELETE' });
            paymentMethods = paymentMethods.filter(method => method.id !== methodId);
            populatePaymentMethods();
            populateWithdrawalMethods();
            showNotification(response.message, 'success', notification);
          } catch (err) {
            showNotification(err.message, 'error', notification);
          }
        });
      });
    }
  }

  function populateWithdrawalMethods() {
    const select = document.getElementById('withdrawal-method');
    if (select) {
      select.innerHTML = '<option value="" disabled selected>Select a method</option>';
      paymentMethods.forEach(method => {
        const option = document.createElement('option');
        option.value = method.id;
        option.textContent = `${sanitizeInput(method.type)} - ${method.type === 'Bank Account' ? sanitizeInput(method.accountNumber) : sanitizeInput(method.email)}`;
        select.appendChild(option);
      });
    }
  }

  function populateTransactionHistory() {
    const tbody = document.getElementById('transaction-history-table');
    if (tbody) {
      tbody.innerHTML = transactions.length === 0 ? '<tr><td colspan="5">No transactions found.</td></tr>' : '';
      transactions.forEach(transaction => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${sanitizeInput(transaction.date || 'N/A')}</td>
          <td>${sanitizeInput(transaction.type || 'Unknown')}</td>
          <td>₦${Math.abs(transaction.amount || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
          <td>${sanitizeInput(transaction.description || 'N/A')}</td>
          <td>${sanitizeInput(transaction.status || 'N/A')}</td>
        `;
        tbody.appendChild(tr);
      });
    }
  }

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
      showNotification('Profile details are set and cannot be changed.', 'info', notification);
    } else {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = profileForm.querySelector('button');
        submitBtn.disabled = true;
        const username = sanitizeInput(document.getElementById('username')?.value.trim());
        const bankName = sanitizeInput(document.getElementById('bank-name')?.value.trim());
        const accountNumber = sanitizeInput(document.getElementById('account-number')?.value.trim());
        if (!username || !bankName || !accountNumber) {
          showNotification('Please fill in all fields.', 'error', notification);
          submitBtn.disabled = false;
          return;
        }
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
          showNotification('Username must be 3-20 characters, alphanumeric or underscores.', 'error', notification);
          submitBtn.disabled = false;
          return;
        }
        try {
          user = await fetchJSON(API_ENDPOINTS.profile, {
            method: 'PUT',
            body: JSON.stringify({ username, bank: `${bankName} - ${accountNumber}` })
          });
          populateProfileDetails();
          profileForm.querySelectorAll('input').forEach(input => input.disabled = true);
          submitBtn.disabled = true;
          showNotification('Profile details set successfully.', 'success', notification);
        } catch (err) {
          showNotification(err.message, 'error', notification);
          submitBtn.disabled = false;
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
        showNotification('Please enter a new password.', 'error', securityNotification);
        submitBtn.disabled = false;
        return;
      }
      try {
        const response = await fetchJSON(API_ENDPOINTS.security, {
          method: 'PUT',
          body: JSON.stringify({ newPassword })
        });
        showNotification(response.message, 'success', securityNotification);
        submitBtn.disabled = false;
      } catch (err) {
        showNotification(err.message, 'error', securityNotification);
        submitBtn.disabled = false;
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
        showNotification('Invalid payment method type.', 'error', paymentNotification);
        return;
      }
      try {
        const response = await fetchJSON(API_ENDPOINTS.paymentMethods, {
          method: 'POST',
          body: JSON.stringify({ type, ...details })
        });
        paymentMethods.push(response.method);
        populatePaymentMethods();
        populateWithdrawalMethods();
        showNotification(response.message, 'success', paymentNotification);
      } catch (err) {
        showNotification(err.message, 'error', paymentNotification);
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
      const amount = parseFloat(document.getElementById('withdrawal-amount')?.value);
      if (!amount || amount < 1000) {
        showNotification(amount ? 'Amount must be at least ₦1,000.' : 'Please enter an amount.', 'error', withdrawalNotification);
        submitBtn.disabled = false;
        return;
      }
      try {
        const response = await fetchJSON(API_ENDPOINTS.withdrawals, {
          method: 'POST',
          body: JSON.stringify({ amount })
        });
        showNotification(response.message, 'success', withdrawalNotification);
        populateTransactionHistory();
        withdrawalForm.reset();
        submitBtn.disabled = false;
      } catch (err) {
        showNotification(err.message, 'error', withdrawalNotification);
        submitBtn.disabled = false;
      }
    });
  }

  populateProfileDetails();
  populatePaymentMethods();
  populateWithdrawalMethods();
  populateTransactionHistory();
  populateReferralStats();
}

// Referrals Page initialization
async function initReferralsPage() {
  const token = getToken();
  if (!token) {
    alert('Please log in to access this page.');
    window.location.href = 'login.html';
    return;
  }

  let referralStats, referredUsers;
  const notification = document.getElementById('referral-notification');

  try {
    [referralStats, referredUsers] = await Promise.all([
      fetchJSON(API_ENDPOINTS.referralStats),
      fetchJSON(API_ENDPOINTS.referrals)
    ]);
  } catch (err) {
    showNotification(err.message, 'error', notification);
    return;
  }

  function populateReferralStats() {
    const referralCount = document.getElementById('referral-count');
    const referralEarnings = document.getElementById('referral-earnings');
    if (referralCount) referralCount.textContent = referralStats.count || 0;
    if (referralEarnings) referralEarnings.textContent = `₦${(referralStats.earnings || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  }

  function populateReferredUsers() {
    const list = document.getElementById('referral-list');
    if (!list) return;
    list.innerHTML = referredUsers.length === 0 ? '<p>No referred users.</p>' : '';
    referredUsers.forEach(user => {
      const div = document.createElement('div');
      div.className = 'referral-list-item';
      div.innerHTML = `
        <i class="fas fa-user"></i>
        <div>
          <span class="label">${sanitizeInput(user.fullName)}</span>
          <span class="value">
            Level: ${user.level} |
            Joined: ${new Date(user.createdAt).toLocaleDateString()} |
            Status: ${user.status === 'verified' || user.status === 'active' ? 'Verified' : 'Non-Verified'}
          </span>
        </div>
      `;
      list.appendChild(div);
    });
  }

  async function generateReferralLink() {
    const referralLink = document.getElementById('referral-link');
    if (!referralLink) return;
    try {
      const user = await fetchJSON(API_ENDPOINTS.profile);
      referralLink.value = `https://dailytaskacademy.vercel.app/signup.html?ref=${encodeURIComponent(user.referralCode)}`;
    } catch (err) {
      showNotification(err.message, 'error', notification);
    }
  }

  const toggleReferrals = () => {
    const referredUsersSection = document.getElementById('referred-users');
    if (referredUsersSection) {
      referredUsersSection.style.display = referredUsersSection.style.display === 'none' ? 'block' : 'none';
    }
  };

  const toggleLabel = document.getElementById('toggle-referrals-label');
  const toggleCount = document.getElementById('referral-count');
  if (toggleLabel && toggleCount) {
    toggleLabel.addEventListener('click', toggleReferrals);
    toggleCount.addEventListener('click', toggleReferrals);
  }

  const copyLinkBtn = document.getElementById('copy-link-btn');
  if (copyLinkBtn && notification) {
    copyLinkBtn.addEventListener('click', () => {
      const link = document.getElementById('referral-link');
      if (!link || !link.value) {
        showNotification('No referral link available to copy.', 'error', notification);
        return;
      }
      navigator.clipboard.writeText(link.value).then(() => {
        showNotification('Referral link copied to clipboard!', 'success', notification);
      }).catch(() => {
        showNotification('Failed to copy link. Please copy manually.', 'error', notification);
      });
    });
  }

  populateReferralStats();
  populateReferredUsers();
  generateReferralLink();
}

// Register Page initialization
async function initRegisterPage() {
  const registerForm = document.getElementById('signup-form');
  const notification = document.getElementById('register-notification');
  const usernameError = document.getElementById('username-error');
  const usernameInput = document.getElementById('signup-username');
  const policyModal = document.getElementById('policy-modal');
  const termsCheckbox = document.getElementById('terms-checkbox');
  const privacyCheckbox = document.getElementById('privacy-checkbox');
  const disclaimerCheckbox = document.getElementById('disclaimer-checkbox');
  const continueBtn = document.getElementById('policy-continue-btn');
  const cancelBtn = document.getElementById('policy-cancel-btn');
  const submitBtn = document.querySelector('#signup-form button[type="submit"]');

  if (!policyModal && notification) {
    showNotification('Policy modal not found. Please check HTML.', 'error', notification);
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    submitBtn.style.cursor = 'not-allowed';
  }

  if (policyModal) {
    policyModal.style.display = 'flex';

    function checkPolicyAcceptance() {
      if (!termsCheckbox || !privacyCheckbox || !disclaimerCheckbox) {
        showNotification('Policy checkboxes not found. Please check HTML.', 'error', notification);
        return;
      }
      const allChecked = termsCheckbox.checked && privacyCheckbox.checked && disclaimerCheckbox.checked;
      if (continueBtn) {
        continueBtn.disabled = !allChecked;
        continueBtn.style.opacity = allChecked ? '1' : '0.6';
        continueBtn.style.cursor = allChecked ? 'pointer' : 'not-allowed';
      }
    }

    if (termsCheckbox) termsCheckbox.addEventListener('change', checkPolicyAcceptance);
    if (privacyCheckbox) privacyCheckbox.addEventListener('change', checkPolicyAcceptance);
    if (disclaimerCheckbox) disclaimerCheckbox.addEventListener('change', checkPolicyAcceptance);

    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        if (!continueBtn.disabled) {
          policyModal.style.display = 'none';
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
          }
        }
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get('ref');
  if (referralCode && document.getElementById('signup-referral')) {
    document.getElementById('signup-referral').value = sanitizeInput(referralCode);
  }

  async function checkUsername(username) {
    if (!username) return false;
    try {
      const data = await fetchJSON(`${API_ENDPOINTS.checkUsername}?username=${encodeURIComponent(username)}`);
      return data.available;
    } catch (err) {
      console.error('Error checking username:', err);
      return false;
    }
  }

  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  if (usernameInput && usernameError) {
    const validateUsername = debounce(async (username) => {
      if (!username) {
        usernameError.style.display = 'none';
        return;
      }
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        usernameError.textContent = 'Username must be 3-20 characters, alphanumeric or underscores.';
        usernameError.style.display = 'block';
        return;
      }
      const isAvailable = await checkUsername(username);
      usernameError.textContent = isAvailable ? '' : 'Username already taken or used as referral code.';
      usernameError.style.display = isAvailable ? 'none' : 'block';
    }, 300);
    usernameInput.addEventListener('input', (e) => validateUsername(e.target.value.trim()));
  }

  if (registerForm && notification) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = registerForm.querySelector('button');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Registering...';

      const fullName = sanitizeInput(document.getElementById('signup-name')?.value.trim());
      const username = sanitizeInput(document.getElementById('signup-username')?.value.trim());
      const email = sanitizeInput(document.getElementById('signup-email')?.value.trim());
      const phone = sanitizeInput(document.getElementById('signup-phone')?.value.trim());
      const password = document.getElementById('signup-password')?.value;
      const referralCode = sanitizeInput(document.getElementById('signup-referral')?.value.trim());
      const level = parseInt(document.getElementById('signup-level')?.value) || 1;
      const amount = 15000 * Math.pow(2, level - 1);

      if (!fullName || !username || !email || !phone || !password || !level) {
        showNotification(`Please fill in all required fields. Missing: ${[
          !fullName && 'Full Name',
          !username && 'Username',
          !email && 'Email',
          !phone && 'Phone',
          !password && 'Password',
          !level && 'Level'
        ].filter(Boolean).join(', ')}.`, 'error', notification);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address.', 'error', notification);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
        return;
      }

      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(phone)) {
        showNotification('Please enter a valid phone number (10-15 digits).', 'error', notification);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
        return;
      }

      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        showNotification('Username must be 3-20 characters, alphanumeric or underscores.', 'error', notification);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
        return;
      }

      const isUsernameAvailable = await checkUsername(username);
      if (!isUsernameAvailable) {
        showNotification('Username already taken or used as referral code.', 'error', notification);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
        return;
      }

      try {
        const data = await fetchJSON(API_ENDPOINTS.signup, {
          method: 'POST',
          body: JSON.stringify({ fullName, username, email, phone, password, referralCode, level, amount })
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        socket.emit('join-room', data.user.id);
        showNotification(data.message, 'success', notification);
        setTimeout(() => window.location.href = 'verify-email.html', 3000);
      } catch (err) {
        showNotification(err.message, 'error', notification);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
      }
    });
  }
}

// Upgrade Page initialization
async function initUpgradePage() {
  const token = getToken();
  if (!token) {
    alert('Please log in to access this page.');
    window.location.href = 'login.html';
    return;
  }
  let user;
  const notification = document.getElementById('upgrade-notification');
  try {
    user = await fetchJSON(API_ENDPOINTS.profile);
  } catch (err) {
    showNotification(err.message, 'error', notification);
    return;
  }

  function populateUserData() {
    const currentLevel = document.getElementById('current-level');
    const availableBalance = document.getElementById('available-balance');
    if (currentLevel) currentLevel.textContent = `Level ${user.level}`;
    if (availableBalance) {
      availableBalance.textContent = `₦${(user.balance?.available || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
    }
  }

  function disableLowerLevels() {
    document.querySelectorAll('#new-level option').forEach(option => {
      if (option.value && parseInt(option.value) <= user.level) option.disabled = true;
    });
  }

  const upgradeForm = document.getElementById('upgrade-form');
  if (upgradeForm && notification) {
    upgradeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = upgradeForm.querySelector('button');
      submitBtn.disabled = true;
      const newLevel = document.getElementById('new-level')?.value;
      if (!newLevel) {
        showNotification('Please select a new level.', 'error', notification);
        submitBtn.disabled = false;
        return;
      }
      const newLevelInt = parseInt(newLevel);
      if (newLevelInt <= user.level) {
        showNotification('Please select a level higher than your current level.', 'error', notification);
        submitBtn.disabled = false;
        return;
      }
      const amount = 15000 * Math.pow(2, newLevelInt - 1);
      try {
        const response = await fetchJSON(API_ENDPOINTS.upgrade, {
          method: 'POST',
          body: JSON.stringify({ level: newLevelInt, amount })
        });
        showNotification(response.message, 'success', notification);
        setTimeout(() => window.location.href = 'deposit.html', 2000);
      } catch (err) {
        showNotification(err.message, 'error', notification);
        submitBtn.disabled = false;
      }
    });
  }

  populateUserData();
  disableLowerLevels();
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
    [user, paymentMethods] = await Promise.all([
      fetchJSON(API_ENDPOINTS.profile),
      fetchJSON(API_ENDPOINTS.paymentMethods)
    ]);
  } catch (err) {
    showNotification(err.message, 'error', notification);
    return;
  }

  function populateBalance() {
    const availableBalance = document.getElementById('available-balance');
    if (availableBalance) {
      availableBalance.textContent = `₦${(user.balance?.available || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
    }
  }

  function populatePaymentMethods() {
    const select = document.getElementById('withdrawal-method');
    if (select) {
      select.innerHTML = '<option value="" disabled selected>Select a method</option>';
      paymentMethods.forEach(method => {
        const option = document.createElement('option');
        option.value = method.id;
        option.textContent = `${sanitizeInput(method.type)} - ${method.type === 'Bank Account' ? sanitizeInput(method.accountNumber) : sanitizeInput(method.email)}`;
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
      const amount = parseFloat(document.getElementById('amount')?.value);
      if (!amount || amount < 1000) {
        showNotification(amount ? 'Amount must be at least ₦1,000.' : 'Please enter an amount.', 'error', notification);
        submitBtn.disabled = false;
        return;
      }
      try {
        const response = await fetchJSON(API_ENDPOINTS.withdrawals, {
          method: 'POST',
          body: JSON.stringify({ amount })
        });
        showNotification(response.message, 'success', notification);
        populateBalance();
        withdrawForm.reset();
        submitBtn.disabled = false;
      } catch (err) {
        showNotification(err.message, 'error', notification);
        submitBtn.disabled = false;
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
    data = await fetchJSON(API_ENDPOINTS.pendingPayment);
  } catch (err) {
    showNotification(err.message, 'error', notification);
    setTimeout(() => window.location.href = data?.isUpgrade ? 'upgrade.html' : 'register.html', 3000);
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
        const response = await fetchJSON(API_ENDPOINTS.deposits, {
          method: 'POST',
          body: JSON.stringify({
            amount: data.amount,
            type: data.isUpgrade ? 'upgrade' : 'registration',
            level: data.level
          })
        });
        showNotification(response.message, 'success', notification);
        setTimeout(() => window.location.href = 'dashboard.html', 3000);
      } catch (err) {
        showNotification(err.message, 'error', notification);
        submitBtn.disabled = false;
      }
    });
  }
}

// Logout Page initialization
function initLogoutPage() {
  const logoutForm = document.getElementById('logout-form');
  const notification = document.getElementById('logout-notification');
  const returnLink = document.getElementById('return-to-id');
  if (logoutForm && notification) {
    logoutForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const submitBtn = logoutForm.querySelector('button');
      submitBtn.disabled = true;
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      showNotification('Logged out successfully!', 'success', notification);
      setTimeout(() => window.location.href = 'index.html', 2000);
    });
  }
  if (returnLink && notification) {
    returnLink.addEventListener('click', (e) => {
      e.preventDefault();
      showNotification('Returning to dashboard...', 'info', notification);
      setTimeout(() => window.location.href = 'dashboard.html', 3000);
    });
  }
}

// Reset Password Page initialization
function initResetPage() {
  const resetForm = document.getElementById('reset-password');
  const notification = document.getElementById('reset-notification');
  if (resetForm && notification) {
    showNotification('Password reset is not yet implemented.', 'info', notification);
    setTimeout(() => window.location.href = 'login.html', 3000);
  }
}

// Forgot Password Page initialization
function initForgotPasswordPage() {
  const forgotForm = document.getElementById('forgot-password-form');
  const notification = document.getElementById('forgot-notification');
  if (forgotForm && notification) {
    showNotification('Password reset is not yet implemented.', 'info', notification);
    setTimeout(() => window.location.href = 'login.html', 3000);
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
  let transactions;
  const notification = document.getElementById('transaction-notification');
  try {
    transactions = await fetchJSON(API_ENDPOINTS.transactions);
  } catch (err) {
    showNotification(err.message, 'error', notification);
    return;
  }

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
            <div class="label">${sanitizeInput(tx.date)} - ${sanitizeInput(tx.type)}</div>
            <span class="value">₦${Math.abs(tx.amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })} | ${sanitizeInput(tx.description)} | Status: ${sanitizeInput(tx.status)}</span>
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
      const code = sanitizeInput(document.getElementById('verify-code')?.value.trim());
      if (!code) {
        showNotification('Please enter the verification code.', 'error', notification);
        submitBtn.disabled = false;
        return;
      }
      try {
        const response = await fetchJSON(API_ENDPOINTS.verifyEmail, {
          method: 'POST',
          body: JSON.stringify({ code })
        });
        showNotification(response.message, 'success', notification);
        setTimeout(() => window.location.href = 'deposit.html', 2000);
      } catch (err) {
        showNotification(err.message, 'error', notification);
        submitBtn.disabled = false;
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
    verify: initVerifyEmailPage
  };
  if (pageInit[page]) pageInit[page]();
});