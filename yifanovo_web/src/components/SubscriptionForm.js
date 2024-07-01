import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const SubscriptionForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting email:", email);
    // Perform your subscription logic here
  };

  return (
    <form onSubmit={handleSubmit} className="inputButtonContainerStyle">
      <input
        type="text"
        placeholder={t("emailPlaceholder")}
        className="inputStyle"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit" className="buttonStyle">
        {t("getUpdates")}
      </button>
    </form>
  );
};

export default SubscriptionForm;
