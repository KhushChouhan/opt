/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, Calendar, User, Package, CreditCard, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface VerifyPageProps {
  params: {
    invoiceId: string;
  };
}

export default function InvoiceVerificationPage({ params }: VerifyPageProps) {
  const { invoiceId } = params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function verifyInvoice() {
      try {
        const res = await fetch(`/api/verify/${invoiceId}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to authenticate this invoice record.');
        }
        const verifyResult = await res.json();
        setData(verifyResult);
      } catch (err: any) {
        setError(err.message || 'Invoice authentication failed.');
      } finally {
        setLoading(false);
      }
    }

    if (invoiceId) {
      verifyInvoice();
    }
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#050C14] text-white">
        <div className="w-8 h-8 border-4 border-t-[#C8A14A] border-gray-700 rounded-full animate-spin mb-4" />
        <p className="text-sm tracking-widest text-[#E8D9A0] font-semibold">AUTHENTICATING SECURE TAX RECORD...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050C14] flex items-center justify-center py-12 px-4 relative overflow-hidden text-white font-sans">
      {/* Background Luxury grid lines overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050c14] via-[#0b131e] to-[#050c14] z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#C8A14A]/10 via-transparent to-transparent opacity-50 z-0" />
      <div className="absolute inset-0 bg-image-grid-lines luxury-grid-overlay opacity-30 z-0" />

      <div className="relative z-10 w-full max-w-xl mx-auto space-y-6">
        
        {/* Company Header */}
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-white font-luxury">
            <span className="text-[#C8A14A]">HARIYANA</span> WATCH &amp; OPTICALs
          </h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold mt-0.5">
            ERP Secure Document Verification
          </p>
        </div>

        {error ? (
          /* Error / Invalid Card */
          <Card className="border border-red-500/30 bg-[#0B131E]/95 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-red-500">Authentication Failed</h2>
                <p className="text-xs text-gray-400 tracking-wider">
                  The invoice number <span className="font-mono text-white bg-white/5 px-1.5 py-0.5 rounded">{invoiceId}</span> is not registered in our central tax directory or does not pass cryptography integrity checks.
                </p>
              </div>

              <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl text-left text-xs text-red-400/80 leading-relaxed">
                <p className="font-bold text-red-400 mb-1">Security Warning:</p>
                <p>If you received this invoice document in paper or email form, it may be invalid. Please reach out to customer support to verify database logs.</p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <Link href="/" className="flex-1">
                  <Button className="w-full bg-[#C8A14A] text-black hover:bg-[#C8A14A]/90 font-bold uppercase tracking-wider text-xs py-3">
                    Store Homepage
                  </Button>
                </Link>
                <a href="mailto:hariyanaoptical49@gmail.com" className="flex-1">
                  <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-wider text-xs py-3">
                    Contact Support
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Successful Verification Card */
          <Card className="border border-[#C8A14A]/30 bg-[#0B131E]/95 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden">
            <CardContent className="p-8 space-y-6">
              {/* Header Checkmark */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white tracking-wide">Verified Tax Invoice</h2>
                  <p className="text-[10px] text-emerald-500 font-mono tracking-widest font-extrabold uppercase">
                    Central Registry Records Match
                  </p>
                </div>
              </div>

              {/* Verification Info */}
              <div className="border border-white/5 bg-white/2 p-5 rounded-xl text-xs space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <span className="text-gray-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#C8A14A]" /> Verification Time</span>
                  <span className="font-mono text-white">{new Date(data.verification_timestamp).toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <span className="text-gray-400 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-[#C8A14A]" /> Customer Record</span>
                  <span className="font-bold text-white">{data.customer_name}</span>
                </div>

                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <span className="text-gray-400 flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-[#C8A14A]" /> Product Purchased</span>
                  <span className="font-bold text-white max-w-[200px] text-right truncate" title={data.product_name}>{data.product_name}</span>
                </div>

                <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                  <span className="text-gray-400 flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-[#C8A14A]" /> Settlement Value</span>
                  <span className="font-mono font-bold text-[#C8A14A]">₹{data.amount_paid.toLocaleString('en-IN')}.00</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#C8A14A]" /> Payment Status</span>
                  <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-black uppercase tracking-wider ${
                    data.payment_status === 'confirmed' || data.payment_status === 'delivered'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                  }`}>
                    {data.payment_status === 'confirmed' || data.payment_status === 'delivered' ? 'PAID & SETTLED' : 'AWAITING VERIFICATION'}
                  </span>
                </div>
              </div>

              {/* Masked details reminder */}
              <div className="text-[10px] text-gray-500 text-center leading-relaxed italic bg-white/2 py-2 px-4 border border-white/5 rounded-lg">
                Privacy Protected: Customer contact information and shipment address are locked behind secure cryptographic hashing.
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link href="/" className="flex-1">
                  <Button className="w-full bg-[#C8A14A] text-black hover:bg-[#C8A14A]/90 font-bold uppercase tracking-wider text-xs py-3 flex items-center justify-center gap-1">
                    Store Homepage <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href={`/receipt/${data.order_id}`} className="flex-1">
                  <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-wider text-xs py-3">
                    View Online Invoice
                  </Button>
                </Link>
              </div>

            </CardContent>
          </Card>
        )}

        {/* Security watermark footer */}
        <div className="text-center text-[10px] text-gray-500 font-mono">
          <p>© {new Date().getFullYear()} Hariyana Watch &amp; Opticals.</p>
          <p className="mt-0.5">Secure Document Verification Authority (HWO-SDVA)</p>
        </div>

      </div>
    </div>
  );
}
