// src/projectsData.js

const projects = [
    {
        id: 1,
        date: "Mar 19, 2024",
        title: "s/AIO",
        description: "一个动态网页应用。用户可以通过Steam API登录自己的Steam账号，访问其游戏库中的项目，并能够通过网页进行自定义化的操作，包括评分、添加标签和改变游戏海报，所有的更改都是直接与数据库进行交互的。",
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
        description: "一个WinExe程序，用户可以一键式地通过调用GPT-4o的API接口完成功能请求，快速解决在日常使用计算机时遇到的错误或疑问，尤其是报错弹窗和系统信息等不便直接进行检索的内容。",
        imageUrl: "/img/sGPT.png",
        links: [
            { name: "GitHub", url: "https://github.com/yifanwow/sGPT" }
        ]
    },
    {
        id: 3,
        date: "Apr 7, 2024",
        title: "fanCtrl",
        description: "一个C#程序，通过发送PWM信号控制电脑硬件速度，例如风扇和水泵的速度。和市面上大多数软件不同的地方在于可以自定义快捷方式发送指令，同时绕过UAC提示。多数其他软件调速的方式都局限在软件内本身，较为复杂。",
        imageUrl: "/img/fanCtrl.png",
        links: [
            { name: "GitHub", url: "https://github.com/yifanwow/fanCtrl" }
        ]
    },
    {
        id: 4,
        date: "Apr 7, 2024",
        title: "Grid View Engine",
        description: "在开发中的软件，可以让用户自定义Steam库中的游戏游戏海报，直接与本地文件进行交互和修改，所有更改实时反馈在用户的Steam游戏库中。",
        imageUrl: "/img/store_home_share.jpg",
        links: [
            { name: "GitHub", url: "https://github.com/yifanwow/Grid_view_Engine" }
        ]
    }
];

export default projects;
