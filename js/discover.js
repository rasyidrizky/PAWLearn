let totalClick = 0;
let click = 0;
let startTime = new Date().getTime();
let currFactId = 0;

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

const factId = document.getElementById("fact-id");
const factTextElement = document.getElementById("fact-text");

function updateFact(factIndex) {
    if (facts[factIndex]) {
        currFactId += 1;
        factId.textContent = currFactId;
        factTextElement.textContent = facts[factIndex];
    }
}

function addClick() {
    totalClick = totalClick + 1;
    click = click + 1;

    const currentTime = new Date().getTime();
    const elapsedTime = (currentTime - startTime) / 1000;
    const clickpersec = totalClick / elapsedTime;

    document.getElementById("no_of_click").innerHTML = totalClick;
    document.getElementById("click_per_second").innerHTML = clickpersec.toFixed(2);

    let currGoal = document.getElementById("click_goal").innerHTML;
    let result = Number(currGoal);

    document.getElementById("goal_percentage").value = click;

    if (totalClick % 100 == 0 && totalClick <= 1000) {
        click = 0;
        let currGoal = document.getElementById("click_goal").innerHTML;
        let result = Number(currGoal);

        let newGoal = result + 100;

        if (newGoal <= 1000) {
            document.getElementById("click_goal").innerHTML = newGoal;
        }

        updateFact((totalClick / 100) - 1);
    }
    else if (totalClick > 1100) {
        factTextElement.textContent = "Congratulations! You unlocked all the facts.";
    }
}