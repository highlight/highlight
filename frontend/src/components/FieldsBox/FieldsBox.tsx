import React from 'react';

import styles from './FieldsBox.module.scss';

export const FieldsBox: React.FC = ({ children }) => {
    return <div className={styles.fieldsBox}>{children}</div>;
};
