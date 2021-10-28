import { LoadingOutlined } from '@ant-design/icons';
import SvgHighlightLogoWithNoBackground from '@icons/HighlightLogoWithNoBackground';
import { Spin } from 'antd';
import { motion } from 'framer-motion';
import React from 'react';
import BarLoader from 'react-spinners/BarLoader';

import styles from './Loading.module.scss';

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

export const LoadingBar = ({ width }: { width?: string | number }) => {
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

export const LoadingPage = React.memo(() => {
    return (
        <div className={styles.loadingWrapper}>
            <motion.div
                className={styles.logoContainer}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    repeatType: 'mirror',
                }}
                initial={{ scale: 1 }}
                animate={{ scale: 0.6 }}
                exit={{ scale: 1 }}
            >
                <motion.div
                    className={styles.logo}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 1.5 }}
                    transition={{ duration: 0.5 }}
                >
                    <SvgHighlightLogoWithNoBackground />
                </motion.div>
                <motion.div
                    className={styles.logoBackground}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.5 }}
                />
            </motion.div>
        </div>
    );
});
