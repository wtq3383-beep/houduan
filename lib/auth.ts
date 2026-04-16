const SESSION_COOKIE = "notes_session";
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set.`);
  }

  return value;
}

export function getLoginCredentials() {
  return {
    username: getRequiredEnv("LOGIN_USERNAME"),
    password: getRequiredEnv("LOGIN_PASSWORD")
  };
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function getSessionMaxAge() {
  return ONE_WEEK_SECONDS;
}

export function createSessionToken(username: string) {
  const secret = getRequiredEnv("SESSION_SECRET");
  return `${username}.${secret}`;
}

export function isValidSessionToken(token: string | undefined) {
  if (!token) {
    return false;
  }

  const { username } = getLoginCredentials();
  const expected = createSessionToken(username);
  return token === expected;
}
