import React from 'react';
import BarLoader from 'react-spinners/BarLoader';

import styles from './Spinner.module.scss';

import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export const CircularSpinner = ({ style }: { style?: React.CSSProperties }) => {
    return (
        <Spin
            indicator={
                <LoadingOutlined
                    style={{
                        fontSize: 24,
                        ...style,
                    }}
                    spin
                />
            }
        />
    );
};

export const Spinner = ({ width }: { width?: string | number }) => {
    return (
        <div className={styles.spinnerWrapper}>
            <div
                className={styles.spinnerStyle}
                style={{ width: width || 100 }}
            >
                <BarLoader color={'#5629c6'} />
            </div>
        </div>
    );
};
