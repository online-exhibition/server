import dot from 'dot';
import trim from 'lodash/trim';

const templateSettings = {
  evaluate: /\{\{([\s\S]+?)\}\}/g,
  interpolate: /\{\{=([\s\S]+?)\}\}/g,
  encode: /\{\{!([\s\S]+?)\}\}/g,
  use: /\{\{#([\s\S]+?)\}\}/g,
  define: /\{\{##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\}\}/g,
  conditional: /\{\{\?(\?)?\s*([\s\S]*?)\s*\}\}/g,
  iterate: /\{\{~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\}\})/g,
  varname: 'it',
  strip: false,
  append: true,
  selfcontained: false,
};

/**
 * Send an E-Mail from the given template with the given scope.
 * @param  {object} transport
 * @param  {string} from
 * @param  {string} to
 * @param  {string} subject
 * @param  {object} scope
 * @param  {string} template
 * @return {object} Information about the transport
 */
export function sendEmail(transport, from, to, subject, scope, template) {
  const render = dot.template(trim(template), templateSettings);
  return transport.sendMail({
    from,
    to,
    subject,
    text: render(scope),
  });
}

export default {
  sendEmail,
};
