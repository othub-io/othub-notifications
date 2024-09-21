const othub_db = require("../config/othub_db");
const dkg_mainnet = require("../config/dkg_mainnet");
const dkg_testnet = require("../config/dkg_testnet");
const neuroweb_mainnet = require("../config/sync_neuroweb_mainnet");
const neuroweb_testnet = require("../config/sync_neuroweb_testnet");
const gnosis_mainnet = require("../config/sync_gnosis_mainnet");
const gnosis_testnet = require("../config/sync_gnosis_testnet");
const base_mainnet = require("../config/sync_base_mainnet");
const base_testnet = require("../config/sync_base_testnet");

module.exports = executeQuery = async (query, params, network, blockchain) => {
  return new Promise(async (resolve, reject) => {
    let pool;
    
    if (blockchain === "othub_db") {
      pool = othub_db;
    }

    if (blockchain === "Chiado Testnet") {
      pool = gnosis_testnet;
    }

    if (blockchain === "Gnosis Mainnet") {
      pool = gnosis_mainnet;
    }

    if (blockchain === "NeuroWeb Testnet") {
      pool = neuroweb_testnet;
    }

    if (blockchain === "NeuroWeb Mainnet") {
      pool = neuroweb_mainnet;
    }

    if (blockchain === "Base Testnet") {
      pool = base_testnet;
    }

    if (blockchain === "Base Mainnet") {
      pool = base_mainnet;
    }

    if (network === "DKG Mainnet") {
      pool = dkg_mainnet;
    }

    if (network === "DKG Testnet") {
      pool = dkg_testnet;
    }

    await pool.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};
