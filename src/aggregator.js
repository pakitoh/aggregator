function average(points) {
  return points.reduce((x, y) => x + y, 0)
    / points.length
    || 0;
}

function groupByFreq(freq, times) {
  if (!freq) {
    return {};
  }
  return times.reduce(
    (acc, time, index) => {
      const groupKey = new Date(Math.floor(Date.parse(time) / freq) * freq).toISOString();
      const currentGroupValue = acc[groupKey] || [];
      const newGroupValue = [...currentGroupValue, index];
      return { ...acc, ...{ [groupKey]: newGroupValue } };
    },
    {},
  );
}

function collectMetricData(metric, idxs) {
  return idxs.map((idx) => metric[idx]);
}

function aggregateMetric(metric, idxs) {
  return average(collectMetricData(metric, idxs));
}

function computeMetrics(assetData, idxs) {
  if (!assetData) {
    return {};
  }
  return Object.keys(assetData)
    .filter((k) => k !== 'time')
    .reduce((acc, metricName) => ({
      ...acc,
      [metricName]: aggregateMetric(assetData[metricName], idxs),
    }),
    {});
}

function computeGroups(assetData, groups) {
  if (!groups) {
    return {};
  }
  return Object.keys(groups)
    .reduce((acc, time) => ({
      ...acc,
      [time]: computeMetrics(assetData, groups[time]),
    }),
    {});
}

function formatGroup(time, metrics) {
  return Object.keys(metrics)
    .reduce((acc, metricName) => ({
      ...acc,
      [metricName]: [metrics[metricName]],
    }),
    { time: [time] });
}

function mergeGroup(groups, newMetric) {
  return Object.keys(groups)
    .reduce((acc, k) => ({
      ...acc,
      [k]: [...groups[k], ...newMetric[k]],
    }),
    {});
}

function emptyGroup(assetData) {
  return Object.keys(assetData)
    .reduce(
      (acc, metricName) => ({ ...acc, [metricName]: [] }),
      {},
    );
}

function composeAssetData(freq, assetData) {
  const timeEntries = assetData.time || [];
  const groups = computeGroups(assetData, groupByFreq(freq, timeEntries));
  return Object.keys(groups)
    .reduce(
      (acc, time) => mergeGroup(acc, formatGroup(time, groups[time])),
      emptyGroup(assetData),
    );
}

function aggregate(freq, data) {
  if (!data) {
    return {};
  }
  return Object.keys(data)
    .reduce(
      (acc, assetName) => ({
        ...acc,
        [assetName]: composeAssetData(freq, data[assetName]),
      }),
      {},
    );
}

module.exports = {
  average,
  groupByFreq,
  computeGroups,
  composeAssetData,
  aggregate,
};
