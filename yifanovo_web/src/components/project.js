import React, { useRef, useCallback } from 'react';
import './Project.css';

function Project({ date, title, description, imageUrl, links }) {
  const projectImageRef = useRef(null);
  let frameId = useRef(null);

  const handleMouseMove = useCallback((event) => {
    if (frameId.current) {
      cancelAnimationFrame(frameId.current);
    }

    frameId.current = requestAnimationFrame(() => {
      if (!projectImageRef.current) return;

      const rect = projectImageRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const deltaX = (x - centerX) / centerX;
      const deltaY = (centerY - y) / centerY;

      const transformStyle = `rotateX(${deltaY * 10}deg) rotateY(${deltaX * 10}deg) translateZ(50px) scale(1.1)`;

      // 动态计算阴影偏移和模糊
      const shadowX = - deltaX * 17;
      const shadowY = deltaY * 17;
      const shadowBlur = Math.abs(deltaX * deltaY) * 10 + 10;
      const boxShadow = `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(0, 0, 0, 0.5)`;

      projectImageRef.current.style.transform = transformStyle;
      projectImageRef.current.style.boxShadow = boxShadow;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (frameId.current) {
      cancelAnimationFrame(frameId.current);
    }
    if (projectImageRef.current) {
      projectImageRef.current.style.transform = 'rotateX(0) rotateY(0) scale(1)';
      projectImageRef.current.style.boxShadow = '0 4px 11px rgba(0, 0, 0, 0.5)';
    }
  }, []);

  return (
    <div className="project">
      <div className="imageContainer">
        <img src={imageUrl} alt={title} className="projectImage" ref={projectImageRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
      </div>
      <div className="projectContent">
        <h3 className="projectTitle">{title}</h3>
        <p className="projectDescription">{description}</p>
        <p className="projectLink">Visit Website：
          {links.map((link, index) => (
            <React.Fragment key={index}>
              {index > 0 && ', '}
              <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
}

export default Project;
