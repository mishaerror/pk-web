import React from 'react';

export default function Login() {
  return (
    <main className="page-root">
      <div className="container card">
        <h2>Sign in</h2>
        <form className="form">
          <label>
            Email
            <input type="email" name="email" placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input type="password" name="password" placeholder="••••••••" />
          </label>
          <button type="submit" className="btn primary">Sign in</button>
        </form>
      </div>
    </main>
  );
}
