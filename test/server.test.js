jest.mock('http', () => ({
  createServer: jest.fn(),
}));
jest.mock('../src/fetcher', () => ({
  fetch: jest.fn(),
}));

jest.mock('../src/aggregator', () => ({
  aggregate: jest.fn(),
}));

const { createServer } = require('http');
const { startServer, requestListener, postHandler } = require('../src/server');
const { fetch } = require('../src/fetcher');
const { aggregate } = require('../src/aggregator');

const mockServer = jest.fn();
mockServer.listen = jest.fn();
createServer.mockReturnValue(mockServer);

describe('HTTP server', () => {
  it('startServer should create server when start', () => {
    const port = 3000;

    startServer(port);

    expect(createServer).toHaveBeenCalled();
    expect(mockServer.listen).toHaveBeenCalledWith(port);
  });

  it('requestListener should return 400 when no POST', () => {
    const req = {
      method: 'GET',
      on: jest.fn(),
    };
    const res = jest.fn();
    res.end = jest.fn();

    requestListener(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.end).toHaveBeenCalled();
  });

  it('requestListener should call postHandler after collecting data when POST', () => {
    const req = {
      method: 'POST',
      on: jest.fn(),
    };
    const res = jest.fn();
    res.end = jest.fn();

    requestListener(req, res);

    expect(req.on).toHaveBeenCalledWith('data', expect.any(Function));
    expect(req.on).toHaveBeenCalledWith('end', expect.any(Function));
  });

  it('postHandler should return 400 when invalid data', () => {
    const res = jest.fn();
    res.end = jest.fn();
    const rawData = 'invalid';

    postHandler(res, rawData);

    expect(res.statusCode).toBe(400);
    expect(res.end).toHaveBeenCalled();
  });

  it('postHandler should return 400 when invalid period', () => {
    const res = jest.fn();
    res.end = jest.fn();
    const rawData = '{ "period": "invalid" }';

    postHandler(res, rawData);

    expect(res.statusCode).toBe(400);
    expect(res.end).toHaveBeenCalled();
  });

  describe('postHandler should call external endpoint when valid period', () => {
    const res = jest.fn();
    const rawData = '{ "period": 30 }';

    it('and should return 502 when error', (done) => {
      fetch.mockReturnValue(Promise.reject(new Error('unexpected error')));
      res.end = jest.fn(() => {
        try {
          expect(res.statusCode).toBe(502);
          expect(fetch).toHaveBeenCalled();
          done();
        } catch (err) {
          done(err);
        }
      });

      postHandler(res, rawData);
    });

    it('and should aggregate data and return 200 otherwise', (done) => {
      const expectedAggregatedData = '{"data":"aggregated"}';
      res.setHeader = jest.fn();
      fetch.mockReturnValue(Promise.resolve('{"data":"raw"}'));
      aggregate.mockReturnValue(expectedAggregatedData);
      res.end = jest.fn((aggregatedData) => {
        try {
          expect(res.statusCode).toBe(200);
          expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
          expect(fetch).toHaveBeenCalled();
          expect(aggregatedData).toBe(JSON.stringify(expectedAggregatedData));
          done();
        } catch (err) {
          done(err);
        }
      });

      postHandler(res, rawData);
    });
  });
});
