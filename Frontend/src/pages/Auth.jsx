import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useGoogleLogin } from '@react-oauth/google';

/* ── Google login button ─────────────────────────────── */
function GoogleButton({ role }) {
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (tokenResponse) => {
    setLoading(true);
    try {
      // Get user info from Google using the access token
      const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });

      // Send to our backend which will verify and issue our own JWT
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        credential: tokenResponse.access_token,
        email: userInfo.data.email,
        name: userInfo.data.name,
        role,
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('email', res.data.email);
      window.location.href = role === 'seller' ? '/seller-dashboard/inventory' : '/';
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Google login failed';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => alert('Google login was cancelled or failed'),
  });

  return (
    <button
      id="auth-google"
      type="button"
      onClick={() => login()}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-outline-variant/60 bg-white text-on-surface text-[14px] font-medium hover:border-on-surface/30 hover:shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-on-surface border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
          <path d="M43.611 20.083H42V20H24v8h11.303C33.978 31.973 29.418 35 24 35c-6.075 0-11-4.925-11-11s4.925-11 11-11c2.804 0 5.358 1.063 7.294 2.794l5.659-5.659C33.386 7.53 28.936 6 24 6 13.523 6 5 14.523 5 24s8.523 18 19 18c10.477 0 18-7.5 18-18 0-1.232-.134-2.434-.389-3.917z" fill="#FFC107"/>
          <path d="M6.306 14.691l6.571 4.819C14.655 16.108 19.001 13 24 13c2.804 0 5.358 1.063 7.294 2.794l5.659-5.659C33.386 7.53 28.936 6 24 6c-7.682 0-14.344 4.337-17.694 10.691z" fill="#FF3D00"/>
          <path d="M24 42c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A10.943 10.943 0 0 1 24 33c-5.396 0-9.942-3.014-11.298-7H6.356C9.669 37.483 16.28 42 24 42z" fill="#4CAF50"/>
          <path d="M43.611 20.083H42V20H24v8h11.303a11.04 11.04 0 0 1-3.743 4.57l.003-.002 6.19 5.238C37.121 39.407 43 35 43 24c0-1.232-.134-2.434-.389-3.917z" fill="#1976D2"/>
        </svg>
      )}
      {loading ? 'Signing in…' : 'Continue with Google'}
    </button>
  );
}

/* ── tiny reusable field ─────────────────────────────── */
function Field({ id, label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-semibold tracking-wide text-on-surface uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full py-3.5 rounded-xl border border-outline-variant/70 bg-white text-on-surface text-[15px] placeholder:text-on-surface-variant/40 focus:outline-none focus:border-on-surface/50 focus:ring-2 focus:ring-on-surface/8 transition-all duration-200';

/* ── page ────────────────────────────────────────────── */
export default function Auth() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') === 'seller' ? 'seller' : 'customer';
  const initialMode = queryParams.get('role') === 'seller' ? 'register' : 'login';

  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });

  const handleInput = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log('Submitting', { mode, role, ...form }); 
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/${mode}`, {...form, role});
      console.log(response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('email', form.email);
      window.location.href = role === 'seller' ? '/seller-dashboard/inventory' : '/';
    }
    catch(err) {
      const message = err?.response?.data?.message || err.message || 'Something went wrong. Please try again.';
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F5] font-body-md flex flex-col">

      {/* ── Minimal top bar ──────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-[#F8F7F5]/90 backdrop-blur-xl border-b border-black/[0.07]">
        <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <Link to="/" className="flex items-center gap-1 group">
            <span className="material-symbols-outlined text-[24px] text-primary group-hover:scale-110 transition-transform">shopping_cart</span>
            <span className="font-display-sm text-[22px] font-bold tracking-[-0.05em] text-on-surface leading-none select-none">
              GoKart
            </span>
          </Link>
          <div className="flex items-center gap-6 font-label-md text-label-md text-on-surface-variant">
            <Link to="/" className="hidden sm:block hover:text-on-surface transition-colors duration-200">Shop</Link>
            <Link to="/collections" className="hidden sm:block hover:text-on-surface transition-colors duration-200">Collections</Link>
            <Link to="/checkout" className="flex items-center justify-center w-9 h-9 rounded-full bg-on-surface text-surface hover:bg-on-surface/85 transition-colors duration-200">
              <span className="material-symbols-outlined text-[17px]">shopping_bag</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Full-viewport split layout ─────────────── */}
      <main className="flex-grow flex">

        {/* ── LEFT: Brand panel ─────────────────────── */}
        <div className="hidden lg:flex flex-col justify-between w-[42%] min-h-screen bg-[#111111] text-white px-16 pt-40 pb-14 relative overflow-hidden">

          {/* Subtle geometric lines */}
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-px h-full bg-white/[0.06]" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-white/[0.06]" />
            {/* large circle */}
            <div className="absolute -bottom-48 -left-48 w-[520px] h-[520px] rounded-full border border-white/[0.05]" />
            <div className="absolute -bottom-32 -left-32 w-[380px] h-[380px] rounded-full border border-white/[0.04]" />
            {/* top corner dot grid */}
            <div
              className="absolute top-0 right-0 w-48 h-48 opacity-[0.035]"
              style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
          </div>

          {/* Brand */}
          <div className="relative z-10 space-y-6">
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/40">
              GoKart
            </p>
            <h2 className="font-display-sm text-[42px] leading-[50px] font-bold tracking-[-0.03em] text-white">
              {mode === 'login'
                ? <>Welcome<br />back.</>
                : <>Discover<br />your store.</>}
            </h2>
            <p className="text-[15px] leading-[26px] text-white/55 max-w-xs">
              {mode === 'login'
                ? 'Sign in to access your orders and seller dashboard.'
                : 'Join thousands of customers and sellers on GoKart — where design meets purpose.'}
            </p>
          </div>

          {/* Feature list */}
          <div className="relative z-10 space-y-4 mb-20">
            {[
              { icon: 'local_shipping', text: 'Free shipping over ₹100' },
              { icon: 'verified',       text: 'Authenticity guaranteed' },
              { icon: 'autorenew',      text: '30-day free returns' },
              { icon: 'support_agent', text: '24 / 7 support' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-white/50 text-[13px]">
                <span className="material-symbols-outlined text-[16px] text-white/30">{icon}</span>
                {text}
              </div>
            ))}
          </div>


        </div>

        {/* ── RIGHT: Form panel ─────────────────────── */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 sm:px-12 pt-28 pb-16 min-h-screen">
          <div className="w-full max-w-[420px]">

            {/* Mode tabs */}
            <div className="flex gap-8 mb-10 border-b border-outline-variant/40">
              {[
                { key: 'login',    label: 'Sign In' },
                { key: 'register', label: 'Create Account' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  id={`auth-tab-${key}`}
                  onClick={() => setMode(key)}
                  className={`pb-3.5 text-[13px] font-semibold tracking-wide transition-all duration-200 border-b-2 -mb-px ${
                    mode === key
                      ? 'border-on-surface text-on-surface'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Subheading */}
            <p className="text-[14px] text-on-surface-variant mb-8 leading-relaxed">
              {mode === 'login'
                ? 'Enter your credentials below to access your account.'
                : 'Fill in your details below to get started with GoKart.'}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

              {/* Name */}
              {mode === 'register' && (
                <Field id="auth-name" label="Full Name">
                  <div className="relative auth-field-animate">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/60 pointer-events-none">person</span>
                    <input
                      id="auth-name" name="username" type="text" autoComplete="username" required
                      value={form.username} onChange={handleInput} placeholder="Alex Rivera"
                      className={`${inputCls} pl-10 pr-4`}
                    />
                  </div>
                </Field>
              )}

              {/* Email */}
              <Field id="auth-email" label="Email Address">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/60 pointer-events-none">mail</span>
                  <input
                    id="auth-email" name="email" type="email" autoComplete="email" required
                    value={form.email} onChange={handleInput} placeholder="you@example.com"
                    className={`${inputCls} pl-10 pr-4`}
                  />
                </div>
              </Field>

              {/* Password */}
              <Field id="auth-password" label="Password">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/60 pointer-events-none">lock</span>
                  <input
                    id="auth-password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required
                    value={form.password} onChange={handleInput} placeholder="••••••••"
                    className={`${inputCls} pl-10 pr-12`}
                  />
                  <button
                    type="button" id="auth-toggle-password"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </Field>

              {/* Confirm Password */}
              {mode === 'register' && (
                <Field id="auth-confirm-password" label="Confirm Password">
                  <div className="relative auth-field-animate">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/60 pointer-events-none">lock</span>
                    <input
                      id="auth-confirm-password" name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password" required
                      value={form.confirmPassword} onChange={handleInput} placeholder="••••••••"
                      className={`${inputCls} pl-10 pr-12`}
                    />
                    <button
                      type="button" id="auth-toggle-confirm-password"
                      onClick={() => setShowConfirmPassword(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-symbols-outlined text-[18px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                </Field>
              )}

              {/* Role selector */}
              <div className="flex flex-col gap-2.5 auth-field-animate">
                <span className="text-[13px] font-semibold tracking-wide text-on-surface uppercase">I am a…</span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'customer', icon: 'shopping_bag', label: 'Customer', sub: 'Browse & shop' },
                    { key: 'seller',   icon: 'storefront',   label: 'Seller',   sub: 'List & sell' },
                  ].map(({ key, icon, label, sub }) => (
                    <button
                      key={key}
                      type="button"
                      id={`auth-role-${key}`}
                      onClick={() => setRole(key)}
                      className={`flex flex-col items-start gap-1 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        role === key
                          ? 'border-on-surface bg-on-surface text-surface shadow-md'
                          : 'border-outline-variant/60 bg-white text-on-surface hover:border-on-surface/40'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[20px] ${role === key ? 'text-surface' : 'text-on-surface-variant'}`}>{icon}</span>
                      <span className="text-[13px] font-semibold mt-1">{label}</span>
                      <span className={`text-[11px] leading-tight ${role === key ? 'text-surface/70' : 'text-on-surface-variant'}`}>{sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Forgot password */}
              {mode === 'login' && (
                <div className="flex justify-end -mt-1">
                  <a href="#" id="auth-forgot-password" className="text-[12px] text-on-surface-variant hover:text-on-surface underline-offset-2 hover:underline transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}

              {/* Submit */}
              <button
                id="auth-submit"
                type="submit"
                className="w-full mt-1 bg-on-surface text-surface py-4 rounded-xl text-[14px] font-semibold tracking-wide flex items-center justify-center gap-2 hover:bg-on-surface/85 active:scale-[0.99] transition-all duration-200 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">{mode === 'login' ? 'login' : 'person_add'}</span>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-outline-variant/50" />
                <span className="text-[12px] text-on-surface-variant tracking-widest uppercase">or</span>
                <div className="flex-1 h-px bg-outline-variant/50" />
              </div>

              {/* Google */}
              <GoogleButton role={role} />

            </form>

            {/* Switch mode */}
            <p className="mt-8 text-center text-[13px] text-on-surface-variant">
              {mode === 'login' ? (
                <>Don&apos;t have an account?{' '}
                  <button id="auth-switch-to-register" onClick={() => setMode('register')} className="text-on-surface font-semibold hover:underline underline-offset-2 transition-colors">
                    Create one
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button id="auth-switch-to-login" onClick={() => setMode('login')} className="text-on-surface font-semibold hover:underline underline-offset-2 transition-colors">
                    Sign in
                  </button>
                </>
              )}
            </p>


          </div>
        </div>
      </main>
    </div>
  );
}
