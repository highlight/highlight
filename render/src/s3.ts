import { S3Client } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import zlib from "zlib";

// TODO(vkorolik) doppler env region
export const client = new S3Client({ region: 'us-west-2' });

// Apparently the stream parameter should be of type Readable|ReadableStream|Blob
// The latter 2 don't seem to exist anywhere.
export async function compressedStreamToString(
    stream: Readable
): Promise<string> {
    return await new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () =>
            resolve(zlib.brotliDecompressSync(Buffer.concat(chunks)).toString('utf-8'))
        );
    });
}
