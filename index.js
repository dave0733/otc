const express = require('express');
const sslRedirect = require('heroku-ssl-redirect');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config');

const app = express();

app.use(sslRedirect());
app.use(helmet({ frameguard: false }));
app.use(compression());
app.use(
  bodyParser.json({
    limit: config.uploadLimit
  })
);
app.use(
  bodyParser.urlencoded({
    limit: config.uploadLimit,
    extended: false
  })
);

app.get('/', (req, res) => {
  res.send('Welcome to OTC Trading API');
});

app.listen(config.port, err => {
  if (err) throw err;

  console.log(`> Ready on ${config.host}`);
});
