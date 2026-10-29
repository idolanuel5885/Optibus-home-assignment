import type { FormEvent } from 'react';
import Logo from '../Logo.tsx';

// A fake login: the fields are prefilled and Login always succeeds.
export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onLogin();
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
        <button type="submit" className="primary big">
          Log in
        </button>
      </form>
    </div>
  );
}
