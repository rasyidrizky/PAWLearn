// document.addEventListener('DOMContentLoaded', () => {

//     if (!localStorage.getItem('quizStartTime')) {
//         localStorage.setItem('quizStartTime', Date.now());
//     }

//     const quizData = [
//         {
//             title: "Question 1",
//             questionText: "Instructions: Read the paragraph below and select the most effective topic sentence from the options provided. \"First, physical exercise builds muscle strength and increases stamina. Aerobic activities strengthen heart muscles. Running or cycling can also improve endurance. Furthermore, physical activity greatly benefits mental health. It reduces stress and helps people to relax. Also, individuals can make new friends by joining a gym or sports class. In addition, people can learn new skills when they practice a sport or activity.\" ",
//             type: "multipleChoice",
//             options: ["Many people join a gym or play a sport.", "When people participate in a physical activity, they gain many advantages.", "People should participate in sports that they like to keep their motivation."],
//             answer: "When people participate in a physical activity, they gain many advantages."
//         },
//         {
//             title: "Question 2",
//             questionText: " A quality summary must be objective, complete, and have __________, which means giving equal attention to each of the author's main ideas.",
//             type: "fillInTheBlank",
//             answer: "balance"
//         },
//         {
//             title: "Question 3",
//             questionText: "An introductory paragraph has three main parts that should appear in a specific order. Drag and drop the components below into the correct sequence as they would appear in an essay's introduction.",
//             type: "dragAndDrop",
//             dragItems: [
//                 { id: "thesis", text: "Thesis Sentence" },
//                 { id: "transition", text: "Transition" },
//                 { id: "hook", text: "Hook" },
//             ],
//             dropTargets: [
//                 { id: "first", text: "1st Part", correctDragId: "hook" },
//                 { id: "second", text: "2nd Part", correctDragId: "transition" },
//                 { id: "third", text: "3rd Part", correctDragId: "thesis" }
//             ]
//         },
//         {
//             title: "Question 4",
//             questionText: "Instructions: In addition to presenting evidence to support its own side, a strong argumentative essay must also include which of the following?",
//             type: "multipleChoice",
//             options: ["A detailed description of the sights and sounds to bring the topic alive.", "A counterargument that acknowledges the opposing viewpoint and a refutation that responds to it.", "A \"focus on cause\" method or a \"focus on effect\" method.", "A \"block method\" or a \"point-by-point method\" to organize paragraphs."],
//             answer: "A counterargument that acknowledges the opposing viewpoint and a refutation that responds to it."
//         },
//         {
//             title: "Question 5",
//             questionText: "Instructions: When you are directly quoting from a work using APA style, you must include specific information in the in-text citation. Fill in the blank to complete the rule. If you are directly quoting from a work, you will need to include the author, year of publication, and the _______ for the reference.",
//             type: "fillInTheBlank",
//             answer: "page number"
//         }
//     ];

//     const questionTitleEl = document.querySelector("#question-title");
//     const questionTextEl = document.querySelector("#question-text");
//     const quizBodyEl = document.querySelector("#quiz-body");
//     const nextButton = document.querySelector("#next-btn");
//     const backButton = document.querySelector("#back-btn");

//     let currentQuestionIndex = 0;
//     const userAnswers = new Array(quizData.length).fill(null);

//     function renderMultipleChoice(question) {
//         quizBodyEl.innerHTML = `<div class="mc-options">${question.options.map(option => `<button class="mc-option">${option}</button>`).join('')}</div>`;
//         const optionButtons = document.querySelectorAll(".mc-option");
//         optionButtons.forEach(button => {
//             if (userAnswers[currentQuestionIndex] === button.textContent) {
//                 button.classList.add("selected");
//             }
//             button.addEventListener("click", (e) => {
//                 optionButtons.forEach(btn => btn.classList.remove("selected"));
//                 e.target.classList.add("selected");
//                 userAnswers[currentQuestionIndex] = e.target.textContent;
//             });
//         });
//     }

//     function renderFillInTheBlank(question) {
//         const savedAnswer = userAnswers[currentQuestionIndex] || "";
//         quizBodyEl.innerHTML = `<div class="fill-blank-container"><input type="text" id="fill-blank-input" placeholder="Type your answer..." value="${savedAnswer}"></div>`;
//         const inputField = document.querySelector("#fill-blank-input");
//         inputField.addEventListener("input", (e) => {
//             userAnswers[currentQuestionIndex] = e.target.value.toLowerCase().trim();
//         });
//     }

//     function renderDragAndDrop(question) {
//         quizBodyEl.innerHTML = `
//             <div class="drag-drop-container">
//                 <div class="drag-items">
//                     ${question.dragItems.map(item => `<div class="drag-item" draggable="true" id="${item.id}">${item.text}</div>`).join('')}
//                 </div>
//                 <div class="drop-targets">
//                     ${question.dropTargets.map(target => `<div class="drop-target" id="${target.id}" data-correct="${target.correctDragId}">${target.text}</div>`).join('')}
//                 </div>
//             </div>
//         `;
//         addDragAndDropListeners();
//     }

//     function renderQuestion() {
//         quizBodyEl.innerHTML = "";
//         const question = quizData[currentQuestionIndex];
//         questionTitleEl.textContent = question.title;
//         questionTextEl.textContent = question.questionText;

//         switch (question.type) {
//             case "multipleChoice": renderMultipleChoice(question); break;
//             case "fillInTheBlank": renderFillInTheBlank(question); break;
//             case "dragAndDrop": renderDragAndDrop(question); break;
//         }

//         if (currentQuestionIndex === quizData.length - 1) {
//             nextButton.textContent = "Submit";
//         } else {
//             nextButton.textContent = "Next >";
//         }
//     }

//     nextButton.addEventListener("click", () => {
//         if (nextButton.textContent === "Submit") {
//             calculateScoreAndRedirect();
//             return;
//         }
//         currentQuestionIndex++;
//         if (currentQuestionIndex < quizData.length) {
//             renderQuestion();
//         }
//     });

//     backButton.addEventListener("click", () => {
//         if (currentQuestionIndex > 0) {
//             currentQuestionIndex--;
//             renderQuestion();
//         }
//     });

//     function calculateScoreAndRedirect() {
//         const startTime = localStorage.getItem('quizStartTime');
//         const endTime = Date.now();
//         const durationInMs = endTime - startTime;
//         localStorage.setItem('quizDuration', durationInMs);
//         localStorage.removeItem('quizStartTime');

//         let score = 0;

//         quizData.forEach((question, index) => {
//             const userAnswer = userAnswers[index];
            
//             switch (question.type) {
//                 case "multipleChoice":
//                 case "fillInTheBlank":
//                     if (userAnswer === question.answer) {
//                         score++;
//                     }
//                     break;

//                 case "dragAndDrop":
//                     let allCorrect = true;
//                     if (!userAnswer) {
//                         allCorrect = false;
//                         break;
//                     }
                    
//                     for (const dragItem of question.dragItems) {
//                         const correctTarget = question.dropTargets.find(
//                             target => target.correctDragId === dragItem.id
//                         );
                        
//                         if (!correctTarget || userAnswer[dragItem.id] !== correctTarget.id) {
//                             allCorrect = false;
//                             break; 
//                         }
//                     }
                    
//                     if (allCorrect) {
//                         score++;
//                     }
//                     break;
//             }
//         });

//         localStorage.setItem('quizScore', score);
//         localStorage.setItem('totalQuestions', quizData.length);
//         window.location.href = 'result.html';
//     }

//     function addDragAndDropListeners() {
//         const dragItems = document.querySelectorAll(".drag-item");
//         const dropTargets = document.querySelectorAll(".drop-target");
//         dragItems.forEach(item => {
//             item.addEventListener("dragstart", (e) => {
//                 e.dataTransfer.setData("text/plain", e.target.id);
//             });
//         });
//         dropTargets.forEach(target => {
//             target.addEventListener("dragover", (e) => e.preventDefault());
//             target.addEventListener("drop", (e) => {
//                 e.preventDefault();
//                 const draggedId = e.dataTransfer.getData("text/plain");
//                 const draggedItem = document.getElementById(draggedId);
                
//                 if (draggedItem && !target.contains(draggedItem)) {
//                     if (target.children.length === 0) {
//                         target.appendChild(draggedItem);
//                     }
//                 }
                
//                 if (!userAnswers[currentQuestionIndex]) {
//                     userAnswers[currentQuestionIndex] = {};
//                 }
//                 userAnswers[currentQuestionIndex][draggedId] = target.id;
//             });
//         });
//     }

//     renderQuestion();
// });

document.addEventListener('DOMContentLoaded', () => {
    const quizData = [
        {
            title: "Question 1",
            questionText: "Instructions: Read the paragraph below and select the most effective topic sentence from the options provided. \"First, physical exercise builds muscle strength and increases stamina. Aerobic activities strengthen heart muscles. Running or cycling can also improve endurance. Furthermore, physical activity greatly benefits mental health. It reduces stress and helps people to relax. Also, individuals can make new friends by joining a gym or sports class. In addition, people can learn new skills when they practice a sport or activity.\" ",
            type: "multipleChoice",
            options: ["Many people join a gym or play a sport.", "When people participate in a physical activity, they gain many advantages.", "People should participate in sports that they like to keep their motivation."],
            answer: "When people participate in a physical activity, they gain many advantages."
        },
        {
            title: "Question 2",
            questionText: " A quality summary must be objective, complete, and have __________, which means giving equal attention to each of the author's main ideas.",
            type: "fillInTheBlank",
            answer: "balance"
        },
        {
            title: "Question 3",
            questionText: "An introductory paragraph has three main parts that should appear in a specific order. Drag and drop the components below into the correct sequence as they would appear in an essay's introduction.",
            type: "dragAndDrop",
            dragItems: [
                { id: "thesis", text: "Thesis Sentence" },
                { id: "transition", text: "Transition" },
                { id: "hook", text: "Hook" },
            ],
            dropTargets: [
                { id: "first", text: "1st Part", correctDragId: "hook" },
                { id: "second", text: "2nd Part", correctDragId: "transition" },
                { id: "third", text: "3rd Part", correctDragId: "thesis" }
            ]
        },
        {
            title: "Question 4",
            questionText: "Instructions: In addition to presenting evidence to support its own side, a strong argumentative essay must also include which of the following?",
            type: "multipleChoice",
            options: ["A detailed description of the sights and sounds to bring the topic alive.", "A counterargument that acknowledges the opposing viewpoint and a refutation that responds to it.", "A \"focus on cause\" method or a \"focus on effect\" method.", "A \"block method\" or a \"point-by-point method\" to organize paragraphs."],
            answer: "A counterargument that acknowledges the opposing viewpoint and a refutation that responds to it."
        },
        {
            title: "Question 5",
            questionText: "Instructions: When you are directly quoting from a work using APA style, you must include specific information in the in-text citation. Fill in the blank to complete the rule. If you are directly quoting from a work, you will need to include the author, year of publication, and the _______ for the reference.",
            type: "fillInTheBlank",
            answer: "page number"
        }
    ];

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

        submit() {
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

    const myQuiz = new Quiz(quizData, elements);
    
    myQuiz.init();
});