// src/projectsData.js

const projects = [
    {
        id: 1,
        date: "Mar 19, 2024",
        title: "s/AIO",
        description: "Dynamic web application that integrates with Steam's API. A personalized dashboard where users can log in with their Steam accounts and access a wealth of information about their gaming library. Rating, Adding tag and Changing the grid of games.",
        imageUrl: "/img/saio.png",
        links: [
            { name: "s/AIO", url: "http://saio.us-east-2.elasticbeanstalk.com" },
            { name: "GitHub", url: "https://github.com/yifanwow/saio" }
        ]
    },
    {
        id: 2,
        date: "Apr 7, 2024",
        title: "Night Screen Viewer",
        description: "NSV is a JavaScript & C# utility for Windows users that dims other screens when an application runs in full-screen on the primary monitor or open a specific .exe file. It reduces distractions by allowing users to adjust the opacity of an overlay. Ideal for enhancing focus while watching movies or working.",
        imageUrl: "/img/nsv.png",
        links: [
            { name: "GitHub", url: "https://github.com/yifanwow/NightScreenViewer" }
        ]
    },
    {
        id: 2,
        date: "Apr 7, 2024",
        title: "fanCtrl",
        description: "A C# program to control the speed of computer hardware such as fans and pumps by sending PWM signals. The difference with most software on the market is the ability to customize shortcuts to send commands while bypassing UAC prompts. Most other software speed control methods are limited to the software itself and are more complicated.",
        imageUrl: "/img/fanCtrl.png",
        links: [
            { name: "GitHub", url: "https://github.com/yifanwow/fanCtrl" }
        ]
    },
    {
        id: 3,
        date: "Apr 7, 2024",
        title: "s/GPT",
        description: "A WinExe program allows users to complete function requests by calling GPT-4o's API interface in a one-click manner, quickly resolving errors or questions encountered in daily use of the computer, especially error pop-ups and system messages that are not easy to retrieve directly.",
        imageUrl: "/img/sGPT.png",
        links: [
            { name: "GitHub", url: "https://github.com/yifanwow/sGPT" }
        ]
    },
    
    {
        id: 4,
        date: "Apr 7, 2024",
        title: "Grid View Engine",
        description: "Software in development that allows users to customize game grid for games in the Steam library, interacting and modifying them directly with local files, with all changes fed back to the user's Steam library in real time.",
        imageUrl: "/img/store_home_share.jpg",
        links: [
            { name: "GitHub", url: "https://github.com/yifanwow/Grid_view_Engine" }
        ]
    }
];

export default projects;
