import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/admin/login',
  },
});

// Match all routes starting with /admin, but exclude /admin/login to prevent infinite redirect loops
export const config = {
  matcher: [
    '/admin',
    '/admin/((?!login$).*)',
  ],
};
