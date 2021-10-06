import PanelToggleButton from '@pages/Player/components/PanelToggleButton/PanelToggleButton';
import { usePlayerUIContext } from '@pages/Player/context/PlayerUIContext';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { Resizable } from 're-resizable';
import React from 'react';

import styles from './DetailPanel.module.scss';

const DetailPanel = () => {
    const { detailedPanel, setDetailedPanel } = usePlayerUIContext();

    return (
        <AnimatePresence>
            {!detailedPanel ? null : (
                <Resizable
                    enable={{ left: true }}
                    className={styles.resizeContainer}
                    defaultSize={{
                        width: '350',
                        height: '100%',
                    }}
                    minWidth="300"
                    maxWidth="90vw"
                    handleComponent={{
                        left: (
                            <div
                                className={classNames(styles.dragHandle)}
                            ></div>
                        ),
                    }}
                    handleWrapperClass={classNames(styles.dragHandleWrapper)}
                >
                    <motion.div
                        key="detailPanel"
                        className={styles.detailPanel}
                        initial={{ transform: 'translateX(110%)' }}
                        animate={{ transform: 'translateX(0%)' }}
                        exit={{ transform: 'translateX(110%)' }}
                    >
                        <PanelToggleButton
                            className={classNames(styles.toggleButton)}
                            direction="right"
                            isOpen={true}
                            onClick={() => {
                                setDetailedPanel(undefined);
                            }}
                        />
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
                </Resizable>
            )}
        </AnimatePresence>
    );
};

export default DetailPanel;
