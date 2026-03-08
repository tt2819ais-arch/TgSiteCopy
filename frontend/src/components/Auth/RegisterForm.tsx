import { useState, useEffect, type FormEvent } from 'react';
import styles from './RegisterForm.module.css';
import { Input } from '@/components/UI/Input/Input';
import { Button } from '@/components/UI/Button/Button';
import useAuthStore from '@/store/authStore';
import authService from '@/services/authService';
import {
  validateUsername,
  validatePassword,
  validatePasswordConfirm,
} from '@/utils/validators';
import { cleanUsername } from '@/utils/formatters';
import { useDebounce } from '@/hooks/useDebounce';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const authError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const debouncedUsername = useDebounce(username, 500);

  // Проверка доступности имени
  useEffect(() => {
    if (!debouncedUsername || debouncedUsername.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const result = validateUsername(debouncedUsername);
    if (!result.valid) {
      setUsernameAvailable(null);
      return;
    }

    let cancelled = false;
    setCheckingUsername(true);

    authService
      .checkUsername(cleanUsername(debouncedUsername))
      .then((res) => {
        if (!cancelled) {
          setUsernameAvailable(res.available);
          if (!res.available) {
            setErrors((prev) => ({ ...prev, username: 'Имя пользователя занято' }));
          } else {
            setErrors((prev) => {
              const next = { ...prev };
              if (next.username === 'Имя пользователя занято') delete next.username;
              return next;
            });
          }
        }
      })
      .catch(() => {
        if (!cancelled) setUsernameAvailable(null);
      })
      .finally(() => {
        if (!cancelled) setCheckingUsername(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedUsername]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const usernameResult = validateUsername(username);
    if (!usernameResult.valid) newErrors.username = usernameResult.error!;

    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) newErrors.password = passwordResult.error!;

    const confirmResult = validatePasswordConfirm(password, passwordConfirm);
    if (!confirmResult.valid) newErrors.passwordConfirm = confirmResult.error!;

    if (usernameAvailable === false) {
      newErrors.username = 'Имя пользователя занято';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    try {
      await register({
        username: cleanUsername(username),
        password,
        passwordConfirm,
      });
    } catch {
      // ошибка в сторе
    }
  };

  const getUsernameHint = (): string | undefined => {
    if (checkingUsername) return 'Проверка...';
    if (usernameAvailable === true) return 'Имя свободно';
    return undefined;
  };

  const getUsernameStatus = () => {
    if (checkingUsername) return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2.5" strokeLinecap="round" className={styles.spinIcon}>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
    );
    if (usernameAvailable === true) return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
    if (usernameAvailable === false) return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="2.5" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
    return null;
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1 className={styles.title}>Nyxgram</h1>
        <p className={styles.subtitle}>Создайте аккаунт</p>
      </div>

      <div className={styles.fields}>
        <Input
          label="Имя пользователя"
          placeholder="username"
          value={username}
          onChange={(e) => {
            let val = e.target.value;
            if (val.startsWith('@')) val = val.slice(1);
            setUsername(val);
            setUsernameAvailable(null);
            if (errors.username) setErrors((prev) => ({ ...prev, username: '' }));
            if (authError) clearError();
          }}
          error={errors.username}
          hint={getUsernameHint()}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="5" r="3" />
              <line x1="12" y1="22" x2="12" y2="8" />
              <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
            </svg>
          }
          iconRight={getUsernameStatus()}
          autoComplete="username"
          autoFocus
          maxLength={11}
        />

        <Input
          label="Пароль"
          type={showPassword ? 'text' : 'password'}
          placeholder="Минимум 6 символов"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            if (authError) clearError();
          }}
          error={errors.password}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          }
          iconRight={
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {showPassword ? (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </>
              )}
            </svg>
          }
          onIconRightClick={() => setShowPassword(!showPassword)}
          autoComplete="new-password"
        />

        <Input
          label="Подтверждение пароля"
          type={showPassword ? 'text' : 'password'}
          placeholder="Повторите пароль"
          value={passwordConfirm}
          onChange={(e) => {
            setPasswordConfirm(e.target.value);
            if (errors.passwordConfirm) setErrors((prev) => ({ ...prev, passwordConfirm: '' }));
          }}
          error={errors.passwordConfirm}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
          autoComplete="new-password"
        />
      </div>

      {authError && (
        <div className={styles.authError}>{authError}</div>
      )}

      <div className={styles.actions}>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
        >
          Создать аккаунт
        </Button>

        <div className={styles.switchText}>
          Уже есть аккаунт?{' '}
          <button
            type="button"
            className={styles.switchLink}
            onClick={onSwitchToLogin}
          >
            Войти
          </button>
        </div>
      </div>
    </form>
  );
}

export default RegisterForm;
