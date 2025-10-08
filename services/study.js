import { chapterCard } from '../constants/chaptercard.js';

document.addEventListener('DOMContentLoaded', () => {

    // CLASS DEFINITION
    class Study {
        constructor(data, elements) {
            this.data = data;
            this.elements = elements;

            this.currentPage = 0;
            this.chaptersPerPage = 6;
            this.totalPages = Math.ceil(data.length / this.chaptersPerPage);
        }

        init() {
            this.setupEventListeners();
            this.renderChapters();
        }

        renderChapters() {
            this.elements.chapterContainer.innerHTML = '';
            const startIndex = this.currentPage * this.chaptersPerPage;
            const endIndex = startIndex + this.chaptersPerPage;
            const chaptersToRender = this.data.slice(startIndex, endIndex);

            chaptersToRender.forEach(chapter => {
                const cardLink = document.createElement('a');
                cardLink.href = chapter.link;
                cardLink.classList.add('card-link');

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
        chapterContainer: document.getElementById('chapter-grid-container'),
        dotsContainer: document.getElementById('pagination-dots-container'),
        prevButton: document.getElementById('prev-page-btn'),
        nextButton: document.getElementById('next-page-btn')
    }

    const study = new Study(chapterCard, elements);

    study.init();
});