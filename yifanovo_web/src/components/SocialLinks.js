import React, { useState, useRef, useEffect } from 'react';
import { GitHubIcon, InstagramIcon, WeChatIcon, SteamIcon } from './Icons';
import './Icons.css'; // 引入样式文件

const SocialLinks = () => {
    const [showWeChatImage, setShowWeChatImage] = useState(false);
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
                GitHub
            </a>
            <a href="https://instagram.com/yifanovo_" target="_blank" rel="noopener noreferrer" className="InstagramStyle">
                <InstagramIcon />
                Instagram
            </a>
            <a href="https://steamcommunity.com/id/yifanovo/" target="_blank" rel="noopener noreferrer" className="SteamStyle">
                <SteamIcon />
                Steam
            </a>
            <div className="WeChatContainer" ref={weChatRef} onMouseEnter={handleWeChatMouseEnter} onMouseLeave={handleWeChatMouseLeave}>
                <a href="#" className="WeChatStyle">
                    <WeChatIcon />
                    WeChat Public
                </a>
                <img src="/img/wechat.jpg" alt="WeChat QR Code" className={`WeChatImage ${showWeChatImage ? 'visible' : ''}`} />
            </div>

        </div>
    );
};

export default SocialLinks;
