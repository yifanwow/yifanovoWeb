import React, { useEffect, useRef, useState } from 'react';
import BIRDS from 'vanta/dist/vanta.halo.min';
import './ProfileBackground_big.css';

const ProfileBackground_big = () => {
    const vantaRef = useRef(null);
    const [vantaEffect, setVantaEffect] = useState(null);

    const initializeVantaEffect = () => {
        const isPortrait = window.matchMedia("(orientation: portrait)").matches;
        const xOffset = isPortrait ? -1.39 : -0.5;
        const yOffset = isPortrait ? 0.13 : 0.13;
        const size = isPortrait ? 5.1 : 5.7;

        if (vantaEffect) {
            vantaEffect.setOptions({
                xOffset,
                yOffset,
                size
            });
        } else {
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
    };

    useEffect(() => {
        initializeVantaEffect();

        const handleResize = () => {
            initializeVantaEffect();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            if (vantaEffect) vantaEffect.destroy();
            window.removeEventListener('resize', handleResize);
        };
    }, [vantaEffect]); // 依赖vantaEffect，确保effect实例被更新时也能重新初始化

    return <div ref={vantaRef} className="profileBackground"></div>;
};

export default React.memo(ProfileBackground_big);
