import build from 'pino-abstract-transport';
import { RedisClient, StreamMessageData } from '@secrid/redis-streams-nodejs';

type RedisClientOptions = ConstructorParameters<typeof RedisClient>[0];

export default async function (options: { clientOptions: Partial<RedisClientOptions>; streams: string | string[] }) {
  const clientOptions = options.clientOptions;
  clientOptions.clientName = clientOptions.clientName || 'undefined';
  clientOptions.groupName = clientOptions.groupName || 'undefined';

  const client = new RedisClient(clientOptions as RedisClientOptions);
  client.on('error', err => console.error('Redis client for pino-redis-streams logging failed.', err));
  await client.connect();

  const producer = client.createProducer();

  setInterval(async function () {
    // Ping for azure redis cache timeouts
    client.ping();
  }, 5 * 60 * 1000);

  const fn = build(async function (source) {
    let obj: unknown;

    for await (obj of source) {
      const redisMessage: StreamMessageData = {};

      if (!isObject(obj)) {
        console.log('Log data is not an object. Not sending log to Redis Stream');
        return;
      }

      for (const key in obj) {
        const value = obj[key];

        switch (typeof value) {
          case 'boolean':
            redisMessage[key] = value.toString();
            break;
          case 'number':
            redisMessage[key] = value.toString();
            break;
          case 'string':
            redisMessage[key] = value;
            break;
          case 'object':
            redisMessage[key] = JSON.stringify(value);
            break;
        }
      }

      let streams = options.streams;
      if (!Array.isArray(streams)) {
        streams = Array(streams);
      }

      for (const stream of streams) {
        producer.add(stream, redisMessage);
      }
    }
  });

  return fn;
}

function isObject(obj: unknown): obj is Record<any, unknown> {
  return typeof obj === 'object' && obj !== null;
}
