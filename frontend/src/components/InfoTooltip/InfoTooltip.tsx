import { Tooltip } from 'antd';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import React from 'react';

import SvgInformationIcon from '../../static/InformationIcon';
import styles from './InfoTooltip.module.scss';

type Props = Pick<
    TooltipPropsWithTitle,
    'title' | 'placement' | 'className' | 'align' | 'visible'
>;

const InfoTooltip = ({ ...props }: Props) => {
    if (props.title == undefined) {
        return null;
    }

    return (
        <Tooltip
            {...props}
            overlayClassName={styles.tooltip}
            mouseEnterDelay={0}
        >
            <SvgInformationIcon />
        </Tooltip>
    );
};

export default InfoTooltip;
