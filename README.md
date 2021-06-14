# Aggregator

## Table of Contents
- [Description](#description)
- [Requirements](#requirements)
- [Development](#development)
- [Usage](#usage)


## Description

Aggregator is a little service that aggregate data on-the-fly from an external endpoint based on a frequency provided in a POST request.


## Requirements

### Objective
Take time series data from a REST API endpoint and aggregate the provided data from minute values into 10 minute, 30 minute, and 1 hour averaged values based on an aggregate time period specified in the request.
The data set can be accessed here: https://reference.intellisense.io/test.dataprovider

### Details
1. Create a web service that accepts a post request with JSON data

    a. The post request should accept an object like:   
    ```
    {"period":10}
    ```     
    b. The period value provides the number of minutes to average together into 1 entry
2. On receiving a request it will use the REST endpoint above to get a set of data
3. This data will be averaged together into groups of data with one entry per period minutes
4. The output format will also be JSON and should match the import format but with less entries to reflect that entries have been averaged together
For example the API should provide around 3 hours of data with an entry in each array per minute, so if `{"period":60}` is passed in for the request the output will have 3 entries in each array of the data object representing 3 time points with a value representing 60 averaged time points each

### Data Details
The data from the service is provided in arrays of numbers and an array of ISO formatted dates. All arrays should be the same length. The values at a specific entry in each array represent the value for that metric for the time point indicated in the same entry in the time array.
The following outlines what the parts of the data format represent:

```
{
    "asset_id": {
        "metric_id": [...entries],
        "time": [...time entries]
    }
}
```

### Constraints
- The project should be provided in a Git repository such as on gitlab.com
- The service can be in any language you feel appropriate, Node.js/Javascript or Java/Spring are preferred
- The service should be packaged in a docker image
- Instructions on how to run the project should be provided


## Development

## Assumptions

### Requests
- Only accept HTTP POST requests.

- HTTP body should be `{"period": $PERIOD}`

$PERIOD could be 10, 30 or 60.
Let's validate input and throw BadResponse error otherwise.
 
### External service
- Could external service URL change in future? 
Let's make it configurable and provide it as an env var.

- Can we cache this data somehow? How often this data is updated? 
Let's assume we can't.

### Response
- Response with data from HTTP POST is not standard but can be done

- Possible responses:
  * 200 Ok + data when happy path
  * 400 Bad request when invalid response (wrong HTTP verb or invalid period)
  * 502 Bad Gateway when external endpoint response is not valid (i.e. empty)

### Data
- time series in minutes range

- shape of the data:
```javascript
{
    "asset_id": {
        "metric_id": [...entries],
        "time": [...time entries]
    }
}
```

- Could there be multiple assets data? 
Let's assume there could be.

- Could there ve multiple metrics data? 
Let's assume there could be.

- All arrays should be the same length. No need to validate.

- Entries could include `null` values but time entries couldn't.


## Architecture
```
Client --> POST request 
Server 
--> Parse input
--> Request to external service
--> Aggregate data from external service 
--> Return with data
```

## Paradigm
It is possible that an imperative implmentation of the aggregation algorithm would be more efficient but I've decided to follow a functional approach because it's something I'm currently learning about.

## Acceptance test example
Given data from endpoint 
```javascript
{
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
};
```
When calling service with period = 10 mins
Then response should be
```javascript
{
  metric1: [ 4.5, 14.5 ],
  metric2: [ 9, 29 ],
  time: [ '2021-06-09T18:10:00.000Z', '2021-06-09T18:20:00.000Z' ]
}

```

## Aggregation algorithm

From this example data provided by external endpoint, steps are as follow:
```javascript
{
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
```

1. Group entries by provided period as map {time->indexes}
```javascript
{
  '2021-06-09T18:10:00.000Z': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  '2021-06-09T18:20:00.000Z': [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
}
```

2. Compute each metric aggregating values from all indexes
```javascript
{
  '2021-06-09T18:10:00.000Z': { metric1: 4.5, metric2: 9 },
  '2021-06-09T18:20:00.000Z': { metric1: 14.5, metric2: 29 }
}
```
 
3. Compose output merging all metrics together
```javascript
{
  metric1: [ 4.5, 14.5 ],
  metric2: [ 9, 29 ],
  time: [ '2021-06-09T18:10:00.000Z', '2021-06-09T18:20:00.000Z' ]
}
```

## Usage

### Using npm

To install the node package and its dependencies
```
npm install
```

To run tests
```
npm test
```

To run the server
```
npm start
```

### Using Docker

#### 1. Using [Docker](https://www.docker.com/)

First you have to build the image
```
docker build -t aggregator .
```

And then you can run the server
```
docker run -d --rm --name my-server -p 4000:4000 aggregator
```

