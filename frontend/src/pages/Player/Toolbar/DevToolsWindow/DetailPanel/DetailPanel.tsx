import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import styles from './DetailPanel.module.scss';

const DetailPanel = () => {
    const { detailedPanel } = usePlayerUIContext();

    return (
        <AnimatePresence>
            {!detailedPanel ? null : (
                <motion.div
                    key="detailPanel"
                    className={styles.detailPanel}
                    initial={{ transform: 'translateX(105%)' }}
                    animate={{ transform: 'translateX(0%)' }}
                    exit={{ transform: 'translateX(105%)' }}
                >
                    {!detailedPanel.options?.noHeader && (
                        <div className={styles.header}>
                            <h3 className={styles.title}>
                                {detailedPanel.title}
                            </h3>
                        </div>
                    )}

                    <div className={styles.contentContainer}>
                        {detailedPanel.content}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DetailPanel;
