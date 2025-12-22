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
          <button
            type="button"
            className="google-btn"
            onClick={handleGoogleSignIn}
            aria-label="Sign in with Google"
          >
            <span className="google-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fillRule="evenodd">
                  <path d="M17.64 9.2045c0-.638-.0573-1.2518-.1645-1.8477H9v3.5h4.8445c-.2082 1.1236-.8391 2.0764-1.7864 2.7173v2.2578h2.8884c1.6896-1.5582 2.718-3.8492 2.718-6.6274z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.47-.8068 5.96-2.197l-2.8884-2.2578c-.8051.5413-1.8353.8613-3.0716.8613-2.3646 0-4.3686-1.5976-5.0879-3.7413H1.9572v2.3444C3.448 16.569 6.0189 18 9 18z" fill="#34A853"/>
                  <path d="M3.9121 10.665c-.1825-.5419-.2861-1.1217-.2861-1.7119 0-.5902.1036-1.1699.2861-1.7118V4.8969H1.9572A8.9998 8.9998 0 0 0 0 8.9531c0 1.4406.3464 2.8032.9572 3.9968l2.9549-2.2849z" fill="#FBBC05"/>
                  <path d="M9 3.5796c1.3226 0 2.5124.4548 3.4476 1.346l2.583-2.583C13.4623.9065 11.423 0 9 0 6.0189 0 3.448 1.431 1.9572 3.9968l2.9549 2.3444C4.6314 5.177 6.6354 3.5796 9 3.5796z" fill="#EA4335"/>
                </g>
              </svg>
            </span>
            <span className="google-label">Sign in with Google</span>
          </button>
        </div>

      </div>
    </main>
  );
}
