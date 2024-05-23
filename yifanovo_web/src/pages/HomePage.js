import React from 'react';
import 'bulma/css/bulma.css';
import './HomePage.css';
import Project from '../components/Project';
import ProfileBackground_big from '../components/ProfileBackground_big';


function HomePage() {
  // Function to handle the form submission
  console.log('Try to login in using API Base URL:', process.env.REACT_APP_API_BASE_URL);
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('LOGIN IN HomeLoggedOut-checkpoint 2');
    // Perform your login logic here
  };

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

  return (
    <div className="homeStyle">
      <div className="homeStyleLeft">

        {/* Profile background */}
        <div className="temple">
          <div className="leftContainerStyle">
            <div>
              <div className="textGroupStyle">
                <h1 className="titleGroupStyle">
                  <span className="SteamStyle">Yifan </span>
                  <span className="AIOStyle">Yu</span>
                </h1>
                <p>Software development / Tech make life better</p>
              </div>
              <form onSubmit={handleSubmit} className="inputButtonContainerStyle">
                <input type="text" placeholder="Email Address" className="inputStyle" />
                <button type="submit" className="buttonStyle">Get Updates</button>
              </form>
              <div className="GitHubStyle">
                <img src="/img/ICON/GITHUB_GRAY.png" alt="GitHub Icon" style={{ width: '21px' }} />
                <a href="https://github.com/yifanwow" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                  GitHub
                </a>
              </div>
              {/* Other content like GitHub link, version info, etc. */}
            </div>
            <div style={{ fontSize: '0.77em', color: '#5a4d54', position: 'absolute', bottom: '10px', alignItems: 'center' }}>
              version 0.02
            </div>
          </div>
        </div>
      </div>


      <div style={{ width: '100vw' }}>
        <div className="rightContainerStyle">
          {projects.map(project => (
            <Project key={project.id} {...project} />
          ))}
        </div>
      </div>
      <ProfileBackground_big />
    </div>
  );
}

export default HomePage;