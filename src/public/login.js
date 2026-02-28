const loginButton = document.getElementById('github-login');
const loginStatus = document.getElementById('login-status');

const apiBase = (document.querySelector('meta[name="api-base"]')?.content || '')
  .replace(/\/$/, '');
const apiUrl = (path) => `${apiBase}${path}`;

const base64UrlEncode = (buffer) => {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
  let binary = '';
  bytes.forEach((value) => {
    binary += String.fromCharCode(value);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const generateRandomString = (size = 64) => {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
};

const sha256 = async (value) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  return crypto.subtle.digest('SHA-256', data);
};

const setStatus = (message) => {
  if (loginStatus) {
    loginStatus.textContent = message;
  }
};

const startLogin = async () => {
  try {
    setStatus('Preparing secure sign-in...');
    const codeVerifier = generateRandomString(64);
    const state = generateRandomString(24);
    const challengeBuffer = await sha256(codeVerifier);
    const codeChallenge = base64UrlEncode(challengeBuffer);

    sessionStorage.setItem('pkce_verifier', codeVerifier);
    sessionStorage.setItem('oauth_state', state);

    const authorizeUrl = new URL(apiUrl('/api/auth/github/authorize'));
    authorizeUrl.searchParams.set('code_challenge', codeChallenge);
    authorizeUrl.searchParams.set('state', state);

    window.location.assign(authorizeUrl.toString());
  } catch (error) {
    setStatus(error.message || 'Unable to start GitHub login.');
  }
};

const existingToken = localStorage.getItem('access_token');
if (existingToken) {
  window.location.assign('/app');
}

if (loginButton) {
  loginButton.addEventListener('click', () => {
    startLogin();
  });
}
