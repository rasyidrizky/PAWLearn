import { auth, db } from "../api/config/firebaseConfig.js";
import { onAuthStateChanged, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { trophy, medal } from "../constants/achievement.js";

document.addEventListener('DOMContentLoaded', () => {

    // CLASS DEFINITION
    class Profile {
        constructor(elements) {
            this.elements = elements;
            this.DEFAULT_PROFILE_PIC = '../assets/elements/Logo (Regular).svg';
            this.timeInterval = null;
            this.chapterTiers = trophy;
            this.quizTiers = medal;
        }

        init() {
            this.setupEventListeners();

            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    const isEmailProvider = user.providerData.some(
                        (provider) => provider.providerId === 'password'
                    );

                    if (!isEmailProvider) {
                        this.elements.resetPasswordBtn.style.display = 'none';
                    }

                    if (docSnap.exists()) {
                        const progressData = docSnap.data();
                        
                        this.displayInfo(user, progressData);
                        this.startTime(user, progressData);
                    } else {
                        console.error("No user progress document found in Firestore!");
                    }
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

            if (this.elements.resetPasswordBtn) {
                this.elements.resetPasswordBtn.addEventListener('click', () => {
                    this.handleResetPassword();
                });
            }
        }

        displayInfo(user, progressData) {
            this.elements.usernameFullname.textContent = user.displayName || user.email.split('@')[0];
            this.elements.userEmail.textContent = user.email;
            this.elements.profilePic.src = user.photoURL || this.DEFAULT_PROFILE_PIC;
            this.elements.lastSignedIn.textContent = new Date(user.metadata.lastSignInTime).toLocaleString();

            const chaptersCompleted = progressData.highestChapterUnlocked - 1;
            const quizzesCompleted = progressData.quizCompleted || 0;

            this.elements.chaptersCounter.textContent = chaptersCompleted;
            this.elements.quizCounter.textContent = quizzesCompleted;

            const chapterAchievement = this.getAchievementTier(chaptersCompleted, this.chapterTiers);
            if (chapterAchievement) {
                this.elements.trophyImg.src = chapterAchievement.image;
                this.elements.trophyImg.classList.remove('hidden');
            } 
            else {
                this.elements.trophyImg.classList.add('hidden');
            }

            const quizAchievement = this.getAchievementTier(quizzesCompleted, this.quizTiers);
            if (quizAchievement) {
                this.elements.medalImg.src = quizAchievement.image;
                this.elements.medalImg.classList.remove('hidden');
            } 
            else {
                this.elements.medalImg.classList.add('hidden');
            }
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

        getAchievementTier(score, tiers) {
            for (const tier of tiers) {
                if (score >= tier.threshold) {
                    return tier;
                }
            }
            return null;
        }

        handleResetPassword() {
            const user = auth.currentUser;
            if (!user || !user.email) {
                alert("Could not find user email. Please log in again.");
                return;
            }

            if (confirm(`Are you sure you want to send a password reset link to ${user.email}?`)) {
                sendPasswordResetEmail(auth, user.email)
                    .then(() => {
                        alert("Password reset email sent! Please check your inbox.");
                    })
                    .catch((error) => {
                        console.error("Error sending password reset email:", error);
                        alert("Failed to send password reset email. Please try again later.");
                    });
            }
        }
    }

    // INITIALIZATION
    const elements = {
        profilePic: document.getElementById('profile-picture'),
        lastSignedIn: document.getElementById('last-signed-in-date'),
        usernameFullname: document.getElementById('username-fullname'),
        userEmail: document.getElementById('user-email'),
        timeSpentCounter: document.getElementById('time-spent-counter'),
        logoutBtn: document.getElementById('logout-btn'),
        chaptersCounter: document.getElementById('chapters-completed-counter'),
        quizCounter: document.getElementById('quiz-completed-counter'),
        trophyImg: document.getElementById('trophy-img'),
        medalImg: document.getElementById('medal-img'),
        resetPasswordBtn: document.querySelector('.reset-password-btn')
    }

    const profile = new Profile(elements);

    profile.init();
});