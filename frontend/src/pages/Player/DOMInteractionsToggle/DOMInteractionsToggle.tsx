import React from 'react';

import Switch from '../../../components/Switch/Switch';
import Tooltip from '../../../components/Tooltip/Tooltip';
import usePlayerConfiguration from '../PlayerHook/utils/usePlayerConfiguration';
import styles from './DOMInteractionsToggle.module.scss';

const DOMInteractionsToggle = () => {
    const { enableInspectElement, setEnableInspectElement } =
        usePlayerConfiguration();

    return (
        <Tooltip
            title={`Enabling Inspect Element allows you to inspect the DOM in the player. You can use the browser DevTools like Elements to debug layout and other CSS issues. Get started by right clicking in the player and click "Inspect".`}
        >
            <div className={styles.container}>
                <Switch
                    label="Inspect Element"
                    checked={enableInspectElement}
                    onChange={() => {
                        setEnableInspectElement(!enableInspectElement);
                    }}
                    trackingId="DOMInteractions"
                />{' '}
            </div>
        </Tooltip>
    );
};

export default DOMInteractionsToggle;
