class BaseCrudController {
  constructor(dataService, varName) {
    if (!dataService) {
      throw new Error('Data service not found', 500);
    }

    this.varName = varName;
    this.dataService = dataService;

    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.read = this.read.bind(this);
    this.remove = this.remove.bind(this);
    this.list = this.list.bind(this);
    this.getByIdMiddleware = this.getByIdMiddleware.bind(this);
  }

  create(req, res, next) {
    this.dataService.setCurrentUser(req.user);

    return this.dataService
      .create(req.body, req.user)
      .then(item => res.json(item))
      .catch(next);
  }

  update(req, res, next) {
    this.dataService.setCurrentUser(req.user);

    return this.dataService
      .update(req[this.varName], req.body)
      .then(item => res.json(item))
      .catch(next);
  }

  read(req, res) {
    res.json(req[this.varName]);
  }

  remove(req, res, next) {
    this.dataService.setCurrentUser(req.user);

    return this.dataService
      .remove(req[this.varName])
      .then(() => res.json({ success: true }))
      .catch(next);
  }

  list(req, res, next) {
    this.dataService.setCurrentUser(req.user);

    return this.dataService
      .list(req.query.filters, req.query.sorts, req.query.skip, req.query.limit)
      .then(items => res.json(items))
      .catch(next);
  }

  getByIdMiddleware(req, res, next, id) {
    this.dataService.setCurrentUser(req.user);
    this.dataService
      .get(id)
      .then(item => {
        req[this.varName] = item;
        next();
      })
      .catch(next);
  }
}

module.exports = BaseCrudController;
