import React from 'react';

export default function Login() {
  const handleGoogleSignIn = () => {
    // Redirect to backend OAuth handler
    window.location.href = 'http://localhost:8443/oauth2/authorization/google';
  };

  return (
    <main className="page-root">
      <div className="container card">
        <h2>Sign in</h2>

        <div className="login-center">
          <button type="button" className="btn primary large" onClick={handleGoogleSignIn}>
            Sign in with Google
          </button>
        </div>

      </div>
    </main>
  );
}
