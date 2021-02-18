import React, { useEffect } from 'react';
import Avatars from '@dicebear/avatars';
import sprites from '@dicebear/avatars-avataaars-sprites';

export const Avatar = ({
    style,
    seed,
}: {
    style?: React.CSSProperties;
    seed: string;
}) => {
    const imageRef = React.useRef<HTMLImageElement>(null);
    useEffect(() => {
        if (imageRef.current) {
            const avatars = new Avatars(sprites, {
                style: 'circle',
                background: '#5629c6',
                eyes: ['default'],
                skin: ['tanned', 'yellow', 'pale', 'light'],
                eyebrow: ['default'],
                mouth: ['smile'],
                top: ['hat', 'longHair', 'shortHair'],
            });
            const svg = avatars.create(seed);
            imageRef.current.src = `data:image/svg+xml;utf8,${encodeURIComponent(
                svg
            )}`;
        }
    }, [seed]);
    return <img alt="" style={style} ref={imageRef} />;
};
