document.addEventListener('DOMContentLoaded', () => {

    if (!localStorage.getItem('quizStartTime')) {
        localStorage.setItem('quizStartTime', Date.now());
    }

    const quizData = [
        {
            title: "Question 1",
            questionText: "What is the capital of Indonesia?",
            type: "multipleChoice",
            options: ["Bandung", "Jakarta", "Surabaya", "Medan"],
            answer: "Jakarta"
        },
        {
            title: "Question 2",
            questionText: "Complete the saying: 'Practice makes ______'.",
            type: "fillInTheBlank",
            answer: "perfect"
        },
        {
            title: "Question 3",
            questionText: "Drag the animal to its correct food source.",
            type: "dragAndDrop",
            dragItems: [
                { id: "dog", text: "🐶 Dog" },
                { id: "monkey", text: "🐵 Monkey" }
            ],
            dropTargets: [
                { id: "banana", text: "🍌 Banana", correctDragId: "monkey" },
                { id: "bone", text: "🦴 Bone", correctDragId: "dog" }
            ]
        }
    ];

    const questionTitleEl = document.querySelector("#question-title");
    const questionTextEl = document.querySelector("#question-text");
    const quizBodyEl = document.querySelector("#quiz-body");
    const nextButton = document.querySelector("#next-btn");
    const backButton = document.querySelector("#back-btn");

    let currentQuestionIndex = 0;
    const userAnswers = new Array(quizData.length).fill(null);

    function renderMultipleChoice(question) {
        quizBodyEl.innerHTML = `<div class="mc-options">${question.options.map(option => `<button class="mc-option">${option}</button>`).join('')}</div>`;
        const optionButtons = document.querySelectorAll(".mc-option");
        optionButtons.forEach(button => {
            if (userAnswers[currentQuestionIndex] === button.textContent) {
                button.classList.add("selected");
            }
            button.addEventListener("click", (e) => {
                optionButtons.forEach(btn => btn.classList.remove("selected"));
                e.target.classList.add("selected");
                userAnswers[currentQuestionIndex] = e.target.textContent;
            });
        });
    }

    function renderFillInTheBlank(question) {
        const savedAnswer = userAnswers[currentQuestionIndex] || "";
        quizBodyEl.innerHTML = `<div class="fill-blank-container"><input type="text" id="fill-blank-input" placeholder="Type your answer..." value="${savedAnswer}"></div>`;
        const inputField = document.querySelector("#fill-blank-input");
        inputField.addEventListener("input", (e) => {
            userAnswers[currentQuestionIndex] = e.target.value.toLowerCase().trim();
        });
    }

    function renderDragAndDrop(question) {
        quizBodyEl.innerHTML = `
            <div class="drag-drop-container">
                <div class="drag-items">
                    ${question.dragItems.map(item => `<div class="drag-item" draggable="true" id="${item.id}">${item.text}</div>`).join('')}
                </div>
                <div class="drop-targets">
                    ${question.dropTargets.map(target => `<div class="drop-target" id="${target.id}" data-correct="${target.correctDragId}">${target.text}</div>`).join('')}
                </div>
            </div>
        `;
        addDragAndDropListeners();
    }

    function renderQuestion() {
        quizBodyEl.innerHTML = "";
        const question = quizData[currentQuestionIndex];
        questionTitleEl.textContent = question.title;
        questionTextEl.textContent = question.questionText;

        switch (question.type) {
            case "multipleChoice": renderMultipleChoice(question); break;
            case "fillInTheBlank": renderFillInTheBlank(question); break;
            case "dragAndDrop": renderDragAndDrop(question); break;
        }

        if (currentQuestionIndex === quizData.length - 1) {
            nextButton.textContent = "Submit";
        } else {
            nextButton.textContent = "Next >";
        }
    }

    nextButton.addEventListener("click", () => {
        if (nextButton.textContent === "Submit") {
            calculateScoreAndRedirect();
            return;
        }
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            renderQuestion();
        }
    });

    backButton.addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
        }
    });

    function calculateScoreAndRedirect() {
        const startTime = localStorage.getItem('quizStartTime');
        const endTime = Date.now();
        const durationInMs = endTime - startTime;

        localStorage.setItem('quizDuration', durationInMs);
        
        localStorage.removeItem('quizStartTime');

        let score = 0;

        quizData.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            
            switch (question.type) {
                case "multipleChoice":
                case "fillInTheBlank":
                    if (userAnswer === question.answer) {
                        score++;
                    }
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
                        
                        if (userAnswer[dragItem.id] !== correctTarget.id) {
                            allCorrect = false;
                            break;
                        }
                    }
                    
                    if (allCorrect) {
                        score++;
                    }
                    break;
            }
        });

        localStorage.setItem('quizScore', score);
        localStorage.setItem('totalQuestions', quizData.length);

        window.location.href = 'result.html';
    }

    function addDragAndDropListeners() {
        const dragItems = document.querySelectorAll(".drag-item");
        const dropTargets = document.querySelectorAll(".drop-target");
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
                const draggedItem = document.getElementById(draggedId);
                
                if (draggedItem && !target.contains(draggedItem)) {
                    if (target.children.length === 0) {
                        target.appendChild(draggedItem);
                    }
                }
                
                if (!userAnswers[currentQuestionIndex]) {
                    userAnswers[currentQuestionIndex] = {};
                }
                userAnswers[currentQuestionIndex][draggedId] = target.id;
            });
        });
    }

    renderQuestion();
});