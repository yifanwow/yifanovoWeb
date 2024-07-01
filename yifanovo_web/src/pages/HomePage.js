import React, { useEffect, useState} from "react";
import "bulma/css/bulma.css";
import "./HomePage.css";
import "./Loading.css";
import "./language.css";
import { useTranslation } from "react-i18next";
import Project from "../components/Project";
import SocialLinks from "../components/SocialLinks_en";
import SubscriptionForm from "../components/SubscriptionForm";
import ProfileBackgroundBig from "../components/ProfileBackground_big";
import LanguageToggle from "../components/LanguageToggle"; // 引入 LanguageToggle

function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState([]); // 根据当前设定的项目数据

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

    // 组件卸载时移除事件监听器

    return () => {
      window.removeEventListener("resize", setHeights);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div key={windowWidth} className="homeStyle">
      {isLoaded ? (
        <>
          <div className="homeStyleLeft">
            <div className="temple">
              <div className="leftContainerStyle">
                <LanguageToggle /> {/* 使用 LanguageToggle 组件 */}
                <div className="templeT">
                  <div className="textGroupStyle">
                    <h1 className="titleGroupStyle">
                      <span className="YuStyle">Yifan </span>
                      <span className="AIOStyle">Yu</span>
                    </h1>
                    <p className="textDesc">{t("description1")} </p>
                    <p className="textDesc2">{t("description2")}</p>
                  </div>
                  <SubscriptionForm /> {/* 使用 SubscriptionForm 组件 */}
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
          <ProfileBackgroundBig />
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
