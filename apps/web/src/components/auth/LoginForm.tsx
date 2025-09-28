'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const loginSchema = z.object({
  empresaCodigo: z
    .string()
    .min(2, 'El código de empresa debe tener al menos 2 caracteres')
    .max(20, 'El código de empresa no puede exceder 20 caracteres')
    .regex(/^[A-Z0-9_-]+$/, 'Solo se permiten letras mayúsculas, números, guiones y guiones bajos'),
  username: z
    .string()
    .min(3, 'El usuario debe tener al menos 3 caracteres')
    .max(100, 'El usuario no puede exceder 100 caracteres'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      empresaCodigo: 'DEMO',
      username: 'admin',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        empresaCodigo: data.empresaCodigo,
        username: data.username,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('root', {
            message: 'Credenciales inválidas. Verifica tu código de empresa, usuario y contraseña.',
          });
        } else {
          setError('root', {
            message: 'Error al iniciar sesión. Inténtalo nuevamente.',
          });
        }
        toast.error('Error al iniciar sesión');
      } else if (result?.ok) {
        toast.success('¡Bienvenido al sistema ASC!');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('root', {
        message: 'Error de conexión. Verifica tu conexión a internet.',
      });
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Código de Empresa */}
      <div className="form-group">
        <label htmlFor="empresaCodigo" className="form-label">
          Código de Empresa
        </label>
        <input
          {...register('empresaCodigo')}
          type="text"
          id="empresaCodigo"
          placeholder="Ej: DEMO"
          className={`input ${errors.empresaCodigo ? 'input-error' : ''}`}
          disabled={isLoading}
          style={{ textTransform: 'uppercase' }}
          onChange={(e) => {
            e.target.value = e.target.value.toUpperCase();
          }}
        />
        {errors.empresaCodigo && (
          <p className="form-error">{errors.empresaCodigo.message}</p>
        )}
        <p className="form-help">
          Código único de tu empresa proporcionado por el administrador
        </p>
      </div>

      {/* Usuario */}
      <div className="form-group">
        <label htmlFor="username" className="form-label">
          Usuario
        </label>
        <input
          {...register('username')}
          type="text"
          id="username"
          placeholder="Tu nombre de usuario"
          className={`input ${errors.username ? 'input-error' : ''}`}
          disabled={isLoading}
          autoComplete="username"
        />
        {errors.username && (
          <p className="form-error">{errors.username.message}</p>
        )}
      </div>

      {/* Contraseña */}
      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Contraseña
        </label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            id="password"
            placeholder="Tu contraseña"
            className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="form-error">{errors.password.message}</p>
        )}
      </div>

      {/* Error general */}
      {errors.root && (
        <div className="rounded-md bg-danger-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-danger-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-danger-800">{errors.root.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Botón de envío */}
      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Iniciando sesión...
          </>
        ) : (
          'Iniciar Sesión'
        )}
      </button>

      {/* Credenciales de demo */}
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Credenciales de Demo
        </h4>
        <div className="text-xs text-blue-700 space-y-1">
          <div><strong>Empresa:</strong> DEMO</div>
          <div><strong>Admin:</strong> admin / admin123</div>
          <div><strong>Líder:</strong> lider1 / lider123</div>
          <div><strong>Técnico:</strong> tecnico1 / tecnico123</div>
        </div>
      </div>
    </form>
  );
}
