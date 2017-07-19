const { expect } = require('chai');
const map = require('./index');

describe('Mapping', () => {
  it('should map correctly', () => {
    const givenQuery = {
      firstName: 'John',
      lastName: { notEqualTo: 'Doe' },
      country: {
        none: ['UK', 'US']
      },
      dob: { lessThanOrEquals: new Date('1999-01-01') },
      age: {
        any: [
          20,
          { lessThan: 55 },
          { greaterThan: 5 },
          { lessThanOrEquals: 45 },
          { greaterThanOrEquals: 15 },
          { in: [16, 26, 32] },
          { notIn: [17, 27, 33] },
        ]
      },
      $where: 'this.phones.length > 3',
      phones: {
        arrayLength: 1,
      },
      'phones.0': {
        exists: true,
      },
      and: [
        {
          pets: {
            containsElement: {
              all: [
                { kind: { or: [{ equalsTo: 'cat' }, { notEqualTo: 'dog' }] } },
                { age: { lessThan: 5 } }
              ]
            }
          }
        }
      ]
    };

    const expectedQuery = {
      firstName: 'John',
      lastName: { $ne: 'Doe' },
      country: {
        $nor: ['UK', 'US']
      },
      dob: { $lte: new Date('1999-01-01') },
      age: {
        $or: [
          20,
          { $lt: 55 },
          { $gt: 5 },
          { $lte: 45 },
          { $gte: 15 },
          { $in: [16, 26, 32] },
          { $nin: [17, 27, 33] },
        ]
      },
      $where: 'this.phones.length > 3',
      phones: {
        $size: 1
      },
      'phones.0': {
        $exists: true,
      },
      $and: [
        {
          pets: {
            $elemMatch: {
              $and: [
                { kind: { $or: [{ $eq: 'cat' }, { $ne: 'dog' }] } },
                { age: { $lt: 5 } }
              ]
            }
          }
        }
      ]
    };


    const result = map(givenQuery);
    expect(result).to.be.deep.equal(expectedQuery);
  });
});
