import {
    getSdk,
    Sdk,
    PushBackendPayloadMutationVariables,
    InputMaybe,
    BackendErrorObjectInput,
} from './graph/generated/operations';
import ErrorStackParser from 'error-stack-parser';
import { GraphQLClient } from 'graphql-request';
import { NodeOptions } from './types';

export class Highlight {
    readonly FLUSH_TIMEOUT = 10;
    _graphqlSdk: Sdk;
    _backendUrl: string;
    _intervalFunction: ReturnType<typeof setInterval>;
    errors: Array<InputMaybe<BackendErrorObjectInput>> = [];

    constructor(options: NodeOptions) {
        this._backendUrl = options.backendUrl || 'https://pub.highlight.run';
        const client = new GraphQLClient(this._backendUrl, {
            headers: {},
        });
        this._graphqlSdk = getSdk(client);
        this._intervalFunction = setInterval(
            () => this.flush(),
            this.FLUSH_TIMEOUT * 1000
        );
    }

    consumeCustomError(
        error: Error,
        secureSessionId: string,
        requestId: string
    ) {
        let res: ErrorStackParser.StackFrame[] = [];
        try {
            res = ErrorStackParser.parse(error);
        } catch {}
        this.errors.push({
            event: error.message
                ? `${error.name}: ${error.message}`
                : `${error.name}`,
            request_id: requestId,
            session_secure_id: secureSessionId,
            source: '',
            stackTrace: JSON.stringify(res),
            timestamp: new Date().toISOString(),
            type: 'BACKEND',
            url: '',
        });
    }

    flush() {
        if (this.errors.length === 0) {
            return;
        }
        const variables: PushBackendPayloadMutationVariables = {
            errors: this.errors,
        };
        this.errors = [];
        this._graphqlSdk
            .PushBackendPayload(variables)
            .then(() => {})
            .catch((e) => {
                console.log('highlight-node error: ', e);
            });
    }
}
