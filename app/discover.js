import { auth, db } from "../service/config/firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    
    // CLASS DEFINITION
    class Discover {
        constructor(facts, elements) {
            this.facts = facts;
            this.elements = elements;
            this.totalClicks = 0;
            this.clicksForCurrentGoal = 0;
            this.currentFactIndex = 0;
            this.clicksPerSecond = 0;
            this.startTime = Date.now();
            this.user = null;
            this.docRef = null; 
        }

        async init() {
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                    this.user = user;
                    this.docRef = doc(db, "discover_progress", this.user.uid);
                    await this.loadProgress();
                    this.setupEventListeners();
                    this.startCpsUpdater();
                }
            });
        }

        async loadProgress() {
            const docSnap = await getDoc(this.docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                this.totalClicks = data.totalClicks || 0;
                this.currentFactIndex = data.unlockedFacts || 0;
            } 
            else {
                await setDoc(this.docRef, {
                    username: this.user.displayName || this.user.email.split('@')[0],
                    totalClicks: 0,
                    unlockedFacts: 0,
                });
            }
            this.updateUI();
        }

        updateUI() {
            const currentGoal = (this.currentFactIndex + 1) * 100;
            this.clicksForCurrentGoal = this.totalClicks % 100;
            
            this.elements.noClick.textContent = this.totalClicks;
            this.elements.clickPerSec.textContent = this.clicksPerSecond.toFixed(2);
            this.elements.newGoal.textContent = currentGoal > 1000 ? "Max" : currentGoal;

            this.elements.goalPercent.max = 100;
            this.elements.goalPercent.value = this.clicksForCurrentGoal;
            
            this.updateFact();
        }

        updateFact() {
            if (this.currentFactIndex > 0) {
                this.elements.factId.textContent = `${this.currentFactIndex}`;
                this.elements.factTextElement.textContent = this.facts[this.currentFactIndex - 1];
            } 
            else {
                this.elements.factId.textContent = '0';
                this.elements.factTextElement.textContent = "Click the dog on the middle to unlock a fact.";
            }

            if (this.currentFactIndex >= this.facts.length) {
                this.elements.factTextElement.textContent = "Congratulations! You unlocked all the facts.";
            }
        }

        startCpsUpdater() {
            setInterval(() => {
                const elapsedTime = (Date.now() - this.startTime) / 1000;
                this.clicksPerSecond = elapsedTime > 0 ? this.totalClicks / elapsedTime : 0;
                this.elements.clickPerSec.textContent = this.clicksPerSecond.toFixed(2);
            }, 1000);
        }

        setupEventListeners() {
            this.elements.doge.addEventListener('click', async () => {
                this.totalClicks++;
                
                const newUnlockedFacts = Math.floor(this.totalClicks / 100);
                
                if (newUnlockedFacts > this.currentFactIndex) {
                    this.currentFactIndex = newUnlockedFacts;

                    await updateDoc(this.docRef, {
                        totalClicks: this.totalClicks,
                        unlockedFacts: this.currentFactIndex
                    });
                } 
                else {
                    await updateDoc(this.docRef, {
                        totalClicks: this.totalClicks
                    });
                }

                this.updateUI();
            });
        }
    }

    // INITIALIZATION
    const facts = [
        "About 98% of the atoms in the human body are replaced each year through the body's metabolic processes.",
        "A bolt of lightning is five times hotter than the surface of the sun. The temperature of lightning can reach up to 30,000 Kelvin (about 53,540∘F or 29,726∘C).",
        "A group of crows is most famously known as a \"murder\".",
        "The smell of rain has a name: \"petrichor\". This earthy scent is produced when airborne oils from plants, which have collected on dry surfaces, are released into the air by rainfall.",
        "The human brain can't feel pain. While the brain is what interprets pain signals sent from the rest of the body, the organ itself has no pain receptors. This is why brain surgery can be performed while the patient is awake.",
        "Carrots were originally purple, not orange. The first carrots cultivated by humans in the 10th century in Persia and Asia Minor were purple and yellow. The orange carrot we know today is a variety that was developed by Dutch growers in the 17th century.",
        "Vending machines are more deadly than sharks. On average, vending machines cause about 2-4 deaths per year (usually from being rocked or tilted over), while sharks are responsible for an average of one death every two years in the U.S. and about 6-10 worldwide.",
        "There is a species of ant in Southeast Asia that can explode. To defend its colony from predators, the Malaysian exploding ant (Colobopsis saundersi) can contract its abdominal muscles so forcefully that its body ruptures, spraying a sticky, toxic goo onto its enemies.",
        "When you click \"I'm not a robot,\" you are often training AI. Those CAPTCHA tests that ask you to identify images are using your responses to help train image-recognition algorithms for services like Google's self-driving cars. You are providing free, valuable data.",
        "Yawning is contagious as a sign of empathy. While a yawn's primary function might be to cool the brain, studies show that you're more likely to \"catch\" a yawn from someone you are socially and emotionally close to, like a family member or friend."
    ];

    const elements = {
        doge: document.getElementById("doge"),
        factId: document.getElementById("fact-id"),
        factTextElement: document.getElementById("fact-text"),
        noClick: document.getElementById("no_of_click"),
        clickPerSec: document.getElementById("click_per_second"),
        goalPercent: document.getElementById("goal_percentage"),
        newGoal: document.getElementById("click_goal"),
    }

    const discover = new Discover(facts, elements);

    discover.init();
    
});