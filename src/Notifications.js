require("dotenv").config();
const { Telegraf } = require("telegraf");

function formatNumberWithSpaces(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = {
  DailyReport: async function DailyReport(node_data, delegator_data, node_data_24h) {
    try {

        let message = `
        OTHub Notification:

        ${node_data[0].tokenName} Daily Report

        -Delegation-
          30d APR: ${(APR30d * 100).toFixed(2)}%
          Shares: ${formatNumberWithSpaces(delegator_data[0].shares)} (${delegator_data[0].shares / node_data[0].nodeSharesTotalSupply}% of supply)

          Earnings: ${formatNumberWithSpaces(delegator_data[0].delegatorCurrentEarnings)} Trac
          Prospective Earnings: ${formatNumberWithSpaces(delegator_data[0].delegatorCurrentEarnings)} Trac

          Value: ${formatNumberWithSpaces(delegator_data[0].delegatorStakeValueCurrent)} Trac
          Prospective Value: ${formatNumberWithSpaces(delegator_data[0].delegatorStakeValueFutur)} Trac

        -Node-
          24H Pubs: ${formatNumberWithSpaces(node_data_24h[0].pubsCommited)}
          24H Earnings: ${formatNumberWithSpaces(node_data_24h[0].estimatedEarnings)} Trac
          24H Rewards: ${formatNumberWithSpaces(node_data_24h[0].cumulativePayouts)} Trac

          Shares: ${formatNumberWithSpaces(node_data[0].nodeSharesTotalSupply)} shares
          Ask: ${node_data[0].nodeAsk}
          Operational Fee: ${node_data[0].nodeOperatorFee}%
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

        Delegators have minted ${formatNumberWithSpaces(total_new_shares.toFixed(2))} shares for ${node_data[0].tokenName}.
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
        console.log(JSON.stringify(events))
        message = `
        OTHub Notification:

        ${node_data[0].tokenName} has changed its operational fee to ${events[0].value}%.
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

        ${node_data[0].tokenName} has changed its asking price to ${events[0].value}.
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

        ${node_data[0].tokenName} has fallen below 50k stake and is no longer active.
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
