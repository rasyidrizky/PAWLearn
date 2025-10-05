document.addEventListener("DOMContentLoaded", () => {

    // CLASS DEFINITION
    class Result {
        constructor(data, elements) {
            this.elements = elements;
            this.data = data;
        }

        init() {
            this.renderResult();
        }

        renderResult() {
            if (this.data.score !== null && this.data.total !== null) {
                this.elements.scoreTitleEl.textContent = `You Scored ${this.data.score}/${this.data.total}`;
            } 
            else {
                this.elements.scoreTitleEl.textContent = "No score found!";
            }

            if (this.data.durationMs !== null) {
                const totalSeconds = Math.floor(this.data.durationMs / 1000);
                const minutes = Math.floor(totalSeconds / 60);
                const seconds = totalSeconds % 60;

                const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                this.elements.scoreDateEl.textContent = `Time: ${formattedTime}`;
            } 
            else {
                this.elements.scoreDateEl.textContent = "No time recorded.";
            }
        }

    }

    // INITIALIZATION
    const elements = {
        scoreTitleEl: document.querySelector("#score-title"),
        scoreDateEl: document.querySelector(".score-date"),
    };

    const data = {
        score: localStorage.getItem('quizScore'),
        total: localStorage.getItem('totalQuestions'),
        durationMs: localStorage.getItem('quizDuration'),
    };

    const result = new Result(data, elements);

    result.init();
});