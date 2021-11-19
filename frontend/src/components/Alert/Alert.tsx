import SvgXIcon from '@icons/XIcon';
import { Alert as AntDesignAlert, AlertProps } from 'antd';
import classNames from 'classnames';
import { H } from 'highlight.run';
import React from 'react';
import { useSessionStorage } from 'react-use';

import SvgInformationIcon from '../../static/InformationIcon';
import styles from './Alert.module.scss';

type Props = {
    trackingId: string;
    closable?: boolean;
    shouldAlwaysShow?: boolean;
} & Pick<
    AlertProps,
    'description' | 'type' | 'onClose' | 'message' | 'className'
>;

const Alert = ({
    trackingId,
    closable,
    shouldAlwaysShow = false,
    type = 'info',
    ...props
}: Props) => {
    const [temporarilyHideAlert, setTemporarilyHideAlert] = useSessionStorage(
        `highlightHideAlert-${trackingId}`,
        false
    );

    if (temporarilyHideAlert && !shouldAlwaysShow) {
        return null;
    }

    return (
        <AntDesignAlert
            {...props}
            type={type}
            className={classNames(props.className, styles.alert)}
            closable={closable != null ? closable : true}
            showIcon
            closeText={(closable != null ? closable : true) && <SvgXIcon />}
            icon={<SvgInformationIcon />}
            onClose={(e) => {
                if (props.onClose) {
                    props.onClose(e);
                }
                H.track(`AlertClose-${trackingId}`);
                setTemporarilyHideAlert(true);
            }}
        ></AntDesignAlert>
    );
};

export default Alert;
