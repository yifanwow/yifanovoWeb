import React, { useRef, useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const languageContainerRef = useRef(null);
  const { i18n } = useTranslation();

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
  };

  const handleClickOutside = (event) => {
    if (
      languageContainerRef.current &&
      !languageContainerRef.current.contains(event.target)
    ) {
      setShowLanguageMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="language-toggle-container" ref={languageContainerRef}>
      <div
        className="language-icon"
        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.58 19.37L17.59 11.01C17.38 10.46 16.91 10.12 16.37 10.12C15.83 10.12 15.37 10.46 15.14 11.03L12.16 19.37C12.02 19.76 12.22 20.19 12.61 20.33C13 20.47 13.43 20.27 13.57 19.88L14.19 18.15H18.54L19.16 19.88C19.27 20.19 19.56 20.38 19.87 20.38C19.95 20.38 20.04 20.37 20.12 20.34C20.51 20.2 20.71 19.77 20.57 19.38L20.58 19.37ZM14.74 16.64L16.38 12.05L18.02 16.64H14.74ZM12.19 7.85C9.92999 11.42 7.89 13.58 5.41 15.02C5.29 15.09 5.16 15.12 5.04 15.12C4.78 15.12 4.53 14.99 4.39 14.75C4.18 14.39 4.3 13.93 4.66 13.73C6.75999 12.51 8.48 10.76 10.41 7.86H4.12C3.71 7.86 3.37 7.52 3.37 7.11C3.37 6.7 3.71 6.36 4.12 6.36H7.87V4.38C7.87 3.97 8.21 3.63 8.62 3.63C9.02999 3.63 9.37 3.97 9.37 4.38V6.36H13.12C13.53 6.36 13.87 6.7 13.87 7.11C13.87 7.52 13.53 7.86 13.12 7.86H12.18L12.19 7.85ZM12.23 15.12C12.1 15.12 11.97 15.09 11.85 15.02C11.2 14.64 10.57 14.22 9.97999 13.78C9.64999 13.53 9.58 13.06 9.83 12.73C10.08 12.4 10.55 12.33 10.88 12.58C11.42 12.99 12.01 13.37 12.61 13.72C12.97 13.93 13.09 14.39 12.88 14.75C12.74 14.99 12.49 15.12 12.23 15.12Z" />
        </svg>
      </div>
      <CSSTransition
        in={showLanguageMenu}
        timeout={300}
        classNames="language-menu"
        unmountOnExit
      >
        <div className="language-menu">
          <button onClick={() => handleLanguageChange('en')}>ENG</button>
          <button onClick={() => handleLanguageChange('zh')}>中文</button>
        </div>
      </CSSTransition>
    </div>
  );
};

export default LanguageToggle;