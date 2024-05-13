import React, { useEffect, useRef, useState } from 'react';
import BIRDS from 'vanta/dist/vanta.halo.min';
import './ProfileBackground_big.css';

const ProfileBackground_big = () => {
    const vantaRef = useRef(null);
    const [vantaEffect, setVantaEffect] = useState(null);

    useEffect(() => {
        const updateVanta = () => {
            // 销毁现有的Vanta实例
            if (vantaEffect) vantaEffect.destroy();

            // 根据屏幕尺寸设置xOffset和yOffset
            const isPortrait = window.matchMedia("(orientation: portrait)").matches;
            const xOffset = isPortrait ? -1.39 : -0.5;
            const yOffset = isPortrait ? 0.13 : 0.13;
            const size = isPortrait ? 5.1 : 5.7;
            // 创建新的Vanta实例
            setVantaEffect(BIRDS({
                el: vantaRef.current,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                xOffset,
                yOffset,
                size,
                amplitudeFactor: 3,
                baseColor: 0x50f31,
                backgroundColor: 0x60318,
            }));
        };

        updateVanta();

        // 重设Vanta效果当屏幕方向改变时
        window.addEventListener('orientationchange', updateVanta);
        return () => {
            if (vantaEffect) vantaEffect.destroy();
            window.removeEventListener('orientationchange', updateVanta);
        };
    }, []);

    return <div ref={vantaRef} className="profileBackground"></div>;
};

export default React.memo(ProfileBackground_big);
