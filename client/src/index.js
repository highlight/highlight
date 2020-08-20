import { record } from 'rrweb';
import { v4 } from 'uuid';

let events = [];
let visitID = '';

window.addEventListener('load', function () {
	visitID = v4();
	console.log(`page loaded, visitID: ${visitID}`);
});

record({
	emit(event) {
		// push event into the events array
		events.push(event);
	},
});

// Reset the events array and push to a backend.
function save() {
	if (!visitID.length || !events.length) {
		return;
	}
	console.log(`sending ${events.length} events...`);
	console.log(events);
	const body = JSON.stringify({ events });
	events = [];
	fetch('http://localhost:8082/add-events', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Visit-ID': visitID,
		},
		body,
	});
}

// Run every 5 seconds.
setInterval(() => {
	save();
}, 5 * 1000);
