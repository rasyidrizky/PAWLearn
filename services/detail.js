import { chapters } from '../constants/chapters.js';

document.addEventListener('DOMContentLoaded', () => {

    // CLASS DEFINITION
    class Study {
        constructor(contents, elements) {
            this.contents = contents;
            this.elements = elements;

            this.params = new URLSearchParams(window.location.search);
            this.currentChapter = this.params.get('chapter');
            this.currId = this.contents.findIndex(chapter => chapter.id === this.currentChapter);
        }

        init() {
            this.setupEventListeners();
            this.renderCurrentChapter();
        }
        
        renderCurrentChapter() {            
            if (this.currId !== -1) {
                const chapterData = this.contents[this.currId];
                this.elements.titleElement.textContent = chapterData.title;
                this.elements.descriptionElement.textContent = chapterData.description;

                this.elements.videoContainer.innerHTML = '';

                if (chapterData.youtubeIds && chapterData.youtubeIds.length > 0) {
                    chapterData.youtubeIds.forEach(videoId => {
                        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        this.elements.videoContainer.innerHTML += `
                            <div class="video-wrapper">
                                <iframe src="${embedUrl}" title="YouTube video player" frameborder="0" allowfullscreen></iframe>
                            </div>
                        `;
                    });
                }

                if (this.currId === 0) {
                    this.elements.backButton.disabled = true;
                }
                else if (this.currId === chapterData.length - 1) {
                    this.elements.nextButton.disabled = true;
                }
            }
        }

        setupEventListeners() {
            this.elements.nextButton.addEventListener('click', () => {
                if (this.currId < this.contents.length - 1) {
                    const nextChapterId = this.contents[this.currId + 1].id;
                    window.location.href = `detail.html?chapter=${nextChapterId}`;
                }
            });

            this.elements.backButton.addEventListener('click', () => {
                if (this.currId > 0) {
                    const prevChapterId = this.contents[this.currId - 1].id;
                    window.location.href = `detail.html?chapter=${prevChapterId}`;
                }
            });
        }
    }

    // INITIALIZATION
    const elements = {
        titleElement: document.getElementById('chapter-title'),
        descriptionElement: document.getElementById('chapter-description'),
        videoContainer: document.getElementById('video-container'),
        nextButton: document.getElementById('next-btn'),
        backButton: document.getElementById('back-btn'),
    };

    const study = new Study(chapters, elements);

    study.init();
    
});