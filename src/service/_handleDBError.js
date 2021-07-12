const ServiceError = require('../core/serviceError');

const handleDBError = (error) => {
  const { code = '', sqlMessage } = error;

  if (code === 'ER_DUP_ENTRY') {
    switch (true) {
      case sqlMessage.includes('idx_place_name_unique'):
        throw ServiceError.validationFailed('A place with this name already exists');
      case sqlMessage.includes('idx_user_email_unique'):
        throw ServiceError.validationFailed('There is already a user with this email address');
      default:
        throw ServiceError.validationFailed('This item already exists');
    }
  }

  if (code.startsWith('ER_NO_REFERENCED_ROW')) {
    switch (true) {
      case sqlMessage.includes('fk_transaction_user'):
        throw ServiceError.notFound('This user does not exist');
      case sqlMessage.includes('fk_transaction_place'):
        throw ServiceError.notFound('This place does not exist');
    }
  }

  // Rethrow error because we don't know what happened
  throw error;
};

module.exports = handleDBError;
