require("dotenv").config();
const notifications = require("./src/Notifications.js");
const queries = require("./util/Queries.js");

function startDailyReport() {
  const now = new Date();
  
  // Get the next 12 PM UTC
  const next12PMUTC = new Date();
  next12PMUTC.setUTCHours(12, 0, 0, 0); // Set time to 12 PM UTC
  
  // If it's already past 12 PM UTC today, schedule for tomorrow
  if (now >= next12PMUTC) {
    next12PMUTC.setUTCDate(next12PMUTC.getUTCDate() + 1); // Schedule for the next day
  }
  
  // Calculate the difference between now and next 12 PM UTC
  const timeUntilNext12PMUTC = next12PMUTC - now;

  // Use setTimeout to run processNotifications at 12 PM UTC
  setTimeout(() => {
    dailyReport();

    // After running at 12 PM UTC, set an interval to repeat every 24 hours (86,400,000 ms)
    setInterval(processNotifications, 24 * 60 * 60 * 1000);
  }, timeUntilNext12PMUTC);
}

async function dailyReport() {
  try {
    const notification_records = await queries.getUserNotificationRecords();

    const testnet_nodes = await queries.getNodeRecords("DKG Testnet");
    const mainnet_nodes = await queries.getNodeRecords("DKG Mainnet");

    const testnet_delegators = await queries.getDelegatorRecords("DKG Testnet");
    const mainnet_delegators = await queries.getDelegatorRecords("DKG Mainnet");

    const promises = notification_records.map(async (user_record) => {
      let telegram_id = user_record.telegram_id;
      let bot_token = user_record.bot_token;
      let node_id = user_record.node_id;
      let chain_id = user_record.chain_id;
      let account = user_record.account;
      let node_data;
      let delegator_data;
      let message;
      let node_data_24h;
      let blockchain = 
        chain_id === 20430 ? 'NeuroWeb Testnet' :
        chain_id === 2043 ? 'NeuroWeb Mainnet' :
        chain_id === 10200 ? 'Gnosis Testnet' :
        chain_id === 100 ? 'Gnosis Mainnet' :
        chain_id === 84532 ? 'Base Testnet' :
        chain_id === 8453 ? 'Base Mainnet' :
        ""
      let nodes24h = await queries.getNodeRecords24H(blockchain);

      if (chain_id === 20430 || chain_id === 10200 || chain_id === 84532) {
        node_data = testnet_nodes.filter(
          (node) => node.nodeId === node_id && node.chainId === chain_id
        );
        delegator_data = testnet_delegators.filter(
          (delegator) =>
            delegator.nodeId === node_id &&
            delegator.chainId === chain_id &&
            delegator.delegator === account
        );

        node_data_24h = nodes24h.filter(
          (node) => node.nodeId === node_id && node.chainId === chain_id
        );
      }

      if (chain_id === 2043 || chain_id === 100 || chain_id === 8453) {
        node_data = mainnet_nodes.filter(
          (node) => node.nodeId === node_id && node.chainId === chain_id
        );
        delegator_data = mainnet_delegators.filter(
          (delegator) =>
            delegator.nodeId === node_id &&
            delegator.chainId === chain_id &&
            delegator.delegator === account
        );

        node_data_24h = nodes24h.filter(
          (node) => node.nodeId === node_id && node.chainId === chain_id
        );
      }

      if (user_record.daily_report === 1) {
        message = await notifications.DailyReport(node_data, delegator_data, node_data_24h);
        message && await notifications.sendNotification(telegram_id, bot_token, message);
      }
    });

    const concurrentNotifications = 1000;
    await Promise.all(promises.slice(0, concurrentNotifications));
  } catch (error) {
    console.error("Error processing pending uploads:", error);
  }
}

async function processNotifications() {
  try {
    setTimeout(processNotifications, process.env.NOTIFY_TIME_MIN * 100000);
    const notification_records = await queries.getUserNotificationRecords();

    const testnet_nodes = await queries.getNodeRecords("DKG Testnet");
    const mainnet_nodes = await queries.getNodeRecords("DKG Mainnet");

    const testnet_delegators = await queries.getDelegatorRecords("DKG Testnet");
    const mainnet_delegators = await queries.getDelegatorRecords("DKG Mainnet");

    const promises = notification_records.map(async (user_record) => {
      let telegram_id = user_record.telegram_id;
      let bot_token = user_record.bot_token;
      let node_id = user_record.node_id;
      let chain_id = user_record.chain_id;
      let account = user_record.account;
      let event_data;
      let node_data;
      let delegator_data;
      let message;
      let blockchain = 
        chain_id === 20430 ? 'NeuroWeb Testnet' :
        chain_id === 2043 ? 'NeuroWeb Mainnet' :
        chain_id === 10200 ? 'Gnosis Testnet' :
        chain_id === 100 ? 'Gnosis Mainnet' :
        chain_id === 84532 ? 'Base Testnet' :
        chain_id === 8453 ? 'Base Mainnet' :
        ""

      if (chain_id === 20430 || chain_id === 10200 || chain_id === 84532) {
        node_data = testnet_nodes.filter(
          (node) => node.nodeId === node_id && node.chainId === chain_id
        );
        delegator_data = testnet_delegators.filter(
          (delegator) =>
            delegator.nodeId === node_id &&
            delegator.chainId === chain_id &&
            delegator.delegator === account
        );
        event_data = await queries.getEventRecords('DKG Testnet', blockchain);
      }

      if (chain_id === 2043 || chain_id === 100 || chain_id === 8453) {
        node_data = mainnet_nodes.filter(
          (node) => node.nodeId === node_id && node.chainId === chain_id
        );
        delegator_data = mainnet_delegators.filter(
          (delegator) =>
            delegator.nodeId === node_id &&
            delegator.chainId === chain_id &&
            delegator.delegator === account
        );
        event_data = await queries.getEventRecords('DKG Mainnet', blockchain);
      }

      if (user_record.total_shares === 1) {
        message = await notifications.TotalShares(node_data, event_data);
        message && await notifications.sendNotification(telegram_id, bot_token, message);
      }

      if (user_record.operator_fee === 1) {
        message = await notifications.OperatorFee(node_data, event_data);
        message && await notifications.sendNotification(telegram_id, bot_token, message);
      }

      if (user_record.node_ask === 1) {
        message = await notifications.NodeAsk(node_data, event_data);
        message && await notifications.sendNotification(telegram_id, bot_token, message);
      }

      if (user_record.active_status === 1) {
        message = await notifications.ActiveStatus(node_data);
        message && await notifications.sendNotification(telegram_id, bot_token, message);
      }

      console.log(`Notifications have been sent for user: ${account}`)
    });

    const concurrentNotifications = 1000;
    await Promise.all(promises.slice(0, concurrentNotifications));
  } catch (error) {
    console.error("Error processing pending uploads:", error);
  }
}

//startDailyReport();
processNotifications();