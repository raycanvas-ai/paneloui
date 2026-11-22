/** Auth.js sign-in and sign-out are CSRF-checked form POSTs; this builds and sends one. */
export async function authPost(action: string, fields: Record<string, string>) {
  const { csrfToken } = (await fetch("/api/auth/csrf").then((r) => r.json())) as { csrfToken: string };
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `/api/auth/${action}`;
  for (const [name, value] of Object.entries({ csrfToken, ...fields })) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.append(input);
  }
  document.body.append(form);
  form.submit();
}
