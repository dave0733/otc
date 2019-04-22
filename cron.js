require('./api/mongoose')();
const config = require('./config');
const checkExpire = require('./api/crons/expire-offer');

const checkExpireCron = setInterval(() => {
  return checkExpire()
    .then(offers => {
      console.log(`${offers.length} offers expired`);
    })
    .catch(console.error);
}, config.expireCheckInterval);

process.on(`SIGINT`, () => {
  console.log(`Starting cron shutdown`);
  clearInterval(checkExpireCron);
  process.exit(0);
});
