import React from 'react';
import styles from './SearchCountBubble.module.scss';

const SearchCountBubble: React.FC = (props) => {
    return <div className={styles.bubble}>{props.children}</div>;
};

export default SearchCountBubble;
