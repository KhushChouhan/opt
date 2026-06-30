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
        const log = (msg: string) => {
          console.log(`[NextAuth Debug] [${new Date().toISOString()}] ${msg}`);
        };

        if (!credentials?.email || !credentials?.password) {
          log('Authorize failed: Email or password missing');
          throw new Error('Please enter both email and password.');
        }

        try {
          log(`Attempting login for: ${credentials.email}`);
          
          const { data: admin, error } = await supabaseAdmin
            .from('admins')
            .select('*')
            .eq('email', credentials.email.toLowerCase().trim())
            .maybeSingle();

          if (error) {
            log(`DB Error: ${error.message}`);
            console.error('Error query admin table:', error);
            throw new Error('Database connection issue.');
          }

          if (!admin) {
            log(`Admin not found for email: ${credentials.email}`);
            throw new Error('Invalid email or password.');
          }

          log(`Admin found. Comparing password...`);
          const isPasswordValid = await bcrypt.compare(credentials.password, admin.password_hash);
          
          if (!isPasswordValid) {
            log(`Password invalid for: ${credentials.email}`);
            throw new Error('Invalid email or password.');
          }

          log(`Login successful for: ${credentials.email}`);
          return {
            id: admin.id,
            email: admin.email,
            name: 'Store Administrator',
          };
        } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : 'Authentication failed.';
          log(`Authorize caught exception: ${errMsg}`);
          console.error('Authentication authorize error:', error);
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
