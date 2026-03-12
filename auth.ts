import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [usuario] = await sql`
          SELECT * FROM usuarios WHERE email = ${credentials.email as string}
        `;
        if (!usuario) return null;

        const ok = await bcrypt.compare(credentials.password as string, usuario.password_hash);
        if (!ok) return null;

        return { id: String(usuario.id), name: usuario.nombre, email: usuario.email };
      },
    }),
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
});
