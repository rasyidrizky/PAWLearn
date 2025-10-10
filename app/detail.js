import { chapters } from '../constants/chapters.js';
import { auth, db } from "../service/config/firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {

    // CLASS DEFINITION
    class Detail {
        constructor(allContents, elements) {
            this.allContents = allContents;
            this.elements = elements;

            const params = new URLSearchParams(window.location.search);
            this.chapterId = params.get('chapter');
            this.currentIndex = this.allContents.findIndex(c => c.id === this.chapterId);
        }

        init() {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    this.render(user);
                } else {
                    window.location.href = 'login.html';
                }
            });
        }

        async render(user) {
            if (this.currentIndex === -1) {
                this.elements.titleElement.textContent = 'Chapter Not Found';
                this.elements.descriptionElement.textContent = 'Please select a valid chapter.';
                return;
            }

            const chapterData = this.allContents[this.currentIndex];

            this.elements.titleElement.textContent = chapterData.title;
            
            const paragraphs = chapterData.description.split('\n\n');
            const descriptionHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
            this.elements.descriptionElement.innerHTML = descriptionHTML;

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

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            const progress = docSnap.data();

            this.setupNavButtons(progress);
            this.setupDoneButton(user, progress);
        }

        setupNavButtons(progress) {
            const isFirstChapter = this.currentIndex === 0;
            const isLastChapter = this.currentIndex >= this.allContents.length - 1;
            
            const nextChapterId = isLastChapter ? null : parseInt(this.allContents[this.currentIndex + 1].id, 10);

            this.elements.backButton.disabled = isFirstChapter;
            
            this.elements.nextButton.disabled = isLastChapter || (nextChapterId > progress.highestChapterUnlocked);

            this.elements.nextButton.addEventListener('click', () => {
                if (this.currentIndex < this.allContents.length - 1) {
                    const nextChapterId = this.allContents[this.currentIndex + 1].id;
                    window.location.href = `detail.html?chapter=${nextChapterId}`;
                }
            });

            this.elements.backButton.addEventListener('click', () => {
                if (this.currentIndex > 0) {
                    const prevChapterId = this.allContents[this.currentIndex - 1].id;
                    window.location.href = `detail.html?chapter=${prevChapterId}`;
                }
            });
        }

        async setupDoneButton(user) {
            const docRef = doc(db, "users", user.uid);
            let docSnap = await getDoc(docRef);

            if (!docSnap.exists()) return;
            
            let progress = docSnap.data();
            const chapterIdNum = parseInt(this.chapterId, 10);

            if (chapterIdNum < progress.highestChapterUnlocked) {
                this.elements.doneButton.textContent = "Completed";
                this.elements.doneButton.disabled = true;
            }

            this.elements.doneButton.addEventListener('click', async () => {
                docSnap = await getDoc(docRef);
                progress = docSnap.data();
                
                if (chapterIdNum === progress.highestChapterUnlocked) {
                    const newHighest = progress.highestChapterUnlocked + 1;
                    await updateDoc(docRef, {
                        highestChapterUnlocked: newHighest
                    });
                    progress.highestChapterUnlocked = newHighest;
                    
                    alert(`Chapter ${chapterIdNum} complete! Chapter ${chapterIdNum + 1} unlocked.`);
                    this.elements.doneButton.textContent = "Completed";
                    this.elements.doneButton.disabled = true;

                    this.setupNavButtons(progress);
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
        doneButton: document.getElementById('mark-done-btn')
    };

    const detailPage = new Detail(chapters, elements);

    detailPage.init();
});