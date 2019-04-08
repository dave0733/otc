#!/usr/bin/env node

const client = require('firebase-tools');
const config = require('../config');

const deploy = () => {
  console.log('Starting firestore deployment...');
  console.log('Deploying cloud functions...');
  return client
    .deploy({
      token: config.firebaseToken,
      project: config.firebaseProject,
      only: 'functions',
      'non-interactive': true
    })
    .then(() => {
      console.log('Deploying firestore security rules...');
      return client.deploy({
        token: config.firebaseToken,
        project: config.firebaseProject,
        only: 'firestore:rules',
        'non-interactive': true
      });
    })
    .then(() => {
      console.log('Deploying storage security rules...');
      return client.deploy({
        token: config.firebaseToken,
        project: config.firebaseProject,
        only: 'storage',
        'non-interactive': true
      });
    });
};

deploy()
  .then(() => {
    console.log('Firestore deploy successful.');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
