/**
 * Checks if `obj` is a non-empty object.
 *
 * @param {Object} obj - Object to check.
 * @returns {boolean} `true` if `obj` is a non-empty object, otherwise `false`.
 */
const isNonEmptyObject = (obj) => {
  return obj && typeof obj === 'object' && Object.keys(obj).length > 0;
};

/**
 * Checks if `obj1` and `obj2` have the same keys.
 *
 * @param {Object} obj1 - First object.
 * @param {Object} obj2 - Second object.
 * @returns {boolean} `true` if `obj1` and `obj2` have the same keys, otherwise `false`.
 */
const haveSameKeys = (obj1, obj2) => {
  return Object.keys(obj1).every((key) =>
    Object.prototype.hasOwnProperty.call(obj2, key),
  );
};

/**
 * Creates an array of request bodies each missing one property.
 * If `requestBody` has `n` properties, the result array will contain `n` objects.
 *
 * @param {Object} requestBody - Request body with valid values.
 * @returns {Array<Object>} Array of invalid request bodies
 *
 * @throws {Error} If `requestBody` is not a non-empty object.
 */
const withMissingProperty = (requestBody) => {
  if (!isNonEmptyObject(requestBody)) {
    throw new Error('Request body must be a non-empty object.');
  }

  const result = [];

  for (const key in Object.keys(requestBody)) {
    const obj = { ...requestBody }; // Copy of object with different reference.
    delete obj[key];
    result.push(obj);
  }

  return result;
};

/**
 * Creates request bodies with an invalid value fo one property.
 * The `requestBody` and `invalidValues` must have the same keys.
 *
 * @param {Object} requestBody - Request body with valid values.
 * @param {Object} invalidValues - Object with an array of invalid values for each property.
 * @returns {Array<Object>} Array of invalid request bodies
 *
 * @throws {Error} if `requestBody` or `invalidValues` is not a non-empty object or they have different keys.
 */
const withInvalidProperty = (requestBody, invalidValues) => {
  if (!isNonEmptyObject(requestBody) || !isNonEmptyObject(invalidValues)) {
    throw new Error(
      'Request body and invalid values must be a non-empty object.',
    );
  }

  if (!haveSameKeys(requestBody, invalidValues)) {
    throw new Error('Request body and invalid values must have the same keys.');
  }

  const result = [];

  for (const key of Object.keys(requestBody)) {
    const values = invalidValues[key];

    const objects = values.map((value) => {
      const obj = { ...requestBody };
      obj[key] = value;
      return obj;
    });

    result.push(...objects);
  }

  return result;
};

module.exports = { withMissingProperty, withInvalidProperty };
