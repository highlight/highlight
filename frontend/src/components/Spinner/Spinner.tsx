import React from 'react';
import BarLoader from 'react-spinners/BarLoader';

import styles from './Spinner.module.css';

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

export const Spinner: React.FC = () => {
    return (
        <div className={styles.spinnerStyle}>
            <BarLoader color={'#5629c6'} />
        </div>
    );
};
