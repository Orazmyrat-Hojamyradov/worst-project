'use client'

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { fetchData, Login, SignIn } from '@/api/api';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState<LoginData>({ email: '', password: '' });
  const [signupData, setSignupData] = useState<SignupData>({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const t = useTranslations("AuthPage");

  // Check for existing token on component mount
  useEffect(() => {
    const token = Cookies.get('auth_token');
    const userData = Cookies.get('user_data');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user.role === 'admin') router.push('/admin');
        else router.push('/profile');
      } catch {
        Cookies.remove('auth_token');
        Cookies.remove('user_data');
      }
    }
  }, [router]);


  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setLoginData({ email: '', password: '' });
    setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSignupData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!loginData.email || !loginData.password) {
      setError(t('errors.fillAllFields'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await Login({ payload: loginData });

      if (!response?.access_token) {
        throw new Error(response?.message || t('errors.loginFailed'));
      }

      // Fetch user data with the new token
      const user = await fetchData({
        url: '/api/users/me',
        token: response.access_token,
      });

      // Set cookies with expiration
      Cookies.set('auth_token', response.access_token, {
        expires: 365,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      Cookies.set('user_data', JSON.stringify(user), {
        expires: 365,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      console.log("Login successful, cookies set");
      console.log("Token:", response.access_token);
      console.log("User:", user);

      setIsLoggedIn(true);

      // Small delay to ensure cookies are set before redirect
      setTimeout(() => {
        // Redirect based on role
        if (user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/profile';
        }
      }, 100);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.response?.data?.message || err?.message || t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (!signupData.name || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      setError(t('errors.fillAllFields'));
      setIsLoading(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError(t('errors.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setError(t('errors.passwordLength'));
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupData.email)) {
      setError(t('errors.invalidEmail'));
      setIsLoading(false);
      return;
    }

    try {
      // Prepare payload without confirmPassword
      const { confirmPassword, ...signupPayload } = signupData;
      
      const response = await SignIn({ payload: signupPayload });

      if (!response) {
        throw new Error(response.message || t('errors.registrationFailed'));
      }

      // Set cookies
      Cookies.set('auth_token', response.access_token, {
        expires: 365,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      Cookies.set('user_data', JSON.stringify(response.user || signupPayload), {
        expires: 365,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      console.log("Signup successful, cookies set");
      console.log("Token:", response.token);
      console.log("User:", response.user);

      setIsLoggedIn(true);

      // Small delay to ensure cookies are set before redirect
      setTimeout(() => {
        window.location.href = '/profile';
      }, 100);
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err?.response?.data?.message || err?.message || t('errors.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state for auth check
  if (isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-color)',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '3px solid var(--border-color)',
            borderTop: '3px solid var(--main-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
        </div>
        
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-color)',
      transition: 'background-color 0.3s ease, color 0.3s ease',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-color)',
          border: `1px solid var(--border-color)`,
          borderRadius: '12px',
          padding: '2rem',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: '600',
              margin: 0,
              color: 'var(--main-color)'
            }}>
              {isLogin ? t('login.title') : t('signup.title')}
            </h1>
          </div>

          <p style={{
            textAlign: 'center',
            marginBottom: '2rem',
            color: 'var(--text-color)',
            opacity: 0.7
          }}>
            {isLogin ? t('login.subtitle') : t('signup.subtitle')}
          </p>

          {/* Login Form */}
          {isLogin && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: 'var(--text-color)'
                }}>
                  {t('form.email')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail 
                    size={18} 
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-color)',
                      opacity: 0.5
                    }}
                  />
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                    placeholder={t('form.emailPlaceholder')}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      border: `1px solid var(--border-color)`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: 'var(--bg-color)',
                      color: 'var(--text-color)',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--main-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: 'var(--text-color)'
                }}>
                  {t('form.password')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock 
                    size={18} 
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-color)',
                      opacity: 0.5
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    placeholder={t('form.passwordPlaceholder')}
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                      border: `1px solid var(--border-color)`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: 'var(--bg-color)',
                      color: 'var(--text-color)',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--main-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-color)',
                      opacity: 0.5,
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#dc2626',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: isLoading ? 'var(--border-color)' : 'var(--main-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    {t('login.signingIn')}
                  </>
                ) : (
                  t('login.signIn')
                )}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {!isLogin && (
            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: 'var(--text-color)'
                }}>
                  {t('form.fullName')}
                </label>
                <div style={{ position: 'relative' }}>
                  <User 
                    size={18} 
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-color)',
                      opacity: 0.5
                    }}
                  />
                  <input
                    type="text"
                    name="name"
                    value={signupData.name}
                    onChange={handleSignupChange}
                    required
                    placeholder={t('form.fullNamePlaceholder')}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      border: `1px solid var(--border-color)`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: 'var(--bg-color)',
                      color: 'var(--text-color)',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--main-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: 'var(--text-color)'
                }}>
                  {t('form.email')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail 
                    size={18} 
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-color)',
                      opacity: 0.5
                    }}
                  />
                  <input
                    type="email"
                    name="email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    required
                    placeholder={t('form.emailPlaceholder')}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      border: `1px solid var(--border-color)`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: 'var(--bg-color)',
                      color: 'var(--text-color)',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--main-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: 'var(--text-color)'
                }}>
                  {t('form.password')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock 
                    size={18} 
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-color)',
                      opacity: 0.5
                    }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={signupData.password}
                    onChange={handleSignupChange}
                    required
                    placeholder={t('form.createPassword')}
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                      border: `1px solid var(--border-color)`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: 'var(--bg-color)',
                      color: 'var(--text-color)',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--main-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-color)',
                      opacity: 0.5,
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  color: 'var(--text-color)'
                }}>
                  {t('form.confirmPassword')}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock 
                    size={18} 
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-color)',
                      opacity: 0.5
                    }}
                  />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={signupData.confirmPassword}
                    onChange={handleSignupChange}
                    required
                    placeholder={t('form.confirmPasswordPlaceholder')}
                    style={{
                      width: '100%',
                      padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                      border: `1px solid var(--border-color)`,
                      borderRadius: '8px',
                      fontSize: '1rem',
                      backgroundColor: 'var(--bg-color)',
                      color: 'var(--text-color)',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--main-color)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-color)',
                      opacity: 0.5,
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#dc2626',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem'
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  backgroundColor: isLoading ? 'var(--border-color)' : 'var(--main-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    {t('signup.creatingAccount')}
                  </>
                ) : (
                  t('signup.createAccount')
                )}
              </button>
            </form>
          )}

          <p style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.9rem',
            color: 'var(--text-color)',
            opacity: 0.7
          }}>
            {isLogin ? t('switchMode.noAccount') : t('switchMode.haveAccount')}
            <button 
              onClick={switchMode}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--main-color)',
                textDecoration: 'none',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: 'inherit',
                marginLeft: '0.25rem'
              }}
            >
              {isLogin ? t('switchMode.signUp') : t('switchMode.signIn')}
            </button>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}