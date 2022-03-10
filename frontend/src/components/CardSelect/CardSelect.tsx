import SvgCheckmarkIcon from '@icons/CheckmarkIcon';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import styles from './CardSelect.module.scss';

type Props = {
    title: string;
    description: string;
    onClick: () => void;
    isSelected: boolean;
};

const CardSelect = ({ description, isSelected, onClick, title }: Props) => {
    return (
        <button onClick={onClick} type="button" className={styles.button}>
            <AnimatePresence>
                {isSelected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className={styles.icon}
                    >
                        <SvgCheckmarkIcon />
                    </motion.div>
                )}
            </AnimatePresence>

            <h4>{title}</h4>
            <p>{description}</p>
        </button>
    );
};

export default CardSelect;
