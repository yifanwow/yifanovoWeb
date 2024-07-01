import React, { useEffect, useState, useRef } from "react";
import "bulma/css/bulma.css";
import "./HomePage.css";
import "./good.css";
import "./language.css";
import { CSSTransition } from "react-transition-group";
import { useTranslation } from "react-i18next";
import Project from "../components/Project";
import SocialLinks from "../components/SocialLinks_en";
import ProfileBackgroundBig from "../components/ProfileBackground_big";

function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const languageContainerRef = useRef(null); // 使用 ref 来引用容器 DOM 元素
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState([]); // 根据当前设定的项目数据

  const handleLanguageChange = (language) => {
    i18n.changeLanguage(language);
  };

  const handleClickOutside = (event) => {
    if (
      languageContainerRef.current &&
      !languageContainerRef.current.contains(event.target)
    ) {
      setShowLanguageMenu(false); // 如果点击的是容器外部，则关闭菜单
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("LOGIN IN HomeLoggedOut-checkpoint 2");
    // Perform your login logic here
  };
  useEffect(() => {
    const loadProjects = async () => {
      const projectsData = await import(`./projectsData_${i18n.language}`);
      setProjects(projectsData.default);
    };

    loadProjects();
  }, [i18n.language]); // 当语言改变时重新加载项目数据
  useEffect(() => {
    const setHeights = () => {
      const homeStyleLeft = document.querySelector(".homeStyleLeft");
      const leftContainerStyle = document.querySelector(".leftContainerStyle");
      const temple = document.querySelector(".temple");

      if (homeStyleLeft && leftContainerStyle && temple) {
        const heightValue = homeStyleLeft.clientHeight;
        const leftContainerStyleHeight = leftContainerStyle.clientHeight;
        const templeHeight = temple.clientHeight;

        homeStyleLeft.style.height = heightValue + "px";
        leftContainerStyle.style.minHeight = leftContainerStyleHeight + "px";
        leftContainerStyle.style.height = leftContainerStyleHeight + "px";
        temple.style.height = templeHeight + "px";
      }
    };

    setHeights();
    window.addEventListener("resize", setHeights);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // 模拟异步资源加载
    const simulateAsyncLoad = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1100)); // 模拟延迟
      setIsLoaded(true); // 设置加载完成
    };

    simulateAsyncLoad();
    document.addEventListener("mousedown", handleClickOutside);

    // 组件卸载时移除事件监听器

    return () => {
      window.removeEventListener("resize", setHeights);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div key={windowWidth} className="homeStyle">
      {isLoaded ? (
        <>
          <div className="homeStyleLeft">
            <div className="temple">
              <div className="leftContainerStyle">
                <div
                  className="language-toggle-container"
                  ref={languageContainerRef}
                >
                  <div
                    className="language-icon"
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
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
                      <button onClick={() => handleLanguageChange("en")}>
                        ENG
                      </button>
                      <button onClick={() => handleLanguageChange("zh")}>
                        中文
                      </button>
                    </div>
                  </CSSTransition>
                </div>
                <div className="templeT">
                  <div className="textGroupStyle">
                    <h1 className="titleGroupStyle">
                      <span className="YuStyle">Yifan </span>
                      <span className="AIOStyle">Yu</span>
                    </h1>
                    <p className="textDesc">{t("description1")} </p>
                    <p className="textDesc2">{t("description2")}</p>
                  </div>
                  <form
                    onSubmit={handleSubmit}
                    className="inputButtonContainerStyle"
                  >
                    <input
                      type="text"
                      placeholder={t("emailPlaceholder")}
                      className="inputStyle"
                    />
                    <button type="submit" className="buttonStyle">
                      {t("getUpdates")}
                    </button>
                  </form>
                  {/* <div className="GitHubStyle">
                    <img src="/img/ICON/GITHUB_GRAY.png" alt="GitHub Icon" style={{ width: '21px' }} />
                    <a href="https://github.com/yifanwow" target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'none' }}>
                      GitHub
                    </a>
                  </div> */}
                  <div className="Icons">
                    <SocialLinks />
                  </div>
                </div>
                <div className="Version">version 0.03</div>
              </div>
            </div>
          </div>
          <div style={{ width: "100vw" }}>
            <div className="rightContainerStyle">
              {projects.map((project) => (
                <Project key={project.id} {...project} />
              ))}
            </div>
          </div>
          <ProfileBackgroundBig/>
        </>
      ) : (
        <div className="loader-container">
          <div className="custom-loader"></div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
