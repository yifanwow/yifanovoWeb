import React, { useEffect, useState } from "react";
import "./Notification.css"; // 添加样式文件

const Notification = ({ message, type, onClose, style, closing }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const renderTimer = setTimeout(() => {
      setShouldRender(true);
    }, 100); // 延迟50毫秒再渲染组件

    return () => clearTimeout(renderTimer);
  }, []);

  useEffect(() => {
    if (shouldRender) {
      const visibleTimer = setTimeout(() => {
        setIsVisible(true); // 在组件已渲染后触发显示
      }, 100);

      return () => clearTimeout(visibleTimer);
    }
  }, [shouldRender]);

  useEffect(() => {
    if (closing) {
      // 延迟足够时间以播放关闭动画
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 50); // 可以调整为动画时间
      return () => clearTimeout(timer);
    }
  }, [closing]);

  useEffect(() => {
    if (!isVisible) {
      const closeTimer = setTimeout(() => onClose(), 2000);
      return () => clearTimeout(closeTimer);
    }
  }, [isVisible, onClose]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleAnimationEnd = () => {
    if (!isVisible) {
      onClose(); // 动画完成后触发关闭
    }
  };

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`notification ${type} ${isVisible ? "visible" : "hidden"}`}
      onAnimationEnd={handleAnimationEnd}
      style={style} // 应用传入的样式
    >
      <span>{message}</span>
      <div onClick={handleClose} className="close-button">
        <svg
          width="21px"
          height="21px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V7Z"
            stroke="currentColor"
            stroke-width="1.7"
          />
          <path
            d="M9 9L15 15M15 9L9 15"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default Notification;
