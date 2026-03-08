import { useState, type FormEvent } from 'react';
import styles from './LoginForm.module.css';
import { Input } from '@/components/UI/Input/Input';
import { Button } from '@/components/UI/Button/Button';
import useAuthStore from '@/store/authStore';
import { validateUsername, validatePassword } from '@/utils/validators';
import { cleanUsername } from '@/utils/formatters';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const authError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const usernameResult = validateUsername(username);
    if (!usernameResult.valid) {
      newErrors.username = usernameResult.error!;
    }

    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) {
      newErrors.password = passwordResult.error!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    try {
      await login({
        username: cleanUsername(username),
        password,
      });
    } catch {
      // ошибка уже в сторе
    }
  };

  const handleUsernameChange = (value: string) => {
    let clean = value;
    if (clean.startsWith('@')) clean = clean.slice(1);
    setUsername(clean);
    if (errors.username) {
      setErrors((prev) => ({ ...prev, username: '' }));
    }
    if (authError) clearError();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1 className={styles.title}>Nyxgram</h1>
        <p className={styles.subtitle}>Войдите в аккаунт</p>
      </div>

      <div className={styles.fields}>
        <Input
          label="Имя пользователя"
          placeholder="username"
          value={username}
          onChange={(e) => handleUsernameChange(e.target.value)}
          error={errors.username}
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
          autoComplete="username"
          autoFocus
        />

        <Input
          label="Пароль"
          type={showPassword ? 'text' : 'password'}
          placeholder="Введите пароль"
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
          autoComplete="current-password"
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
          Войти
        </Button>

        <div className={styles.switchText}>
          Нет аккаунта?{' '}
          <button
            type="button"
            className={styles.switchLink}
            onClick={onSwitchToRegister}
          >
            Зарегистрироваться
          </button>
        </div>
      </div>
    </form>
  );
}

export default LoginForm;
