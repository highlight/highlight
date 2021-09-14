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
} & Pick<
    AlertProps,
    'description' | 'type' | 'onClose' | 'message' | 'className'
>;

const Alert = ({ trackingId, ...props }: Props) => {
    const [temporarilyHideAlert, setTemporarilyHideAlert] = useSessionStorage(
        'highlightHideAlert',
        false
    );

    if (temporarilyHideAlert) {
        return null;
    }

    return (
        <AntDesignAlert
            {...props}
            className={classNames(props.className, styles.alert)}
            closable
            showIcon
            closeText={<SvgXIcon />}
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
