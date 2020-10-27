import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { ReactComponent as CloseIcon } from '../../../../../static/close.svg';
import { Element } from 'react-scroll';
import { scroller } from 'react-scroll';

import styles from './ConsolePage.module.css';
import devStyles from '../DevToolsWindow.module.css';

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

export const ConsolePage = ({ time }: { time: number }) => {
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
		setParsedMessages(
			rawMessages?.map((m, i) => {
				return { ...m, id: i };
			})
		);
	}, [rawMessages]);

	useEffect(() => {
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
	}, [time, setCurrentMessage, parsedMessages]);

	const currentMessages = parsedMessages?.filter((m) => {
		// if the console type is 'all', let all messages through. otherwise, filter.
		if (consoleType === undefined) {
			return true;
		} else if (m.type === consoleType) {
			return true;
		}
		return false;
	});

	return (
		<>
			{data?.messages?.length ? (
				<div className={styles.consolePageWrapper}>
					<div className={devStyles.topBar}>
						<div className={devStyles.optionsWrapper}>
							<div
								className={devStyles.option}
								onClick={() => setConsoleType(undefined)}
								style={{
									backgroundColor:
										consoleType === undefined
											? '#5629c6'
											: '#f2eefb',
									color:
										consoleType === undefined
											? 'white'
											: '#5629c6',
								}}
							>
								ALL
							</div>
							<div
								className={devStyles.option}
								onClick={() => setConsoleType(ConsoleType.Log)}
								style={{
									backgroundColor:
										consoleType === ConsoleType.Log
											? '#5629c6'
											: '#f2eefb',
									color:
										consoleType === ConsoleType.Log
											? 'white'
											: '#5629c6',
								}}
							>
								LOG
							</div>
							<div
								className={devStyles.option}
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
											: '#5629c6',
								}}
							>
								ERROR
							</div>
							<div
								className={devStyles.option}
								onClick={() => setConsoleType(ConsoleType.Warn)}
								style={{
									backgroundColor:
										consoleType === ConsoleType.Warn
											? '#5629c6'
											: '#f2eefb',
									color:
										consoleType === ConsoleType.Warn
											? 'white'
											: '#5629c6',
								}}
							>
								WARN
							</div>
							<div
								className={devStyles.option}
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
											: '#5629c6',
								}}
							>
								DEBUG
							</div>
						</div>
					</div>
					<div
						className={devStyles.devToolsStreamWrapper}
						id="logStreamWrapper"
					>
						{currentMessages?.length ? (
							currentMessages
								.filter((m) => m.value.length)
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
												style={{
													color:
														m.id === currentMessage
															? 'black'
															: 'grey',
													fontWeight:
														m.id === currentMessage
															? 400
															: 300,
												}}
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
								})
						) : (
							<div className={devStyles.emptySection}>
								No logs for this section.
							</div>
						)}
					</div>
				</div>
			) : (
				<></>
			)}
		</>
	);
};
