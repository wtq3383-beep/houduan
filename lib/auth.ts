export function getBasicAuthSecret() {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  if (!user || !pass) {
    return null;
  }

  return `${user}:${pass}`;
}
