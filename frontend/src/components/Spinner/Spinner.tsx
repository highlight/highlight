import React from 'react';
import { ImpulseSpinner } from 'react-spinners-kit';
import styles from './Spinner.module.css';

import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export const CircularSpinner = ({ style }: { style?: React.CSSProperties }) => {
    return (
        <Spin
            indicator={
                <LoadingOutlined style={{ fontSize: 24, ...style }} spin />
            }
        />
    );
};

export const Spinner: React.FC = (props) => {
    return (
        <div className={styles.spinnerStyle}>
            <ImpulseSpinner frontColor="#5629C6" backColor="#5629C6" />
        </div>
    );
};
