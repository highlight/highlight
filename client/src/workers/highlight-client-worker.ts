import {
    AsyncEventsMessage,
    HighlightClientWorkerParams,
    HighlightClientWorkerResponse,
    MessageType,
} from './types';
import stringify from 'json-stringify-safe';
import {
    getSdk,
    PushPayloadMutationVariables,
    Sdk,
} from '../graph/generated/operations';
import { ReplayEventsInput } from '../graph/generated/schemas';
import { GraphQLClient } from 'graphql-request';
import { getGraphQLRequestWrapper } from '../utils/graph';

export interface HighlightClientRequestWorker {
    postMessage: (message: HighlightClientWorkerParams) => void;
    onmessage: (message: MessageEvent<HighlightClientWorkerResponse>) => void;
}

interface HighlightClientResponseWorker {
    onmessage:
        | null
        | ((message: MessageEvent<HighlightClientWorkerParams>) => void);

    postMessage(e: HighlightClientWorkerResponse): void;
}

// `as any` because: https://github.com/Microsoft/TypeScript/issues/20595
const worker: HighlightClientResponseWorker = self as any;

{
    let graphqlSDK: Sdk;
    let backend: string;
    let sessionSecureID: string;

    const processAsyncEventsMessage = async (msg: AsyncEventsMessage) => {
        const {
            id,
            events,
            messages,
            errors,
            resourcesString,
            isBeacon,
            hasSessionUnloaded,
            highlightLogs,
        } = msg;

        if (!graphqlSDK) {
            const client = new GraphQLClient(backend, {
                headers: {},
            });
            graphqlSDK = getSdk(
                client,
                getGraphQLRequestWrapper(sessionSecureID)
            );
        }

        const messagesString = stringify({ messages: messages });
        let payload: PushPayloadMutationVariables = {
            session_secure_id: sessionSecureID,
            events: { events } as ReplayEventsInput,
            messages: messagesString,
            resources: resourcesString,
            errors,
            is_beacon: isBeacon,
            has_session_unloaded: hasSessionUnloaded,
            payload_id: id.toString(),
        };
        if (highlightLogs) {
            payload.highlight_logs = highlightLogs;
        }

        const eventsSize = await graphqlSDK
            .PushPayload(payload)
            .then((res) => res.pushPayload ?? 0);

        worker.postMessage({
            response: { type: MessageType.AsyncEvents, id, eventsSize },
        });
    };

    worker.onmessage = async function (e) {
        backend = e.data.backend;
        sessionSecureID = e.data.sessionSecureID;
        if (e.data.message.type === MessageType.AsyncEvents) {
            await processAsyncEventsMessage(
                e.data.message as AsyncEventsMessage
            );
        } else {
            console.error('invalid message received', e.data);
        }
    };
}
