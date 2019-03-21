const _ = require('lodash');
const mongoose = require('mongoose');
const APIError = require('../utils/api-error');
const ROLES = require('../constants/roles');

// @TODO implement pagination, filter, sort
class BaseCrudService {
  constructor(
    modelName,
    safeFields = [],
    adminFields = [],
    userIdField = null,
    populateFields = []
  ) {
    this.currentUser = null;

    this.modelName = modelName;
    this.safeFields = [...safeFields];
    this.fields = [...safeFields];
    this.adminFields = [...adminFields];
    this.userIdField = userIdField;
    this.populateFields = [...populateFields];
    this.model = mongoose.model(this.modelName);

    this.setCurrentUser = this.setCurrentUser.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.get = this.get.bind(this);
    this.remove = this.remove.bind(this);
    this.list = this.list.bind(this);
    this.removeById = this.removeById.bind(this);
    this.getOne = this.getOne.bind(this);
  }

  setCurrentUser(currentUser) {
    this.currentUser = currentUser;

    // @NOTE may need more granular fields control here
    if (currentUser && currentUser.role === ROLES.ADMIN) {
      this.fields = [...this.safeFields, ...this.adminFields];
    } else {
      this.fields = [...this.safeFields];
    }
  }

  create(data, user) {
    const Model = this.model;
    const createData = {};

    if (this.userIdField) {
      createData[this.userIdField] = user._id;
    }

    const item = new Model(
      Object.assign(createData, _.pick(data, this.fields))
    );

    return item.save();
  }

  update(item, data) {
    const updateData = _.pick(data, this.fields);

    Object.assign(item, updateData);

    return item.save();
  }

  remove(item) {
    return item.delete();
  }

  removeById(id) {
    const Model = this.model;

    return Model.deleteOne({ _id: id });
  }

  get(id) {
    const Model = this.model;
    let query = Model.findById(id);

    this.populateFields.forEach(field => {
      query = query.populate(field);
    });

    return query.then(item => {
      if (!item) throw new APIError('Not found', 404);

      return item;
    });
  }

  getOne(filter = {}) {
    const Model = this.model;
    let query = Model.findOne(filter);

    this.populateFields.forEach(field => {
      query = query.populate(field);
    });

    return query.then(item => {
      if (!item) throw new APIError('Not found', 404);

      return item;
    });
  }

  _listWhere(filters = {}) {
    const where = {};

    Object.keys(filters).forEach(filterName => {
      where[filterName] = filters[filterName];
    });

    if (
      this.userIdField &&
      this.currentUser &&
      this.currentUser.role !== ROLES.ADMIN
    ) {
      where[this.userIdField] = this.currentUser.id;
    }

    return where;
  }

  _listSort(sorts) {
    sorts.unshift('createdAt desc');

    return sorts.map(sort => sort.split(' '));
  }

  count(where = {}) {
    return this.model.count(where);
  }

  list(filters, sorts, skip, limit) {
    const Model = this.model;

    const where = this._listWhere(filters || {});
    const sort = this._listSort(sorts || []);

    return Promise.all([
      Model.find(where)
        .sort(sort)
        .skip(skip * 1 || 0)
        .limit(limit * 1 || 20)
        .lean(),
      Model.count(where)
    ]).then(results => {
      const [items, total] = results;

      return {
        skip,
        limit,
        total,
        data: items
      };
    });
  }
}

module.exports = BaseCrudService;
