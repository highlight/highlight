import React, { useState, useRef, useEffect } from 'react';
import styles from './ConsolePage.module.css';

export const ConsolePage = () => {
	const [showStream, setShowStream] = useState(true);
	return (
		<>
			{showStream && <div className={styles.logStreamWrapper}>hi</div>}
			<div onClick={() => setShowStream(!showStream)} className={styles.consoleButton}>Console</div>
		</>
	);
};
