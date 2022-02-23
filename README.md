# pino-redis-streams

This packages provides "transport" for [pino](https://www.npmjs.com/package/pino) which forwards logs to Redis Streams.

## Installation

```bash
npm install pino-redis-streams
```

## Usage

You can use this transport as follows:

```javascript
import pino from 'pino';

const transport = pino.transport({
  target: 'pino-redis-streams',
  options: {
    streams: 'my-log-stream',
    clientOptions: {
      socket: {
        port: 6380,
        host: 'my.redis.server.com',
        tls: true,
      },
      password: 'supersecurepassword',
    },
  },
});

pino(transport);
```

## Options

- `stream` (_string_ | _string[]_) a string or an array of strings of stream keys to which you want to send the logs.
- `clientOptions` (\_RedisClientOptions) the Redis client options found in the official [docs](https://github.com/redis/node-redis/blob/master/docs/client-configuration.md) of Redis.
