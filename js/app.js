const app = {
    init() {
        // Setup Google Calendar Link
        this.setupCalendarLink();
        
        // Setup Google Social Login
        this.initGoogleLogin();

        // Setup initial simulate loops for dynamic view
        setInterval(() => this.simulateLiveUpdates(), 4000);
        
        // Add fast-click handler for mobile feel on buttons
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('touchstart', function() {}, {passive: true});
        });
        
        // Make categories clickable
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    },

    switchView(viewId) {
        // Hide all views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active-view');
        });
        
        // Show selected view
        const targetView = document.getElementById(`view-${viewId}`);
        if(targetView) {
            targetView.classList.add('active-view');
            // Re-trigger animations
            targetView.style.animation = 'none';
            targetView.offsetHeight; /* trigger reflow */
            targetView.style.animation = null;
        }

        // Update nav buttons
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeNav = document.querySelector(`.nav-item[data-view="${viewId}"]`);
        if(activeNav) {
            activeNav.classList.add('active');
        }
    },

    toggleNotifications() {
        const panel = document.getElementById('notifications-panel');
        const overlay = document.getElementById('panel-overlay');
        const badge = document.getElementById('notif-badge');
        
        if(panel.classList.contains('open')) {
            panel.classList.remove('open');
            overlay.classList.remove('show');
        } else {
            panel.classList.add('open');
            overlay.classList.add('show');
            if (badge) badge.style.display = 'none'; // clear on open
        }
    },

    showOrderSuccess(buttonElement) {
        // Change button state temporarily to show loading/success
        const originalText = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="ph-fill ph-spinner-gap" style="animation: rotate 1s linear infinite"></i> Processing...';
        buttonElement.disabled = true;

        setTimeout(() => {
            buttonElement.innerHTML = '<i class="ph-fill ph-check"></i> Ordered!';
            buttonElement.style.background = 'var(--good-color)';
            buttonElement.style.boxShadow = '0 6px 20px rgba(63, 185, 80, 0.4)';
            
            // Show toast
            this.showToast('Order Confirmed!', 'Your food is being prepared.');

            setTimeout(() => {
                buttonElement.innerHTML = originalText;
                buttonElement.style.background = '';
                buttonElement.style.boxShadow = '';
                buttonElement.disabled = false;
            }, 3000);
        }, 3000);
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
        if(modal.classList.contains('open')) {
            modal.classList.remove('open');
            overlay.classList.remove('show');
        } else {
            modal.classList.add('open');
            overlay.classList.add('show');
        }
    },

    sendGeminiMsg() {
        const input = document.getElementById('gemini-input');
        const text = input.value.trim();
        if(!text) return;

        this.appendMsg('user', text);
        input.value = '';

        // Simulate Gemini internal reasoning & processing
        setTimeout(() => {
            const response = this.getGeminiResponse(text);
            this.appendMsg('bot', response);
        }, 1000);
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
        if(q.includes('gate')) return "Checking live footfall... Gate 3 is crowded (15m wait). I recommend Gate 5 (2m wait). Should I show you the route on the map?";
        if(q.includes('food') || q.includes('hungry')) return "Based on your location, 'Stadium Grill' at Section C has 12m wait. 'Express Stand' at D is only 2m wait. I've applied a 20% discount coupon to your account for being a smart mover!";
        if(q.includes('exit')) return "The match is at 35'. I recommend leaving at 85' or waiting 15m post-match to use the Northern transport line, which is currently less congested.";
        return "I'm analyzing the stadium's live data. I can help with gate routing, food wait times, and optimal exit strategies. What's on your mind?";
    },

    setupCalendarLink() {
        const baseUrl = "https://www.google.com/calendar/render?action=TEMPLATE";
        const title = encodeURIComponent("Champions League Final: Real Madrid vs Man City");
        const dates = "20261024T200000Z/20261024T230000Z";
        const details = encodeURIComponent("Smart Venue Experience System (SVES) - View your seat and route in the app.");
        const location = encodeURIComponent("Wembley Stadium, London");
        
        document.getElementById('add-to-calendar').href = `${baseUrl}&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    },

    /* GOOGLE MAPS JS API INIT */
    initMap() {
        console.log("Initializing Live Google Map API...");
        const wembley = { lat: 51.5560, lng: -0.2796 };
        
        const map = new google.maps.Map(document.getElementById("google-map"), {
            zoom: 16,
            center: wembley,
            mapId: "SVES_STADIUM_MAP", // Use a styled map if available
            disableDefaultUI: true,
            styles: [
                { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                {
                    featureType: "administrative.locality",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#d59563" }],
                },
                // Dark mode styles for premium look
            ]
        });

        // Add Live Traffic Layer (Address user need for crowd/flow)
        const trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);

        // Add Marker for Current Objective (Gate 5)
        new google.maps.Marker({
            position: { lat: 51.5565, lng: -0.2810 },
            map,
            title: "Optimized Entry: Gate 5",
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#ff3366",
                fillOpacity: 0.8,
                strokeWeight: 2,
                strokeColor: "#ffffff"
            }
        });
    },

    /* GOOGLE IDENTITY & AUTH */
    initGoogleLogin() {
        window.onload = () => {
            google.accounts.id.initialize({
                client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // Placeholder
                callback: (res) => this.handleCredentialResponse(res)
            });
            google.accounts.id.renderButton(
                document.getElementById("google-login-btn"),
                { theme: "outline", size: "large", width: 280 }
            );
        };
    },

    handleCredentialResponse(response) {
        console.log("Encoded JWT ID token: " + response.credential);
        // In a real app, send token to your server or Firebase
        this.mockLogin();
    },

    mockLogin() {
        const overlay = document.getElementById('login-overlay');
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
            this.showToast('Login Successful', 'Welcome to your personalized venue experience.');
        }, 500);
    },

    /* VOICE RECOGNITION (MIC) */
    startVoiceRecognition() {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        const micBtn = document.getElementById('mic-btn');
        
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => {
            micBtn.classList.add('recording');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('gemini-input').value = transcript;
            this.sendGeminiMsg();
        };

        recognition.onend = () => {
            micBtn.classList.remove('recording');
        };

        recognition.onerror = () => {
             micBtn.classList.remove('recording');
             this.showToast('Mic Error', 'Could not access microphone.');
        };

        recognition.start();
    },

    /* FIREBASE PLACEHOLDER */
    initFirebase() {
        // Placeholder for user to add their config
        // firebase.initializeApp({ apiKey: "...", authDomain: "...", ... });
    },

    showToast(title, message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i class="ph-fill ph-check-circle"></i>
            <div class="toast-content">
                <strong>${title}</strong>
                <span>${message}</span>
            </div>
        `;
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400); // Wait for transition
        }, 3000);
    },

    simulateLiveUpdates() {
        const rand = Math.random();
        
        // Randomly update wait times to show dynamic system
        if(rand > 0.4) {
            const warningEls = document.querySelectorAll('.status-warning');
            const goodEls = document.querySelectorAll('.status-good');
            
            // Example update logic for a warning element
            if(warningEls.length > 0) {
                const el = warningEls[Math.floor(Math.random() * warningEls.length)];
                let match = el.innerText.match(/\\d+/);
                if(match) {
                    let time = parseInt(match[0]);
                    time = Math.max(2, time + (Math.random() > 0.5 ? 1 : -1));
                    el.innerText = `${time} min`;
                    
                    // Add subtle flash animation
                    el.style.transform = 'scale(1.1)';
                    setTimeout(() => el.style.transform = 'scale(1)', 300);

                    // Threshold toggle
                    if(time < 8) {
                        el.classList.remove('status-warning');
                        el.classList.add('status-good');
                        let iconTag = el.parentElement.querySelector('.tag.wait-warning');
                        if (iconTag) {
                            iconTag.className = 'tag wait-good';
                            iconTag.innerHTML = `<i class="ph-fill ph-clock"></i> ${time}m wait`;
                        }
                    } else if (time >= 8) {
                         let iconTag = el.parentElement.querySelector('.tag.wait-good');
                         if (iconTag) {
                            iconTag.className = 'tag wait-warning';
                            iconTag.innerHTML = `<i class="ph-fill ph-clock"></i> ${time}m wait`;
                         }
                    }
                }
            }
        }
    }
};

// Insert basic animation logic for UI loading elements if needed
const style = document.createElement('style');
style.innerHTML = `
@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Google Translate Init
function googleTranslateElementInit() {
    new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE}, 'google_translate_element');
}
