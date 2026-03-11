import app from './app.ts';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';

let server: any;

dotenv.config();

console.log('Starting server');
function main() {
    server = serve({
        fetch: app.fetch,
        port: (process.env.PORT || 3000) as number
    });

    const exitHandler = () => {
        if (server) {
            server.close(() => {
                process.exit(1);
            });
        } else {
            process.exit(1);
        }
    };

    const unexpectedErrorHandler = () => {
        exitHandler();
    };

    process.on('uncaughtException', unexpectedErrorHandler);
    process.on('unhandledRejection', unexpectedErrorHandler);

    process.on('SIGTERM', () => {
        if (server) {
            server.close();
        }
    });
}

main();
