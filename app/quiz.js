import { questions } from "../constants/questions.js";
import { auth, db } from "../service/config/firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { 
    doc, 
    getDoc, 
    updateDoc, 
    increment, 
    collection, 
    addDoc, 
    serverTimestamp,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    // CLASS DEFINITION
    class Quiz {
        constructor(questions, elements) {
            this.questions = questions;
            this.elements = elements;
            this.currentQuestionIndex = 0;
            this.userAnswers = new Array(this.questions.length).fill(null);

            if (!localStorage.getItem('quizStartTime')) {
                localStorage.setItem('quizStartTime', Date.now());
            }
        }

        init() {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    this.setupStartScreen(user);
                }
            });
        }

        async setupStartScreen(user) {
            const params = new URLSearchParams(window.location.search);
            const quizId = params.get('id');

            const resultsQuery = query(
                collection(db, 'users', user.uid, 'quiz_results'),
                where("quizId", "==", quizId)
            );
            
            const querySnapshot = await getDocs(resultsQuery);
            let highestScore = 0;
            querySnapshot.forEach((doc) => {
                const result = doc.data();
                if (result.score > highestScore) {
                    highestScore = result.score;
                }
            });

            this.elements.startTitle.textContent = `Quiz ${quizId/6}`;
            this.elements.startQuestionCount.textContent = this.questions.length;

            if (highestScore > 0 || querySnapshot.size > 0) {
                this.elements.highestScoreDisplay.classList.remove('hidden');
                this.elements.startHighestScore.textContent = `${highestScore} / ${this.questions.length}`;
                this.elements.startQuizBtn.textContent = "Try Again";
            }

            this.elements.startQuizBtn.addEventListener('click', () => {
                this.startQuiz();
            });
        }

        startQuiz() {
            this.elements.startScreen.classList.add('hidden');
            this.elements.mainScreen.classList.remove('hidden');

            if (!localStorage.getItem('quizStartTime')) {
                localStorage.setItem('quizStartTime', Date.now());
            }

            this.setupEventListeners();
            this.renderCurrentQuestion();
        }

        renderCurrentQuestion() {
            const question = this.questions[this.currentQuestionIndex];
            this.elements.titleEl.textContent = question.title;
            this.elements.textEl.textContent = question.questionText;

            switch (question.type) {
                case "multipleChoice":
                    this.renderMultipleChoice(question);
                    break;
                case "fillInTheBlank":
                    this.renderFillInTheBlank(question);
                    break;
                case "dragAndDrop":
                    this.renderDragAndDrop(question);
                    break;
            }
            
            this.updateButtonStates();
        }
        
        renderMultipleChoice(question) {
            this.elements.bodyEl.innerHTML = `<div class="mc-options">${question.options.map(option => `<button class="mc-option">${option}</button>`).join('')}</div>`;
            const optionButtons = this.elements.bodyEl.querySelectorAll(".mc-option");
            optionButtons.forEach(button => {
                if (this.userAnswers[this.currentQuestionIndex] === button.textContent) {
                    button.classList.add("selected");
                }
                button.addEventListener("click", (e) => {
                    optionButtons.forEach(btn => btn.classList.remove("selected"));
                    e.target.classList.add("selected");
                    this.userAnswers[this.currentQuestionIndex] = e.target.textContent;
                });
            });
        }

        renderFillInTheBlank(question) {
            const savedAnswer = this.userAnswers[this.currentQuestionIndex] || "";
            this.elements.bodyEl.innerHTML = `<div class="fill-blank-container"><input type="text" id="fill-blank-input" placeholder="Type your answer..." value="${savedAnswer}"></div>`;
            const inputField = this.elements.bodyEl.querySelector("#fill-blank-input");
            inputField.addEventListener("input", (e) => {
                this.userAnswers[this.currentQuestionIndex] = e.target.value.toLowerCase().trim();
            });
        }
        
        renderDragAndDrop(question) {
            this.elements.bodyEl.innerHTML = `<div class="drag-drop-container"><div class="drag-items">${question.dragItems.map(item => `<div class="drag-item" draggable="true" id="${item.id}">${item.text}</div>`).join('')}</div><div class="drop-targets">${question.dropTargets.map(target => `<div class="drop-target" id="${target.id}" data-correct="${target.correctDragId}">${target.text}</div>`).join('')}</div></div>`;
            this.addDragAndDropListeners();
        }
        
        addDragAndDropListeners() {
            const dragItems = this.elements.bodyEl.querySelectorAll(".drag-item");
            const dropTargets = this.elements.bodyEl.querySelectorAll(".drop-target");

            dragItems.forEach(item => {
                item.addEventListener("dragstart", (e) => {
                    e.dataTransfer.setData("text/plain", e.target.id);
                });
            });

            dropTargets.forEach(target => {
                target.addEventListener("dragover", (e) => e.preventDefault());
                target.addEventListener("drop", (e) => {
                    e.preventDefault();
                    const draggedId = e.dataTransfer.getData("text/plain");
                    const draggedItem = this.elements.bodyEl.querySelector(`#${draggedId}`);
                    if (draggedItem && !target.contains(draggedItem) && target.children.length === 0) {
                        target.appendChild(draggedItem);
                    }
                    if (!this.userAnswers[this.currentQuestionIndex]) {
                        this.userAnswers[this.currentQuestionIndex] = {};
                    }
                    this.userAnswers[this.currentQuestionIndex][draggedId] = target.id;
                });
            });
        }

        setupEventListeners() {
            this.elements.nextBtn.addEventListener("click", () => {
                if (this.currentQuestionIndex === this.questions.length - 1) {
                    this.submit();
                } else {
                    this.currentQuestionIndex++;
                    this.renderCurrentQuestion();
                }
            });

            this.elements.backBtn.addEventListener("click", () => {
                if (this.currentQuestionIndex > 0) {
                    this.currentQuestionIndex--;
                    this.renderCurrentQuestion();
                }
            });
        }
        
        updateButtonStates() {
            this.elements.nextBtn.textContent = (this.currentQuestionIndex === this.questions.length - 1)
                ? "Submit"
                : "Next >";

            this.elements.backBtn.disabled = (this.currentQuestionIndex === 0);
        }

        async submit() {
            const startTime = localStorage.getItem('quizStartTime');
            const durationInMs = Date.now() - startTime;
            localStorage.setItem('quizDuration', durationInMs);
            localStorage.removeItem('quizStartTime');

            let score = 0;
            this.questions.forEach((question, index) => {
                const userAnswer = this.userAnswers[index];
                switch (question.type) {
                    case "multipleChoice":
                    case "fillInTheBlank":
                        if (userAnswer === question.answer) score++;
                        break;
                    case "dragAndDrop":
                        let allCorrect = true;
                        if (!userAnswer) {
                            allCorrect = false;
                            break;
                        }
                        for (const dragItem of question.dragItems) {
                            const correctTarget = question.dropTargets.find(
                                target => target.correctDragId === dragItem.id
                            );
                            if (!correctTarget || userAnswer[dragItem.id] !== correctTarget.id) {
                                allCorrect = false;
                                break;
                            }
                        }
                        if (allCorrect) score++;
                        break;
                }
            });

            localStorage.setItem('quizScore', score);
            localStorage.setItem('totalQuestions', this.questions.length);

            const user = auth.currentUser;
            if (user) {
                const params = new URLSearchParams(window.location.search);
                const quizId = params.get('id');

                const resultsCollectionRef = collection(db, 'users', user.uid, 'quiz_results');

                const existingQuery = query(
                    resultsCollectionRef,
                    where("quizId", "==", quizId)
                );
                const existingSnapshot = await getDocs(existingQuery);

                let isNewQuiz = false;

                if (existingSnapshot.empty) {
                    await addDoc(resultsCollectionRef, {
                        quizId: quizId,
                        score: score,
                        totalQuestions: this.questions.length,
                        timeTakenMs: durationInMs,
                        dateCompleted: serverTimestamp()
                    });
                    isNewQuiz = true;
                    console.log("New quiz result saved.");
                } 
                else {
                    const existingDoc = existingSnapshot.docs[0];
                    const existingData = existingDoc.data();

                    if (score > existingData.score) {
                        await updateDoc(existingDoc.ref, {
                            score: score,
                            timeTakenMs: durationInMs,
                            dateCompleted: serverTimestamp()
                        });
                        console.log("Existing quiz result updated with higher score.");
                    } else {
                        console.log("Existing quiz result kept (score not higher).");
                    }
                }

                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const progress = docSnap.data();
                    const updates = {};

                    if (isNewQuiz) {
                        updates.quizCompleted = increment(1);
                    }

                    const quizIdNum = parseInt(quizId, 10);
                    const unlockMap = {
                        6: 7,
                        12: 13,
                    };

                    if (unlockMap[quizIdNum]) {
                        const unlockTarget = unlockMap[quizIdNum];
                        if (progress.highestChapterUnlocked < unlockTarget) {
                            updates.highestChapterUnlocked = unlockTarget;
                        }
                    }
                    
                    if (Object.keys(updates).length > 0) {
                        await updateDoc(docRef, updates);
                        console.log("User summary progress updated.");
                    }
                }
            }

            window.location.href = 'result.html';
        }

    }

    // INITIALIZATION
    const params = new URLSearchParams(window.location.search);
    const start = parseInt(params.get('start'), 10) || 0;
    const count = parseInt(params.get('count'), 10) || questions.length;

    const questionsQuiz = questions.slice(start, start + count);

    const elements = {
        startScreen: document.getElementById('quiz-start-screen'),
        startTitle: document.getElementById('start-title'),
        startQuestionCount: document.getElementById('start-question-count'),
        highestScoreDisplay: document.getElementById('highest-score-display'),
        startHighestScore: document.getElementById('start-highest-score'),
        startQuizBtn: document.getElementById('start-quiz-btn'),
        
        mainScreen: document.getElementById('quiz-main-screen'),
        titleEl: document.querySelector("#question-title"),
        textEl: document.querySelector("#question-text"),
        bodyEl: document.querySelector("#quiz-body"),
        nextBtn: document.querySelector("#next-btn"),
        backBtn: document.querySelector("#back-btn")
    };

    const myQuiz = new Quiz(questionsQuiz, elements);
    
    myQuiz.init();
});