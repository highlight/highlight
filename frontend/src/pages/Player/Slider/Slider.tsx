import React, { useRef } from 'react';
import styles from './Slider.module.css';

export const Slider = ({
    max,
    current,
    onSelect,
}: {
    max: number;
    current: number;
    onSelect: (newTime: number) => void;
}) => {
    const sliderWrapperRef = useRef<HTMLDivElement>(null);
    const wrapperWidth =
        sliderWrapperRef.current?.getBoundingClientRect().width ?? 1;
    const timePercentage = (current / max) * 100;
    const indicatorStyle = `min(${
        timePercentage.toString() + '%'
    }, ${wrapperWidth}px - 15px)`;
    return (
        <div
            className={styles.sliderWrapper}
            ref={sliderWrapperRef}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                const ratio = e.clientX / wrapperWidth;
                onSelect(ratio * max);
            }}
        >
            <div className={styles.sliderRail}></div>
            <div
                className={styles.indicator}
                style={{
                    marginLeft: indicatorStyle,
                }}
            />
        </div>
    );
};
