// Base URL for API requests
const API_URL = 'https://dta-backend-clean.onrender.com';
const socket = io(API_URL);
console.log("✅ initRegisterPage is running");


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
            if (dropdown) dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });
    }
}

// Update user information in the header and sidebar
async function updateUserInfo() {
    const token = getToken();
    if (!token) return;
    try {
        const response = await fetch(`${API_URL}/api/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const user = await response.json();
            const headerUserName = document.getElementById('header-user-name');
            const sidebarUserName = document.getElementById('sidebar-user-name');
            const sidebarUserLevel = document.getElementById('sidebar-user-level');
            const sidebarUserAvatar = document.getElementById('sidebar-user-avatar');
            if (headerUserName) headerUserName.textContent = `Welcome, ${user.name}`;
            if (sidebarUserName) sidebarUserName.textContent = user.name;
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
            const response = await fetch(`${API_URL}/api/users/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const user = await response.json();
                welcomeMessage.textContent = `Welcome back, ${user.name}!`;
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

// Login Page initialization and Socket.IO connection
function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    const notification = document.getElementById('login-notification');
    const forgotLink = document.getElementById('forgot-password');

    if (loginForm && notification) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = loginForm.querySelector('button');
            submitBtn.disabled = true;
            const email = document.getElementById('login-email')?.value;
            const password = document.getElementById('login-password')?.value;

            if (!email || !password) {
                notification.textContent = 'Please fill all required fields';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Save token and emit join-room with userId
                    localStorage.setItem('token', data.token);

                    if (data.user && data.user._id) {
                        localStorage.setItem('userId', data.user._id); // Optional for later use
                        socket.emit('join-room', data.user._id); // 🔌 Join room
                    }

                    notification.textContent = 'Login successful!';
                    notification.classList.add('success');
                    notification.style.display = 'block';
                    setTimeout(() => window.location.href = 'dashboard.html', 3000);
                } else {
                    notification.textContent = data.message || 'Invalid email or password';
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
                console.error('Login error:', err);
            }
        });
    }

    if (forgotLink) {
        forgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            notification.textContent = 'Redirecting to password reset page...';
            notification.classList.add('info');
            notification.style.display = 'block';
            setTimeout(() => window.location.href = 'forgot-password.html', 2000);
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
        const response = await fetch(`${API_URL}/api/users/profile`, {
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
    function populateBalance() {
        const balanceElement = document.getElementById('available-balance');
        if (balanceElement) {
            balanceElement.textContent = `₦${(user.balance?.available || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
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
                videoId: 'dQw4w9WgXcQ',
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

    const taskButton = document.getElementById('complete-task-btn');
    if (taskButton && notification) {
        taskButton.addEventListener('click', async function(e) {
            e.preventDefault();
            taskButton.disabled = true;
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
                const response = await fetch(`${API_URL}/api/users/tasks/complete`, {
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
                        taskButton.disabled = false;
                    }, 3000);
                    populateBalance();
                    updateTaskStatus();
                } else {
                    throw new Error('Failed to complete task');
                }
            } catch (err) {
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
        const response = await fetch(`${API_URL}/api/users/balance`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const balance = await response.json();
            const totalBalance = document.getElementById('total-balance');
            const availableBalance = document.getElementById('available-balance');
            const pendingBalance = document.getElementById('pending-balance');
            if (totalBalance) totalBalance.textContent = `₦${(balance.total || 0).toLocaleString()}`;
            if (availableBalance) availableBalance.textContent = `₦${(balance.available || 0).toLocaleString()}`;
            if (pendingBalance) pendingBalance.textContent = `₦${(balance.pending || 0).toLocaleString()}`;
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
    let user, paymentMethods, transactions, referralStats;
    const notification = document.getElementById('profile-notification');
    try {
        const [profileRes, paymentRes, txRes, referralRes] = await Promise.all([
            fetch(`${API_URL}/api/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/api/users/payment-methods`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/api/users/transactions`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/api/users/referrals/stats`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (!profileRes.ok || !paymentRes.ok || !txRes.ok || !referralRes.ok) throw new Error('Failed to fetch profile data');
        user = await profileRes.json();
        paymentMethods = await paymentRes.json();
        transactions = await txRes.json();
        referralStats = await referralRes.json();
    } catch (err) {
        console.error('Error fetching profile data:', err);
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
        if (profileUsername) profileUsername.textContent = user.username;
        if (profileFullname) profileFullname.textContent = user.fullName;
        if (profileEmail) profileEmail.textContent = user.email;
        if (profilePhone) profilePhone.textContent = user.phone || 'N/A';
        if (profileBank) profileBank.textContent = user.bank || 'N/A';
    }

    // Populate payment methods list and add edit/remove functionality
    function populatePaymentMethods() {
        const list = document.getElementById('payment-methods-list');
        if (list) {
            list.innerHTML = '';
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
                btn.addEventListener('click', () => {
                    const notification = document.getElementById('payment-notification');
                    if (notification) {
                        notification.textContent = `Edit functionality to be implemented`;
                        notification.classList.add('info');
                        notification.style.display = 'block';
                        setTimeout(() => notification.style.display = 'none', 3000);
                    }
                });
            });
            document.querySelectorAll('.payment-method .remove').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const methodId = parseInt(btn.dataset.id);
                    try {
                        const response = await fetch(`${API_URL}/api/users/payment-methods/${methodId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (response.ok) {
                            paymentMethods = paymentMethods.filter(method => method.id !== methodId);
                            populatePaymentMethods();
                            populateWithdrawalMethods();
                            const notification = document.getElementById('payment-notification');
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
                        const notification = document.getElementById('payment-notification');
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
            tbody.innerHTML = '';
            transactions.forEach(transaction => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${transaction.date}</td>
                    <td>${transaction.type}</td>
                    <td>₦${Math.abs(transaction.amount).toLocaleString()}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.status}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    }

    // Populate referral statistics
    function populateReferralStats() {
        const referralCount = document.getElementById('referral-count');
        const referralEarnings = document.getElementById('referral-earnings');
        if (referralCount) referralCount.textContent = referralStats.count;
        if (referralEarnings) referralEarnings.textContent = `₦${referralStats.earnings.toLocaleString()}`;
    }

    const profileForm = document.getElementById('profile-form');
    if (profileForm && notification) {
        if (user.profileSet) {
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
                    const response = await fetch(`${API_URL}/api/users/profile`, {
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
            const twoFAEnabled = document.getElementById('2fa-toggle')?.checked;
            if (!newPassword && twoFAEnabled === undefined) {
                securityNotification.textContent = 'No changes made to security settings.';
                securityNotification.classList.add('error');
                securityNotification.style.display = 'block';
                setTimeout(() => {
                    securityNotification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
                return;
            }
            try {
                const response = await fetch(`${API_URL}/api/users/security`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ newPassword, twoFAEnabled })
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
        addPaymentBtn.addEventListener('click', () => {
            paymentNotification.textContent = 'Add payment method functionality to be implemented';
            paymentNotification.classList.add('info');
            paymentNotification.style.display = 'block';
            setTimeout(() => paymentNotification.style.display = 'none', 3000);
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
                const response = await fetch(`${API_URL}/api/users/withdrawals`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ methodId, amount })
                });
                if (response.ok) {
                    withdrawalNotification.textContent = `Withdrawal request submitted for ₦${amount.toLocaleString()}`;
                    withdrawalNotification.classList.add('success');
                    withdrawalNotification.style.display = 'block';
                    setTimeout(() => {
                        withdrawalNotification.style.display = 'none';
                        populateTransactionHistory();
                        submitBtn.disabled = false;
                    }, 3000);
                } else {
                    const data = await response.json();
                    withdrawalNotification.textContent = data.error || 'Error submitting withdrawal request.';
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
        const [statsRes, usersRes] = await Promise.all([
            fetch(`${API_URL}/api/users/referrals/stats`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/api/users/referrals`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (!statsRes.ok || !usersRes.ok) throw new Error('Failed to fetch referral data');
        referralStats = await statsRes.json();
        referredUsers = await usersRes.json();
    } catch (err) {
        console.error('Error fetching referral data:', err);
        if (notification) {
            notification.textContent = 'Error loading referral data. Please try again.';
            notification.classList.add('error');
            notification.style.display = 'block';
            setTimeout(() => notification.style.display = 'none', 3000);
        }
        return;
    }

    // Populate referral statistics
    function populateReferralStats() {
        const referralCount = document.getElementById('referral-count');
        const referralEarnings = document.getElementById('referral-earnings');
        if (referralCount) referralCount.textContent = referralStats.count;
        if (referralEarnings) referralEarnings.textContent = `₦${referralStats.earnings.toLocaleString()}`;
    }

    // Populate list of referred users
    function populateReferredUsers() {
        const list = document.getElementById('referral-list');
        if (list) {
            list.innerHTML = '';
            referredUsers.forEach(user => {
                const div = document.createElement('div');
                div.className = 'referral-list-item';
                div.innerHTML = `
                    <i class="fas fa-user"></i>
                    <div>
                        <span class="label">${user.name}</span>
                        <span class="value">Level: ${user.level} | Joined: ${user.joined} | Earnings: ₦${user.earnings.toLocaleString()} | ${user.verified ? 'Verified' : 'Non-Verified'}</span>
                    </div>
                `;
                list.appendChild(div);
            });
        }
    }

    // Generate and display referral link
    async function generateReferralLink() {
        const referralLink = document.getElementById('referral-link');
        if (referralLink) {
            try {
                const response = await fetch(`${API_URL}/api/users/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const user = await response.json();
                    referralLink.value = `https://dailytaskacademy.com/ref/${user.username.replace(/\s+/g, '_').toLowerCase()}`;
                } else {
                    throw new Error('Failed to fetch user profile');
                }
            } catch (err) {
                console.error('Error generating referral link:', err);
                if (notification) {
                    notification.textContent = 'Error generating referral link. Please try again.';
                    notification.classList.add('error');
                    notification.style.display = 'block';
                    setTimeout(() => notification.style.display = 'none', 3000);
                }
            }
        }
    }

    // Toggle visibility of referred users section
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
            if (link) {
                link.select();
                try {
                    navigator.clipboard.writeText(link.value);
                    notification.textContent = 'Referral link copied to clipboard!';
                    notification.classList.add('success');
                    notification.style.display = 'block';
                    setTimeout(() => notification.style.display = 'none', 3000);
                } catch (err) {
                    notification.textContent = 'Failed to copy link. Please copy manually.';
                    notification.classList.add('error');
                    notification.style.display = 'block';
                    setTimeout(() => notification.style.display = 'none', 3000);
                }
            }
        });
    }

    populateReferralStats();
    populateReferredUsers();
    generateReferralLink();
}

// Register Page initialization
function initRegisterPage() {
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
    notification.textContent = 'Policy modal not found. Please check HTML.';
    notification.classList.add('error');
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 3000);
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
        if (notification) {
          notification.textContent = 'Policy checkboxes not found. Please check HTML.';
          notification.classList.add('error');
          notification.style.display = 'block';
          setTimeout(() => notification.style.display = 'none', 3000);
        }
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

    // Handle referral link from URL
    const urlParams = new URLSearchParams(window.location.search);
    const refLink = urlParams.get('ref');
    if (refLink && document.getElementById('signup-referral')) {
        document.getElementById('signup-referral').value = `https://dailytaskacademy.com/ref/${refLink}`;
    }

    // Check username availability
    async function checkUsername(username) {
        if (!username) return false;
        try {
            const response = await fetch(`${API_URL}/api/users/check-username?username=${encodeURIComponent(username)}`);
            if (!response.ok) throw new Error('Failed to check username');
            const data = await response.json();
            return data.available;
        } catch (err) {
            console.error('Error checking username:', err);
            return false;
        }
    }

    // Debounce function to limit API calls during username input
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
            const isAvailable = await checkUsername(username);
            usernameError.style.display = isAvailable ? 'none' : 'block';
        }, 300);
        usernameInput.addEventListener('input', (e) => validateUsername(e.target.value.trim()));
    }

    // ✅ Register form submission
if (registerForm && notification) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = registerForm.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering...';

    // ✅ Get form data
    const name = document.getElementById('signup-name')?.value.trim();
    const username = document.getElementById('signup-username')?.value.trim();
    const email = document.getElementById('signup-email')?.value.trim();
    const phone = document.getElementById('signup-phone')?.value.trim();
    const password = document.getElementById('signup-password')?.value;
    const referralCode = document.getElementById('signup-referral')?.value.trim();
    const levelStr = document.getElementById('signup-level')?.value;
    const level = parseInt(levelStr);
    const amount = !isNaN(level) ? 15000 * Math.pow(2, level - 1) : 0;

    // ✅ Validate fields
    if (!name || !username || !email || !phone || !password || !levelStr) {
      showNotification('Please fill in all required fields.', 'error');
      resetButton();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Please enter a valid email address.', 'error');
      resetButton();
      return;
    }

    const isUsernameAvailable = await checkUsername(username);
    if (!isUsernameAvailable) {
      usernameError.style.display = 'block';
      showNotification('Username already taken. Please choose another.', 'error');
      resetButton();
      return;
    } else {
      usernameError.style.display = 'none';
    }

    // ✅ Send to backend
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, phone, password, referralCode, level, amount }),
      });

      const contentType = response.headers.get('content-type');
      const data = contentType?.includes('application/json') ? await response.json() : {};

      if (response.ok) {
        showNotification(
          `🎉 Registration successful! Please pay ₦${amount.toLocaleString()} for Level ${level} to activate your account.`,
          'success'
        );
        setTimeout(() => (window.location.href = 'deposit.html'), 3000);
      } else {
        showNotification(data.message || 'Registration failed.', 'error');
        resetButton();
      }
    } catch (err) {
      console.error('❌ Registration error:', err);
      showNotification('Server error. Please try again.', 'error');
      resetButton();
    }

    // ✅ Helpers
    function showNotification(message, type = 'info') {
      notification.textContent = message;
      notification.className = `notification ${type}`;
      notification.style.display = 'block';
      setTimeout(() => (notification.style.display = 'none'), 5000);
    }

    function resetButton() {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register';
    }
  });
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
        const response = await fetch(`${API_URL}/api/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        user = await response.json();
    } catch (err) {
        console.error('Error fetching user:', err);
        if (notification) {
            notification.textContent = 'Error loading user data. Please try again.';
            notification.classList.add('error');
            notification.style.display = 'block';
            setTimeout(() => notification.style.display = 'none', 3000);
        }
        return;
    }

    // Populate current user level and balance
    function populateUserData() {
        const currentLevel = document.getElementById('current-level');
        const availableBalance = document.getElementById('available-balance');
        if (currentLevel) currentLevel.textContent = `Level ${user.level}`;
        if (availableBalance) availableBalance.textContent = `₦${(user.balance?.available || 0).toLocaleString()}`;
    }

    // Disable options for levels at or below current level
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
                notification.textContent = 'Please select a new level.';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
                return;
            }
            const newLevelInt = parseInt(newLevel);
            if (newLevelInt <= user.level) {
                notification.textContent = 'Please select a level higher than your current level.';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
                return;
            }
            const amount = 15000 * Math.pow(2, newLevelInt - 1);
            try {
                const response = await fetch(`${API_URL}/api/users/upgrade`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ newLevel: newLevelInt, amount })
                });
                if (response.ok) {
                    notification.textContent = `Upgrade to Level ${newLevel} initiated successfully! Redirecting to payment...`;
                    notification.classList.add('success');
                    notification.style.display = 'block';
                    setTimeout(() => window.location.href = 'deposit.html', 2000);
                } else {
                    const data = await response.json();
                    notification.textContent = data.error || `Error initiating upgrade to Level ${newLevel}.`;
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
        const [userRes, paymentRes] = await Promise.all([
            fetch(`${API_URL}/api/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_URL}/api/users/payment-methods`, { headers: { 'Authorization': `Bearer ${token}` } })
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
            availableBalance.textContent = `₦${(user.balance?.available || 0).toLocaleString()}`;
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
            if (!methodId) {
                notification.textContent = 'Please select a payment method.';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
                return;
            }
            if (!amount || amount < 1000) {
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
                const response = await fetch(`${API_URL}/api/users/withdrawals`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ methodId, amount })
                });
                if (response.ok) {
                    notification.textContent = `Withdrawal request of ₦${amount.toLocaleString()} submitted successfully!`;
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
                    notification.textContent = data.error || 'Failed to submit withdrawal request.';
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
        const response = await fetch(`${API_URL}/api/users/pending-payment`, {
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
        amountSpan.textContent = `₦${data.amount.toLocaleString()}`;
    }

    if (paymentForm && notification) {
        paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = paymentForm.querySelector('button');
            submitBtn.disabled = true;
            try {
                const response = await fetch(`${API_URL}/api/users/deposits`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        amount: data.amount,
                        type: data.isUpgrade ? 'upgrade' : 'registration',
                        level: data.newLevel || data.level
                    })
                });
                if (response.ok) {
                    notification.textContent = 'Payment confirmation received.';
                    notification.classList.add('success');
                    notification.style.display = 'block';
                    setTimeout(() => window.location.href = 'login.html', 3000);
                } else {
                    const resData = await response.json();
                    notification.textContent = resData.error || 'Payment confirmation failed';
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
    const returnLink = document.getElementById('return-to-id');
    if (logoutForm && notification) {
        logoutForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = logoutForm.querySelector('button');
            submitBtn.disabled = true;
            try {
                const token = getToken();
                const response = await fetch(`${API_URL}/api/users/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    localStorage.removeItem('token');
                    notification.textContent = 'Logged out successfully!';
                    notification.classList.add('success');
                    notification.style.display = 'block';
                    setTimeout(() => window.location.href = 'index.html', 2000);
                } else {
                    throw new Error('Logout failed');
                }
            } catch (err) {
                notification.textContent = 'Failed to logout. Please try again.';
                notification.classList.add('error');
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }
    if (returnLink) {
        returnLink.addEventListener('click', (e) => {
            e.preventDefault();
            notification.textContent = 'Returning to dashboard...';
            notification.classList.add('info');
            notification.style.display = 'block';
            setTimeout(() => window.location.href = 'dashboard.html', 3000);
        });
    }
}

// Reset Password Page initialization
function initResetPage() {
    const resetForm = document.getElementById('reset-password');
    const notification = document.getElementById('reset-notification');
    if (resetForm && notification) {
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = resetForm.querySelector('button');
            submitBtn.disabled = true;
            const password = document.getElementById('reset-password')?.value;
            const token = new URLSearchParams(window.location.search).get('token');
            try {
                const response = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                const data = await response.json();
                if (response.ok) {
                    notification.textContent = data.message;
                    notification.classList.add('success');
                    notification.style.display = 'block';
                    setTimeout(() => window.location.href = 'login.html', 3000);
                } else {
                    notification.textContent = data.message || 'Error resetting password';
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

// Forgot Password Page initialization
function initForgotPasswordPage() {
    const forgotForm = document.getElementById('forgot-password-form');
    const notification = document.getElementById('forgot-notification');
    if (forgotForm && notification) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = forgotForm.querySelector('button');
            submitBtn.disabled = true;
            const email = document.getElementById('forgot-email')?.value;
            try {
                const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await response.json();
                notification.textContent = data.message;
                notification.classList.add(response.ok ? 'success' : 'error');
                notification.style.display = 'block';
                setTimeout(() => {
                    notification.style.display = 'none';
                    submitBtn.disabled = false;
                }, 3000);
            } catch (err) {
                notification.textContent = 'Error sending reset link';
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
        const response = await fetch(`${API_URL}/api/users/transactions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch transactions');
        transactions = await response.json();
    } catch (err) {
        console.error('Error fetching transactions:', err);
        const list = document.getElementById('transaction-list');
        if (list && notification) {
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
                        <span class="value">₦${Math.abs(tx.amount).toLocaleString()} | ${tx.description} | Status: ${tx.status}</span>
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
    const notification = document.getElementById('verify-notification');
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
        notification.textContent = 'Invalid verification link.';
        notification.classList.add('error');
        notification.style.display = 'block';
        setTimeout(() => window.location.href = 'index.html', 3000);
        return;
    }
    try {
        const response = await fetch(`${API_URL}/api/auth/verify-email/${token}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (response.ok) {
            notification.textContent = 'Email verified successfully! Redirecting to login...';
            notification.classList.add('success');
            notification.style.display = 'block';
            setTimeout(() => window.location.href = 'login.html', 2000);
        } else {
            notification.textContent = data.message || 'Verification failed';
            notification.classList.add('error');
            notification.style.display = 'block';
            setTimeout(() => window.location.href = 'index.html', 2000);
        }
    } catch (err) {
        notification.textContent = 'Server error. Please try again';
        notification.classList.add('error');
        notification.style.display = 'block';
        setTimeout(() => window.location.href = 'index.html', 3000);
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
        register: initRegisterPage,
        reset: initResetPage,
        forgot: initForgotPasswordPage,
        transactions: initTransactionsPage,
        verify: initVerifyEmailPage
    };
    if (pageInit[page]) pageInit[page]();
});}