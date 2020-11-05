import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Element, scroller } from 'react-scroll';
import { Skeleton } from 'antd';
import { Option, DevToolsSelect } from '../Option/Option';

import styles from './ConsolePage.module.css';
import devStyles from '../DevToolsWindow.module.css';

// copied from 'client/src/index.tsx'
type ConsoleMessage = {
	value: string;
	time: number;
	type: string;
};

enum ConsoleType {
	Log,
	Debug,
	Error,
	Warn,
}

export const ConsolePage = ({
	time,
	onSwitchPage,
}: {
	time: number;
	onSwitchPage: () => void;
}) => {
	const [currentMessage, setCurrentMessage] = useState(-1);
	const [options, setOptions] = useState<Array<string>>([]);
	const [parsedMessages, setParsedMessages] = useState<
		undefined | Array<ConsoleMessage & { selected?: boolean; id: number }>
	>([]);
	const [consoleType, setConsoleType] = useState<string>('All');
	const { session_id } = useParams<{ session_id: string }>();
	const { data, loading } = useQuery<
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
		const base = parsedMessages?.map((o) => o.type) ?? [];
		const uniqueSet = new Set(base);
		setOptions(['All', ...Array.from(uniqueSet)]);
	}, [parsedMessages]);

	useEffect(() => {
		setParsedMessages(
			rawMessages?.map((m, i) => {
				return { ...m, id: i };
			})
		);
	}, [rawMessages]);

	// Logic for scrolling to current entry.
	useEffect(() => {
		if (parsedMessages?.length) {
			var msgIndex: number = 0;
			var msgDiff: number = Math.abs(time - parsedMessages[0].time);
			for (var i = 0; i < parsedMessages.length; i++) {
				const currentDiff: number = Math.abs(
					time - parsedMessages[i].time
				);
				if (currentDiff < msgDiff) {
					msgIndex = i;
					msgDiff = currentDiff;
				}
			}
			if (currentMessage !== msgIndex) {
				setCurrentMessage(msgIndex);
				scroller.scrollTo(msgIndex.toString(), {
					smooth: true,
					containerId: 'logStreamWrapper',
					spy: true,
				});
			}
		}
	}, [currentMessage, time, parsedMessages]);

	const currentMessages = parsedMessages?.filter((m) => {
		// if the console type is 'all', let all messages through. otherwise, filter.
		if (consoleType === 'All') {
			return true;
		} else if (m.type === consoleType) {
			return true;
		}
		return false;
	});

	return (
		<div className={styles.consolePageWrapper}>
			<div className={devStyles.topBar}>
				<div className={devStyles.optionsWrapper}>
					{options.map((o) => {
						return (
							<Option
								onSelect={() => setConsoleType(o)}
								selected={o === consoleType}
								optionValue={o}
							/>
						);
					})}
				</div>
				<DevToolsSelect
					onSelect={() => onSwitchPage()}
					isConsole={true}
				/>
			</div>
			<div className={styles.consoleStreamWrapper} id="logStreamWrapper">
				{loading ? (
					<div className={devStyles.skeletonWrapper}>
						<Skeleton active />
					</div>
				) : currentMessages?.length ? (
					currentMessages
						.filter((m) => m.value.length)
						.map((m) => {
							return (
								<Element
									name={m.id.toString()}
									key={m.id.toString()}
								>
									<div
										className={styles.consoleMessage}
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
													m.id === currentMessage
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
										<div className={styles.messageText}>
											{typeof m.value === 'string' &&
												m.value}
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
	);
};
