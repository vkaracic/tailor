'use strict';

const ctrl = require('./user.controller');
const model = require('./user.model');
const router = require('express-promise-router')();
const auth = require('passport').authenticate('jwt');

router
  // Public routes:
  .post('/users/login', ctrl.login)
  .post('/users/forgotPassword', ctrl.forgotPassword)
  .post('/users/resetPassword', ctrl.resetPassword)
  // Protected routes:
  .get('/users', auth, ctrl.index);

module.exports = {
  model,
  router
};
