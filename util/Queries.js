require("dotenv").config();
const queryTypes = require("./queryTypes.js");
const queryDB = queryTypes.queryDB();

module.exports = {
  getUserNotificationRecords: async function getUserNotificationRecords() {
    try {
      console.log(`Getting user notification records...`);

      let query = "select * FROM telegram_header";
      let params = [];
      let request = await queryDB
        .getData(query, params, "", "othub_db")
        .then((results) => {
          //console.log('Query results:', results);
          return results;
          // Use the results in your variable or perform further operations
        })
        .catch((error) => {
          console.error("Error retrieving data:", error);
        });

      return request;
    } catch (error) {
      throw new Error("Error fetching user requests: " + error.message);
    }
  },
  getEventRecords: async function getEventRecords(network, blockchain) {
    try {
      console.log(`Getting ${blockchain} event records...`);
      let query;
      let params;
      let blockchains;

      if (!blockchain) {
        query = `select chain_name,chain_id from blockchains where environment = ?`;
        params = [network];
        blockchains = await queryDB
          .getData(query, params, "", "othub_db")
          .then((results) => {
            //console.log('Query results:', results);
            return results;
            // Use the results in your variable or perform further operations
          })
          .catch((error) => {
            console.error("Error retrieving data:", error);
          });
      } else {
        query = `select chain_name,chain_id from blockchains where chain_name = ?`;
        params = [blockchain];
        blockchains = await queryDB
          .getData(query, params, "", "othub_db")
          .then((results) => {
            //console.log('Query results:', results);
            return results;
            // Use the results in your variable or perform further operations
          })
          .catch((error) => {
            console.error("Error retrieving data:", error);
          });
      }

      query =
        "SELECT * FROM sync_otp_mainnet.v_nodes_notify WHERE datetime >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) ORDER BY datetime DESC";
      params = [];
      let event_data = [];
      if (!blockchain) {
        let total_event_data = [];
        for (const blockchain of blockchains) {
          result = await queryDB
            .getData(query, params, "", blockchain.chain_name)
            .then((results) => {
              //console.log('Query results:', results);
              return results;
              // Use the results in your variable or perform further operations
            })
            .catch((error) => {
              console.error("Error retrieving data:", error);
            });

          for (const record of result) {
            total_event_data.push(record);
          }

          chain_data = {
            blockchain_name: blockchain.chain_name,
            blockchain_id: blockchain.chain_id,
            data: result,
          };

          event_data.push(chain_data);
        }

        chain_data = {
          blockchain_name: "Total",
          blockchain_id: "99999",
          data: total_event_data,
        };

        event_data.unshift(chain_data);
      } else {
        for (const blockchain of blockchains) {
          result = await queryDB
            .getData(query, params, "", blockchain.chain_name)
            .then((results) => {
              //console.log('Query results:', results);
              return results;
              // Use the results in your variable or perform further operations
            })
            .catch((error) => {
              console.error("Error retrieving data:", error);
            });

          chain_data = {
            blockchain_name: blockchain.chain_name,
            blockchain_id: blockchain.chain_id,
            data: result,
          };

          event_data.push(chain_data);
        }
      }

      return event_data[0].data;
    } catch (error) {
      throw new Error("Error fetching node requests: " + error.message);
    }
  },
  getNodeRecords: async function getNodeRecords(network) {
    try {
      console.log(`Getting ${network} node records...`);

      let query = "select * FROM v_nodes";
      let params = [];
      let request = await queryDB
        .getData(query, params, network, "")
        .then((results) => {
          //console.log('Query results:', results);
          return results;
          // Use the results in your variable or perform further operations
        })
        .catch((error) => {
          console.error("Error retrieving data:", error);
        });

      return request;
    } catch (error) {
      throw new Error("Error fetching node requests: " + error.message);
    }
  },
  getNodeRecords24H: async function getNodeRecords24H(blockchain) {
    try {
      console.log(`Getting ${blockchain} 24 node records...`);

      let query = "select * FROM v_nodes_stats_last24h";
      let params = [];
      let request = await queryDB
        .getData(query, params, "", blockchain)
        .then((results) => {
          //console.log('Query results:', results);
          return results;
          // Use the results in your variable or perform further operations
        })
        .catch((error) => {
          console.error("Error retrieving data:", error);
        });

      return request;
    } catch (error) {
      throw new Error("Error fetching node requests: " + error.message);
    }
  },
  getDelegatorRecords: async function getDelegatorRecords(network) {
    try {
      console.log(`Getting ${network} delegator records...`);

      let query = "select * FROM v_delegators_stats_latest";
      let params = [];
      let request = await queryDB
        .getData(query, params, network, "")
        .then((results) => {
          //console.log('Query results:', results);
          return results;
          // Use the results in your variable or perform further operations
        })
        .catch((error) => {
          console.error("Error retrieving data:", error);
        });

      return request;
    } catch (error) {
      throw new Error("Error fetching delegator requests: " + error.message);
    }
  },
};
