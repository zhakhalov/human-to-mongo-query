const _ = require('lodash');

const comparisonOperators = {
  equalsTo: '$eq',
  greaterThan: '$gt',
  greaterThanOrEquals: '$gte',
  lessThan: '$lt',
  lessThanOrEquals: '$lte',
  notEqualTo: '$ne',
  in: '$in',
  notIn: '$nin',
  exists: '$exists',
  arrayLength: '$size',
};

const projectionOperators = {
  containsElement: '$elemMatch'
};

const logicalOperators = {
  and: '$and',
  all: '$and',
  any: '$or',
  or: '$or',
  none: '$nor'
};

function map(query) {
  query = _.cloneDeep(query);
  query = mapQuery(query);
  return query
}

function mapQuery(query) {
  mapProjection(query);
  mapComparisonOperators(query);
  mapLogicalOperators(query);
  return query;
}

function mapComparisonOperators(query) {
  _(query).each((value, key) => {

    // go downwards recursively
    if (_.isObject(value) && !_.isArray(value) && !_.isDate(value)) {
      query[key] = mapQuery(value);
      return;
    }

    for (let op in comparisonOperators) {
      if (key === op) {
        query[comparisonOperators[op]] = value;
        delete query[op];
      }
    }
  });
}

function mapLogicalOperators(query) {
  _(query).each((value, key) => {
    // go downwards recursively

    if (_.isArray(value)) {
      for (let op in logicalOperators) {
        if (key === op) {
          query[logicalOperators[op]] = value;
          _(value).each(elem => mapQuery(elem));
          delete query[op];
        }
      }
      return;
    }
  });
}

function mapProjection(query) {
  _(query).each((value, key) => {
    for(let op in projectionOperators) {
      if (key === op) {
        query[projectionOperators[op]] = mapQuery(value);
        delete query[key];
      }
    }
  });
}

module.exports = map;