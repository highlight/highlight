import { record } from 'rrweb';
import { detect } from 'detect-browser';
import { InMemoryCache, gql, ApolloClient } from '@apollo/client/core';

let visitID = '';
let visitLocationDetails = {};
let start = Date.now();
const browser = detect();

class Highlight {
	constructor() {
		this.client = new ApolloClient({
			uri: `${process.env.BACKEND_URI}/client`,
			cache: new InMemoryCache(),
			credentials: 'include',
		});
		this.events = [];
	}

	async initialize() {
		let response = await fetch(`https://geolocation-db.com/json/`);
		let data = await response.json();
		let details = JSON.stringify(data);
		let test = 'hi';
		let gr = await this.client.mutate({
			mutation: gql`
				mutation IdentifySession(
					$organization_id: ID!
					$details: String!
				) {
					identifySession(
						organization_id: $organization_id
						details: $details
					) {
						id
						user_id
						organization_id
						details
					}
				}
			`,
			variables: {
				organization_id: 1,
				details: details,
			},
		});
		this.sessionID = gr.data.identifySession.id;
		console.log(`created new session with data:`, gr.data);
		setInterval(() => {
			this._save();
		}, 5 * 1000);
		const emit = event => {
			this.events.push(event);
		};
		emit.bind(this);
		record({
			emit,
		});
	}

	// Reset the events array and push to a backend.
	async _save() {
		if (!this.sessionID.length) {
			console.log('session id is empty');
			return;
		} else if (!this.events.length) {
			console.log('no events');
			return;
		}
		const eventsString = JSON.stringify({ events: this.events });
		console.log(
			`sending ${this.events.length} events to ${process.env.BACKEND_URI}`
		);
		this.events = [];
		let gr = await this.client.mutate({
			mutation: gql`
				mutation AddEvents($session_id: ID!, $events: String!) {
					addEvents(session_id: $session_id, events: $events)
				}
			`,
			variables: {
				session_id: this.sessionID,
				events: eventsString,
			},
		});
	}
}

window.addEventListener('load', function () {
	console.log(`loaded highlight, remote is at ${process.env.BACKEND_URI}`);
	const h = new Highlight();
	h.initialize();
});
