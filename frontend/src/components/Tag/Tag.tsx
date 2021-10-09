import { adjustColorBrightness, convertHexToRGBA } from '@util/color/color';
import React from 'react';

import styles from './Tag.module.scss';

interface Props {
    backgroundColor: string;
}

const Tag: React.FC<Props> = ({ children, backgroundColor }) => {
    const borderColor = adjustColorBrightness(backgroundColor, -50);
    const backgroundColorWithOpacity = convertHexToRGBA(backgroundColor, 10);

    return (
        <div
            style={{
                borderColor: borderColor,
                backgroundColor: backgroundColorWithOpacity,
                color: borderColor,
            }}
            className={styles.tag}
        >
            {children}
        </div>
    );
};

export default Tag;
