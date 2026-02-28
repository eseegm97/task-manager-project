const statusText = document.getElementById('callback-status');

const apiBase = (document.querySelector('meta[name="api-base"]')?.content || '')
  .replace(/\/$/, '');
const apiUrl = (path) => `${apiBase}${path}`;

const setStatus = (message) => {
  if (statusText) {
    statusText.textContent = message;
  }
};

const persistTokens = (payload) => {
  if (payload?.accessToken) {
    localStorage.setItem('access_token', payload.accessToken);
  }
  if (payload?.refreshToken) {
    localStorage.setItem('refresh_token', payload.refreshToken);
  }
  if (payload?.user) {
    localStorage.setItem('user_profile', JSON.stringify(payload.user));
  }
};

const exchangeCode = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');
  const errorDescription = params.get('error_description');

  if (error) {
    setStatus(errorDescription || 'GitHub sign-in failed.');
    return;
  }

  if (!code || !state) {
    setStatus('Missing OAuth response parameters.');
    return;
  }

  const storedState = sessionStorage.getItem('oauth_state');
  const codeVerifier = sessionStorage.getItem('pkce_verifier');

  if (!storedState || storedState !== state || !codeVerifier) {
    setStatus('Login session expired. Try again.');
    return;
  }

  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('pkce_verifier');

  try {
    setStatus('Exchanging code for tokens...');
    const response = await fetch(apiUrl('/api/auth/github/exchange'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
        codeVerifier
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.message || 'OAuth exchange failed.');
    }

    persistTokens(payload);
    setStatus('Signed in! Redirecting...');
    window.setTimeout(() => {
      window.location.assign('/app');
    }, 500);
  } catch (error) {
    setStatus(error.message || 'Unable to complete sign-in.');
  }
};

exchangeCode();
