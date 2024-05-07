import React from 'react';

function Project({ date, title, description, imageUrl, link }) {
  return (
    <div className="projectContainer">
      <img src={imageUrl} alt={title} className="projectImage" />
      <div className="projectInfo">
        <span className="projectDate">{date}</span>
        <h3 className="projectTitle">{title}</h3>
        <p className="projectDescription">{description}</p>
        <a href={link} target="_blank" rel="noopener noreferrer" className="projectLink">Learn More</a>
      </div>
    </div>
  );
}

export default Project;
