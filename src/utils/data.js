const pickBy = require('lodash/pickBy');
const difference = require('lodash/difference');

const { HttpError } = require('../utils/error');

function validate(source, required, maxValueLength = 256) {
  const nonnull = pickBy(
    source,
    (value, key) => required.includes(key) && !!value
  );
  const available = Object.keys(nonnull);
  const diff = difference(required, available);
  if (diff.length > 0) {
    throw new HttpError(
      400,
      'MissingProperty',
      'Missing ' +
        (diff.length > 1 ? 'properties' : 'property') +
        ', please specify ' +
        diff.join(', ') +
        '.'
    );
  }
  Object.keys(source).forEach(key => {
    if (source[key] != null && source[key].toString().length > maxValueLength) {
      throw new HttpError(
        400,
        'InvalidValueLength',
        'The value of parameter "' + key + '" expired the maximum length.'
      );
    }
  });
}
module.exports.validate = validate;
