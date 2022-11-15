import React, { useEffect, useState } from 'react'
import './App.css'
import 'antd/dist/antd.css' // or 'antd/dist/antd.less'
import { FaCopy } from 'react-icons/fa'

import { useChromeStorageLocal } from 'use-chrome-storage'
import { InputNumber, Checkbox, message } from 'antd'
import { useClipboard } from 'use-clipboard-copy'

const Core = () => {
	const [tabId, setTabId] = useState(-1)

	useEffect(() => {
		chrome.tabs.query(
			{ active: true, currentWindow: true },
			function (tabs) {
				const tab = tabs[0]
				setTabId(tab.id ?? -1)
			},
		)
	})

	if (tabId <= 0) {
		return <p>loading</p>
	}
	return <TabApp id={tabId} />
}

const TabApp = ({ id }: { id: number }) => {
	const [recordingDetails, setRecordingDetails] = useChromeStorageLocal(
		`_highlightIsRecording/${id}`,
		'',
	)
	const clipboard = useClipboard()

	const sendMessageToPageScript = (
		payload: { [text: string]: string },
		callback?: (response: { [text: string]: string }) => void,
	) => {
		chrome.tabs.query(
			{ active: true, currentWindow: true },
			function (tabs) {
				const tab = tabs[0]
				// query the active tab, which will be only one tab
				//and inject the script in it
				chrome.tabs.sendMessage(tab?.id ?? 0, payload, (resp) => {
					callback && callback(resp)
				})
			},
		)
	}

	return (
		<div
			className="App"
			style={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				width: '100%',
			}}
		>
			<h2>Welcome to Highlight!</h2>
			{recordingDetails ? (
				<>
					<div
						style={{
							display: 'flex',
							flexDirection: 'row',
							alignItems: 'center',
						}}
					>
						<h3 style={{ marginBottom: 0 }}>Recording Session</h3>
						<Dot />
					</div>
					<p style={{ marginTop: 10, color: 'grey' }}>
						This session is being recorded! You can view the
						recording{' '}
						<a
							target={'_blank'}
							href={'https://' + recordingDetails.url}
							rel="noreferrer"
						>
							here
						</a>
						, or copy the link below.
					</p>
					<div
						style={{
							width: '100%',
							display: 'flex',
							alignItems: 'center',
							backgroundColor: '#eeeeee',
							borderRadius: 4,
							padding: '8px 14px',
							fontSize: 12,
							marginTop: 8,
							marginBottom: 8,
						}}
					>
						<div>{recordingDetails.url}</div>
						<FaCopy
							onClick={() => {
								clipboard.copy(recordingDetails.url)
								message.info('Copied to clipboard!', 1)
							}}
							style={{
								cursor: 'pointer',
								marginLeft: 'auto',
								color: 'grey',
							}}
						/>
					</div>
				</>
			) : (
				<>
					<h3>Recording Configuration</h3>
					<div style={{ display: 'flex', flexDirection: 'column' }}>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: '1fr 1fr',
							}}
						>
							<Row header={'Organization'} row={'1'}>
								<InputNumber
									defaultValue={1}
									onChange={(v) => console.log(v)}
								/>
							</Row>
							<Row header={'Strict Privacy'} row={'2'}>
								<Checkbox onChange={(v) => console.log(v)} />
							</Row>
						</div>
					</div>
				</>
			)}
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					marginTop: 'auto',
				}}
			>
				{recordingDetails ? (
					<button
						style={{ backgroundColor: 'red' }}
						onClick={() => {
							sendMessageToPageScript({ action: 'stop' })
						}}
					>
						Stop Recording
					</button>
				) : (
					<button
						onClick={() => {
							console.log('clicked')
							sendMessageToPageScript(
								{ action: 'init' },
								(resp) =>
									setRecordingDetails({
										url: resp.url ?? 'none',
									}),
							)
						}}
					>
						Start Recording
					</button>
				)}
				<button
					style={{
						border: '1px solid grey',
						backgroundColor: 'white',
						width: '100%',
						color: 'black',
					}}
					onClick={() => {
						chrome.storage.local.clear()
					}}
				>
					Clear Local State
				</button>
			</div>
		</div>
	)
}

const Row: React.FC<
	React.PropsWithChildren<{ header: string; row: string }>
> = ({ header, row, children }) => {
	return (
		<>
			<div
				style={{
					display: 'grid',
					gridColumn: '1',
					gridRow: row,
					color: 'grey',
				}}
			>
				{header}:
			</div>
			<div
				style={{
					display: 'grid',
					gridColumn: '2',
					gridRow: row,
					marginBottom: 10,
				}}
			>
				{children}
			</div>
		</>
	)
}

const Dot = () => {
	return <div className={'dot pulse'} />
}

export default Core
