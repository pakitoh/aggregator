const http = require('http');
const {
  fetch,
} = require('../src/fetcher');

const port = 3876;

let server;

// These are integration tests as are creating a fully HTTP server
function initServer(handler) {
  server = http.createServer(handler);
  server.listen(port);
}

afterEach(() => {
  server.close(() => {});
});

describe('fetch function', () => {
  it('should return future data when ok', (done) => {
    initServer((req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end('{"key": "value"}');
    });

    return fetch(`http://localhost:${port}`)
      .then((response) => {
        expect(response.data).toMatchObject({ key: 'value' });
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it('should return promise with error when response code is error', (done) => {
    const errorCode = 500;
    initServer((req, res) => {
      res.statusCode = errorCode;
      res.end();
    });

    return fetch(`http://localhost:${port}`)
      .then(() => {
        done('it should not reach here');
      })
      .catch((err) => {
        expect(err.response.status).toBe(errorCode);
        done();
      })
      .catch((expectationFailedErr) => {
        done(expectationFailedErr);
      });
  });
});
