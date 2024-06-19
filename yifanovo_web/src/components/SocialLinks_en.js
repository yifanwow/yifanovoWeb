import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { GitHubIcon, InstagramIcon, WeChatIcon, SteamIcon, XiaohongshuIcon } from './Icons';
import './Icons.css'; // 引入样式文件

const SocialLinks = () => {
    const [showWeChatImage, setShowWeChatImage] = useState(false);
    const { t } = useTranslation();
    const weChatRef = useRef(null);

    const handleWeChatMouseEnter = () => {
        setShowWeChatImage(true);
    };

    const handleWeChatMouseLeave = () => {
        setShowWeChatImage(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (weChatRef.current && !weChatRef.current.contains(event.target)) {
                setShowWeChatImage(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [weChatRef]);

    return (
        <div className="Icons">
            <a href="https://github.com/yifanwow" target="_blank" rel="noopener noreferrer" className="GitHubStyle">
                <GitHubIcon />
                {t('GitHub')}
            </a>
            <a href="https://instagram.com/yifanovo_" target="_blank" rel="noopener noreferrer" className="InstagramStyle">
                <InstagramIcon />
                {t('Instagram')}
            </a>

            <a href="https://steamcommunity.com/id/yifanovo/" target="_blank" rel="noopener noreferrer" className="InstagramStyle">
                <SteamIcon />
                {t('Steam')}
            </a>
            <a href="https://www.xiaohongshu.com/user/profile/5b2eb172f7e8b940e52e00c2" target="_blank" rel="noopener noreferrer" className="InstagramStyle">
                <XiaohongshuIcon />
                {t('Xiaohongshu')}
            </a>
            <div className="WeChatContainer" ref={weChatRef} onMouseEnter={handleWeChatMouseEnter} onMouseLeave={handleWeChatMouseLeave}>
                <a href="#" className="WeChatStyle">
                    <WeChatIcon />
                    {t('WeChat Public')}
                </a>
                <img src="/img/wechat.jpg" alt="WeChat QR Code" className={`WeChatImage ${showWeChatImage ? 'visible' : ''}`} />
            </div>

        </div>
    );
};

export default SocialLinks;
