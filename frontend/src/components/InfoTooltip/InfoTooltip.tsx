import { Tooltip } from 'antd';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import React from 'react';

import SvgInformationIcon from '../../static/InformationIcon';
import styles from './InfoTooltip.module.scss';

type Props = Pick<TooltipPropsWithTitle, 'title' | 'placement' | 'className'>;

const InfoTooltip = ({ ...props }: Props) => {
    return (
        <Tooltip {...props} overlayClassName={styles.tooltip}>
            <SvgInformationIcon />
        </Tooltip>
    );
};

export default InfoTooltip;
