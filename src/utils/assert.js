import {HttpError} from './error';

function regex(value, regex, name, traceId, message) {
  if (!value) {
    return false;
  }
  const match = regex.exec(value);
  if (!match) {
    global.logger.warn(
        {traceId, regex: regex.toString(), value},
        'Value of parameter \'' + name + '\' doesn\'t match the regex',
    );
    throw new HttpError(
        400,
        'InvalidParameterValue',
        message ||
        'The value of parameter "' +
          name +
          '" is not valid. Please meet the following regular expression ' +
          regex.toString(),
    );
  }
  return !!match;
}

function email(value, name, traceId) {
  // eslint-disable-next-line max-len
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex(
      value,
      emailRegex,
      name,
      traceId,
      'The value of parameter "' + name + '" is not a valid E-Mail address.',
  );
}

function isoDate(value, name, traceId) {
  // eslint-disable-next-line max-len
  const isoDateRegex = /(\d{4})-(\d{2})-(\d{2})(T|\s)(\d{2})\:(\d{2})\:?(\d{2})?(\.\d{0,3})?Z?([+-](\d{2})\:(\d{2}))?/;
  return regex(
      value,
      isoDateRegex,
      name,
      traceId,
      'The value of parameter "' + name + '" is not a valid ISO date.',
  );
}

function contains(value, expected, name, traceId) {
  if (!value) {
    return false;
  }
  if (Array.isArray(expected) && expected.indexOf(value) > -1) {
    return true;
  }
  global.logger.warn(
      {traceId, expected, value},
      'Value of parameter \'' + name + '\' doesn\'t match the expected values.',
  );
  throw new HttpError(
      400,
      'InvalidParameterValue',
      'The value of parameter "' +
      name +
      '" is not valid. Only one of ' +
      JSON.stringify(expected) +
      ' is allowed.',
  );
}

export default {
  contains,
  email,
  isoDate,
  regex,
};
