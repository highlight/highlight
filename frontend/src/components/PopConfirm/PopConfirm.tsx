import { Popconfirm as AntDesignPopconfirm, PopconfirmProps } from 'antd';
import React from 'react';

import styles from './PopConfirm.module.scss';

type Props = Pick<
    PopconfirmProps,
    | 'cancelText'
    | 'okText'
    | 'children'
    | 'title'
    | 'onConfirm'
    | 'onCancel'
    | 'placement'
    | 'align'
>;

const PopConfirm = ({ children, ...props }: Props) => {
    return (
        <AntDesignPopconfirm
            {...props}
            icon={null}
            overlayClassName={styles.popConfirmContainer}
        >
            {children}
        </AntDesignPopconfirm>
    );
};

export default PopConfirm;
