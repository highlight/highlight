import { APIGatewayEvent } from 'aws-lambda';
import { serialRender } from './serial';
import { readFileSync } from 'fs';

interface Args {
    project?: string;
    session?: string;
    ts?: string;
}

export const handler = async (event?: APIGatewayEvent) => {
    const args = (event?.queryStringParameters as unknown) as Args | undefined;
    const files = await serialRender(
        Number(args?.project),
        Number(args?.session),
        Number(args?.ts)
    );
    const file = readFileSync(files[0]);
    return {
        statusCode: 200,
        isBase64Encoded: true,
        body: Buffer.from(file).toString('base64'),
        headers: {
            'content-type': 'image/png',
        },
    };
};

if (process.env.DEV?.length) {
    handler(({
        queryStringParameters: {
            project: '1',
            session: '33618264',
            ts: '1000',
        },
    } as unknown) as APIGatewayEvent).then(console.info);
}
