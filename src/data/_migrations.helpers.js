
/**
 * Create a trigger for `tableName` whichs generates
 * a new id (UUID) when no id was provided in the INSERT query.
 *
 * @param {string} tableName - Name of the table
 */
const createIdGenerationTrigger = (tableName) => `
CREATE TRIGGER before_insert_${tableName}
  BEFORE INSERT ON ${tableName} FOR EACH ROW
  BEGIN
    IF new.id IS NULL OR new.id = '' THEN
      SET new.id = UUID();
      SET @last_uuid = new.id;
    END IF;
  END;
`;

module.exports = {
  createIdGenerationTrigger,
};
