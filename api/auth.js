import { auth } from "../api/config/firebaseConfig.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

class Auth {
    constructor(protectedPaths, authPaths) {
        document.body.style.visibility = 'hidden';
        this.currentPagePath = window.location.pathname;
        this.protectedPaths = protectedPaths;
        this.authPaths = authPaths;
    }

    init() {
        onAuthStateChanged(auth, (user) => {
            const isLoggedIn = !!user;

            if (isLoggedIn) {
                this.startSessionTimer();
                this.setupEventListeners(user.uid);
            }

            this.handleRedirects(isLoggedIn);
        });
    }

    startSessionTimer() {
        if (!sessionStorage.getItem('sessionStartTime')) {
            sessionStorage.setItem('sessionStartTime', Date.now());
        }
    }

    setupEventListeners() {
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

    handleRedirects(isLoggedIn) {
        const isProtected = this.protectedPaths.some(path => this.currentPagePath.endsWith(path));
        const isAuthPage = this.authPaths.some(path => this.currentPagePath.endsWith(path));

        if (!isLoggedIn && isProtected) {
            window.location.replace('/PAWLearn/views/login.html');
        } 
        else if (isLoggedIn && isAuthPage) {
            window.location.replace('/PAWLearn/views/study.html');
        } 
        else {
            this.showPage();
        }
    }

    addLogoutListener() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                signOut(auth).then(() => {
                    console.log("User signed out.");
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/PAWLearn/views/login.html';
                })
                .catch((error) => {
                    console.error("Sign out error:", error);
                });
            });
        }
    }

    showPage() {
        document.body.style.visibility = 'visible';
    }
}

// INITIALIZATION
const protectedPaths = [
    '/PAWLearn/views/study.html',
    '/PAWLearn/views/discover.html',
    '/PAWLearn/views/profile.html',
    '/PAWLearn/views/quiz.html',
    '/PAWLearn/views/detail.html',
    '/PAWLearn/views/result.html'
]

const authPaths = [
    '/PAWLearn/views/login.html',
    '/PAWLearn/views/register.html'
]

const authManager = new Auth(protectedPaths, authPaths);

authManager.init();