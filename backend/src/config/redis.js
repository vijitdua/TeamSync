import redis from 'redis';
import {env} from "./env.js";

const redisClient = redis.createClient({
    host: env.redisHost || 'localhost',
    port: env.redisPort || 6379,
});

// If error with redis connection
redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

// Confirm redis connection
(async () => {
    try {
        await redisClient.connect(); // Use the connect method to establish a connection
        console.log(`Connected to Redis at ${env.redisHost} on port ${env.redisPort}`);
    } catch (err) {
        console.error('Error connecting to Redis:', err);
    }
})();

export default redisClient;