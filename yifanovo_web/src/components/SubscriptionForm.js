import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Notification from "./Notification";

const SubscriptionForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState([]);
  let index = 0;

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 阻止默认的表单提交
      handleSubmit(e);    // 显式调用提交处理函数
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValidEmail = validateEmail(email);
    const newNotification = {
      id: new Date().getTime(),
      message: isValidEmail ? t("sub_successful") : t("sub_fail"),
      type: isValidEmail ? "success" : "error",
      closing: false  // 新增属性，标记是否正在关闭
    };

    // 添加新通知并在必要时标记最旧的通知为关闭
    setNotifications(prev => prev.length > 4 ? 
      [{ ...prev[prev.length - 5], closing: true }, ...prev.slice(1), newNotification] :
      [...prev, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="inputButtonContainerStyle">
        <input
          type="text"
          placeholder={t("emailPlaceholder")}
          className="inputStyle"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button type="submit" className="buttonStyle">
          {t("getUpdates")}
        </button>
      </form>
      <div className="notifications-container">
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => removeNotification(notification.id)}
            closing={notification.closing}
          />
        ))}
      </div>
    </>
  );
};

export default SubscriptionForm;
