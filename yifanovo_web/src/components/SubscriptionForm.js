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
    if (e.key === "Enter") {
      e.preventDefault(); // 阻止默认的表单提交
      handleSubmit(e); // 显式调用提交处理函数
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const newNotification = {
      id: new Date().getTime(),
      message: validateEmail(email) ? t("sub_successful") : t("sub_fail"),
      type: validateEmail(email) ? "success" : "error",
    };
    setNotifications((prev) => [...prev, newNotification]);
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
          onKeyPress={handleKeyPress} // 添加键盘事件监听器
        />
        <button type="submit" className="buttonStyle">
          {t("getUpdates")}
        </button>
      </form>
      <div className="notifications-container">
      {notifications.map((notification, index) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            style={{ zIndex: notifications.length - index }}  // 设置动态 z-index
          />
        ))}
      </div>
    </>
  );
};

export default SubscriptionForm;
