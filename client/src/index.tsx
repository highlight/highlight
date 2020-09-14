import { record } from 'rrweb';
import { detect } from 'detect-browser';
import {
  InMemoryCache,
  gql,
  ApolloClient,
  NormalizedCacheObject,
} from '@apollo/client/core';

(window as any).Highlight = class Highlight {
  organizationID: number;
  client: ApolloClient<NormalizedCacheObject>;
  events: any[];
  sessionID: number;
  ready: boolean;

  constructor(debug: boolean) {
    // If debug is set to false, disable all console
    this.ready = false;
    if (!debug) {
      console.log = function () {};
    }
    this.client = new ApolloClient({
      uri: `${process.env.BACKEND_URI}/client`,
      cache: new InMemoryCache(),
      credentials: 'include',
    });
    this.organizationID = 0;
    this.sessionID = 0;
    this.events = [];
  }

  async identify(user_identifier: string) {
    await this.client.mutate({
      mutation: gql`
        mutation identifySession($session_id: ID!, $user_identifier: String!) {
          identifySession(
            session_id: $session_id
            user_identifier: $user_identifier
          )
        }
      `,
      variables: {
        session_id: this.sessionID,
        user_identifier: user_identifier,
      },
    });
    console.log(`Identify (${user_identifier}) @ ${process.env.BACKEND_URI}`);
  }

  async initialize(organizationID: number) {
    const browser = detect();
    if (!organizationID) {
      console.error('empty organization_id!');
      return;
    }
    this.organizationID = organizationID;
    let response = await fetch(`https://geolocation-db.com/json/`);
    let data = await response.json();
    let details = JSON.stringify({ ...data, browser });
    let gr = await this.client.mutate({
      mutation: gql`
        mutation initializeSession($organization_id: ID!, $details: String!) {
          initializeSession(
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
        organization_id: this.organizationID,
        details: details,
      },
    });
    this.sessionID = gr.data.initializeSession.id;
    console.log(
      `Loaded Highlight
Remote: ${process.env.BACKEND_URI}
Org:: ${this.organizationID}
Session Data: 
`,
      gr.data
    );
    setInterval(() => {
      this._save();
    }, 5 * 1000);
    const emit = (event: any) => {
      this.events.push(event);
    };
    emit.bind(this);
    record({
      emit,
    });
    this.ready = true;
  }

  // Reset the events array and push to a backend.
  async _save() {
    if (!this.sessionID) {
      return;
    } else if (!this.events.length) {
      return;
    }
    const eventsString = JSON.stringify({ events: this.events });
    console.log(
      `Send (${this.events.length}) @ ${process.env.BACKEND_URI}, org: ${this.organizationID}`
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
};
