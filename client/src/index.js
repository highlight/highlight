import { record } from 'rrweb';
import { v4 } from 'uuid';
import { detect } from 'detect-browser';

let events = [];
let visitID = '';
let backendURL = process.env.BACKEND_URI;
let visitLocationDetails = {};
let start = Date.now();
const browser = detect();

window.addEventListener('load', function () {
  visitID = v4();
  console.log(`page loaded, visitID: ${visitID}`);
  fetch(`https://geolocation-db.com/json/`)
    .then(res => res.json())
    .then(json => {
      visitLocationDetails = json;
      visitLocationDetails.browser = browser;
    });
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
  const body = JSON.stringify({ visitLocationDetails, events });
  console.log(`sending ${events.length} events...`);
  events = [];
  fetch(`${process.env.BACKEND_URI}/add-events`, {
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
