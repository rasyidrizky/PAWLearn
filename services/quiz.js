import { questions } from "../constants/questions.js";
import { auth, db } from "../api/config/firebaseConfig.js";
import { 
    doc, 
    getDoc, 
    updateDoc, 
    increment, 
    collection, 
    addDoc, 
    serverTimestamp 
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
                            const correctTarget = question.dropTargets.find(target => target.correctDragId === dragItem.id);
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

                await addDoc(resultsCollectionRef, {
                    quizId: quizId,
                    score: score,
                    totalQuestions: this.questions.length,
                    timeTakenMs: durationInMs,
                    dateCompleted: serverTimestamp()
                });
                console.log("Quiz result saved to subcollection.");

                const docRef = doc(db, "users", user.uid);
                const updates = { quizCompleted: increment(1) };
                if (quizId) {
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const progress = docSnap.data();
                        if (parseInt(quizId, 10) === progress.highestChapterUnlocked) {
                            updates.highestChapterUnlocked = increment(1);
                        }
                    }
                }
                await updateDoc(docRef, updates);
                console.log("User summary progress updated.");
            }

            window.location.href = 'result.html';
        }
    }

    // INITIALIZATION
    const elements = {
        titleEl: document.querySelector("#question-title"),
        textEl: document.querySelector("#question-text"),
        bodyEl: document.querySelector("#quiz-body"),
        nextBtn: document.querySelector("#next-btn"),
        backBtn: document.querySelector("#back-btn")
    };

    const myQuiz = new Quiz(questions, elements);
    
    myQuiz.init();
});