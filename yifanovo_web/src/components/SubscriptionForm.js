import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Notification from "./Notification";

const SubscriptionForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState([]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();  // 阻止默认的表单提交
      handleSubmit(e);     // 显式调用提交处理函数
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const isValidEmail = validateEmail(email);
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      {
        id: new Date().getTime(),
        message: isValidEmail ? t("sub_successful") : t("sub_fail"),
        type: isValidEmail ? "success" : "error"
      }
    ]);
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter((notification) => notification.id !== id));
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
          onKeyPress={handleKeyPress}  // 添加键盘事件监听器
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
          />
        ))}
      </div>
    </>
  );
};

export default SubscriptionForm;
