import React from 'react';

export default function Login() {
  const handleGoogleLogin = () => {
    // Redirect to Spring Boot OAuth2 endpoint via proxy
    window.location.href = '/oauth2/authorization/google';
  };

  return (
    <main className="page-root">
      <div className="container card">
        <h2>Sign in</h2>

        <div className="login-center">
          {/** Use imported SVG asset for the Google icon to keep markup small */}
          <button type="button" className="google-btn" onClick={handleGoogleLogin} aria-label="Sign in with Google">
            <img src={new URL('../assets/google-g.svg', import.meta.url).href} alt="Google" className="google-icon" />
            <span className="google-label">Sign in with Google</span>
          </button>
        </div>

      </div>
    </main>
  );
}
