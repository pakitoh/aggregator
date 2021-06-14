const env = {
  config: {
    port: process.env.PORT || 4000,
    endpoint: process.env.ENDPOINT || 'https://reference.intellisense.io/test.dataprovider',
    validPeriods: process.env.VALID_PERIODS || [10, 30, 60],
  },
};

module.exports = {
  env,
};
