import { HttpError } from './error';

function regex(value, regex, name, traceId, message) {
  const match = regex.exec(value);
  if (!match) {
    global.logger.warn(
      { traceId, regex: regex.toString(), value },
      "Value of parameter '" + name + "' doesn't match the regex"
    );
    throw new HttpError(
      400,
      'InvalidParameterValue',
      message ||
        'The value of parameter "' +
          name +
          '" is not valid. Please meet the following regular expression ' +
          regex.toString()
    );
  }
  return !!match;
}

function email(value, name, traceId) {
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/gi;
  return regex(
    value,
    emailRegex,
    name,
    traceId,
    'The value of parameter "' + name + '" is not a valid E-Mail address.'
  );
}

function contains(value, expected, name, traceId) {
  if (Array.isArray(expected) && expected.indexOf(value) > -1) {
    return true;
  }
  global.logger.warn(
    { traceId, expected, value },
    "Value of parameter '" + name + "' doesn't match the expected values."
  );
  throw new HttpError(
    400,
    'InvalidParameterValue',
    'The value of parameter "' +
      name +
      '" is not valid. Only one of ' +
      JSON.stringify(expected) +
      ' is allowed.'
  );
}

export default {
  contains,
  email,
  regex,
};
