const withMissingProperty = (requestBody) => {
  if (!requestBody) {
    throw new Error('Request body is required.');
  }

  const result = [];

  for (const key in Object.keys(requestBody)) {
    const obj = { ...requestBody }; // Copy of object with different reference.
    delete obj[key];
    result.push(obj);
  }

  return result;
};

const withInvalidProperty = (requestBody, invalidValues) => {
  if (!requestBody || !invalidValues) {
    throw new Error('Request body and invalid values are both required.');
  }

  const keys1 = Object.keys(requestBody).sort();
  const keys2 = Object.keys(invalidValues).sort();

  if (keys1.length !== keys2.length) {
    throw new Error('Request body and invalid values must have the same keys.');
  }

  for (let index = 0; index < keys1.length; index++) {
    if (keys1[index] !== keys2[index]) {
      throw new Error(
        'Request body and invalid values must have the same keys.',
      );
    }
  }

  const result = [];

  for (const key of keys1) {
    const values = invalidValues[key];

    const objects = values.map((value) => {
      const obj = { ...requestBody }; // Copy of object with different reference.
      obj[key] = value;
      return obj;
    });

    result.push(...objects);
  }

  return result;
};

module.exports = { withMissingProperty, withInvalidProperty };
