require("dotenv").config();
const { Telegraf } = require("telegraf");

function formatNumberWithSpaces(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = {
  DailyReport: async function DailyReport(node_data, delegator_data, node_data_24h) {
    try {

        let message = `
        OTHub Daily Report:

        Node: ${node_data[0].tokenName} on ${node_data[0].chainName}

        -Delegation-
          30d APR: ${(node_data[0].APR30d * 100).toFixed(2)}%
          Shares: ${formatNumberWithSpaces(Number(delegator_data[0].shares).toFixed(2))} (${formatNumberWithSpaces(Number(delegator_data[0].shares / node_data[0].nodeSharesTotalSupply * 100).toFixed(2))}% of supply)

          Earnings: ${formatNumberWithSpaces(Number(delegator_data[0].delegatorCurrentEarnings).toFixed(2))} Trac
          Prospective Earnings: ${formatNumberWithSpaces(Number(delegator_data[0].delegatorFutureEarnings).toFixed(2))} Trac

          Value: ${formatNumberWithSpaces(Number(delegator_data[0].delegatorStakeValueCurrent).toFixed(2))} Trac
          Prospective Value: ${formatNumberWithSpaces(Number(delegator_data[0].delegatorStakeValueFuture).toFixed(2))} Trac

        -Node-
          24H Pubs: ${formatNumberWithSpaces(Number(node_data_24h[0].pubsCommited1stEpochOnly))}
          24H Earnings: ${formatNumberWithSpaces(Number(node_data_24h[0].estimatedEarnings1stEpochOnly).toFixed(2))} Trac
          24H Rewards: ${formatNumberWithSpaces(Number(node_data_24h[0].cumulativePayouts).toFixed(2))} Trac

          Shares: ${formatNumberWithSpaces(Number(node_data[0].nodeSharesTotalSupply).toFixed(2))} shares
          Ask: ${node_data[0].nodeAsk ? `${node_data[0].nodeAsk}` : 'Not Set'}
          Operational Fee: ${node_data[0].nodeOperatorFee ? `${node_data[0].nodeOperatorFee}%` : 'Not Set'}
        `
        return message;
    } catch (error) {
      console.log(error);
    }
  },
  TotalShares: async function TotalShares(node_data, event_data) {
    try {
      let total_new_shares = 0
      let events = event_data.filter(
        (event) => event.event === 'sharesMinted'
      );
      let message;

      if(events.length > 0){
        for(const event of events){
          total_new_shares = (total_new_shares + Number(event.value))
        }
      }

      if(total_new_shares > 0){
        message = `
        OTHub Notification:

        Delegators have minted ${formatNumberWithSpaces(total_new_shares.toFixed(2))} shares for ${node_data[0].tokenName} on ${node_data[0].chainName}.
        `
      }

      return message;
    } catch (error) {
      console.log(error);
    }
  },
  OperatorFee: async function OperatorFee(node_data, event_data) {
    try {
      let events = event_data.filter(
        (event) => event.event === 'opFeeChangeStarted'
      );
      let message;

      if(events.length > 0){
        message = `
        OTHub Notification:

        ${node_data[0].tokenName} on ${node_data[0].chainName} has changed its operational fee to ${events[0].value}% .
        `
      }

      return message;
    } catch (error) {
      console.log(error);
    }
  },
  NodeAsk: async function NodeAsk(node_data, event_data) {
    try {
      let events = event_data.filter(
        (event) => event.event === 'askUpdated'
      );
      let message;

      if(events.length > 0){
        message = `
        OTHub Notification:

        ${node_data[0].tokenName} on ${node_data[0].chainName} has changed its asking price to ${events[0].value}.
        `
      }
      
      return message;
    } catch (error) {
      console.log(error);
    }
  },
  ActiveStatus: async function ActiveStatus(node_data) {
    try {
      let message;

      if(node_data[0].nodeStake < 50000){
        message = `
        OTHub Notification:

        ${node_data[0].tokenName} on ${node_data[0].chainName} has fallen below 50k stake and is no longer active.
        `
      }
      
      return message;
    } catch (error) {
      console.log(error);
    }
  },
  sendNotification: async function sendNotification(
    telegram_id,
    bot_token,
    message
  ) {
    try {
      bot = new Telegraf(bot_token);
      await bot.telegram.sendMessage(telegram_id, message);
    } catch (error) {
      console.log(error);
    }
  },
};
