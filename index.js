const { startServer } = require('./src/server');
const { env } = require('./src/config/env');

startServer(env);
