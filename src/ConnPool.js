//client.expire('key1', 30);
//npm install redis-connection-pool
var Pool = require('redis-connection-pool')('myRedisPool', {
    host: '127.0.0.1', // default
    port: 6379, //default
    max_clients: 30, // defalut
    perform_checks: false, // checks for needed push/pop functionality
    database: 0, // database number to use
    //options: { auth_pass: 'password' }
  });

module.exports = Pool;
