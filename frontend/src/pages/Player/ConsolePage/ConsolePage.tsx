import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { ReactComponent as DownIcon } from '../../../static/down.svg';
import { ReactComponent as UpIcon } from '../../../static/up.svg';
import { ReactComponent as CloseIcon } from '../../../static/close.svg';
import { Element } from 'react-scroll';
import { scroller } from 'react-scroll';

import styles from './ConsolePage.module.css';

export const ConsolePage = ({
	onClick,
	time,
}: {
	onClick: () => void;
	time: number;
}) => {
	const [showStream, setShowStream] = useState(false);
	const [currentMessage, setCurrentMessage] = useState(-1);
	const [parsedMessages, setParsedMessages] = useState<
		undefined | Array<ConsoleMessage & { selected?: boolean; id: number }>
	>([]);
	const [consoleType, setConsoleType] = useState<ConsoleType | undefined>(
		undefined
	);
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

	const rawMessages = data?.messages;

	useEffect(() => {
		onClick();
	}, [showStream, onClick]);

	useEffect(() => {
		setParsedMessages(
			rawMessages?.map((m, i) => {
				return { ...m, id: i };
			})
		);
	}, [rawMessages]);

	useEffect(() => {
		if (showStream) {
			parsedMessages?.map((m, i) => {
				if (m.time < time + 200 && m.time > time - 200) {
					setCurrentMessage(i);
					scroller.scrollTo(i.toString(), {
						smooth: true,
						containerId: 'logStreamWrapper',
						spy: true,
					});
				}
			});
		}
	}, [time, setCurrentMessage]);

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
							className={styles.consoleOptionsWrapper}
							style={{
								visibility: showStream ? 'visible' : 'hidden',
							}}
						>
							<div
								className={styles.consoleOption}
								onClick={() => setConsoleType(undefined)}
								style={{
									backgroundColor:
										consoleType === undefined
											? '#5629c6'
											: '#f2eefb',
									color:
										consoleType === undefined
											? 'white'
											: 'black',
								}}
							>
								ALL
							</div>
							<div
								className={styles.consoleOption}
								onClick={() => setConsoleType(ConsoleType.Log)}
								style={{
									backgroundColor:
										consoleType === ConsoleType.Log
											? '#5629c6'
											: '#f2eefb',
									color:
										consoleType === ConsoleType.Log
											? 'white'
											: 'black',
								}}
							>
								LOG
							</div>
							<div
								className={styles.consoleOption}
								onClick={() =>
									setConsoleType(ConsoleType.Error)
								}
								style={{
									backgroundColor:
										consoleType === ConsoleType.Error
											? '#5629c6'
											: '#f2eefb',
									color:
										consoleType === ConsoleType.Error
											? 'white'
											: 'black',
								}}
							>
								ERROR
							</div>
							<div
								className={styles.consoleOption}
								onClick={() => setConsoleType(ConsoleType.Warn)}
								style={{
									backgroundColor:
										consoleType === ConsoleType.Warn
											? '#5629c6'
											: '#f2eefb',
									color:
										consoleType === ConsoleType.Warn
											? 'white'
											: 'black',
								}}
							>
								WARN
							</div>
							<div
								className={styles.consoleOption}
								onClick={() =>
									setConsoleType(ConsoleType.Debug)
								}
								style={{
									backgroundColor:
										consoleType === ConsoleType.Debug
											? '#5629c6'
											: '#f2eefb',
									color:
										consoleType === ConsoleType.Debug
											? 'white'
											: 'black',
								}}
							>
								DEBUG
							</div>
						</div>
						{showStream ? (
							<div
								className={styles.closeIconWrapper}
								onClick={() => {
									setShowStream(!showStream);
								}}
							>
								<CloseIcon className={styles.closeIcon} />
							</div>
						) : (
							<div className={styles.consoleButtonWrapper}>
								<div
									onClick={() => {
										setShowStream(!showStream);
									}}
									className={styles.consoleButton}
								>
									CONSOLE
								</div>
							</div>
						)}
					</div>
					{showStream && (
						<div
							className={styles.logStreamWrapper}
							id="logStreamWrapper"
						>
							{parsedMessages
								?.filter((m) => {
									if (consoleType === undefined) {
										return true;
									} else if (m.type === consoleType) {
										return true;
									}
									return false;
								})
								.map((m) => {
									return (
										<Element
											name={m.id.toString()}
											key={m.id.toString()}
										>
											<div
												className={
													styles.consoleMessage
												}
											>
												<div
													className={
														styles.currentIndicatorWrapper
													}
													style={{
														visibility:
															m.id ===
															currentMessage
																? 'visible'
																: 'hidden',
													}}
												>
													<div
														className={
															styles.currentIndicator
														}
													/>
												</div>
												<div>
													{typeof m.value ===
														'string' && m.value}
												</div>
											</div>
										</Element>
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
	value: string;
	time: number;
	type: ConsoleType;
};

enum ConsoleType {
	Log,
	Debug,
	Error,
	Warn,
}
