Mapping more-or-less human-readeable query language to native MongoDB queries.

## Example
```js

const mapQuery = require('human-to-mongo-queries');


const query = {
  firstName: 'John',
  lastName: { notEqualTo: 'Doe' },
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
  pets: {
    containsElement: {
      and: [
        { kind: { any: [{ equalsTo: 'cat' }, { notEqualTo: 'dog' }] } },
        { age: { lessThan: 5 } }
      ]
    }
  }
};

const result = map(givenQuery);

/**
`result` will have the following value

{
  firstName: 'John',
  lastName: { $ne: 'Doe' },
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
  pets: {
    $elemMatch: {
      $and: [
        { kind: { $or: [{ $eq: 'cat' }, { $ne: 'dog' }] } },
        { age: { $lt: 5 } }
      ]
    }
  }
}

```

## Available operators

### Comparison operators
- equalsTo - maps to Mongo `$eq`;

  Example:
  ```json
  {
    "name": { "equalsTo": "John" }
  }
  ```

  Will be translated to:
  ```json
  {
    "name": { "$eq": "John" }
  }
  ```

- notEqualTo - maps to Mongo `$ne`;

  Example:
  ```json
  {
    "name": { "notEqualTo": "John" }
  }
  ```

  Will be translated to:
  ```json
  {
    "name": { "$ne": "John" }
  }
  ```
- greaterThan - maps to Mongo `$gt`;

  Example:
  ```json
  {
    "age": { "greaterThan": 21 }
  }
  ```

  Will be translated to:
  ```json
  {
    "age": { "$gt": 21 }
  }
  ```

- greaterThanOrEquals - maps to Mongo `$gte`;

  Example:
  ```json
  {
    "name": { "greaterThanOrEquals": 21 }
  }
  ```

  Will be translated to:
  ```json
  {
    "name": { "$gte": 21 }
  }
  ```

- lessThan - maps to Mongo `$lt`;

  Example:
  ```json
  {
    "name": { "lessThan": 21 }
  }
  ```

  Will be translated to:
  ```json
  {
    "name": { "$lt": 21 }
  }
  ```

- lessThanOrEquals - maps to Mongo `$lte`;

  Example:
  ```json
  {
    "name": { "lessThanOrEquals": 21 }
  }
  ```

  Will be translated to:
  ```json
  {
    "name": { "$lt": 21 }
  }
  ```

- in - maps to Mongo `$in`;

  Example:
  ```json
  {
    "name": { "in": ["John", "Jack", "Jim"] }
  }
  ```

  Will be translated to:
  ```json
  {
    "name": { "$in": ["John", "Jack", "Jim"] }
  }
  ```

- notIn - maps to Mongo `$nin`;

  Example:
  ```json
  {
    "name": { "notIn": ["John", "Jack", "Jim"] }
  }
  ```

  Will be translated to:
  ```json
  {
    "name": { "$nin": ["John", "Jack", "Jim"] }
  }
  ```

- exists - maps to Mongo `$exists`;

  Example:
  ```json
  {
    "name": { "exists": true }
  }
  ```

  Will be translated to:
  ```json
  {
    "name": { "$exists": true }
  }
  ```

- arrayLength - maps to Mongo `$size`;
  - Note: This operator will work only in case of strict equality. Use `$where` statement if length comparison is needed.

  Example:
  ```json
  {
    "phones": { "arrayLength": 1 }
  }
  ```

  Will be translated to:
  ```json
  {
    "phones": { "$size": 1 }
  }
  ```

### Logical operator
- and - `$and` true if all conditions are true

  Example:
  ```json
  {
    "name": {
      "and": [
        { "notEqualTo": "John" },
        { "notEqualTo": "Jack" },
        { "notEqualTo": "Jim" }
      ]
    }
  }
  ```

  Will be translated to:
  ```json
  {
    "name": {
      "$and": [
        { "$ne": "John" },
        { "$ne": "Jack" },
        { "$ne": "Jim" }
      ]
    }
  }
  ```

- any - `$or` true if any of conditions is true

  Example:
  ```json
  {
    "name": {
      "any": [
        { "equalTo": "John" },
        { "equalTo": "Jack" },
        { "equalTo": "Jim" }
      ]
    }
  }
  ```

  Will be translated to:
  ```json
  {
    "name": {
      "$or": [
        { "$eq": "John" },
        { "$eq": "Jack" },
        { "$eq": "Jim" }
      ]
    }
  }
  ```

- none - `$nor` true if all conditions are false

  Example:
  ```json
  {
    "name": {
      "none": [
        { "equalTo": "John" },
        { "equalTo": "Jack" },
        { "equalTo": "Jim" }
      ]
    }
  }
  ```

  Will be translated to:
  ```json
  {
    "name": {
      "$nor": [
        { "$eq": "John" },
        { "$eq": "Jack" },
        { "$eq": "Jim" }
      ]
    }
  }
  ```

### Projection Operators

- containsElement - perform comparison on arrays of objects. Maps to `$elemMatch` projection.
  - Note: use `equalsTo` operator if types of values are primitive (boolean, string, number)

  Example
  ```json
  {
    "pets": {
      "containsElement": {
        "and": [
          { "kind": { "any": [{ "equalsTo": "cat" }, { "notEqualTo": "dog" }] } },
          { "age": { "lessThan": 5 } }
        ]
      }
    }
  }
  ```

  Will be matted to:
  ```json
  {
    "pets": {
      "$elemMatch": {
        "$and": [
          { "kind": { "$or": [{ "$eq": "cat" }, { "$ne": "dog" }] } },
          { "age": { "$lt": 5 } }
        ]
      }
    }
  }
  ```

