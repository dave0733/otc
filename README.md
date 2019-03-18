# OTCTrade API

## Environment setup

#### Set up mongodb

Local Mongodb is required for development.

Follow instructions on https://docs.mongodb.com/manual/installation/ .

#### Set up environment variables

Place a `.env` file in the project root directory. Contact other developers or copy configuration from heroku.

#### Set up node dependencies

We use node `lts/dubnium` which is `10.15.1` as of Mar, 2019.

[nvm](https://github.com/creationix/nvm) might be handy to take control of node versions. Follow instructions on `nvm` readme to install nvm.

And then

```sh
nvm ls-remote # list all node versions on remote
nvm install lts/dubnium # install lts/dubnium
nvm use lts/dubnium
npm i -g yarn
yarn
```

## Running the app

#### When development

```sh
yarn run serve
```

#### On Production

```sh
yarn start
```
