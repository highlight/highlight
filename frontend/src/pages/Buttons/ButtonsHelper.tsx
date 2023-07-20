import { H } from 'highlight.run'
import { useEffect, useState } from 'react'

export const CustomError = () => {
	CustomErrorDeeper()
}

const CustomErrorDeeper = () => {
	H.error('error is being thrown yo!')
}

export const DefaultError = () => {
	DefaultErrorDeeper()
}

const DefaultErrorDeeper = () => {
	throw new Error('errors page')
}

export const RandomError = () => {
	RandomErrorDeeper()
}

const RandomErrorDeeper = () => {
	throw new Error(`random error! ${Math.random()}`)
}

export const NestedError = (message: string) => {
	console.error({
		message,
		cause: new Error('uh oh!'),
		title: 'same title',
	})
}

const apiCall = {
	event: 'bts:subscribe',
	data: { channel: 'order_book_btcusd' },
}

export const WebSocketEvent = () => {
	const [bids, setBids] = useState([0])

	useEffect(() => {
		const ws = new WebSocket('wss://ws.bitstamp.net')
		ws.onopen = () => {
			ws.send(JSON.stringify(apiCall))
		}
		ws.onmessage = function (event) {
			const json = JSON.parse(event.data)
			try {
				if (json.event == 'data') {
					setBids(json.data.bids.slice(0, 5))
				}
			} catch (err) {
				console.log(err)
			}
		}
		ws.onclose = () => {
			console.log('Closed successfully')
		}
		return () => ws.close()
	}, [])

	return (
		<div>
			{bids.map((item, index) => (
				<div key={index}>
					<p> {item}</p>
				</div>
			))}
		</div>
	)
}
