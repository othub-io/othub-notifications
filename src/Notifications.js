require("dotenv").config();
const { Telegraf } = require("telegraf");

function formatNumberWithSpaces(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function escapeMarkdownV2(text) {
  return text
    .replace(/\./g, '\\.')
    .replace(/\-/g, '\\-')
    .replace(/\_/g, '\\_')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\!/g, '\\!')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\~/g, '\\~')
    .replace(/\`/g, '\\`')
    .replace(/\>/g, '\\>')
    .replace(/\#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/\=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}');
}

module.exports = {
  DailyReport: async function DailyReport(node_data, delegator_data, node_data_24h) {
    try {
        let message = `
📊Daily Report📊

⛓${node_data[0].tokenName} on ${node_data[0].chainName}⛓

Delegations
  📈 30d APR: ${(node_data[0].APR30d * 100).toFixed(2)}%
  ⚖️ Stake: ${formatNumberWithSpaces(Number(delegator_data[0].shares).toFixed(2))} (${formatNumberWithSpaces(Number(delegator_data[0].shares / node_data[0].nodeSharesTotalSupply * 100).toFixed(2))}% of supply)
  💰 Earnings: ${formatNumberWithSpaces(Number(delegator_data[0].delegatorCurrentEarnings).toFixed(2))} 
  🔮 Prospective Earnings: ${formatNumberWithSpaces(Number(delegator_data[0].delegatorFutureEarnings).toFixed(2))} 

Node
  🏆 24h Pubs: ${formatNumberWithSpaces(Number(node_data_24h[0].pubsCommited1stEpochOnly))}
  💰 24h Earnings: ${formatNumberWithSpaces(Number(node_data_24h[0].estimatedEarnings1stEpochOnly).toFixed(2))} 
  🔮 24h Rewards: ${formatNumberWithSpaces(Number(node_data_24h[0].cumulativePayouts).toFixed(2))} 

  ⚖️ Total Stake: ${formatNumberWithSpaces(Number(node_data[0].nodeSharesTotalSupply).toFixed(2))}
  ⚙️ Ask: ${node_data[0].nodeAsk ? `${node_data[0].nodeAsk}` : 'Not Set'}
  🧾 Operator Fee: ${node_data[0].nodeOperatorFee ? `${node_data[0].nodeOperatorFee}%` : 'Not Set'}

👉 Brought to you by OTHub.io 👈
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

      if(total_new_shares > 1){
        message = `
🟢 New Delegation Alert! 🟢

Delegators have staked ${formatNumberWithSpaces(total_new_shares.toFixed(2))} TRAC to ${node_data[0].tokenName} on ${node_data[0].chainName}.
The new total stake is now ${formatNumberWithSpaces(Number(node_data[0].nodeSharesTotalSupply).toFixed(2))}!

👉 Find out more on OTHub.io 👈
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
🟠 Operator Fee Change! 🟠

${node_data[0].tokenName} on ${node_data[0].chainName} has changed its operator fee to ${events[0].value}%!
        
👉 Find out more on OTHub.io 👈
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
🟠 Ask Price Change! 🟠

${node_data[0].tokenName} on ${node_data[0].chainName} has changed its asking price to ${events[0].value}!

👉 Find out more on OTHub.io 👈
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
🔴 Node Stake Alert! 🔴

${node_data[0].tokenName} on ${node_data[0].chainName} has fallen below 50k stake and is no longer active.

👉 Find out more on OTHub.io 👈
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
      const bot = new Telegraf(bot_token);
      const escapedMessage = escapeMarkdownV2(message); // Escape special characters
      await bot.telegram.sendMessage(telegram_id, escapedMessage, { parse_mode: 'MarkdownV2' });
    } catch (error) {
      console.log(error);
    }
  },
};