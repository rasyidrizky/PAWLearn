import { auth } from "../api/config/firebaseConfig.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

class Auth {
    constructor() {
        document.body.style.visibility = 'hidden';
        this.currentPagePath = window.location.pathname;

        this.protectedPaths = [
            '/PAWLearn/views/study.html',
            '/PAWLearn/views/discover.html',
            '/PAWLearn/views/profile.html',
            '/PAWLearn/views/quiz.html',
            '/PAWLearn/views/detail.html',
            '/PAWLearn/views/result.html'
        ];
        
        this.authPaths = [
            '/PAWLearn/views/login.html',
            '/PAWLearn/views/register.html'
        ];
    }

    init() {
        onAuthStateChanged(auth, (user) => {
            const isLoggedIn = !!user;

            if (isLoggedIn) {
                this._startSessionTimer();
                this._setupUnloadListener(user.uid);
            }

            this._handleRedirects(isLoggedIn);
            this._renderNavbar(isLoggedIn);
        });
    }

    _startSessionTimer() {
        if (!sessionStorage.getItem('sessionStartTime')) {
            sessionStorage.setItem('sessionStartTime', Date.now());
        }
    }

    _setupUnloadListener(userId) {
        if (window.hasUnloadListener) return;
        window.addEventListener('beforeunload', () => {
            const sessionStartTime = parseInt(sessionStorage.getItem('sessionStartTime'), 10);
            if (sessionStartTime) {
                const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
                const userData = JSON.parse(localStorage.getItem(userId)) || { totalTimeSpent: 0 };
                userData.totalTimeSpent = (userData.totalTimeSpent || 0) + sessionDuration;
                localStorage.setItem(userId, JSON.stringify(userData));
                sessionStorage.removeItem('sessionStartTime');
            }
        });
        window.hasUnloadListener = true;
    }

    _handleRedirects(isLoggedIn) {
        const isProtected = this.protectedPaths.some(path => this.currentPagePath.endsWith(path));
        const isAuthPage = this.authPaths.some(path => this.currentPagePath.endsWith(path));

        if (!isLoggedIn && isProtected) {
            window.location.replace('/PAWLearn/views/login.html');
        } else if (isLoggedIn && isAuthPage) {
            window.location.replace('/PAWLearn/views/study.html');
        } else {
            this._showPage();
        }
    }

    _addLogoutListener() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                signOut(auth).then(() => {
                    console.log("User signed out.");
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/PAWLearn/views/login.html';
                }).catch((error) => {
                    console.error("Sign out error:", error);
                });
            });
        }
    }

    _showPage() {
        document.body.style.visibility = 'visible';
    }
}

// INITIALIZATION
new Auth().init();