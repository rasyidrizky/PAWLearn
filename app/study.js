import { chapterCard } from '../constants/chaptercard.js';
import { auth, db } from "../service/config/firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    class Study {
        constructor(data, elements) {
            this.chapters = data;
            this.elements = elements;

            this.currentPage = 0;
            this.chaptersPerPage = 6;
            this.totalPages = Math.ceil(this.chapters.length / this.chaptersPerPage);
            this.highestChapterUnlocked = 1;
        }

        init() {
            this.fetchUserProgressAndRender();
            this.setupEventListeners();
        }

        fetchUserProgressAndRender() {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        this.highestChapterUnlocked = docSnap.data().highestChapterUnlocked;
                    }
                }
                this.renderChapters();
            });
        }

        renderChapters() {
            this.elements.chapterContainer.innerHTML = '';
            const startIndex = this.currentPage * this.chaptersPerPage;
            const endIndex = startIndex + this.chaptersPerPage;
            const chaptersToRender = this.chapters.slice(startIndex, endIndex);
            const chaptersCompleted = this.highestChapterUnlocked - 1;

            chaptersToRender.forEach(chapter => {
                let isLocked = false;

                if (chapter.isQuiz) {
                    isLocked = chaptersCompleted < chapter.requiredChapters;
                } 
                else {
                    isLocked = chapter.id > this.highestChapterUnlocked;
                }
                
                const cardLink = document.createElement('a');
                cardLink.href = isLocked ? "#" : chapter.link;
                cardLink.classList.add('card-link');
                if (isLocked) {
                    cardLink.classList.add('locked');
                }

                Object.assign(cardLink.style, chapter.position);

                cardLink.innerHTML = `
                    <div class="chapter-card ${chapter.isQuiz ? 'chapter-quiz' : ''}">
                        <h2>${chapter.title}</h2>
                        <p>${chapter.description}</p>
                    </div>
                `;
                this.elements.chapterContainer.appendChild(cardLink);
            });

            this.updatePagination();
        }

        updatePagination() {
            this.elements.dotsContainer.innerHTML = '';
            for (let i = 0; i < this.totalPages; i++) {
                const dot = document.createElement('div');
                dot.classList.add('dot');
                if (i === this.currentPage) {
                    dot.classList.add('active');
                }
                this.elements.dotsContainer.appendChild(dot);
            }
            this.elements.prevButton.disabled = this.currentPage === 0;
            this.elements.nextButton.disabled = this.currentPage === this.totalPages - 1;
        }

        setupEventListeners() {
            this.elements.nextButton.addEventListener('click', () => {
                if (this.currentPage < this.totalPages - 1) {
                    this.currentPage++;
                    this.renderChapters();
                }
            });
            this.elements.prevButton.addEventListener('click', () => {
                if (this.currentPage > 0) {
                    this.currentPage--;
                    this.renderChapters();
                }
            });
        }
    }

    // INITIALIZATION
    const elements = {
        chapterContainer: document.getElementById('chapter-container'),
        dotsContainer: document.getElementById('pagination-dots-container'),
        prevButton: document.getElementById('prev-page-btn'),
        nextButton: document.getElementById('next-page-btn')
    };

    const study = new Study(chapterCard, elements);
    
    study.init();
});