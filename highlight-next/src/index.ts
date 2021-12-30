import ErrorStackParser from 'error-stack-parser';
import { getSdk, Sdk, PushBackendPayloadMutationVariables } from './graph/generated/operations';
import { GraphQLClient } from 'graphql-request';

export interface HighlightInterface {
        consumeError: (
                error: Error,
                secureSessionId: string, 
                requestId: string,
        ) => void;
}

var highlight_obj: Highlight;
export const H: HighlightInterface = {
        consumeError: (
                error: Error,
                secureSessionId: string, 
                requestId: string,
        ) => {
                try {
                        highlight_obj.consumeCustomError(
                                error,
                                secureSessionId,
                                requestId,
                        )
                } catch (e) {
                        console.log('error', e);
                }
        },
};

export class Highlight {
        _graphqlSdk: Sdk;

        constructor() {
                const client = new GraphQLClient('https://pub.highlight.run', {
                        headers: {},
                });
                this._graphqlSdk = getSdk(client)
        }

        consumeCustomError(error: Error, secureSessionId: string, requestId: string) {
                let res: ErrorStackParser.StackFrame[] = [];
                try {
                        res = ErrorStackParser.parse(error);
                } catch {}
                const variables: PushBackendPayloadMutationVariables = {
                        errors: {
                                event: error.message
                                        ? `${error.name}: ${error.message}`
                                        : `${error.name}`,
                                request_id: requestId,
                                session_secure_id: secureSessionId,
                                source: '',
                                stackTrace: JSON.stringify(res),
                                timestamp: new Date().toISOString(),
                                type: 'BACKEND',
                                url: ''
                        }
                };
                this._graphqlSdk.PushBackendPayload(variables);

        }

}