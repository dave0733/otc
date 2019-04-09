const messageService = require('../services/message.service');

class MessageController {
  constructor() {
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.delete = this.delete.bind(this);
    this.getByIdMiddleware = this.getByIdMiddleware.bind(this);
  }

  create(req, res, next) {
    messageService
      .create(req.user, req.chat, req.body)
      .then(message => {
        res.json(message);
      })
      .catch(next);
  }

  createFileMessage(req, res, next) {
    messageService
      .createFileMessage(req.user, req.chat, req.body, req.file)
      .then(message => {
        res.json(message);
      })
      .catch(next);
  }

  update(req, res, next) {
    messageService
      .update(req.user, req.message, req.body)
      .then(message => {
        res.json(message);
      })
      .catch(next);
  }

  delete(req, res, next) {
    messageService
      .delete(req.user, req.message)
      .then(message => {
        res.json(message);
      })
      .catch(next);
  }

  getByIdMiddleware(req, res, next, id) {
    messageService
      .get(req.user, req.chat, id)
      .then(msg => {
        req.message = msg;
        next();
      })
      .catch(next);
  }
}

module.exports = new MessageController();
