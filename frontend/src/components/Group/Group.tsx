import React from 'react';

import styles from './Group.module.scss';

const Group: React.FC<
    React.PropsWithChildren<React.PropsWithChildren<unknown>>
> = ({ children }) => {
    return <div className={styles.group}>{children}</div>;
};

export default Group;
