import React, { useEffect, useRef, useState } from 'react';
import BIRDS from 'vanta/dist/vanta.halo.min';
import './ProfileBackground_big.css';

const ProfileBackground_big = () => {
    const vantaRef = useRef(null);
    const [vantaEffect, setVantaEffect] = useState(null);

    useEffect(() => {
        if (!vantaEffect) {
            const isPortrait = window.matchMedia("(orientation: portrait)").matches;
            const xOffset = isPortrait ? -1.39 : -0.5;
            const yOffset = isPortrait ? 0.13 : 0.13;
            const size = isPortrait ? 4.9 : 5.7;

            const effect = BIRDS({
                el: vantaRef.current,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                xOffset,
                yOffset,
                size,
                amplitudeFactor: 1.7,
                baseColor: 0x50f31,
                backgroundColor: 0x60318,
            });
            setVantaEffect(effect);
        }

        // 在加载时设置固定高度
        const setFixedHeight = () => {
            const profileBackground = document.querySelector('.profileBackground');
            const heightValue = profileBackground.clientHeight;// 获取视口高度
            profileBackground.style.height = heightValue + 'px';
            profileBackground.style.minHeight = heightValue + 'px'; // 设置固定高度
        };

        setFixedHeight(); // 初始设置

        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [vantaEffect]);

    return <div ref={vantaRef} className="profileBackground"></div>;
};

export default React.memo(ProfileBackground_big);
