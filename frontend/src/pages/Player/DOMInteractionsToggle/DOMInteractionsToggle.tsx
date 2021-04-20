import useLocalStorage from '@rehooks/local-storage';
import { Switch } from 'antd';
import React from 'react';
import styles from './DOMInteractionsToggle.module.scss';

const DOMInteractionsToggle = () => {
    const [enableDOMInteractions, setEnableDOMInteractions] = useLocalStorage(
        'highlightMenuEnableDOMInteractions',
        false
    );

    return (
        <div className={styles.container}>
            <Switch
                checked={enableDOMInteractions}
                onChange={() => {
                    setEnableDOMInteractions(!enableDOMInteractions);
                }}
            />{' '}
            DOM Interactions
        </div>
    );
};

export default DOMInteractionsToggle;
