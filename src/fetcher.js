const axios = require('axios');

async function fetch(url) {
  return axios.get(url);
}

module.exports = {
  fetch,
};
