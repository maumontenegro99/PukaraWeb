import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CircleAlertIcon, LoaderCircleIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Banderines } from '@/components/brand/Banderines';
import { useAuth } from '@/context/AuthContext';
import { FondoFacetado } from '@/components/brand/FondoFacetado';
import { SelectorTema } from '@/components/SelectorTema';
import insignia from '@/assets/insignia.png';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.from ?? '/admin';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    const result = await login(username, password);
    setEnviando(false);

    if (result.success) {
      navigate(destino, { replace: true });
    } else {
      setError(
        result.message === 'Error de servidor'
          ? 'El servidor no responde. Revisa que el backend esté encendido.'
          : 'El usuario o la contraseña no coinciden.'
      );
    }
  };

  return (
    <div className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      <div className="relative isolate hidden overflow-hidden lg:block">
        <FondoFacetado />
        <div className="absolute inset-0 bg-gradient-to-t from-grafito/90 via-grafito/30 to-transparent" />
        <p className="absolute bottom-10 left-10 max-w-md font-display text-6xl uppercase text-white">Siempre listos</p>
      </div>

      <div className="relative flex flex-col bg-background">
        <Banderines animado />
        <SelectorTema className="absolute top-6 right-4" />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="flex w-full max-w-sm flex-col gap-8">
            <Button asChild variant="ghost" className="-ml-3 w-fit">
              <Link to="/">
                <ArrowLeftIcon data-icon="inline-start" />
                Volver al sitio
              </Link>
            </Button>

            <div className="flex items-center gap-4">
              <img src={insignia} alt="" className="h-16 w-auto" />
              <div>
                <h1 className="font-display text-4xl uppercase">Panel del grupo</h1>
                <p className="text-sm text-muted-foreground">Acceso para dirigentes y administración</p>
              </div>
            </div>

            <form onSubmit={handleLogin} noValidate>
              <FieldGroup>
                {error && (
                  <Alert variant="destructive">
                    <CircleAlertIcon />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Field data-invalid={error ? true : undefined}>
                  <FieldLabel htmlFor="username">Usuario</FieldLabel>
                  <Input
                    id="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    aria-invalid={error ? true : undefined}
                    required
                  />
                </Field>
                <Field data-invalid={error ? true : undefined}>
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={error ? true : undefined}
                    required
                  />
                </Field>
                <Button type="submit" size="lg" disabled={enviando || !username || !password}>
                  {enviando && <LoaderCircleIcon data-icon="inline-start" className="animate-spin" />}
                  Entrar al panel
                </Button>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
