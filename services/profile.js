import { auth } from "../api/config/firebaseConfig.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {

    // CLASS DEFINITION
    class Profile {
        constructor(elements) {
            this.elements = elements;
            this.DEFAULT_PROFILE_PIC = '../assets/elements/Logo (Regular).svg';
            this.timeInterval = null;
        }

        init() {
            this.setupEventListeners();

            onAuthStateChanged(auth, (user) => {
                if (user) {
                    this.displayInfo(user);
                    this.startTime(user);
                } else {
                    window.location.href = 'login.html';
                }
            });
        }

        setupEventListeners() {
            if (this.elements.logoutBtn) {
                this.elements.logoutBtn.addEventListener('click', () => {
                    signOut(auth).then(() => {
                        console.log("User signed out.");
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.href = '/PAWLearn/views/login.html';
                    }).catch(error => console.error("Sign out error:", error));
                });
            }
        }

        displayInfo(user) {
            this.elements.usernameFullname.textContent = user.displayName || user.email.split('@')[0];
            this.elements.userEmail.textContent = user.email;
            this.elements.profilePic.src = user.photoURL || this.DEFAULT_PROFILE_PIC;
            this.elements.lastSignedIn.textContent = new Date(user.metadata.lastSignInTime).toLocaleString();
        }

        startTime(user) {
            let userData = JSON.parse(localStorage.getItem(user.uid)) || { totalTimeSpent: 0 };
            const pageVisitStartTime = Date.now();

            const updateLiveTime = () => {
                const previousTimeSpent = userData.totalTimeSpent;
                const timeOnThisPage = Math.floor((Date.now() - pageVisitStartTime) / 1000);
                const totalLiveTime = previousTimeSpent + timeOnThisPage;

                this.elements.timeSpentCounter.textContent = this.formatTime(totalLiveTime);
            };

            clearInterval(this.timeInterval);
            this.timeInterval = setInterval(updateLiveTime, 1000);

            window.addEventListener('beforeunload', () => {
                const timeOnThisPage = Math.floor((Date.now() - pageVisitStartTime) / 1000);
                
                userData.totalTimeSpent += timeOnThisPage;
                localStorage.setItem(user.uid, JSON.stringify(userData));
            });
        }

        formatTime(totalSeconds) {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            return [hours, minutes, seconds].map(v => String(v).padStart(2, '0')).join(":");
        }
    }

    // INITIALIZATION
    const elements = {
        profilePic: document.getElementById('profile-picture'),
        lastSignedIn: document.getElementById('last-signed-in-date'),
        usernameFullname: document.getElementById('username-fullname'),
        userEmail: document.getElementById('user-email'),
        timeSpentCounter: document.getElementById('time-spent-counter'),
        logoutBtn: document.getElementById('logout-btn')
    }

    const profile = new Profile(elements);

    profile.init();
});