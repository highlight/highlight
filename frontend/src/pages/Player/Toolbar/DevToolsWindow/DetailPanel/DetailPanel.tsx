import Button from '@components/Button/Button/Button';
import SvgArrowRightIcon from '@icons/ArrowRightIcon';
import { useDevToolsContext } from '@pages/Player/Toolbar/DevToolsContext/DevToolsContext';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import styles from './DetailPanel.module.scss';

const DetailPanel = () => {
    const { setPanelContent, panelContent } = useDevToolsContext();

    return (
        <AnimatePresence>
            {!panelContent ? null : (
                <motion.div
                    key="detailPanel"
                    className={styles.detailPanel}
                    initial={{ transform: 'translateX(100%)' }}
                    animate={{ transform: 'translateX(0%)' }}
                    exit={{ transform: 'translateX(100%)' }}
                >
                    <div className={styles.header}>
                        <h3 className={styles.title}>{panelContent.title}</h3>
                        <Button
                            trackingId="DevToolsDetailsPanel"
                            onClick={() => {
                                setPanelContent(undefined);
                            }}
                            iconButton
                            type="text"
                            className={styles.backButton}
                        >
                            <SvgArrowRightIcon />
                        </Button>
                    </div>

                    <div className={styles.contentContainer}>
                        {panelContent.content}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DetailPanel;
