# Aggregator

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

## Usage
