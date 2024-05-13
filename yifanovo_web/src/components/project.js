import React from 'react';
import './Project.css'; // 引入样式文件

function Project({ date, title, description, imageUrl, links }) { // 注意这里修改了参数为links，它是一个数组
  return (
    <div className="project">
      <img src={imageUrl} alt={title} className="projectImage" />
      <div className="projectContent">
        <h3 className="projectTitle">{title}</h3>
        <p className="projectDescription">{description}</p>
        <p className="projectLink">Visit Website：
          {links.map((link, index) => (
            <React.Fragment key={index}>
              {index > 0 && ', '} {/* 添加逗号作为链接分隔 */}
              <a href={link.url} target="_blank" rel="noopener noreferrer">{link.name}</a>
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
}

export default Project;
