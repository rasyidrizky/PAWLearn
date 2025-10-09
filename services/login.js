import { auth, db } from "../api/config/firebaseConfig.js";
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    // CLASS DEFINITION
    class Login {
        constructor(form) {
            this.form = form;
        }

        init() {
            this.setupEventListeners();
        }

        setupEventListeners() {
            const activeGoogleForm = this.form.loginForm || this.form.registerForm;
            if (activeGoogleForm) {
                const googleLoginButton = activeGoogleForm.querySelector('#google-button');
                if (googleLoginButton) {
                    googleLoginButton.addEventListener('click', () => this.loginGoogle());
                }
            }

            if (this.form.loginForm) {
                const loginButton = this.form.loginForm.querySelector('#log-in-button');
                loginButton.addEventListener('click', () => this.loginEmail());
                
                this.form.loginForm.addEventListener('submit', (event) => {
                    event.preventDefault();
                    this.loginEmail();
                });
            }

            if (this.form.registerForm) {
                const registerButton = this.form.registerForm.querySelector('#register-button');
                registerButton.addEventListener('click', () => this.handleSignUp());

                this.form.registerForm.addEventListener('submit', (event) => {
                    event.preventDefault();
                    this.handleSignUp();
                });
            }
        }

        async loginEmail() {
            const email = this.form.loginForm.querySelector('input[type="email"]').value;
            const password = this.form.loginForm.querySelector('input[type="password"]').value;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log("Successfully logged in!", userCredential.user);

                window.location.href = 'study.html'; 
            } 
            catch (error) {
                const errorCode = error.code;
                const errorMessage = error.message;

                console.error(`Login failed: ${errorCode}`, errorMessage);
                
                if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
                    alert('Invalid email or password. Please try again.');
                } 
                else {
                    alert(errorMessage);
                }
            }
        }

        async loginGoogle() {
            try {
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                const user = result.user;

                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    console.log("First time Google sign-in for this user. Creating progress document...");
                    await setDoc(docRef, {
                        username: user.displayName, 
                        email: user.email,
                        highestChapterUnlocked: 1,
                        quizCompleted: 0
                    });
                }
                
                window.location.href = 'study.html';

            } 
            catch (error) {
                console.error("Google login failed:", error);
            }
        }

        async handleSignUp() {
            const email = this.form.registerForm.querySelector('input[type="email"]').value;
            const username = this.form.registerForm.querySelector('input[type="text"]').value;
            const password = this.form.registerForm.querySelectorAll('input[type="password"]')[0].value;
            const passwordConfirm = this.form.registerForm.querySelectorAll('input[type="password"]')[1].value;

            if (!email || !username || !password) {
                alert('Please fill in all fields.');
                return;
            }
            if (password !== passwordConfirm) {
                alert('Passwords do not match!');
                return;
            }
            if (password.length < 6) {
                alert('Password must be at least 6 characters long.');
                return; 
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await updateProfile(userCredential.user, {
                    displayName: username 
                })

                await setDoc(doc(db, "users", user.uid), {
                    username: user.displayName, 
                    email: user.email,
                    highestChapterUnlocked: 1,
                    quizCompleted: 0
                });

                console.log('User registered successfully!', user);
                alert(`Welcome, ${username}! Your account has been created.`);

                window.location.href = './login.html';

            } 
            catch (error) {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error(`Sign up failed: ${errorCode}`, errorMessage);

                if (errorCode === 'auth/email-already-in-use') {
                    alert('This email address is already in use.');
                } 
                else if (errorCode === 'auth/weak-password') {
                    alert('The password is too weak.');
                } 
                else {
                    alert(errorMessage);
                }
            }
        }
    }

    // INITIALIZATION
    const form = {
        loginForm: document.querySelector('.login-form-container form'),
        registerForm: document.querySelector('.register-form-container form'),
    };

    const loginHandler = new Login(form);

    loginHandler.init();
});