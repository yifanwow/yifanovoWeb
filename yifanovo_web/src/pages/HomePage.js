import React from 'react';
import 'bulma/css/bulma.css';
import './HomePage.css';
import Project from '../components/project';
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
    { id: 1, date: "Mar 19, 2024", title: "Latent Box", description: "A collection of awesome lists for AI, creativity and art.", imageUrl: "/img/project1.jpg", link: "https://latentbox.com" },
    { id: 2, date: "Apr 7, 2024", title: "AI Explorer", description: "Explore the limits of AI in one place.", imageUrl: "/img/project2.jpg", link: "https://aiexplorer.com" }
  ];

  return (
    <div className="homeStyle">
      <div style={{ width: '50vw' }}>
        {/* Profile background */}
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
          version 0.01
        </div>
      </div>
      </div>
      <div style={{ width: '50vw' }}>
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