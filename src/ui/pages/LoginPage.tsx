import { useState, type FormEvent } from 'react';
import { LOADING_MS } from '../loading.ts';
import Logo from '../Logo.tsx';

// A fake login: the fields are prefilled and Login always succeeds.
export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [signingIn, setSigningIn] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (signingIn) return;
    setSigningIn(true);
    setTimeout(onLogin, LOADING_MS.login);
  };
  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">
          <Logo size={44} />
        </div>
        <p className="muted login-sub">Weekly schedule review</p>
        <label>
          Username
          <input type="email" defaultValue="user1@demo.com" autoComplete="off" />
        </label>
        <label>
          Password
          <input type="password" defaultValue="demopassword" autoComplete="off" />
        </label>
        <button type="submit" className="primary big login-button" disabled={signingIn}>
          {signingIn && <span className="spinner small" aria-hidden="true" />}
          {signingIn ? 'Signing in…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
