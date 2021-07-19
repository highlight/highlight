function PushPayloadWorker() {
    const ctx: Worker = self as any;

    ctx.onmessage = async function (_event) {
        const typedEvent = _event as MessageEvent<PushPayloadWorkerMessage>;
        const { data } = typedEvent;
        const { backendUrl, data: payloadData, type } = data;

        switch (type) {
            case 'PushPayload':
                console.log(payloadData);

                try {
                    const payload = {
                        errors: [],
                        events: { events: [] },
                        messages: '{"messages":[]}',
                        resources: '{"resources":[]}',
                        session_id: '1647',
                    };
                    await fetch(backendUrl, {
                        method: 'POST',
                        headers: {
                            type: 'application/json',
                        },
                        body: JSON.stringify({ query, variables: payload }),
                    });

                    ctx.postMessage(true);
                } catch (err) {
                    console.error('worker', err);
                    ctx.postMessage(false);
                }
                break;
            default:
                break;
        }
    };
}

export interface PushPayloadWorkerMessage {
    type: 'PushPayload';
    data: {
        consoleMessages: string[];
    };
    backendUrl: string;
}

/**
 * The response from the worker.
 * This signals whether the PushPayload request was made successfully.
 */
export interface PushPayloadWorkerAcknowledgement {
    status: boolean;
}

const workerBlob = new Blob(
    [PushPayloadWorker.toString().replace(/^function .+\{?|\}$/g, '')],
    { type: 'text/javascript' }
);

export const workerBlobFunction = PushPayloadWorker.toString().replace(
    /^function .+\{?|\}$/g,
    ''
);

export const workerBlobUrl = URL.createObjectURL(workerBlob);
