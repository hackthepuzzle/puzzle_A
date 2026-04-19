const app = {
    init() {
        // Setup Google Services
        this.setupCalendarLink();
        this.initGoogleLogin();

        // Optimized Event Delegation (Improves memory efficiency)
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('button, .nav-item, .category-btn');
            if (!btn) return;

            // Handle View Switching
            if (btn.hasAttribute('data-view')) {
                this.switchView(btn.getAttribute('data-view'));
            }

            // Handle Category Selection (Food)
            if (btn.classList.contains('category-btn')) {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });

        // Setup fast-click feel for mobile (Passive listeners improve scrolling efficiency)
        document.addEventListener('touchstart', () => {}, {passive: true});

        // Background Simulation (CPU efficient intervals)
        setInterval(() => this.simulateLiveUpdates(), 5000);
    },

    switchView(viewId) {
        if (!viewId) return;
        
        // Hide all views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active-view', 'fade-in');
        });
        
        // Show selected view efficiently
        const targetView = document.getElementById(`view-${viewId}`);
        if(targetView) {
            targetView.classList.add('active-view');
            // Allow DOM to settle before animating
            requestAnimationFrame(() => {
                targetView.classList.add('fade-in');
            });
        }

        // Update nav buttons
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-view') === viewId) {
                btn.classList.add('active');
            }
        });
    },

    toggleNotifications() {
        const panel = document.getElementById('notifications-panel');
        const overlay = document.getElementById('panel-overlay');
        const badge = document.getElementById('notif-badge');
        
        const isOpen = panel.classList.toggle('open');
        overlay.classList.toggle('show', isOpen);
        
        if (isOpen && badge) {
            badge.style.opacity = '0';
            setTimeout(() => badge.remove(), 300);
        }
    },

    showOrderSuccess(buttonElement) {
        if (buttonElement.disabled) return;
        
        const originalText = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="ph-fill ph-spinner-gap" style="animation: rotate 1s linear infinite"></i>';
        buttonElement.disabled = true;

        // Simulated network latency
        setTimeout(() => {
            buttonElement.innerHTML = '<i class="ph-fill ph-check"></i>';
            buttonElement.style.background = 'var(--good-color)';
            
            this.showToast('Order Confirmed!', 'Your food is being prepared.');

            setTimeout(() => {
                buttonElement.innerHTML = originalText;
                buttonElement.style.background = '';
                buttonElement.disabled = false;
            }, 3000);
        }, 800);
    },

    triggerSmartNudge() {
        const nudges = [
            { title: "Smart Suggestion", msg: "Restroom Eq-1 is busy. Walk 20 more steps to Section E for 0 wait!" },
            { title: "Traffic Update", msg: "Main concourse is slow. Use the service elevator for faster access to Level 2." },
            { title: "Exclusive Offer", msg: "Halftime approaching! Pre-order now to skip the 20-min rush." }
        ];
        const nudge = nudges[Math.floor(Math.random() * nudges.length)];
        this.showToast(nudge.title, nudge.msg);
    },

    toggleGemini() {
        const modal = document.getElementById('gemini-modal');
        const overlay = document.getElementById('panel-overlay');
        const isOpen = modal.classList.toggle('open');
        overlay.classList.toggle('show', isOpen);
    },

    sendGeminiMsg() {
        const input = document.getElementById('gemini-input');
        const text = input.value.trim();
        if(!text) return;

        this.appendMsg('user', text);
        input.value = '';

        setTimeout(() => {
            const response = this.getGeminiResponse(text);
            this.appendMsg('bot', response);
        }, 600);
    },

    appendMsg(type, text) {
        const container = document.getElementById('chat-messages');
        const d = document.createElement('div');
        d.className = `msg ${type} fade-in`;
        d.innerHTML = `<p>${text}</p>`;
        container.appendChild(d);
        container.scrollTop = container.scrollHeight;
    },

    getGeminiResponse(q) {
        q = q.toLowerCase();
        if(q.includes('gate')) return "Checking live footfall... Gate 3 is crowded. I recommend Gate 5 (2m wait).";
        if(q.includes('food') || q.includes('hungry')) return "Stadium Grill (Sec C) has 12m wait. Express Stand (Sec D) is only 2m wait.";
        if(q.includes('exit')) return "I recommend waiting 15m post-match to use the Northern transport line.";
        return "I'm analyzing live stadium data. I can help with routing, food, and safety. What do you need?";
    },

    setupCalendarLink() {
        const baseUrl = "https://www.google.com/calendar/render?action=TEMPLATE";
        const title = encodeURIComponent("Champions League Final: Real Madrid vs Man City");
        const dates = "20261024T200000Z/20261024T230000Z";
        const details = encodeURIComponent("SVES - View seat and route in app.");
        const location = encodeURIComponent("Wembley Stadium, London");
        
        const link = document.getElementById('add-to-calendar');
        if (link) link.href = `${baseUrl}&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    },

    initMap() {
        if (typeof google === 'undefined') return;
        const wembley = { lat: 51.5560, lng: -0.2796 };
        const map = new google.maps.Map(document.getElementById("google-map"), {
            zoom: 16,
            center: wembley,
            disableDefaultUI: true,
            styles: [{ elementType: "geometry", stylers: [{ color: "#242f3e" }] }]
        });
        new google.maps.TrafficLayer().setMap(map);
    },

    initGoogleLogin() {
        if (typeof google === 'undefined') return;
        google.accounts.id.initialize({
            client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
            callback: (res) => this.mockLogin()
        });
        const btnContainer = document.getElementById("google-login-btn");
        if (btnContainer) google.accounts.id.renderButton(btnContainer, { theme: "outline", size: "large" });
    },

    mockLogin() {
        const overlay = document.getElementById('login-overlay');
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            this.showToast('Login Successful', 'Welcome Alex!');
        }, 400);
    },

    startVoiceRecognition() {
        const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!Speech) return this.showToast('Error', 'Browser does not support speech.');
        
        const recognition = new Speech();
        const micBtn = document.getElementById('mic-btn');
        recognition.onstart = () => micBtn.classList.add('recording');
        recognition.onresult = (e) => {
            document.getElementById('gemini-input').value = e.results[0][0].transcript;
            this.sendGeminiMsg();
        };
        recognition.onend = () => micBtn.classList.remove('recording');
        recognition.start();
    },

    showToast(title, message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="ph-fill ph-check-circle"></i><div class="toast-content"><strong>${title}</strong><span>${message}</span></div>`;
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 50);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    },

    simulateLiveUpdates() {
        const metrics = document.querySelectorAll('.metric-value');
        metrics.forEach(el => {
            if (Math.random() > 0.7) {
                let time = parseInt(el.innerText) + (Math.random() > 0.5 ? 1 : -1);
                el.innerText = `${Math.max(1, time)} min`;
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
function googleTranslateElementInit() {
    new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');
}
