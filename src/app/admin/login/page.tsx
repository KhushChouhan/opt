'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Shield, Lock, Mail, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Parse error from query parameters (e.g. NextAuth auth failures)
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      if (error === 'CredentialsSignin') {
        setErrorMsg('Invalid email or password. Please try again.');
      } else {
        setErrorMsg('Authentication failed: ' + error);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setErrorMsg(result.error || 'Invalid credentials. Access Denied.');
      } else {
        // Redirect to admin panel dashboard
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      console.error('Login submit error:', err);
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-[#c7a14e]/20 bg-[#0b131e]/80 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="w-12 h-12 rounded-full bg-[#0d1522] border border-[#c7a14e]/30 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-[#c7a14e]" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-wider font-luxury text-white">
            Store Administration
          </CardTitle>
          <p className="text-xs text-gray-400 mt-1">
            Access secure dashboard for Hariyana Watch & Opticals
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 rounded text-xs font-semibold flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="relative">
              <Input
                label="Administrator Email"
                type="email"
                placeholder="hariyanaoptical49@gmail.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
              <Mail className="absolute left-3 bottom-3 w-4 h-4 text-gray-500" />
            </div>

            <div className="relative">
              <Input
                label="Security Password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
              <Lock className="absolute left-3 bottom-3 w-4 h-4 text-gray-500" />
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Log In to Dashboard
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-t-[#c7a14e] border-[#c7a14e]/30 rounded-full animate-spin" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
