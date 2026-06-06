import Logos from './Shared/Logo';
import { Alert } from './ui/alert';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Lock, LogIn, User, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const initialState = {
  password: '',
  rememberMe: true,
  username: '',
};

const LoginForm = ({
  error,
  loading,
  onLoginAttempt,
}: {
  readonly error: unknown;
  readonly loading: boolean;
  readonly onLoginAttempt: (
    username: string,
    password: string,
    rememberMe: boolean,
  ) => void;
}) => {
  const usernameInput = useRef<HTMLInputElement>(null);
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);
  const logo = useMemo(
    () => Logos[Math.floor(Math.random() * Logos.length)],
    [],
  );

  useEffect(() => {
    if (state.username !== '' && state.password !== '') {
      setReady(true);
    } else {
      setReady(false);
    }
  }, [state]);

  useEffect(() => {
    usernameInput.current?.focus();
  }, [loading]);

  const handleChange = (
    field: keyof typeof initialState,
    value: string | boolean,
  ) => {
    setState((previous) => ({ ...previous, [field]: value }));
  };

  const { password, rememberMe, username } = state;

  return (
    <div className="columns-3 text-center align-middle">
      <div style={{ maxWidth: 372 }}>
        <h2 className="font-mono text-inherit tracking-[-1px] leading-[1.1] whitespace-pre text-center">
          {logo}
        </h2>
        <form className="text-lg">
          <div className="segment-raised">
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                disabled={loading}
                onChange={(event) =>
                  handleChange('username', event.target.value)
                }
                placeholder="Username"
                ref={usernameInput}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                disabled={loading}
                onChange={(event) =>
                  handleChange('password', event.target.value)
                }
                placeholder="Password"
                type="password"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={rememberMe}
                disabled={loading}
                id="rememberMe"
                onCheckedChange={(checked) =>
                  handleChange('rememberMe', Boolean(checked))
                }
              />
              <label htmlFor="rememberMe">Remember Me</label>
            </div>
          </div>
          <Button
            className="login-button text-lg"
            disabled={!ready || loading}
            onClick={() => onLoginAttempt(username, password, rememberMe)}
          >
            <LogIn className="h-4 w-4" />
            Login
          </Button>
          {error && (
            <Alert className="login-failure">
              <X className="h-4 w-4" />
              {error instanceof Error ? error.message : String(error)}
            </Alert>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
