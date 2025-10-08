export const questions = [
    {
        title: "Question 1",
        questionText: "Instructions: Read the paragraph below and select the most effective topic sentence from the options provided. \"First, physical exercise builds muscle strength and increases stamina. Aerobic activities strengthen heart muscles. Running or cycling can also improve endurance. Furthermore, physical activity greatly benefits mental health. It reduces stress and helps people to relax. Also, individuals can make new friends by joining a gym or sports class. In addition, people can learn new skills when they practice a sport or activity.\" ",
        type: "multipleChoice",
        options: ["Many people join a gym or play a sport.", "When people participate in a physical activity, they gain many advantages.", "People should participate in sports that they like to keep their motivation."],
        answer: "When people participate in a physical activity, they gain many advantages."
    },
    {
        title: "Question 2",
        questionText: " A quality summary must be objective, complete, and have __________, which means giving equal attention to each of the author's main ideas.",
        type: "fillInTheBlank",
        answer: "balance"
    },
    {
        title: "Question 3",
        questionText: "An introductory paragraph has three main parts that should appear in a specific order. Drag and drop the components below into the correct sequence as they would appear in an essay's introduction.",
        type: "dragAndDrop",
        dragItems: [
            { id: "thesis", text: "Thesis Sentence" },
            { id: "transition", text: "Transition" },
            { id: "hook", text: "Hook" },
        ],
        dropTargets: [
            { id: "first", text: "1st Part", correctDragId: "hook" },
            { id: "second", text: "2nd Part", correctDragId: "transition" },
            { id: "third", text: "3rd Part", correctDragId: "thesis" }
        ]
    },
    {
        title: "Question 4",
        questionText: "Instructions: In addition to presenting evidence to support its own side, a strong argumentative essay must also include which of the following?",
        type: "multipleChoice",
        options: ["A detailed description of the sights and sounds to bring the topic alive.", "A counterargument that acknowledges the opposing viewpoint and a refutation that responds to it.", "A \"focus on cause\" method or a \"focus on effect\" method.", "A \"block method\" or a \"point-by-point method\" to organize paragraphs."],
        answer: "A counterargument that acknowledges the opposing viewpoint and a refutation that responds to it."
    },
    {
        title: "Question 5",
        questionText: "Instructions: When you are directly quoting from a work using APA style, you must include specific information in the in-text citation. Fill in the blank to complete the rule. If you are directly quoting from a work, you will need to include the author, year of publication, and the _______ for the reference.",
        type: "fillInTheBlank",
        answer: "page number"
    }
];