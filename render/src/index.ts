import { APIGatewayEvent } from 'aws-lambda';
import { serialRender } from './serial';
import { readFileSync } from 'fs';

interface Args {
    project?: string;
    session?: string;
    ts?: string;
    chunk?: string;
}

export const handler = async (event?: APIGatewayEvent) => {
    const args = (event?.queryStringParameters as unknown) as Args | undefined;
    const files = await serialRender(
        Number(args?.project),
        Number(args?.session),
        Number(args?.ts),
        args?.chunk?.length ? Number(args?.chunk) : undefined
    );
    const file = readFileSync(files[0]);
    return {
        statusCode: 200,
        isBase64Encoded: true,
        body: Buffer.from(file).toString('base64'),
        path: files[0],
        headers: {
            'content-type': 'image/png',
        },
    };
};

if (process.env.DEV?.length) {
    handler(({
        queryStringParameters: {
            project: '122',
            session: '33249578',
            ts: '208392',
            chunk: '3'
        }
    } as unknown) as APIGatewayEvent).then(console.info);
}
