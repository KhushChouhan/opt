'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, MessageSquare, Phone, MapPin, ShoppingBag } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'Unknown ID';
  const productName = searchParams.get('product') || 'Selected Item';

  const phoneNumber = '919828207999';
  const messageText = encodeURIComponent(
    `Order confirmed! Order ID: ${orderId}\nProduct: ${productName}\n\nHello Hariyana Watch & Opticals, I have submitted my virtual try-on order request. Please confirm availability.`
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${messageText}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] mb-6 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="font-luxury text-3xl sm:text-4xl font-bold tracking-wider text-white mb-2">
          Order Submitted!
        </h1>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Thank you for choosing Hariyana Watch & Opticals. Your order request has been received.
        </p>
      </div>

      <Card className="border-[#d4af37]/20 bg-[#0b132b]/60 mb-8">
        <CardContent className="p-6 sm:p-8 space-y-6">
          {/* Order Details Summary */}
          <div className="space-y-3 pb-4 border-b border-gray-800">
            <div className="flex justify-between items-start text-sm">
              <span className="text-gray-500 uppercase tracking-wider text-xs font-semibold">Ordered Product</span>
              <span className="text-white font-bold text-right truncate max-w-[250px]">{productName}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 uppercase tracking-wider text-xs font-semibold">Order ID</span>
              <span className="text-gray-300 font-mono text-xs font-semibold select-all bg-black/30 px-2 py-1 rounded border border-gray-800">{orderId}</span>
            </div>
          </div>

          {/* Action Call for WhatsApp - VERY IMPORTANT */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-5 text-center">
            <h3 className="text-white font-bold mb-2 flex items-center justify-center space-x-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>Instant Confirmation Required</span>
            </h3>
            <p className="text-xs text-gray-300 mb-4">
              To expedite processing and coordinate pickup/delivery, please click the button below to send this order code to us directly via WhatsApp.
            </p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center">
                <MessageSquare className="w-4 h-4 mr-2 fill-current" />
                Confirm Order on WhatsApp
              </Button>
            </a>
          </div>

          {/* Shop Location and Contacts */}
          <div className="space-y-4 pt-2">
            <h4 className="text-white font-semibold uppercase tracking-wider text-xs">Shop Details & Contact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-[#d4af37] flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">
                  52 Main Bus Stand,<br />
                  Hanumangarh Town, Rajasthan
                </span>
              </div>
              <div className="flex items-start space-x-2.5">
                <Phone className="w-4 h-4 text-[#d4af37] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col text-gray-300">
                  <span>98282-07999 (Vinod Kumar)</span>
                  <span>85262-00444 (Shop)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center space-x-4">
        <Link href="/products">
          <Button variant="outline" className="text-xs">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" className="text-xs">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 space-y-4 min-h-screen">
        <div className="w-8 h-8 border-4 border-t-[#d4af37] border-r-[#d4af37]/30 border-b-[#d4af37]/30 border-l-[#d4af37]/30 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading details...</p>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
