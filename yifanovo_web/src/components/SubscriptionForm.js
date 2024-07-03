import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Notification from "./Notification";

const SubscriptionForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [index, setIndex] = useState(0); // 使用 useState 管理 index，为通知提供额外的唯一性标识
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isActive, setIsActive] = useState(false);  // 管理表单的活跃状态

  const handleFocus = () => setIsActive(true);  // 输入框获得焦点
  const handleBlur = () => setIsActive(false);  // 输入框失去焦点


  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValidEmail = validateEmail(email);
    const uniqueId = `${new Date().getTime()}-${index}`;
    const newNotification = {
      id: uniqueId,
      message: isValidEmail ? t("sub_successful") : t("sub_fail"),
      type: isValidEmail ? "success" : "error",
      closing: false
    };
  
    if (isValidEmail) {
      try {
        const response = await fetch('http://localhost:5000/api/submit-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: email })
        });
        const data = await response.json();
        // if (response.ok) {
        //   newNotification.message = t("verification_email_sent");
        //   newNotification.type = "success";
        // } else {
        //   newNotification.message = t("error_sending_email") + data.message;
        //   newNotification.type = "error";
        // }
      } catch (error) {
        // newNotification.message = t("network_error");
        // newNotification.type = "error";
      }
    }

    setNotifications(prev => {
      // 如果通知数量已达到或超过五个，禁用按钮两秒
      if (prev.length > 4) {
        setIsButtonDisabled(true);
        setTimeout(() => {
          setIsButtonDisabled(false);
        }, 2100);// 2000ms 动画时间 + 100ms 延迟
      }
      return prev.length > 4 ? 
        [{ ...prev[prev.length - 5], closing: true }, ...prev.slice(1), newNotification] :
        [...prev, newNotification];
        
    });
  
    setIndex(prevIndex => prevIndex + 1);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={`inputButtonContainerStyle ${isActive ? 'active' : ''}`}>
        <input
          type="text"
          placeholder={t("emailPlaceholder")}
          className="inputStyle"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={handleFocus}  // 绑定获得焦点事件
          onBlur={handleBlur}    // 绑定失去焦点事件
        />
        <button type="submit" className="buttonStyle"disabled={isButtonDisabled}>
          {t("getUpdates")}
        </button>
      </form>
      <div className="notifications-container">
      {notifications.map((notification, index) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
            style={{ zIndex: notifications.length - index }}  // 设置动态 z-index
            closing={notification.closing}
          />
        ))}
      </div>
    </>
  );
};

export default SubscriptionForm;
