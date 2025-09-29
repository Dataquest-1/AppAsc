import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';

interface DecodedJwt {
  exp?: number;
  [key: string]: unknown;
}

interface ExtendedJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const decodeJwt = (token: string): DecodedJwt | null => {
  try {
    const [, payload] = token.split('.');
    if (!payload) {
      return null;
    }

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded = Buffer.from(paddedBase64, 'base64').toString('utf-8');

    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode JWT payload', error);
    return null;
  }
};

const getExpirationFromToken = (accessToken: string | undefined) => {
  if (!accessToken) {
    return undefined;
  }

  const decoded = decodeJwt(accessToken);

  if (decoded?.exp) {
    return decoded.exp * 1000;
  }

  return Date.now() + 15 * 60 * 1000;
};

const refreshAccessToken = async (token: ExtendedJWT): Promise<ExtendedJWT> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh access token: ${response.status}`);
    }

    const data = await response.json();

    if (!data?.accessToken) {
      throw new Error('No access token returned from refresh endpoint');
    }

    const accessTokenExpires = getExpirationFromToken(data.accessToken);

    return {
      ...token,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? token.refreshToken,
      accessTokenExpires,
      error: undefined,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);

    return {
      ...token,
      accessToken: undefined,
      refreshToken: undefined,
      accessTokenExpires: 0,
      error: 'RefreshAccessTokenError',
    };
  }
};

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        empresaCodigo: { label: 'Código de Empresa', type: 'text' },
        username: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.empresaCodigo || !credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              empresaCodigo: credentials.empresaCodigo,
              username: credentials.username,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();

          if (data.accessToken && data.user) {
            return {
              id: data.user.id,
              name: `${data.user.nombre} ${data.user.apellido || ''}`.trim(),
              email: data.user.email,
              username: data.user.username,
              rol: data.user.rol,
              empresaId: data.user.empresa.id,
              empresaCodigo: data.user.empresa.codigo,
              empresaNombre: data.user.empresa.nombre,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      const extendedToken = token as ExtendedJWT;

      // Initial sign in
      if (account && user) {
        const accessTokenExpires = getExpirationFromToken(user.accessToken as string | undefined);

        return {
          ...extendedToken,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires,
          username: user.username,
          rol: user.rol,
          empresaId: user.empresaId,
          empresaCodigo: user.empresaCodigo,
          empresaNombre: user.empresaNombre,
        };
      }

      const shouldRefreshToken =
        !extendedToken.accessTokenExpires ||
        Date.now() + 60 * 1000 >= extendedToken.accessTokenExpires;

      if (!shouldRefreshToken) {
        return extendedToken;
      }

      if (!extendedToken.refreshToken) {
        return {
          ...extendedToken,
          accessToken: undefined,
          accessTokenExpires: 0,
          error: 'MissingRefreshToken',
        };
      }

      return await refreshAccessToken(extendedToken);
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: (token as ExtendedJWT).accessToken,
        refreshToken: (token as ExtendedJWT).refreshToken,
        error: (token as ExtendedJWT).error,
        user: {
          ...session.user,
          id: token.sub,
          username: token.username,
          rol: token.rol,
          empresaId: token.empresaId,
          empresaCodigo: token.empresaCodigo,
          empresaNombre: token.empresaNombre,
        },
      };
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 minutes
  },
  jwt: {
    maxAge: 15 * 60, // 15 minutes
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
