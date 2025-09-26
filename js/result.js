document.addEventListener("DOMContentLoaded", () => {
    const scoreTitleEl = document.querySelector("#score-title");
    const scoreDateEl = document.querySelector(".score-date");

    const score = localStorage.getItem('quizScore');
    const total = localStorage.getItem('totalQuestions');
    const durationMs = localStorage.getItem('quizDuration');

    if (score !== null && total !== null) {
        scoreTitleEl.textContent = `You Scored ${score}/${total}`;
    } else {
        scoreTitleEl.textContent = "No score found!";
    }

    if (durationMs !== null) {
        const totalSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        scoreDateEl.textContent = `Time: ${formattedTime}`;
    } else {
        scoreDateEl.textContent = "No time recorded.";
    }
});