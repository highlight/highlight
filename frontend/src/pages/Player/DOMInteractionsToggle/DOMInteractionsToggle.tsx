import useLocalStorage from '@rehooks/local-storage';
import { Switch } from 'antd';
import React from 'react';

import Tooltip from '../../../components/Tooltip/Tooltip';
import styles from './DOMInteractionsToggle.module.scss';

const DOMInteractionsToggle = () => {
    const [enableDOMInteractions, setEnableDOMInteractions] = useLocalStorage(
        'highlightMenuEnableDOMInteractions',
        false
    );

    return (
        <Tooltip
            title={`Enabling DOM interactions allows you to inspect the DOM in the player. You can use the browser DevTools like Elements to debug layout and other CSS issues. Get started by right clicking in the player and click "Inspect".`}
        >
            <div className={styles.container}>
                <Switch
                    checked={enableDOMInteractions}
                    onChange={() => {
                        setEnableDOMInteractions(!enableDOMInteractions);
                    }}
                />{' '}
                DOM interactions
            </div>
        </Tooltip>
    );
};

export default DOMInteractionsToggle;
