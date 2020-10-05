import { record, addCustomEvent } from 'rrweb';
import { detect } from 'detect-browser';
import {
  InMemoryCache,
  gql,
  ApolloClient,
  NormalizedCacheObject,
} from '@apollo/client/core';
import { eventWithTime } from 'rrweb/typings/types';

class Logger {
  debug: boolean;
  constructor(debug: boolean) {
    this.debug = debug;
  }
  log(...data: any[]) {
    if (this.debug) {
      console.log.apply(console, data);
    }
  }
}

(window as any).Highlight = class Highlight {
  organizationID: number;
  client: ApolloClient<NormalizedCacheObject>;
  events: any[];
  sessionID: number;
  ready: boolean;
  logger: Logger;

  constructor(debug: boolean) {
    // If debug is set to false, disable all console
    this.ready = false;
    this.logger = new Logger(debug);
    this.client = new ApolloClient({
      uri: `${process.env.BACKEND_URI}/client`,
      cache: new InMemoryCache(),
      credentials: 'include',
    });
    this.organizationID = 0;
    this.sessionID = 0;
    this.events = [];
  }

  async identify(user_identifier: string, user_object = {}) {
    await this.client.mutate({
      mutation: gql`
        mutation identifySession(
          $session_id: ID!
          $user_identifier: String!
          $user_object: Any
        ) {
          identifySession(
            session_id: $session_id
            user_identifier: $user_identifier
            user_object: $user_object
          )
        }
      `,
      variables: {
        session_id: this.sessionID,
        user_identifier: user_identifier,
        user_object: user_object,
      },
    });
    this.logger.log(
      `Identify (${user_identifier}) w/ obj: ${JSON.stringify(user_object)} @ ${
        process.env.BACKEND_URI
      }`
    );
  }

  async addProperties(properties_obj = {}) {
    await this.client.mutate({
      mutation: gql`
        mutation addProperties($session_id: ID!, $properties_object: Any) {
          addProperties(
            session_id: $session_id
            properties_object: $properties_object
          )
        }
      `,
      variables: {
        session_id: this.sessionID,
        properties_object: properties_obj,
      },
    });
    this.logger.log(
      `AddProperties to session (${this.sessionID}) w/ obj: ${JSON.stringify(
        properties_obj
      )} @ ${process.env.BACKEND_URI}`
    );
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
    this.logger.log(
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
    const emit = (event: eventWithTime) => {
      this.events.push(event);
    };
    emit.bind(this);
    record({
      emit,
    });
    const ref = document.referrer;
    if (ref) {
      addCustomEvent('referrer', { value: document.referrer });
    }
    // overwrite xhr send.
    const highlightThis = this;
    let oldXHRSend = window.XMLHttpRequest.prototype.send;
    window.XMLHttpRequest.prototype.send = function (
      body?: Document | BodyInit | null
    ) {
      const obj = JSON.parse(body?.toString() ?? '');
      if (obj.type === 'track') {
        const properties: { [key: string]: string } = {};
        properties['segment-event'] = obj.event;
        highlightThis.addProperties(properties);
      }
      // @ts-ignore
      return oldXHRSend.apply(this, arguments);
    };
    this.ready = true;
  }

  // Reset the events array and push to a backend.
  async _save() {
    if (!this.sessionID) {
      return;
    }
    const eventsString = JSON.stringify({ events: this.events });
    this.logger.log(
      `Send (${this.events.length}) @ ${process.env.BACKEND_URI}, org: ${this.organizationID}`
    );
    this.events = [];
    await this.client.mutate({
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
