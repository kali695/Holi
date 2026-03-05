// script.js - Holi Shopping Website

// Products database
const products = [
    {
        id: 1,
        name: 'Holi Color Powder',
        emoji: '🎨',
        description: 'Set of 5 vibrant organic colors',
        price: 299
    },
    {
        id: 2,
        name: 'Water Balloons',
        emoji: '🎈',
        description: '100 colorful water balloons',
        price: 199
    },
    {
        id: 3,
        name: 'Holi Gift Basket',
        emoji: '🎁',
        description: 'Assorted Holi treats & gifts',
        price: 599
    },
    {
        id: 4,
        name: 'Pichkari Set',
        emoji: '💦',
        description: 'Premium water gun collection',
        price: 449
    },
    {
        id: 5,
        name: 'Holi Sweets Box',
        emoji: '🍬',
        description: 'Delicious traditional sweets',
        price: 399
    },
    {
        id: 6,
        name: 'Rangoli Kit',
        emoji: '🌺',
        description: 'Complete rangoli design kit',
        price: 349
    },
    {
        id: 7,
        name: 'Flower Wreath',
        emoji: '🌸',
        description: 'Beautiful decorative flowers',
        price: 249
    },
    {
        id: 8,
        name: 'Holi Decoration Bundle',
        emoji: '🎊',
        description: 'Balloons, banners & lights',
        price: 549
    }
];

let cart = [];
let appliedCoupon = null;

// Coupon Codes Database - Load from localStorage or use defaults
let coupons = JSON.parse(localStorage.getItem('holiCoupon') || '{}');

// Default coupons if none exist in localStorage
if (Object.keys(coupons).length === 0) {
    coupons = {
        'HOLI2026': { discount: 20, type: 'percentage' },      // 20% off
        'COLORS50': { discount: 50, type: 'percentage' },       // 50% off
        'SAVE100': { discount: 100, type: 'fixed' },            // ₹100 off
        'FESTIVE': { discount: 15, type: 'percentage' },        // 15% off
        'CELEBRATE': { discount: 25, type: 'fixed' },           // ₹25 off
        'HOLI50OFF': { discount: 50, type: 'fixed' }            // ₹50 off
    };
    // Save defaults to localStorage
    localStorage.setItem('holiCoupon', JSON.stringify(coupons));
}

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('productsGrid');
    const cartIcon = document.getElementById('cartIcon');
    const cartModal = document.getElementById('cartModal');
    const checkoutModal = document.getElementById('checkoutModal');
    const cartItemsDiv = document.getElementById('cartItems');
    const cartCountSpan = document.getElementById('cartCount');
    const totalPriceSpan = document.getElementById('totalPrice');
    const closeCartBtn = document.getElementById('closeCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const continueShopping = document.getElementById('continueShopping');
    const backHome = document.getElementById('backHome');
    
    // Login elements
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLoginBtn = document.getElementById('closeLogin');
    const emailForm = document.getElementById('emailForm');
    const otpForm = document.getElementById('otpForm');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // OTP variables
    let generatedOTP = null;
    let userEmail = null;
    let otpExpiryTime = null;

    // Check if user is already logged in
    function checkLoginStatus() {
        const currentUser = localStorage.getItem('holiShopUser');
        if (currentUser) {
            showUserInfo(currentUser);
        } else {
            showLoginButton();
        }
    }

    // Show login button
    function showLoginButton() {
        loginBtn.style.display = 'block';
        userInfo.style.display = 'none';
    }

    // Show user info
    function showUserInfo(user) {
        loginBtn.style.display = 'none';
        userInfo.style.display = 'flex';
        userName.textContent = `👤 ${user}`;
    }

    // Open login modal
    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('show');
    });

    // Close login modal
    closeLoginBtn.addEventListener('click', () => {
        loginModal.classList.remove('show');
    });

    // Close modal when clicking outside
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.remove('show');
            resetLoginForms();
        }
    });

    // Generate OTP (6 digit random number)
    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Handle email form submission
    emailForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();

        if (!email) {
            alert('Please enter a valid email address');
            return;
        }

        // Generate OTP
        generatedOTP = generateOTP();
        userEmail = email;
        otpExpiryTime = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

        // Show OTP form and hide email form
        emailForm.style.display = 'none';
        otpForm.style.display = 'block';

        // Display email and OTP
        document.getElementById('otpEmailDisplay').textContent = `OTP sent to: ${email}`;
        document.getElementById('otpCodeDisplay').textContent = generatedOTP;
        document.getElementById('otpDemoCode').style.display = 'block';

        // Disable resend button for 30 seconds
        const resendBtn = document.getElementById('resendOtpBtn');
        let countdown = 30;
        resendBtn.disabled = true;
        resendBtn.textContent = `Resend OTP (${countdown}s)`;

        const timer = setInterval(() => {
            countdown--;
            resendBtn.textContent = `Resend OTP (${countdown}s)`;
            if (countdown <= 0) {
                clearInterval(timer);
                resendBtn.disabled = false;
                resendBtn.textContent = 'Resend OTP';
            }
        }, 1000);

        showNotification2('📧 OTP sent to your email!');
    });

    // Handle OTP verification
    otpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const enteredOTP = document.getElementById('otp').value.trim();

        // Check if OTP is expired
        if (Date.now() > otpExpiryTime) {
            alert('❌ OTP expired! Please request a new OTP');
            resetLoginForms();
            return;
        }

        if (!enteredOTP || enteredOTP.length !== 6) {
            alert('⚠️ Please enter a 6-digit OTP');
            return;
        }

        if (enteredOTP === generatedOTP) {
            // OTP verified - Extract name from email
            const userName = userEmail.split('@')[0];
            localStorage.setItem('holiShopUser', userName);
            showUserInfo(userName);
            loginModal.classList.remove('show');
            resetLoginForms();
            showNotification2('✓ Login successful! Welcome ' + userName + '! 🎉');
        } else {
            alert('❌ Incorrect OTP! Please try again');
        }
    });

    // Resend OTP
    document.getElementById('resendOtpBtn').addEventListener('click', () => {
        generatedOTP = generateOTP();
        otpExpiryTime = Date.now() + 5 * 60 * 1000;

        document.getElementById('otpCodeDisplay').textContent = generatedOTP;
        document.getElementById('otp').value = '';

        const resendBtn = document.getElementById('resendOtpBtn');
        let countdown = 30;
        resendBtn.disabled = true;
        resendBtn.textContent = `Resend OTP (${countdown}s)`;

        const timer = setInterval(() => {
            countdown--;
            resendBtn.textContent = `Resend OTP (${countdown}s)`;
            if (countdown <= 0) {
                clearInterval(timer);
                resendBtn.disabled = false;
                resendBtn.textContent = 'Resend OTP';
            }
        }, 1000);

        showNotification2('📧 New OTP sent!');
    });

    // Reset login forms
    function resetLoginForms() {
        emailForm.style.display = 'block';
        otpForm.style.display = 'none';
        document.getElementById('email').value = '';
        document.getElementById('otp').value = '';
        generatedOTP = null;
        userEmail = null;
    }

    // Handle logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('holiShopUser');
        localStorage.removeItem('holiCart');
        localStorage.removeItem('appliedCoupon');
        cart = [];
        appliedCoupon = null;
        showLoginButton();
        updateCartUI();
        showNotification2('Logged out successfully! 👋');
    });

    // Additional notification function
    function showNotification2(message) {
        const msg = document.createElement('div');
        msg.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            background: linear-gradient(135deg, #4db6ac, #26a69a);
            color: white;
            padding: 18px 28px;
            border-radius: 50px;
            animation: notificationSlide 0.4s ease;
            z-index: 300;
            font-weight: 700;
            font-size: 1.05rem;
            box-shadow: 0 10px 30px rgba(77, 182, 172, 0.4);
            letter-spacing: 0.5px;
        `;
        msg.textContent = message;
        document.body.appendChild(msg);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes notificationSlide {
                from { transform: translateX(400px) translateY(-20px); opacity: 0; }
                to { transform: translateX(0) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => msg.remove(), 2500);
    }

    // Load cart from localStorage
    const savedCart = localStorage.getItem('holiCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }

    // Load coupon from localStorage
    const savedCoupon = localStorage.getItem('appliedCoupon');
    if (savedCoupon) {
        appliedCoupon = JSON.parse(savedCoupon);
        updateCouponDisplay();
    }

    // Render products
    function renderProducts() {
        productsGrid.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">${product.emoji}</div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-description">${product.description}</div>
                    <div class="product-price">₹${product.price}</div>
                    <button class="btn btn-add" data-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `).join('');

        // Add event listeners to add-to-cart buttons
        document.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id);
                addToCart(productId);
                showNotification();
            });
        });
    }

    // Add to cart
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        saveCart();
        updateCartUI();
    }

    // Remove from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartUI();
        renderCartItems();
    }

    // Update quantity
    function updateQuantity(productId, change) {
        const item = cart.find(p => p.id === productId);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart();
                updateCartUI();
                renderCartItems();
            }
        }
    }

    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('holiCart', JSON.stringify(cart));
    }

    // Update cart UI
    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountSpan.textContent = totalItems;

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        let discount = 0;

        if (appliedCoupon) {
            if (appliedCoupon.type === 'percentage') {
                discount = (subtotal * appliedCoupon.discount) / 100;
            } else {
                discount = appliedCoupon.discount;
            }
        }

        const total = subtotal - discount;
        
        document.getElementById('subtotalPrice').textContent = subtotal;
        totalPriceSpan.textContent = total;

        // Show/hide discount row
        const discountRow = document.getElementById('discountRow');
        if (discount > 0) {
            discountRow.style.display = 'flex';
            document.getElementById('discountPrice').textContent = discount.toFixed(0);
        } else {
            discountRow.style.display = 'none';
        }
    }

    // Apply Coupon Function
    function applyCoupon(code) {
        // Reload coupons from localStorage to get latest admin updates
        coupons = JSON.parse(localStorage.getItem('holiCoupon') || '{}');
        
        const couponCode = code.toUpperCase().trim();
        const couponMessage = document.getElementById('couponMessage');

        if (!couponCode) {
            couponMessage.textContent = '❌ Please enter a coupon code!';
            couponMessage.classList.remove('success');
            couponMessage.classList.add('error');
            return;
        }

        if (coupons[couponCode]) {
            appliedCoupon = {
                code: couponCode,
                ...coupons[couponCode]
            };
            localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
            
            const discountAmount = appliedCoupon.type === 'percentage' 
                ? ((cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * appliedCoupon.discount) / 100).toFixed(0)
                : appliedCoupon.discount;

            couponMessage.textContent = `✓ Coupon Applied! ${appliedCoupon.type === 'percentage' ? appliedCoupon.discount + '% OFF' : '₹' + discountAmount + ' OFF'}`;
            couponMessage.classList.add('success');
            couponMessage.classList.remove('error');
            
            updateCartUI();
            document.getElementById('couponCode').value = '';
            showNotification2('Coupon "' + couponCode + '" Applied! 🎉');
        } else {
            couponMessage.textContent = '❌ Invalid coupon code!';
            couponMessage.classList.remove('success');
            couponMessage.classList.add('error');
        }
    }

    // Update coupon display
    function updateCouponDisplay() {
        const couponMessage = document.getElementById('couponMessage');
        if (appliedCoupon) {
            const discountAmount = appliedCoupon.type === 'percentage' 
                ? ((cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * appliedCoupon.discount) / 100).toFixed(0)
                : appliedCoupon.discount;
            couponMessage.textContent = `✓ Applied: ${appliedCoupon.code} (${appliedCoupon.type === 'percentage' ? appliedCoupon.discount + '% OFF' : '₹' + discountAmount + ' OFF'})`;
            couponMessage.classList.add('success');
        }
    }

    // Render cart items
    function renderCartItems() {
        if (cart.length === 0) {
            cartItemsDiv.innerHTML = '<p style="text-align: center; color: #666;">Your cart is empty 🛒</p>';
            return;
        }

        cartItemsDiv.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="item-info">
                    <div class="item-name">${item.emoji} ${item.name}</div>
                    <div class="item-price">₹${item.price}</div>
                </div>
                <div class="item-qty">
                    <button onclick="window.updateQuantity(${item.id}, -1)">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="window.updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="window.removeFromCart(${item.id})">Remove</button>
            </div>
        `).join('');
    }

    // Cart icon click
    cartIcon.addEventListener('click', () => {
        renderCartItems();
        updateCouponDisplay();
        cartModal.style.display = cartModal.style.display === 'none' ? 'block' : 'none';
    });

    // Close cart
    closeCartBtn.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    // Continue shopping
    continueShopping.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    // Apply Coupon Button
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    const couponCodeInput = document.getElementById('couponCode');

    applyCouponBtn.addEventListener('click', () => {
        const code = couponCodeInput.value;
        applyCoupon(code);
    });

    // Apply coupon on Enter key
    couponCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyCoupon(couponCodeInput.value);
        }
    });

    // Checkout
    checkoutBtn.addEventListener('click', () => {
        const currentUser = localStorage.getItem('holiShopUser');
        if (!currentUser) {
            alert('Please login first to checkout! 📝');
            loginModal.classList.add('show');
            return;
        }
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        cartModal.style.display = 'none';
        checkoutModal.style.display = 'block';
        launchConfetti();
    });

    // Back to home
    backHome.addEventListener('click', () => {
        checkoutModal.style.display = 'none';
        cart = [];
        appliedCoupon = null;
        localStorage.removeItem('holiCart');
        localStorage.removeItem('appliedCoupon');
        saveCart();
        updateCartUI();
    });

    // Show notification with better styling
    function showNotification() {
        const msg = document.createElement('div');
        msg.style.cssText = `
            position: fixed;
            top: 30px;
            right: 30px;
            background: linear-gradient(135deg, #ff4081, #e91e63);
            color: white;
            padding: 18px 28px;
            border-radius: 50px;
            animation: notificationSlide 0.4s ease;
            z-index: 300;
            font-weight: 700;
            font-size: 1.05rem;
            box-shadow: 0 10px 30px rgba(233, 30, 99, 0.4);
            letter-spacing: 0.5px;
        `;
        msg.textContent = '✓ Added to cart!';
        document.body.appendChild(msg);
        
        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes notificationSlide {
                from { transform: translateX(400px) translateY(-20px); opacity: 0; }
                to { transform: translateX(0) translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => msg.remove(), 2500);
    }

    // Confetti effect - Enhanced version
    function launchConfetti() {
        const confettiCanvas = document.createElement('canvas');
        confettiCanvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 250;
        `;
        document.body.appendChild(confettiCanvas);

        const ctx = confettiCanvas.getContext('2d');
        const width = confettiCanvas.width = window.innerWidth;
        const height = confettiCanvas.height = window.innerHeight;

        let confetti = [];
        const colors = ['#ff4081', '#e91e63', '#FFD700', '#4db6ac', '#ba68c8', '#00CED1', '#FF69B4'];
        
        for (let i = 0; i < 150; i++) {
            confetti.push({
                x: Math.random() * width,
                y: Math.random() * height - height,
                r: Math.random() * 5 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                vy: Math.random() * 4 + 2,
                vx: (Math.random() - 0.5) * 2
            });
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            let anyVisible = false;

            confetti.forEach(piece => {
                piece.y += piece.vy;
                piece.x += piece.vx;
                piece.vx *= 0.99; // Air resistance

                if (piece.y < height) {
                    ctx.fillStyle = piece.color;
                    ctx.beginPath();
                    ctx.arc(piece.x, piece.y, piece.r, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = piece.color;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                    anyVisible = true;
                }
            });

            if (anyVisible) requestAnimationFrame(animate);
            else confettiCanvas.remove();
        }
        animate();
    }

    // Make functions global for onclick handlers
    window.removeFromCart = removeFromCart;
    window.updateQuantity = updateQuantity;

    // Check login status
    checkLoginStatus();

    // Add floating emojis animation
    function addFloatingEmoji() {
        const emojis = ['🎨', '🎉', '🎊', '🎁', '💦', '🌸', '🌺', '✨'];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        const floatingDiv = document.createElement('div');
        
        floatingDiv.style.cssText = `
            position: fixed;
            font-size: ${Math.random() * 20 + 20}px;
            left: ${Math.random() * 100}%;
            top: 100%;
            pointer-events: none;
            z-index: 0;
            animation: floatUp ${Math.random() * 3 + 4}s ease-in forwards;
            opacity: 0.7;
        `;
        
        floatingDiv.textContent = emoji;
        document.body.appendChild(floatingDiv);

        // Add animation if not already there
        if (!document.querySelector('style[data-float]')) {
            const style = document.createElement('style');
            style.setAttribute('data-float', 'true');
            style.textContent = `
                @keyframes floatUp {
                    to {
                        transform: translateY(-100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => floatingDiv.remove(), 7000);
    }

    // Create floating emojis periodically
    setInterval(addFloatingEmoji, 800);

    // Initial render
    renderProducts();
});
