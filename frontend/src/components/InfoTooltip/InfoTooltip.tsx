import { Tooltip } from 'antd';
import { TooltipPropsWithTitle } from 'antd/lib/tooltip';
import React from 'react';

import SvgInformationIcon from '../../static/InformationIcon';

type Props = Pick<TooltipPropsWithTitle, 'title' | 'placement'>;

const InfoTooltip = ({ ...props }: Props) => {
    return (
        <Tooltip {...props}>
            <SvgInformationIcon />
        </Tooltip>
    );
};

export default InfoTooltip;
