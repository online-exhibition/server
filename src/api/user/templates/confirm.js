/* eslint-disable max-len */
export default `
Hallo {{=it.firstname}} {{=it.name}},
Sie haben das Benutzerkonto "{{=it.username}}" auf {{=it.origin}} bestätigt.

Sie können sich nun mit dem Benutzernamen und Ihrem Passwort anmelden:

{{=it.origin}}/login?id={{=it.username}}

Viel Spaß bei Ihrer Austellung.


Ihr FLAB-Team
`;
