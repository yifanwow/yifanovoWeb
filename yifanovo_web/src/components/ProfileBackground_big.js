import React, { useEffect, useRef, useState } from 'react';
import BIRDS from 'vanta/dist/vanta.halo.min';
import './ProfileBackground_big.css';

const ProfileBackground_big = () => {
    const vantaRef = useRef(null);
    const [vantaEffect, setVantaEffect] = useState(null);

    useEffect(() => {
        // 在组件加载时初始化Vanta.js效果
        if (!vantaEffect) {
            const isPortrait = window.matchMedia("(orientation: portrait)").matches;
            const xOffset = isPortrait ? -1.39 : -0.5;
            const yOffset = isPortrait ? 0.13 : 0.13;
            const size = isPortrait ? 5.1 : 5.7;
            
            const effect = BIRDS({
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
            });

            setVantaEffect(effect);
        }

        // 清理函数，仅当组件卸载时销毁Vanta.js实例
        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, []); // 空依赖数组，确保仅在组件挂载时执行一次

    return <div ref={vantaRef} className="profileBackground"></div>;
};

export default React.memo(ProfileBackground_big);
