import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { ReactComponent as DownIcon } from '../../../static/down.svg';
import { ReactComponent as UpIcon } from '../../../static/up.svg';

import styles from './ConsolePage.module.css';

export const ConsolePage = ({ onClick }: { onClick: () => void }) => {
	const [showStream, setShowStream] = useState(false);
	const { session_id } = useParams<{ session_id: string }>();
	const { data } = useQuery<
		{ messages: ConsoleMessage[] },
		{ session_id: string }
	>(
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
			{data?.messages?.length && (
				<div className={styles.consolePageWrapper}>
					<div
						className={styles.consoleTopBar}
						style={{
							backgroundColor: showStream
								? 'white'
								: 'transparent',
						}}
					>
						<div
							onClick={() => {
								setShowStream(!showStream);
							}}
							className={styles.consoleButton}
						>
							Console{' '}
							{showStream ? (
								<DownIcon className={styles.directionIcon} />
							) : (
								<UpIcon className={styles.directionIcon} />
							)}
						</div>
					</div>
					{showStream && (
						<div className={styles.logStreamWrapper}>
							{data?.messages?.map((m) => {
								return (
									<div className={styles.consoleMessage}>
										{JSON.stringify(m.value)}
									</div>
								);
							})}
						</div>
					)}
				</div>
			)}
		</>
	);
};

// copied from 'client/src/index.tsx'
type ConsoleMessage = {
	value: IArguments;
	time: number;
	type: ConsoleType;
};

enum ConsoleType {
	Log,
	Debug,
	Error,
	Warn,
}
