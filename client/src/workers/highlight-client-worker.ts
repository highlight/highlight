import {
    HighlightClientWorkerParams,
    HighlightClientWorkerResponse,
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
    worker.onmessage = async function (e) {
        const {
            backend,
            id,
            sessionSecureID,
            events,
            messages,
            errors,
            resourcesString,
            isBeacon,
            hasSessionUnloaded,
            highlightLogs,
        } = e.data;

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

        worker.postMessage({ id, eventsSize });
    };
}
