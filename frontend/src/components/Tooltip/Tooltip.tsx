import {
    // Disabling here because we are using this file as a proxy.
    // eslint-disable-next-line no-restricted-imports
    Tooltip as AntDesignTooltip,
    TooltipProps as AntDesignTooltipProps,
} from 'antd';
import React from 'react';

import styles from './Tooltip.module.scss';

type TooltipProps = Pick<
    AntDesignTooltipProps,
    'title' | 'placement' | 'align' | 'arrowPointAtCenter' | 'overlayStyle'
>;

/**
 * A proxy for Ant Design's tooltip. This component should be used instead of directly using Ant Design's.
 */
const Tooltip: React.FC<TooltipProps> = ({ children, ...props }) => {
    return (
        <AntDesignTooltip
            {...props}
            overlayClassName={styles.tooltipOverlay}
            title={props.title}
        >
            {children}
        </AntDesignTooltip>
    );
};

export default Tooltip;
