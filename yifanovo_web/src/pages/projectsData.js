// src/projectsData.js

const projects = [
    {
        id: 1,
        date: "Mar 19, 2024",
        title: "s/AIO",
        description: "Dynamic web application that integrates with Steam's API. A personalized dashboard where users can log in with their Steam accounts and access a wealth of information about their gaming library. Rating, adding tag and Changing the grid of games.",
        imageUrl: "/img/saio.png",
        links: [
            { name: "s/AIO", url: "http://saio.us-east-2.elasticbeanstalk.com" },
            { name: "GitHub", url: "https://github.com/yifanwow/saio" }
        ]
    },
    {
        id: 2,
        date: "Apr 7, 2024",
        title: "s/GPT",
        description: "A WinExe Program help users to quickly communicate errors or any doubts encountered in their daily use of the computer through images by using GPT-4o Completions API.",
        imageUrl: "/img/sGPT.png",
        links: [
            { name: "GitHub", url: "https://github.com/yifanwow/sGPT" }
        ]
    },
    {
        id: 3,
        date: "Apr 7, 2024",
        title: "fanCtrl",
        description: "A C# program to control your computer fan and water pump speed (Hardware) by sending PWM signal, and bypass the UAC prompts.",
        imageUrl: "/img/fanCtrl.png",
        links: [
            { name: "GitHub", url: "https://github.com/yifanwow/fanCtrl" }
        ]
    },
    {
        id: 4,
        date: "Apr 7, 2024",
        title: "Grid View Engine",
        description: "A self-build software which can allow user to change the Grid on their Steam library.",
        imageUrl: "/img/store_home_share.jpg",
        links: [
            { name: "GitHub", url: "https://github.com/yifanwow/Grid_view_Engine" }
        ]
    }
];

export default projects;
