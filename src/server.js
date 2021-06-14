const http = require('http');
const { fetch } = require('./fetcher');
const { aggregate } = require('./aggregator');
const { logger } = require('./config/logger');

const VALID_FREQUENCIES = [10, 30, 60];
const ENDPOINT = 'https://reference.intellisense.io/test.dataprovider';

function isValidPeriod(period) {
  return VALID_FREQUENCIES.includes(period);
}

function processEndpointData(period, endpointData) {
  logger.debug(`Received data: ${endpointData.data}`);
  const aggregatedData = aggregate(
    period * 60000,
    endpointData.data,
  );
  logger.debug(`Aggregated data: ${aggregatedData}`);
  return JSON.stringify(aggregatedData);
}

function postHandler(res, rawRequestData) {
  try {
    const parsedRequestData = JSON.parse(rawRequestData);
    if (isValidPeriod(parsedRequestData.period)) {
      fetch(ENDPOINT)
        .then((endpointData) => {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(processEndpointData(parsedRequestData.period, endpointData));
        })
        .catch((err) => {
          logger.error(err);
          res.statusCode = 502;
          res.end();
        });
    } else {
      res.statusCode = 400;
      res.end();
    }
  } catch (err) {
    logger.error(err);
    res.statusCode = 400;
    res.end();
  }
}

function requestListener(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 400;
    res.end();
  } else {
    let rawData = '';
    req.on('data', (chunk) => { rawData += chunk; });
    req.on('end', () => postHandler(res, rawData));
  }
}

function startServer(port) {
  const server = http.createServer(requestListener);
  server.listen(port);
  return server;
}

module.exports = {
  startServer,
  requestListener,
  postHandler,
};
