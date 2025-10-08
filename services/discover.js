document.addEventListener('DOMContentLoaded', () => {
    
    // CLASS DEFINITION
    class Discover {
        constructor(facts, elements) {
            this.elements = elements;
            this.facts = facts;

            this.totalClick = 0;
            this.click = 0;
            this.startTime = new Date().getTime();
            this.currFactId = 0;
        }

        init() {
            this.setupEventListeners();
        }

        setupEventListeners() {
            this.elements.doge.addEventListener('click', () => {
                this.totalClick += 1;
                this.click += 1;

                const currentTime = new Date().getTime();
                const elapsedTime = (currentTime - this.startTime) / 1000;
                const clickpersec = this.totalClick / elapsedTime;

                this.elements.noClick.innerHTML = this.totalClick;
                this.elements.clickPerSec.innerHTML = clickpersec.toFixed(2);

                let result = Number(this.elements.newGoal);

                this.elements.goalPercent.value = this.click;

                if (this.totalClick % 100 == 0 && this.totalClick <= 1000) {
                    this.click = 0;

                    let newGoal = result + 100;

                    if (newGoal <= 1000) {
                        this.elements.newGoal.innerHTML = newGoal;
                    }

                    this.updateFact((this.totalClick / 100) - 1);
                }
                else if (this.totalClick > 1100) {
                    this.elements.factTextElement.textContent = "Congratulations! You unlocked all the facts.";
                }
            });
        }

        updateFact(factIndex) {
            if (this.facts[factIndex]) {
                this.currFactId += 1;
                this.elements.factId.textContent = this.currFactId;
                this.elements.factTextElement.textContent = facts[factIndex];
            }
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