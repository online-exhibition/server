/* eslint-disable max-len */
export default `
Hallo {{=it.firstname}} {{=it.name}},
mit der E-Mail Adresse "{{=it.email}}" wurde ein Benutzerkonto "{{=it.username}}" auf {{=it.origin}} angelegt.

Bitte bestätigen Sie das Anlegen des Benutzerkontos mit Hilfe des folgenden Links:

{{=it.origin}}/confirm?id={{=it.registrationId}}

Falls Sie diese Benutzerkonto nicht angelegt haben, können Sie diese E-Mail ignorieren. Es ist dann von Ihrer Seite nichts weiter zu tun.


Ihr FLAB-Team
`;
