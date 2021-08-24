import { Alert as AntDesignAlert, AlertProps } from 'antd';
import classNames from 'classnames';
import { H } from 'highlight.run';
import React, { useState } from 'react';

import SvgCloseIcon from '../../static/CloseIcon';
import SvgInformationIcon from '../../static/InformationIcon';
import styles from './Alert.module.scss';

type Props = {
    trackingId: string;
} & Pick<
    AlertProps,
    'description' | 'type' | 'onClose' | 'message' | 'className'
>;

const Alert = ({ trackingId, ...props }: Props) => {
    const [showAlert, setShowAlert] = useState(true);

    if (!showAlert) {
        return null;
    }

    return (
        <AntDesignAlert
            {...props}
            className={classNames(props.className, styles.alert)}
            closable
            showIcon
            closeText={<SvgCloseIcon />}
            icon={<SvgInformationIcon />}
            onClose={(e) => {
                if (props.onClose) {
                    props.onClose(e);
                }
                H.track(`AlertClose-${trackingId}`);
                setShowAlert(false);
            }}
        ></AntDesignAlert>
    );
};

export default Alert;
