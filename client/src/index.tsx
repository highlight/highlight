import { addCustomEvent, record } from '@highlight-run/rrweb';
import { eventWithTime } from '@highlight-run/rrweb/dist/types';
import { ConsoleListener } from './listeners/console-listener';
import { ErrorListener } from './listeners/error-listener';
import { PathListener } from './listeners/path-listener';
import { GraphQLClient, gql } from 'graphql-request';
import { Sdk, getSdk } from './graph/generated/operations';

import {
    ConsoleMessage,
    ErrorMessage,
    NetworkResourceContent,
} from '../../frontend/src/util/shared-types';
import { TabStateListener } from './listeners/tab-state-listener';
import { ViewportResizeListener } from './listeners/viewport-resize-listener';
import { SegmentIntegrationListener } from './listeners/segment-integration-listener';

export const HighlightWarning = (context: string, msg: any) => {
    console.warn(`Highlight Warning: (${context}): `, msg);
};
class Logger {
    debug: boolean | undefined;
    constructor(debug?: boolean) {
        this.debug = debug;
    }
    log(...data: any[]) {
        if (this.debug) {
            console.log.apply(console, data);
        }
    }
}

export type DebugOptions = {
    clientInteractions?: boolean;
    domRecording?: boolean;
};

export type HighlightClassOptions = {
    organizationID: number | string;
    debug?: boolean | DebugOptions;
    backendUrl?: string;
    disableNetworkRecording?: boolean;
    disableConsoleRecording?: boolean;
    enableSegmentIntegration?: boolean;
};

type PropertyType = {
    type?: 'track' | 'session';
    source?: Source;
};

type Source = 'segment' | undefined;

export class Highlight {
    organizationID: string;
    graphqlSDK: Sdk;
    events: eventWithTime[];
    errors: ErrorMessage[];
    messages: ConsoleMessage[];
    networkContents: NetworkResourceContent[];
    sessionID: number;
    ready: boolean;
    logger: Logger;
    disableNetworkRecording: boolean | undefined;
    disableConsoleRecording: boolean | undefined;
    enableSegmentIntegration: boolean | undefined;
    debugOptions: DebugOptions;

    constructor(options: HighlightClassOptions) {
        if (typeof options?.debug === 'boolean') {
            this.debugOptions = options.debug
                ? { clientInteractions: true }
                : {};
        } else {
            this.debugOptions = options?.debug ?? {};
        }
        this.ready = false;
        this.disableNetworkRecording = options.disableNetworkRecording;
        this.disableConsoleRecording = options.disableConsoleRecording;
        this.enableSegmentIntegration = options.enableSegmentIntegration;
        this.logger = new Logger(this.debugOptions.clientInteractions);
        const backend = options?.backendUrl
            ? options.backendUrl
            : process.env.BACKEND_URI;
        const client = new GraphQLClient(`${backend}/client`, { headers: {} });
        this.graphqlSDK = getSdk(client);
        if (typeof options.organizationID === 'string') {
            this.organizationID = options.organizationID;
        } else if (typeof options.organizationID === 'number') {
            this.organizationID = options.organizationID.toString();
        } else {
            this.organizationID = '';
        }
        this.sessionID = 0;
        this.events = [];
        this.errors = [];
        this.networkContents = [];
        this.messages = [];
    }

    async identify(user_identifier: string, user_object = {}, source?: Source) {
        if (source === 'segment') {
            addCustomEvent(
                'Segment Identify',
                JSON.stringify({ user_identifier, ...user_object })
            );
        } else {
            addCustomEvent(
                'Identify',
                JSON.stringify({ user_identifier, ...user_object })
            );
        }
        await this.graphqlSDK.identifySession({
            session_id: this.sessionID.toString(),
            user_identifier: user_identifier,
            user_object: user_object,
        });
        const sourceString = source === 'segment' ? source : 'default';
        this.logger.log(
            `Identify (${user_identifier}, source: ${sourceString}) w/ obj: ${JSON.stringify(
                user_object
            )} @ ${process.env.BACKEND_URI}`
        );
    }

    async addProperties(properties_obj = {}, typeArg?: PropertyType) {
        // Session properties are custom properties that the Highlight snippet adds (visited-url, referrer, etc.)
        if (typeArg?.type === 'session') {
            await this.graphqlSDK.addSessionProperties({
                session_id: this.sessionID.toString(),
                properties_object: properties_obj,
            });
            this.logger.log(
                `AddSessionProperties to session (${
                    this.sessionID
                }) w/ obj: ${JSON.stringify(properties_obj)} @ ${
                    process.env.BACKEND_URI
                }`
            );
        }
        // Track properties are properties that users define; rn, either through segment or manually.
        else {
            if (typeArg?.source === 'segment') {
                addCustomEvent<string>(
                    'Segment Track',
                    JSON.stringify(properties_obj)
                );
            } else {
                addCustomEvent<string>('Track', JSON.stringify(properties_obj));
            }
            await this.graphqlSDK.addTrackProperties({
                session_id: this.sessionID.toString(),
                properties_object: properties_obj,
            });
            const sourceString =
                typeArg?.source === 'segment' ? typeArg.source : 'default';
            this.logger.log(
                `AddTrackProperties to session (${
                    this.sessionID
                }, source: ${sourceString}) w/ obj: ${JSON.stringify(
                    properties_obj
                )} @ ${process.env.BACKEND_URI}`
            );
        }
    }
    // TODO: (organization_id is only here because of old clients, we should figure out how to version stuff).
    async initialize(organization_id?: number | string) {
        var org_id = '';
        if (typeof organization_id === 'number') {
            org_id = organization_id.toString();
        } else if (typeof organization_id === 'string') {
            org_id = organization_id;
        } else {
            org_id = '0';
        }
        try {
            if (organization_id) {
                this.organizationID = org_id;
            }
            let storedID =
                Number(window.sessionStorage.getItem('currentSessionID')) ||
                null;
            let reloaded = false;
            if (storedID) {
                this.sessionID = storedID;
                reloaded = true;
            } else {
                const gr = await this.graphqlSDK.initializeSession({
                    organization_verbose_id: this.organizationID,
                });
                this.sessionID = parseInt(gr?.initializeSession?.id || '0');
                const organization_id = gr?.initializeSession?.organization_id;
                this.logger.log(
                    `Loaded Highlight
  Remote: ${process.env.BACKEND_URI}
  Org ID: ${organization_id}
  Verbose Org ID: ${this.organizationID}
  SessionID: ${this.sessionID}
  Session Data:
  `,
                    gr.initializeSession
                );
                window.sessionStorage.setItem(
                    'currentSessionID',
                    this.sessionID.toString()
                );
            }
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

            const highlightThis = this;
            if (this.enableSegmentIntegration) {
                SegmentIntegrationListener((obj: any) => {
                    if (obj.type === 'track') {
                        const properties: { [key: string]: string } = {};
                        properties['segment-event'] = obj.event;
                        highlightThis.addProperties(properties, {
                            type: 'track',
                            source: 'segment',
                        });
                    } else if (obj.type === 'identify') {
                        highlightThis.identify(
                            obj.userId,
                            obj.traits,
                            'segment'
                        );
                    }
                });
            }

            if (document.referrer) {
                addCustomEvent<string>('Referrer', document.referrer);
                highlightThis.addProperties(
                    { referrer: document.referrer },
                    { type: 'session' }
                );
            }
            PathListener((url: string) => {
                if (reloaded) {
                    addCustomEvent<string>('Reload', url);
                    reloaded = false;
                    highlightThis.addProperties(
                        { reload: true },
                        { type: 'session' }
                    );
                } else {
                    addCustomEvent<string>('Navigate', url);
                }
                highlightThis.addProperties(
                    { 'visited-url': url },
                    { type: 'session' }
                );
            });
            if (!this.disableConsoleRecording) {
                ConsoleListener((c: ConsoleMessage) => {
                    if (c.type == 'Error' && c.value && c.trace)
                        highlightThis.errors.push({
                            event: c.value,
                            type: 'console',
                            source: c.trace[0].fileName
                                ? c.trace[0].fileName
                                : '',
                            lineNumber: c.trace[0].lineNumber
                                ? c.trace[0].lineNumber
                                : 0,
                            columnNumber: c.trace[0].columnNumber
                                ? c.trace[0].columnNumber
                                : 0,
                            trace: c.trace,
                        });
                    highlightThis.messages.push(c);
                });
            }
            ErrorListener((e: ErrorMessage) => highlightThis.errors.push(e));
            TabStateListener((tabIsActive: string) => {
                addCustomEvent<string>('Tab', tabIsActive);
            });
            ViewportResizeListener((viewport) => {
                addCustomEvent('Viewport', viewport);
            });
            this.ready = true;
        } catch (e) {
            HighlightWarning('initializeSession', e);
        }
    }
    // Reset the events array and push to a backend.
    async _save() {
        try {
            if (!this.sessionID) {
                return;
            }
            var resources: Array<any> = [];
            if (!this.disableNetworkRecording) {
                // get all resources that don't include 'api.highlight.run'
                resources = performance
                    .getEntriesByType('resource')
                    .filter(
                        (r) =>
                            !r.name.includes(
                                process.env.BACKEND_URI ??
                                    'https://api.highlight.run'
                            )
                    );
            }

            const resourcesString = JSON.stringify({ resources: resources });
            const messagesString = JSON.stringify({ messages: this.messages });
            this.logger.log(
                `Sending: ${this.events.length} events, ${this.messages.length} messages, ${resources.length} network resources, ${this.errors.length} errors \nTo: ${process.env.BACKEND_URI}\nOrg: ${this.organizationID}\nSessionID: ${this.sessionID}`
            );
            if (!this.disableNetworkRecording) {
                performance.clearResourceTimings();
            }
            await this.graphqlSDK.PushPayload({
                session_id: this.sessionID.toString(),
                events: this.events,
                messages: messagesString,
                resources: resourcesString,
                errors: this.errors,
            });
            this.events = [];
            this.errors = [];
            this.messages = [];
            this.networkContents = [];
        } catch (e) {
            HighlightWarning('_save', e);
        }
    }
}

(window as any).Highlight = Highlight;

declare global {
    interface Console {
        defaultLog: any;
        defaultError: any;
        defaultWarn: any;
        defaultDebug: any;
    }
}
