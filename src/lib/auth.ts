import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Store Admin',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'hariyanaoptical49@gmail.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password.');
        }

        try {
          // Select using supabaseAdmin to bypass normal read RLS policies onadmins table
          const { data: admin, error } = await supabaseAdmin
            .from('admins')
            .select('*')
            .eq('email', credentials.email.toLowerCase().trim())
            .maybeSingle();

          if (error) {
            console.error('Error query admin table:', error);
            throw new Error('Database connection issue.');
          }

          if (!admin) {
            throw new Error('Invalid email or password.');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, admin.password_hash);
          if (!isPasswordValid) {
            throw new Error('Invalid email or password.');
          }

          return {
            id: admin.id,
            email: admin.email,
            name: 'Store Administrator',
          };
        } catch (error: unknown) {
          console.error('Authentication authorize error:', error);
          const errMsg = error instanceof Error ? error.message : 'Authentication failed.';
          throw new Error(errMsg);
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        const userWithId = session.user as { name?: string | null; email?: string | null; image?: string | null; id?: string };
        userWithId.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
