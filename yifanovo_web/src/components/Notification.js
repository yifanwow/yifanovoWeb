import React, { useEffect, useState } from 'react';
import './Notification.css'; // 添加样式文件

const Notification = ({ message, type, onClose, style }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const renderTimer = setTimeout(() => {
      setShouldRender(true);
    }, 10);  // 延迟10毫秒再渲染组件

    return () => clearTimeout(renderTimer);
  }, []);

  useEffect(() => {
    if (shouldRender) {
      const visibleTimer = setTimeout(() => {
        setIsVisible(true);  // 在组件已渲染后触发显示
      }, 10);

      return () => clearTimeout(visibleTimer);
    }
  }, [shouldRender]);

  useEffect(() => {
    if (!isVisible) {
      const closeTimer = setTimeout(() => onClose(), 2000);
      return () => clearTimeout(closeTimer);
    }
  }, [isVisible, onClose]);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`notification ${type} ${isVisible ? 'visible' : 'hidden'}`}
      onAnimationEnd={() => !isVisible && onClose()}
      style={style}  // 应用传入的样式
    >
      <span>{message}</span>
      <div onClick={handleClose} className="close-button">
        <svg width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M5.4 3h13.2A2.4 2.4 0 0 1 21 5.4v13.2a2.4 2.4 0 0 1-2.4 2.4H5.4A2.4 2.4 0 0 1 3 18.6V5.4A2.4 2.4 0 0 1 5.4 3Zm11.55 4.05a1 1 0 0 1 0 1.414L13.414 12l3.536 3.536a1 1 0 0 1-1.414 1.414L12 13.414 8.464 16.95a1 1 0 1 1-1.414-1.414L10.586 12 7.05 8.464A1 1 0 1 1 8.464 7.05L12 10.586l3.536-3.536a1 1 0 0 1 1.414 0Z"/>
        </svg>
      </div>
    </div>
  );
};

export default Notification;
