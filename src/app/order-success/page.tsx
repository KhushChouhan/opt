'use client';

import React, { Suspense, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Phone, MapPin, ShoppingBag, Mail, Globe, Upload, FileText, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'HWO-20260629-00125';
  const productName = searchParams.get('product') || 'Ray-Ban Aviator Sunglasses';
  const priceParam = searchParams.get('price') || '2499';
  const customerName = searchParams.get('name') || 'Rahul Sharma';
  const customerPhone = searchParams.get('phone') || '+91 98765 43210';
  const customerAddress = searchParams.get('address') || '123, ABC Colony, Jaipur, Rajasthan';
  const pincode = searchParams.get('pincode') || '302001';

  const priceVal = parseInt(priceParam, 10) || 2499;
  const formattedPrice = priceVal.toLocaleString('en-IN');

  const today = new Date();
  const day = today.getDate();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = months[today.getMonth()];
  const year = today.getFullYear();
  const dateStr = `${day} ${monthName} ${year}`;
  
  // Format invoice matching invoice template
  const invoiceNo = orderId.replace('HWO', 'INV');

  // Interactive Payment States
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setScreenshot(uploadEvent.target.result as string);
          setValidationError(''); // Clear upload error
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleWhatsAppRedirect = async () => {
    const cleanUtr = utr.trim();
    const utrRegex = /^\d{12}$/;

    if (!screenshot) {
      setValidationError('Please upload a screenshot of your successful UPI payment.');
      return;
    }

    if (!cleanUtr) {
      setValidationError('Please enter your 12-digit UPI UTR / Transaction ID.');
      return;
    }

    if (!utrRegex.test(cleanUtr)) {
      setValidationError('Enter a valid 12-digit numeric UTR / Transaction ID.');
      return;
    }

    setValidationError('');

    if (screenshot) {
      try {
        setCopyStatus('Copying screenshot to clipboard...');
        const blob = dataURLtoBlob(screenshot);
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        setCopyStatus('Screenshot copied! Opening WhatsApp...');
      } catch (err) {
        console.error('Failed to copy image to clipboard:', err);
        setCopyStatus('Failed to copy. Opening WhatsApp...');
      }
    }

    const msg = `*💳 HARIYANA WATCH & OPTICAL PAYMENT RECEIPT*
*Thank you for choosing us!*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*📦 ORDER INFORMATION*
*Order ID*: ${orderId}
*Order Date*: ${dateStr}
*Invoice No*: ${invoiceNo}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*👤 CUSTOMER INFORMATION*
*Name*: ${customerName}
*Mobile*: ${customerPhone}
*Address*: ${customerAddress}, PIN: ${pincode}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*🛍️ PRODUCT INFORMATION*
*Product*: ${productName}
*Quantity*: 1
*Total Amount*: ₹${formattedPrice}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*💰 PAYMENT INFORMATION*
*Amount Paid*: ₹${formattedPrice}
*Payment Method*: UPI
*UTR / Transaction ID*: ${utr.trim() || 'Provided via Screenshot'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I have successfully completed the UPI payment. Please find my receipt details above and transaction screenshot attached in this chat.`;

    // Fire background email dispatch
    fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        dateStr,
        invoiceNo,
        customerName,
        customerPhone,
        customerAddress,
        pincode,
        productName,
        formattedPrice,
        utr,
        screenshot,
      }),
    }).catch(err => {
      console.error('Silent email dispatch error:', err);
    });

    const whatsappUrl = `https://wa.me/919828207999?text=${encodeURIComponent(msg)}`;

    if (screenshot) {
      setTimeout(() => {
        window.location.href = whatsappUrl;
      }, 1000);
    } else {
      window.location.href = whatsappUrl;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20 text-gray-300">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] mb-4">
          <FileText className="w-6 h-6" />
        </div>
        <h1 className="font-luxury text-3xl font-bold tracking-wider text-white mb-2">
          Payment Receipt
        </h1>
        <p className="text-sm text-gray-400">
          Hariyana Watch & Opticals &bull; Thank you for choosing us!
        </p>
      </div>

      <Card className="border-[#C9A84C]/25 bg-[#0A1220]/90 shadow-2xl relative overflow-hidden mb-8">
        {/* Gold highlight accent top strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#c7a14e]/20 via-[#c7a14e] to-[#c7a14e]/20" />

        <CardContent className="p-6 sm:p-10 space-y-8 text-sm">
          {/* Header Branding */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800 pb-6 gap-4">
            <div>
              <h2 className="text-[#C9A84C] font-luxury text-xl font-bold tracking-wide">HARIYANA WATCH & OPTICAL</h2>
              <p className="text-xs text-gray-500 mt-1">Exquisite Timepieces & Premium Optical Wear</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs rounded uppercase tracking-wider">
              Pending Verification
            </span>
          </div>

          {/* Section 1: Order Information */}
          <div>
            <h3 className="text-[#C9A84C] font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <span>📦</span> Order Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/20 p-4 rounded-lg border border-white/5">
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Order ID</p>
                <p className="text-white font-mono font-semibold mt-0.5">{orderId}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Order Date</p>
                <p className="text-white font-semibold mt-0.5">{dateStr}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Invoice No.</p>
                <p className="text-white font-mono font-semibold mt-0.5">{invoiceNo}</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-800/80 border-dashed" />

          {/* Section 2: Customer Information */}
          <div>
            <h3 className="text-[#C9A84C] font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <span>👤</span> Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/20 p-4 rounded-lg border border-white/5">
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Name</p>
                <p className="text-white font-semibold mt-0.5">{customerName}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Mobile</p>
                <p className="text-white font-semibold mt-0.5">{customerPhone}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Shipping Address</p>
                <p className="text-white font-semibold mt-0.5 leading-relaxed">{customerAddress}, PIN: {pincode}</p>
              </div>
            </div>
          </div>

          <hr className="border-gray-800/80 border-dashed" />

          {/* Section 3: Product Information */}
          <div>
            <h3 className="text-[#C9A84C] font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <span>🛍️</span> Product Information
            </h3>
            <div className="bg-black/20 rounded-lg border border-white/5 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-800 bg-white/5 text-gray-400">
                    <th className="p-3 font-semibold">Product Description</th>
                    <th className="p-3 text-center font-semibold">Qty</th>
                    <th className="p-3 text-right font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 font-semibold text-white">
                      {productName}
                      <span className="block text-[10px] text-gray-500 font-normal mt-0.5">Premium eyewear brand catalog selection</span>
                    </td>
                    <td className="p-3 text-center text-white">1</td>
                    <td className="p-3 text-right font-bold text-white">₹{formattedPrice}</td>
                  </tr>
                  <tr className="border-t border-gray-800/60 font-bold bg-white/5 text-sm">
                    <td colSpan={2} className="p-3 text-right text-gray-400 uppercase tracking-wider text-[10px]">Total Amount</td>
                    <td className="p-3 text-right text-[#C9A84C] text-base">₹{formattedPrice}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <hr className="border-gray-800/80 border-dashed" />

          {/* Section 4: Payment QR Code & Instructions */}
          <div>
            <h3 className="text-[#C9A84C] font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <span>📱</span> Payment QR Code
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 items-center bg-black/20 p-5 rounded-lg border border-white/5">
              <div className="sm:col-span-2 flex flex-col items-center">
                <div className="bg-white p-2 rounded-xl border border-[#c7a14e]/30 relative w-[180px] h-[180px]">
                  <Image
                    src="/images/payment_qr.png"
                    alt="Payment UPI QR Code"
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2.5 font-semibold">
                  Scan QR code to pay with any UPI App
                </p>
              </div>
              <div className="sm:col-span-3 space-y-3.5">
                <div className="space-y-1">
                  <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">Merchant UPI</p>
                  <p className="text-white font-bold select-all bg-black/30 px-2 py-1.5 rounded border border-gray-800/80 inline-block font-mono text-xs">
                    9828207999@paytm
                  </p>
                </div>
                <div className="text-xs text-gray-400 space-y-1.5">
                  <p className="font-semibold text-white">Payment Steps:</p>
                  <p>1. Open GooglePay, PhonePe, Paytm or BHIM UPI.</p>
                  <p>2. Scan this QR code or input the merchant ID above.</p>
                  <p>3. Pay the exact total amount: <span className="text-[#C9A84C] font-bold">₹{formattedPrice}</span>.</p>
                  <p>4. Save the payment screenshot and type the UTR code below.</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-800/80 border-dashed" />

          {/* Section 5: UTR & Screenshot Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* UTR Input */}
            <div className="space-y-3">
              <h3 className="text-[#C9A84C] font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                <span>💰</span> Transaction Details
              </h3>
              <div className="bg-black/20 p-4 rounded-lg border border-white/5 space-y-4">
                <div className="space-y-1">
                  <label htmlFor="utr-input" className="text-gray-400 text-xs font-semibold">Transaction ID / UTR Code</label>
                  <input
                    id="utr-input"
                    type="text"
                    placeholder="Enter 12-digit UTR/UPI number"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    className="w-full bg-black/30 border border-gray-800 hover:border-gray-700 focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]/30 text-white rounded px-3 py-2 text-xs font-mono transition-all outline-none"
                  />
                </div>
                <div className="text-[10px] text-gray-500 leading-normal">
                  Providing the UTR number helps our staff verify your UPI payment instantly.
                </div>
              </div>
            </div>

            {/* Screenshot Upload */}
            <div className="space-y-3">
              <h3 className="text-[#C9A84C] font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                <span>📸</span> Payment Screenshot
              </h3>
              <div className="bg-black/20 p-4 rounded-lg border border-white/5 flex flex-col items-center justify-center min-h-[120px] relative">
                {screenshot ? (
                  <div className="w-full flex flex-col items-center">
                    <div className="relative w-full max-h-[140px] aspect-[4/3] rounded overflow-hidden border border-white/10 bg-black/40 mb-2">
                      <Image src={screenshot} alt="Screenshot Preview" fill className="object-contain p-1" />
                    </div>
                    <button
                      onClick={() => setScreenshot(null)}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold transition-colors cursor-pointer"
                    >
                      Remove & Change File
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center py-2">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-gray-500 mb-2" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-[#C9A84C] hover:text-[#E8D9A0] font-bold transition-all underline cursor-pointer"
                    >
                      Upload Payment Screenshot
                    </button>
                    <p className="text-[10px] text-gray-500 mt-1">PNG, JPG formats supported</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-800" />

          {/* Action button */}
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-lg p-5 text-center">
            <h3 className="text-white font-bold mb-1.5 flex items-center justify-center space-x-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <span>Submit & Confirm Order</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4 max-w-lg mx-auto">
              Please click below to submit your payment details and open WhatsApp to send your payment screenshot for immediate processing.
            </p>
            {validationError && (
              <div className="p-3 mb-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-md flex items-center justify-center gap-2 max-w-md mx-auto">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
            {screenshot && (
              <p className="text-xs text-[#C9A84C] font-semibold mb-3">
                💡 Tip: Your screenshot has been copied to your clipboard. Once WhatsApp opens, simply paste (Ctrl+V or long-tap and select Paste) to send the image!
              </p>
            )}
            {copyStatus && (
              <p className="text-xs text-emerald-400 font-bold mb-3 animate-pulse">
                {copyStatus}
              </p>
            )}
            <Button
              onClick={handleWhatsAppRedirect}
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center font-bold tracking-wide uppercase text-xs py-3.5"
            >
              <MessageSquare className="w-4 h-4 mr-2 fill-current" />
              Confirm Payment & Order on WhatsApp
            </Button>
          </div>

          {/* Shop Location and Contacts */}
          <div className="border-t border-gray-800 pt-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-5 text-xs text-gray-400">
              <div className="space-y-1.5">
                <p className="text-[#C9A84C] font-bold text-[10px] uppercase tracking-wider">Hariyana Watch &amp; Opticals</p>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">52 Main Bus Stand,<br/>Hanumangarh Town,<br/>Rajasthan - 335513</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[#C9A84C] font-bold text-[10px] uppercase tracking-wider">Contact Phone</p>
                <div className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-0.5">
                    <span>+91 98282-07999</span>
                    <span className="text-gray-500">(Vinod)</span>
                    <span>+91 85262-00444</span>
                    <span className="text-gray-500">(Shop)</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[#C9A84C] font-bold text-[10px] uppercase tracking-wider">Email Support</p>
                <div className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <a href="mailto:hariyanaoptical49@gmail.com" className="hover:text-white transition-colors break-all">hariyanaoptical49@gmail.com</a>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-[#C9A84C] font-bold text-[10px] uppercase tracking-wider">Online Store</p>
                <div className="flex items-start gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#C9A84C] shrink-0 mt-0.5" />
                  <a href="/" className="hover:text-white transition-colors break-all">hariyanawatchopticals.com</a>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Navigation */}
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
        <div className="w-8 h-8 border-4 border-t-[#C9A84C] border-r-[#C9A84C]/30 border-b-[#C9A84C]/30 border-l-[#C9A84C]/30 rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading details...</p>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}
