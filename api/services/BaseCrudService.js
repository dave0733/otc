const _ = require('lodash');
const mongoose = require('mongoose');
const APIError = require('../utils/api-error');
const BaseService = require('./BaseService');

class BaseCrudService extends BaseService {
  constructor(
    modelName,
    safeFields = [],
    adminFields = [],
    userIdField = null,
    populateFields = [],
    listPopulateField = ''
  ) {
    super();

    this.modelName = modelName;
    this.safeFields = [...safeFields];
    this.fields = [...safeFields];
    this.adminFields = [...adminFields];
    this.userIdField = userIdField;
    this.populateFields = [...populateFields];
    this.listPopulateField = listPopulateField;
    this.model = mongoose.model(this.modelName);

    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.get = this.get.bind(this);
    this.remove = this.remove.bind(this);
    this.list = this.list.bind(this);
    this.removeById = this.removeById.bind(this);
    this.getOne = this.getOne.bind(this);
  }

  _getFieldNames(user) {
    if (this._isAdmin(user)) {
      return [...this.safeFields, ...this.adminFields];
    }

    return [...this.safeFields];
  }

  create(user, data, extraData = {}) {
    const Model = this.model;
    const createData = {};
    const fields = this._getFieldNames(user);

    if (this.userIdField) {
      createData[this.userIdField] = user._id;
    }

    const item = new Model(
      Object.assign(createData, _.pick(data, fields), extraData)
    );

    return item.save();
  }

  update(user, item, data) {
    const fields = this._getFieldNames(user);
    const updateData = _.pick(data, fields);

    Object.assign(item, updateData);

    return item.save();
  }

  remove(user, item) {
    return item.delete();
  }

  removeById(user, id) {
    const Model = this.model;

    return Model.deleteOne({ _id: id });
  }

  get(user, id) {
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

  getOne(user, filter = {}) {
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

  _listWhere(user, filters = {}) {
    const where = {};

    Object.keys(filters).forEach(filterName => {
      where[filterName] = filters[filterName];
    });

    if (this.userIdField && !this._isAdmin(user)) {
      where[this.userIdField] = user._id;
    }

    return where;
  }

  _listSort(user, sorts) {
    sorts.unshift('createdAt desc');

    return sorts.map(sort => sort.split(' '));
  }

  count(where = {}) {
    return this.model.count(where);
  }

  list(user, filters, sorts, skip, limit, useRawFilter = false) {
    const Model = this.model;

    const where = this._listWhere(user, filters || {});
    const sort = this._listSort(user, sorts || []);

    return Promise.all([
      Model.find(useRawFilter ? filters : where)
        .populate(this.listPopulateField)
        .sort(sort)
        .skip(skip * 1 || 0)
        .limit(limit * 1 || 20)
        .lean(),
      Model.count(where)
    ]).then(results => {
      const [items, total] = results;

      return {
        skip: skip * 1 || 0,
        limit: limit * 1 || 20,
        total,
        data: items
      };
    });
  }
}

module.exports = BaseCrudService;
