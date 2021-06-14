const {
  average,
  groupByPeriod,
  computeGroups,
  composeAssetData,
  aggregate,
} = require('../src/aggregator');

describe('average function', () => {
  it('should return 0 when input is empty array', () => {
    const input = [];

    const resul = average(input);

    expect(resul).toBe(0);
  });

  it('should calculate average on array of numbers', () => {
    const input = [0, 1, 2, 3, 4];

    const resul = average(input);

    expect(resul).toBe(2);
  });

  it('should include null to calculate average on array of numbers', () => {
    const input = [1, 2, 3, 4, null];

    const resul = average(input);

    expect(resul).toBe(2);
  });
});

describe('groupByPeriod function', () => {
  it('should return empty object when empty input', () => {
    const time = [];
    const twoMinsPeriod = 2 * 60 * 1000;

    const resul = groupByPeriod(twoMinsPeriod, time);

    expect(resul).toMatchObject({});
  });

  it('should return empty object when no period', () => {
    const time = [
      '2021-06-09T18:10:00.000Z',
      '2021-06-09T18:11:00.000Z',
    ];
    const period = undefined;

    const resul = groupByPeriod(period, time);

    expect(resul).toMatchObject({});
  });

  it('should return empty object when period is zero', () => {
    const time = [
      '2021-06-09T18:10:00.000Z',
      '2021-06-09T18:11:00.000Z',
    ];
    const period = 0;

    const resul = groupByPeriod(period, time);

    expect(resul).toMatchObject({});
  });

  it('should return indexes grouped by period', () => {
    const time = [
      '2021-06-09T18:10:00.000Z',
      '2021-06-09T18:11:00.000Z',
      '2021-06-09T18:12:00.000Z',
      '2021-06-09T18:13:00.000Z',
      '2021-06-09T18:14:00.000Z',
      '2021-06-09T18:15:00.000Z',
      '2021-06-09T18:16:00.000Z',
      '2021-06-09T18:17:00.000Z',
      '2021-06-09T18:18:00.000Z',
      '2021-06-09T18:19:00.000Z',
    ];
    const twoMinsPeriod = 2 * 60 * 1000;

    const resul = groupByPeriod(twoMinsPeriod, time);

    expect(resul).toMatchObject({
      '2021-06-09T18:10:00.000Z': [0, 1],
      '2021-06-09T18:12:00.000Z': [2, 3],
      '2021-06-09T18:14:00.000Z': [4, 5],
      '2021-06-09T18:16:00.000Z': [6, 7],
      '2021-06-09T18:18:00.000Z': [8, 9],
    });
  });

  it('should return indexes grouped by period with smaller first group when first time does not match', () => {
    const time = [
      '2021-06-09T18:11:00.000Z',
      '2021-06-09T18:12:00.000Z',
      '2021-06-09T18:13:00.000Z',
    ];
    const twoMinsPeriod = 2 * 60 * 1000;

    const resul = groupByPeriod(twoMinsPeriod, time);

    expect(resul).toMatchObject({
      '2021-06-09T18:10:00.000Z': [0],
      '2021-06-09T18:12:00.000Z': [1, 2],
    });
  });
});

const inputData = {
  assetId1: {
    metric1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    metric2: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38],
    time: [
      '2021-06-09T18:10:00.000Z',
      '2021-06-09T18:11:00.000Z',
      '2021-06-09T18:12:00.000Z',
      '2021-06-09T18:13:00.000Z',
      '2021-06-09T18:14:00.000Z',
      '2021-06-09T18:15:00.000Z',
      '2021-06-09T18:16:00.000Z',
      '2021-06-09T18:17:00.000Z',
      '2021-06-09T18:18:00.000Z',
      '2021-06-09T18:19:00.000Z',
      '2021-06-09T18:20:00.000Z',
      '2021-06-09T18:21:00.000Z',
      '2021-06-09T18:22:00.000Z',
      '2021-06-09T18:23:00.000Z',
      '2021-06-09T18:24:00.000Z',
      '2021-06-09T18:25:00.000Z',
      '2021-06-09T18:26:00.000Z',
      '2021-06-09T18:27:00.000Z',
      '2021-06-09T18:28:00.000Z',
      '2021-06-09T18:29:00.000Z',
    ],
  },
  assetId2: {
    metric1: [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57],
    metric2: [20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58],
    time: [
      '2021-06-09T18:10:00.000Z',
      '2021-06-09T18:11:00.000Z',
      '2021-06-09T18:12:00.000Z',
      '2021-06-09T18:13:00.000Z',
      '2021-06-09T18:14:00.000Z',
      '2021-06-09T18:15:00.000Z',
      '2021-06-09T18:16:00.000Z',
      '2021-06-09T18:17:00.000Z',
      '2021-06-09T18:18:00.000Z',
      '2021-06-09T18:19:00.000Z',
      '2021-06-09T18:20:00.000Z',
      '2021-06-09T18:21:00.000Z',
      '2021-06-09T18:22:00.000Z',
      '2021-06-09T18:23:00.000Z',
      '2021-06-09T18:24:00.000Z',
      '2021-06-09T18:25:00.000Z',
      '2021-06-09T18:26:00.000Z',
      '2021-06-09T18:27:00.000Z',
      '2021-06-09T18:28:00.000Z',
      '2021-06-09T18:29:00.000Z',
    ],
  },
};

describe('computeGroups function', () => {
  it('should return empty object when undefined groups', () => {
    const groups = undefined;

    const resul = computeGroups(inputData.assetId1, groups);

    expect(resul).toMatchObject({});
  });

  it('should return empty object when empty groups', () => {
    const groups = {};

    const resul = computeGroups(inputData.assetId1, groups);

    expect(resul).toMatchObject({});
  });

  it('should return empty object when asset data is undefined', () => {
    const groups = {
      '2021-06-09T18:10:00.000Z': [0, 1, 2, 3, 4],
      '2021-06-09T18:15:00.000Z': [5, 6, 7, 8, 9],
      '2021-06-09T18:20:00.000Z': [10, 11, 12, 13, 14],
      '2021-06-09T18:25:00.000Z': [15, 16, 17, 18, 19],
    };

    const resul = computeGroups(undefined, groups);

    expect(resul).toMatchObject({});
  });

  it('should return empty object when empty asset data', () => {
    const groups = {
      '2021-06-09T18:10:00.000Z': [0, 1, 2, 3, 4],
      '2021-06-09T18:15:00.000Z': [5, 6, 7, 8, 9],
      '2021-06-09T18:20:00.000Z': [10, 11, 12, 13, 14],
      '2021-06-09T18:25:00.000Z': [15, 16, 17, 18, 19],
    };

    const resul = computeGroups({}, groups);

    expect(resul).toMatchObject({});
  });

  it('should compute groups when asset data and groups', () => {
    const groups = {
      '2021-06-09T18:10:00.000Z': [0, 1, 2, 3, 4],
      '2021-06-09T18:15:00.000Z': [5, 6, 7, 8, 9],
      '2021-06-09T18:20:00.000Z': [10, 11, 12, 13, 14],
      '2021-06-09T18:25:00.000Z': [15, 16, 17, 18, 19],
    };

    const resul = computeGroups(inputData.assetId1, groups);

    expect(resul).toMatchObject({
      '2021-06-09T18:10:00.000Z': { metric1: 2, metric2: 4 },
      '2021-06-09T18:15:00.000Z': { metric1: 7, metric2: 14 },
      '2021-06-09T18:20:00.000Z': { metric1: 12, metric2: 24 },
      '2021-06-09T18:25:00.000Z': { metric1: 17, metric2: 34 },
    });
  });
});

describe('composeAssetData function', () => {
  it('should return empty object when empty data', () => {
    const fiveMinsPeriod = 5 * 60 * 1000;

    const resul = composeAssetData(fiveMinsPeriod, {});

    expect(resul).toMatchObject({});
  });

  it('should return empty object when no period', () => {
    const period = undefined;

    const resul = composeAssetData(period, inputData.assetId1);

    expect(resul).toMatchObject({});
  });

  it('should return formatted asset data when input data', () => {
    const fiveMinsPeriod = 5 * 60 * 1000;

    const resul = composeAssetData(fiveMinsPeriod, inputData.assetId1);

    expect(resul).toMatchObject({
      metric1: [2, 7, 12, 17],
      metric2: [4, 14, 24, 34],
      time: [
        '2021-06-09T18:10:00.000Z',
        '2021-06-09T18:15:00.000Z',
        '2021-06-09T18:20:00.000Z',
        '2021-06-09T18:25:00.000Z',
      ],
    });
  });
});

describe('aggregate function', () => {
  it('should return empty object when empty data', () => {
    const fiveMinsPeriod = 5 * 60 * 1000;

    const resul = aggregate(fiveMinsPeriod, {});

    expect(resul).toMatchObject({});
  });

  it('should return empty object when undefined data', () => {
    const fiveMinsPeriod = 5 * 60 * 1000;

    const resul = aggregate(fiveMinsPeriod, undefined);

    expect(resul).toMatchObject({});
  });

  it('should return empty object when period is zero', () => {
    const period = 0;

    const resul = aggregate(period, inputData);

    expect(resul).toMatchObject({});
  });

  it('should return empty object when undefined data', () => {
    const period = undefined;

    const resul = aggregate(period, inputData);

    expect(resul).toMatchObject({});
  });
});
