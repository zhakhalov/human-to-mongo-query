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
};

const projectionOperators = {
  containsElement: '$elemMatch'
};

const logicalOperators = {
  and: '$and',
  any: '$or',
  nor: '$nor'
};

function map(query) {
  query = _.cloneDeep(query);
  query = mapQuery(query);
  const projection = mapProjection(query);
  return { query, projection }
}

function mapQuery(query) {
  mapComparisonOperators(query);
  mapLogicalOperators(query);
  return query;
}

function mapComparisonOperators(query) {
  _(query).each((value, key) => {

    // go downwards recursively
    if (_.isObject(value) && !_.isArray(value)) {
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
  let projection = {};

  _(query).each((value, key) => {
    if (_.isObject(value)) {
      for (let op in projectionOperators) {
        if (op in value) {
          projection[key] = { [projectionOperators[op]]: value[op] };
          mapQuery(value[projectionOperators[op]])
          delete query[key];
        }
      }
    }
  });

  return projection;
}

module.exports = map;