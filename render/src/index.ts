import { render } from './render';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { client, compressedStreamToString } from './s3';
import { Readable } from 'stream';

async function main(project: number, session: number) {
    const key = `${project}/${session}/session-contents-compressed`;
    const command = new GetObjectCommand({
        Bucket: 'highlight-session-s3-test',
        Key: key,
    });
    const response = await client.send(command);
    if (!response.Body) {
        throw new Error(`no body downloaded from s3 for ${key}`);
    }
    const events = await compressedStreamToString(response.Body as Readable);
    return await render(events);
}

const r = main(1, 33249519).catch(console.error);
console.warn(r);
