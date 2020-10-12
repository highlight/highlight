import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';

import styles from './ConsolePage.module.css';

export const ConsolePage = ({ onClick }: { onClick: () => void }) => {
	const [showStream, setShowStream] = useState(false);
    const { session_id } = useParams();
    const {
        loading,
        error,
        data,
    } = useQuery<{ events: any[] }, { session_id: string }>(
        gql`
            query GetEvents($session_id: ID!) {
                messages(session_id: $session_id)
            }
        `,
        { variables: { session_id } }
    );

	useEffect(() => {
		onClick();
	}, [showStream, onClick]);

	return (
		<>
			{showStream && (
				<div className={styles.logStreamWrapper}>
			{JSON.stringify(data)}
				</div>
			)}
			<div
				onClick={() => {
					setShowStream(!showStream);
				}}
				className={styles.consoleButton}
			>
				Console
			</div>
		</>
	);
};
