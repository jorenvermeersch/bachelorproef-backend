const { gql } = require('apollo-server-core');
const { GraphQLScalarType, Kind } = require('graphql');

/**
 * Validate and parse the given input value into a date.
 * // Note: you can also use Joi to validate and parse the input
 *
 * @param {string} value - The input value.
 */
const validateAndParseDate = (value) => {
  const parsedDate = new Date(value); // Convert hard-coded AST string to Date

  // The date's time will be NaN when an invalid date was given
  if (isNaN(parsedDate.getTime())) {
    throw Error('Invalid date format used, date could not be parsed');
  }

  // Input string is a valid date, but not in ISO format
  if (parsedDate.toISOString() !== value) {
    throw new Error('Date was not in ISO format, not parsed for consistency reasons');
  }

  return parsedDate;
};

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Scalar type representing a date.\n'
   + 'Input/output: ISO string',
  // converts a value to JSON
  serialize(value) {
    return value.toISOString(); // Converts outgoing Date to string (ISO format)
  },
  // parses values from query variables
  parseValue(value) {
    // Only strings are accepted as input
    if (Number.isInteger(value)) throw new Error('Dates must be given as an ISO string, not a number');

    return validateAndParseDate(value);
  },
  // parse hard-coded values in queries, mutations...
  parseLiteral(ast) {
    // Only strings are accepted as input
    if (ast.kind !== Kind.STRING) {
      throw new Error('Date must be given as an ISO string, not a number'); // Invalid hard-coded value (not a string)
    }

    return validateAndParseDate(ast.value);
  },
});

const dateTypeDef = gql`
  scalar Date
`;

const dateResolver = {
  Date: dateScalar,
};

module.exports = {
  dateTypeDef,
  dateResolver,
};
