import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Notification from "./Notification";

const SubscriptionForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [index, setIndex] = useState(0); // 使用 useState 管理 index，为通知提供额外的唯一性标识
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isActive, setIsActive] = useState(false); // 管理表单的活跃状态
  const [lastSuccessfulTimestamp, setLastSuccessfulTimestamp] = useState(0); // 存储最后一次成功提交的时间戳
  const [debounceTimer, setDebounceTimer] = useState(null);

  const handleFocus = () => setIsActive(true); // 输入框获得焦点
  const handleBlur = () => setIsActive(false); // 输入框失去焦点

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (debounceTimer) {
      clearTimeout(debounceTimer); // 清除之前的定时器
    }
    const timer = setTimeout(async () => {
      const isValidEmail = validateEmail(email);
      const now = new Date().getTime();

      const uniqueId = `${new Date().getTime()}-${index}`;
      const newNotification = {
        id: uniqueId,
        message: isValidEmail ? t("sub_successful") : t("sub_fail"),
        type: isValidEmail ? "success" : "error",
        closing: false,
      };

      if (isValidEmail && now - lastSuccessfulTimestamp >= 10000) {
        // 检查距离上次成功提交是否已经超过10秒
        try {
          const response = await fetch(
            "https://yifanovo.info/api/submit-email",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email: email }),
            }
          );
          const data = await response.json();
          if (response.ok) {
            setLastSuccessfulTimestamp(now); // 更新最后一次成功提交的时间戳
            //   newNotification.message = t("verification_email_sent");
            //   newNotification.type = "success";
            // } else {
            //   newNotification.message = t("error_sending_email") + data.message;
            //   newNotification.type = "error";
          }
        } catch (error) {
          // newNotification.message = t("network_error");
          // newNotification.type = "error";
        }
      } else if (now - lastSuccessfulTimestamp < 10000) {
        console.log("Please wait for 10 seconds before submitting again.");
      }
      setNotifications((prev) => {
        // 如果通知数量已达到或超过五个，禁用按钮两秒
        if (prev.length > 4) {
          setIsButtonDisabled(true);
          setTimeout(() => {
            setIsButtonDisabled(false);
          }, 2100); // 2000ms 动画时间 + 100ms 延迟
        }
        return prev.length > 4
          ? [
              { ...prev[prev.length - 5], closing: true },
              ...prev.slice(1),
              newNotification,
            ]
          : [...prev, newNotification];
      });

      setIndex((prevIndex) => prevIndex + 1);
      setEmail('');
    }, 50); // 防抖时间设置为500毫秒

    setDebounceTimer(timer); // 保存定时器，以便可以在需要时清除
  };

  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={`inputButtonContainerStyle ${isActive ? "active" : ""}`}
      >
        <input
          type="text"
          placeholder={t("emailPlaceholder")}
          className="inputStyle"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={handleFocus} // 绑定获得焦点事件
          onBlur={handleBlur} // 绑定失去焦点事件
        />
        <button
          type="submit"
          className="buttonStyle"
          disabled={isButtonDisabled}
        >
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
            style={{ zIndex: notifications.length - index }} // 设置动态 z-index
            closing={notification.closing}
          />
        ))}
      </div>
    </>
  );
};

export default SubscriptionForm;
