import React from 'react';
import './Project.css'; // 引入样式文件

function Project({ date, title, description, imageUrl, link }) {
  return (
    <div className="project">
      <img src={imageUrl} alt={title} className="projectImage" />
      <div className="projectContent">
        <h3 className="projectTitle">{title}</h3>
        <p className="projectDescription">{description}</p>
        <a href={link} target="_blank" rel="noopener noreferrer" className="projectLink">Visit website</a>
      </div>
    </div>
  );
}

export default Project;
