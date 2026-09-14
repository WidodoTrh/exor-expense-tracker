// api/_lib/redis.js
// Shared Redis client. Serverless functions can be invoked many times
// concurrently, so we cache the client (and its connect promise) across
// invocations within the same warm instance instead of reconnecting every time.

import { createClient } from 'redis';

let client;
let connectPromise;

export async function getRedisClient() {
    if (!client) {
        client = createClient({ url: process.env.CASHFLOW_REDIS_REDIS_URL });
        client.on('error', (err) => console.error('Redis Client Error', err));
    }

    if (!client.isOpen) {
        if (!connectPromise) {
            connectPromise = client.connect();
        }
        await connectPromise;
    }

    return client;
}