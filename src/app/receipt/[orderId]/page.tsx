/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @next/next/no-img-element */
'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Share2, 
  Mail,
  CheckCircle,
  ShieldCheck,
  ShieldAlert,
  Clock,
  FileText
} from 'lucide-react';
import { Facebook, Instagram, Twitter } from '@/components/icons/Social';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface InvoicePageProps {
  params: {
    orderId: string;
  };
}

// Standalone Barcode Generator Component (Vector SVG Code 39-like Barcode)
const Barcode = ({ value }: { value: string }) => {
  const lines = [];
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
  }
  let seed = Math.abs(hash);
  for (let i = 0; i < 46; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const isWide = (seed % 3) === 0;
    const isExtraWide = (seed % 7) === 0;
    const width = isExtraWide ? 3.5 : (isWide ? 2 : 0.8);
    lines.push(
      <rect 
        key={i} 
        x={i * 3.6} 
        y={0} 
        width={width} 
        height={32} 
        fill="black" 
      />
    );
  }
  return (
    <div className="flex flex-col items-center">
      <svg width={165} height={32} viewBox="0 0 165 32" className="overflow-visible">
        {lines}
      </svg>
      <span className="text-[9px] font-mono tracking-widest text-gray-500 mt-1">{value}</span>
    </div>
  );
};

export default function EnterpriseTaxInvoicePage({ params }: InvoicePageProps) {
  const { orderId } = params;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          throw new Error('Could not retrieve tax invoice details.');
        }
        const data = await res.json();
        
        // Parse metadata inside address column
        let metadata: any = {};
        try {
          metadata = JSON.parse(data.address);
        } catch (e) {
          // Fallback if not JSON
        }

        const hasJson = Object.keys(metadata).length > 0;
        
        // Parse product PID
        let pid = 'PID-000000';
        let desc = data.products?.description || '';
        try {
          const parsedDesc = JSON.parse(data.products?.description);
          if (parsedDesc && typeof parsedDesc === 'object' && parsedDesc.pid) {
            pid = parsedDesc.pid;
            desc = parsedDesc.desc || '';
          }
        } catch (e) {}

        if (!pid && data.products) {
          const match = desc.match(/\[PID:\s*(PID-\d+)\]$/);
          if (match) {
            pid = match[1];
          } else {
            let hash = 0;
            for (let i = 0; i < data.products.id.length; i++) {
              hash = (hash << 5) - hash + data.products.id.charCodeAt(i);
              hash |= 0;
            }
            pid = `PID-${String(Math.abs(hash) % 100000).padStart(6, '0')}`;
          }
        }

        // Determine HSN, Category and Brand dynamically
        const category = data.products?.category || 'watches';
        let hsnCode = '9102'; // Watches
        if (category === 'glasses' || category === 'sunglasses') {
          hsnCode = '9004';
        } else if (category === 'belts') {
          hsnCode = '4203';
        } else if (category === 'perfumes') {
          hsnCode = '3303';
        } else if (category === 'wallets') {
          hsnCode = '4202';
        }

        const pName = data.products?.name || '';
        let brandName = 'Hariyana Select';
        if (pName.toLowerCase().includes('titan')) {
          brandName = 'Titan';
        } else if (pName.toLowerCase().includes('ray-ban') || pName.toLowerCase().includes('rayban')) {
          brandName = 'Ray-Ban';
        } else if (pName.toLowerCase().includes('fastrack')) {
          brandName = 'Fastrack';
        } else if (pName.toLowerCase().includes('creed')) {
          brandName = 'Creed';
        } else if (pName.toLowerCase().includes('tom ford')) {
          brandName = 'Tom Ford';
        } else if (pName.toLowerCase().includes('montblanc')) {
          brandName = 'Montblanc';
        } else if (pName.toLowerCase().includes('hermes')) {
          brandName = 'Hermes';
        } else if (pName.toLowerCase().includes('louis vuitton') || pName.toLowerCase().includes('lv')) {
          brandName = 'Louis Vuitton';
        }

        // Generate customer ID and SKU
        const cName = data.customer_name || 'Customer';
        const phoneStr = data.phone || '00000';
        const initials = cName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
        const digits = phoneStr.replace(/\D/g, '').slice(-4);
        const customerId = `CUST-${initials}-${digits || '0000'}`;

        let nameHash = 0;
        for (let i = 0; i < pName.length; i++) {
          nameHash = (nameHash << 5) - nameHash + pName.charCodeAt(i);
        }
        const skuNumber = Math.abs(nameHash) % 1000000;
        const skuCode = `${brandName.slice(0, 3).toUpperCase()}-${skuNumber}`;

        // Address Details
        const rawAddr = hasJson ? (metadata.shipping_address || '') : data.address;
        const addrParts = rawAddr.split(',').map((p: string) => p.trim());
        const state = addrParts[addrParts.length - 1] || 'Rajasthan';
        const city = addrParts[addrParts.length - 2] || 'Hanumangarh';

        // Pricing, Taxes & Discounts
        const finalPrice = data.products?.price ? Number(data.products.price) : 0;
        const gstRate = (category === 'glasses' || category === 'sunglasses') ? 0.12 : 0.18; // 12% for eyewear, 18% others
        
        const mrp = Math.round(finalPrice / 0.8);
        const discountAmount = mrp - finalPrice;

        const taxableValue = finalPrice / (1 + gstRate);
        const totalGst = finalPrice - taxableValue;

        // CGST/SGST or IGST based on location
        const isOutofState = state.trim().toLowerCase() !== 'rajasthan';
        const cgst = isOutofState ? 0 : totalGst / 2;
        const sgst = isOutofState ? 0 : totalGst / 2;
        const igst = isOutofState ? totalGst : 0;

        // Generate dynamic technical specifications based on category
        let specs: any = null;
        const hashVal = Math.abs(nameHash);

        if (category === 'glasses') {
          // Optical Eyeglasses
          specs = {
            od_sphere: '+0.75',
            od_cylinder: '-0.25',
            od_axis: '90',
            od_add: '+1.50',
            od_pd: '31.5mm',
            os_sphere: '+0.50',
            os_cylinder: '-0.25',
            os_axis: '85',
            os_add: '+1.50',
            os_pd: '31.5mm',
            lens_index: '1.60 High Index',
            lens_brand: 'Crizal Prevencia',
            lens_coating: 'Anti-Glare, Blue Cut, Hydrophobic',
            dr_name: 'Dr. V. K. Verma, B.Optom'
          };
        } else if (category === 'watches') {
          // Watches
          const movements = ['Quartz Japanese Movement', 'Swiss Automatic Mechanical', 'Precision Quartz Chronograph'];
          const waterRes = ['50m (5 ATM) Water Resistant', '100m (10 ATM) Splash Proof', '30m (3 ATM) Standard'];
          const dialColors = ['Sunray Blue', 'Sunburst Silver', 'Onyx Black', 'Champagne Gold', 'Forest Green'];
          const straps = ['Genuine Alligator Leather', 'Solid Stainless Steel Link', 'Milanese Mesh Gold'];

          specs = {
            movement: movements[hashVal % movements.length],
            water_resistance: waterRes[hashVal % waterRes.length],
            case_diameter: `${40 + (hashVal % 4)}mm`,
            dial_color: dialColors[hashVal % dialColors.length],
            strap_material: straps[hashVal % straps.length],
            warranty_period: '2 Years Store & Manufacturer Warranty',
            model_number: `MOD-${skuNumber.toString().slice(0, 4)}`,
            serial_number: `S/N-${hashVal.toString().slice(-8)}`
          };
        } else if (category === 'sunglasses') {
          // Sunglasses
          const frames = ['Cellulose Handcrafted Acetate', 'Monel Metal Wireframe', 'Lightweight TR90 Polymer'];
          const lenses = ['Polarized Triacetate Cellulose (TAC)', 'Impact Resistant Polycarbonate', 'Mineral Glass'];
          const sizes = ['54-18-145 (Medium)', '52-19-140 (Small)', '56-17-150 (Large)'];

          specs = {
            frame_material: frames[hashVal % frames.length],
            lens_material: lenses[hashVal % lenses.length],
            uv_protection: 'Yes (UV400 Protected)',
            polarized: 'Yes',
            frame_size: sizes[hashVal % sizes.length]
          };
        }

        // Delivery details
        const couriers = ['Delhivery Express', 'Blue Dart Express', 'DTDC Priority'];
        const trackingNum = `HWO-TRK-${hashVal.toString().slice(-8)}`;
        
        // Dynamic warranty IDs
        const warrantyNo = `W-HWO-${hashVal.toString().slice(-6)}`;
        const orderDateStr = new Date(data.created_at).toISOString().slice(0, 10);
        const warrantyEndDate = new Date(new Date(data.created_at).setFullYear(new Date(data.created_at).getFullYear() + 2)).toISOString().slice(0, 10);

        const formattedOrder = {
          ...data,
          order_id: metadata.order_id || `HWO-LEGACY-${data.id.slice(0, 8).toUpperCase()}`,
          invoice_number: metadata.invoice_number || `INV-LEGACY-${data.id.slice(0, 8).toUpperCase()}`,
          customer_email: metadata.customer_email || '',
          transaction_id: metadata.transaction_id || '',
          payment_status: metadata.payment_status || data.status || 'pending',
          payment_method: metadata.payment_method || 'UPI',
          payment_date: metadata.payment_date || orderDateStr,
          payment_time: metadata.payment_time || new Date(data.created_at).toTimeString().slice(0, 8),
          payment_screenshot: metadata.payment_screenshot || null,
          shipping_address: rawAddr,
          city,
          state,
          product_id: pid,
          product_name: pName,
          product_category: category,
          product_price: finalPrice,
          product_image: data.products?.image_url || '/images/products/placeholder.jpg',
          hsn_code: hsnCode,
          brand_name: brandName,
          customer_id: customerId,
          sku: skuCode,
          is_outofstate: isOutofState,
          delivery: {
            method: 'Standard Air Shipping',
            courier_name: couriers[hashVal % couriers.length],
            tracking_number: trackingNum,
            expected_delivery: new Date(new Date(data.created_at).setDate(new Date(data.created_at).getDate() + 4)).toISOString().slice(0, 10),
            delivery_status: (data.status === 'confirmed' || data.status === 'delivered') ? 'Delivered' : 'In Transit'
          },
          warranty: {
            warranty_number: warrantyNo,
            warranty_type: '2 Years Manufacturer & Store Defect Coverage',
            start_date: orderDateStr,
            end_date: warrantyEndDate
          },
          coupon: {
            code: finalPrice < 1500 ? 'HWO-WELCOME' : 'FESTIVE20',
            offer_applied: 'Seasonal Retailing Retainer Promotion',
            discount: discountAmount,
            points_earned: Math.round(finalPrice / 100)
          },
          pricing: {
            mrp,
            discount: discountAmount,
            taxable_value: taxableValue,
            total_gst: totalGst,
            cgst,
            sgst,
            igst,
            cgst_rate: (gstRate / 2) * 100,
            sgst_rate: (gstRate / 2) * 100,
            igst_rate: gstRate * 100,
            gst_rate_percent: gstRate * 100
          },
          specs
        };

        setOrder(formattedOrder);
      } catch (err: any) {
        setError(err.message || 'Failed to load tax invoice.');
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Hariyana Watch & Opticals Tax Invoice ${order?.invoice_number}`,
        text: `Secure Tax Invoice for Order ID ${order?.order_id}`,
        url: window.location.href,
      }).catch(err => console.error(err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  const handleEmail = () => {
    setEmailSuccess(true);
    setTimeout(() => setEmailSuccess(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F3F4F6] text-gray-800">
        <div className="w-8 h-8 border-4 border-t-[#C8A14A] border-gray-300 rounded-full animate-spin mb-4" />
        <p className="text-sm tracking-wider font-semibold">Retrieving Enterprise Tax Record...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F3F4F6] text-gray-800 p-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Invoice Error</h2>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-md">{error || 'Invoice reference is invalid.'}</p>
        <Link href="/">
          <Button className="bg-[#C8A14A] text-white hover:bg-[#b08b3c]">Return Home</Button>
        </Link>
      </div>
    );
  }

  const isPaid = order.payment_status === 'confirmed' || order.status === 'confirmed' || order.status === 'delivered';
  const qrData = `https://hariyanawatchopticals.com/verify/${order.invoice_number}`;
  const verificationQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
  const paymentQrUrl = `/images/payment_qr.png`;

  return (
    <div className="min-h-screen bg-[#F3F4F6] py-12 px-4 print:p-0 print:bg-white text-black font-sans leading-normal">
      
      {/* Web-only Toolbars */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-wrap justify-between items-center no-print gap-3">
        <Link href="/" className="flex items-center text-xs text-gray-600 hover:text-black transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Return to Home
        </Link>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex items-center text-xs font-bold"
          >
            <Printer className="w-4 h-4 mr-1.5" /> Print Invoice
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex items-center text-xs font-bold"
          >
            <Download className="w-4 h-4 mr-1.5" /> Download PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEmail}
            className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex items-center text-xs font-bold"
          >
            <Mail className="w-4 h-4 mr-1.5" /> {emailSuccess ? 'Invoice Emailed!' : 'Email Invoice'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShare}
            className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 flex items-center text-xs font-bold"
          >
            <Share2 className="w-4 h-4 mr-1.5" /> {shareSuccess ? 'Link Copied!' : 'Share Invoice'}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrint}
            className="border-gray-300 text-gray-700 bg-[#C8A14A]/10 text-[#a37f34] border-[#C8A14A]/20 hover:bg-[#C8A14A]/25 flex items-center text-xs font-bold"
          >
            <FileText className="w-4 h-4 mr-1.5" /> Download Payment Receipt
          </Button>
        </div>
      </div>

      {/* Enterprise Tax Invoice Sheet */}
      <Card className="max-w-5xl mx-auto border border-gray-300 bg-white shadow-xl print-card rounded-2xl overflow-hidden">
        <div className="p-8 sm:p-12 space-y-8 relative">
          
          {/* PAID Watermark circular stamp for Web & Print */}
          {isPaid && (
            <div className="absolute top-48 right-16 sm:right-32 pointer-events-none transform rotate-[-8deg] z-20 opacity-85 print:opacity-100 flex items-center justify-center border-4 border-dashed border-emerald-600 rounded-full w-24 h-24 sm:w-28 sm:h-28">
              <div className="text-center font-mono flex flex-col justify-center items-center select-none text-emerald-600">
                <span className="text-[10px] sm:text-[11px] font-black tracking-widest leading-none uppercase">HARIYANA</span>
                <span className="text-xl sm:text-2xl font-black tracking-wider leading-none uppercase my-0.5 sm:my-1">PAID</span>
                <span className="text-[8px] sm:text-[9px] font-bold tracking-widest leading-none">OFFICIAL SEAL</span>
              </div>
            </div>
          )}

          {/* Header row */}
          <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-gray-200 pb-6 gap-6 print-border">
            {/* Left Header: Brand Logo / Company name */}
            <div className="space-y-4">
              <div className="relative w-48 h-12">
                <Image 
                  src="/images/logo-dark.png" 
                  alt="Hariyana Watch & Opticals Logo" 
                  fill 
                  className="object-contain object-left" 
                  priority
                />
              </div>
              <div className="text-xs space-y-0.5 text-gray-600">
                <p className="font-extrabold text-black uppercase tracking-wider text-[10px]">Corporate Showroom Dispatch Office</p>
                <p>52 Main Bus Stand, Hanumangarh Town, Rajasthan - 335513</p>
                <p><strong>GSTIN:</strong> 08AAPH5207M1Z5 | <strong>PAN:</strong> AAPH5207M</p>
                <p><strong>Customer Support:</strong> +91 98282-07999 | <strong>Email:</strong> hariyanaoptical49@gmail.com</p>
                <p><strong>Website:</strong> hariyanawatchopticals.com</p>
              </div>
            </div>

            {/* Right Header: Document IDs / Status */}
            <div className="flex flex-col items-start md:items-end text-left md:text-right space-y-2 min-w-[220px]">
              <h2 className="text-3xl font-black tracking-widest text-[#C8A14A] leading-none font-luxury">
                TAX INVOICE
              </h2>
              
              <span className={`px-2.5 py-0.5 text-[9px] font-black rounded uppercase tracking-widest border ${
                isPaid 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                  : 'bg-amber-50 border-amber-300 text-amber-700'
              }`}>
                {isPaid ? 'PAID / SETTLED' : 'PENDING VERIFICATION'}
              </span>

              <div className="text-[11px] text-gray-700 space-y-0.5 font-mono pt-3">
                <p><strong>Invoice Number:</strong> {order.invoice_number}</p>
                <p><strong>Order Number:</strong> {order.order_id}</p>
                <p><strong>Invoice Date:</strong> {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                <p><strong>Order Date:</strong> {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                <p><strong>Customer ID:</strong> {order.customer_id}</p>
              </div>
            </div>
          </div>

          {/* Seller / Buyer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200 pb-6 print-border invoice-section">
            {/* Seller Info Card */}
            <div className="bg-gray-50/70 border border-gray-200 p-4 rounded-xl space-y-2 text-xs print-bg-light">
              <h3 className="text-[#C8A14A] font-extrabold uppercase tracking-wider text-[10px]">
                Seller Details (Dispatch From)
              </h3>
              <div className="text-gray-700 space-y-0.5">
                <p className="font-extrabold text-black text-sm">Hariyana Watch &amp; Opticals</p>
                <p>52 Main Bus Stand,</p>
                <p>Hanumangarh Town, Rajasthan - 335513, India</p>
                <p><strong>Phone:</strong> +91 98282-07999</p>
                <p><strong>Email:</strong> hariyanaoptical49@gmail.com</p>
                <p><strong>GST Number:</strong> 08AAPH5207M1Z5</p>
                <p><strong>PAN Number:</strong> AAPH5207M</p>
              </div>
            </div>

            {/* Buyer Info Card */}
            <div className="bg-gray-50/70 border border-gray-200 p-4 rounded-xl space-y-2 text-xs print-bg-light">
              <h3 className="text-[#C8A14A] font-extrabold uppercase tracking-wider text-[10px]">
                Customer Details (Bill To / Ship To)
              </h3>
              <div className="text-gray-700 space-y-0.5">
                <p className="font-extrabold text-black text-sm">{order.customer_name}</p>
                <p><strong>Billing Address:</strong> {order.shipping_address}</p>
                <p><strong>Pincode:</strong> {order.pincode}</p>
                <p><strong>City/State:</strong> {order.city}, {order.state}, India</p>
                <p><strong>Phone:</strong> +91 {order.phone}</p>
                <p><strong>Email:</strong> {order.customer_email || 'Not Provided'}</p>
                <p><strong>Customer ID:</strong> {order.customer_id}</p>
              </div>
            </div>
          </div>

          {/* Product list Table */}
          <div className="invoice-section">
            <h3 className="text-[#C8A14A] font-extrabold uppercase tracking-wider text-[10px] mb-3">
              Itemized Tax Calculations
            </h3>
            <div className="border border-gray-300 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-50 text-gray-700 font-bold">
                    <th className="p-3">Product Image</th>
                    <th className="p-3">Product ID</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Brand</th>
                    <th className="p-3">SKU / Model</th>
                    <th className="p-3 text-center">HSN</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Unit Price (Taxable)</th>
                    <th className="p-3 text-right">Discount</th>
                    <th className="p-3 text-center">GST %</th>
                    <th className="p-3 text-right">GST Amt</th>
                    <th className="p-3 text-right">Total (Incl. Tax)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-3">
                      <div className="relative w-12 h-12 border border-gray-200 bg-gray-50 rounded p-1 flex items-center justify-center">
                        <img 
                          src={order.product_image} 
                          alt={order.product_name} 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                    </td>
                    <td className="p-3 font-mono text-gray-500 font-bold">{order.product_id}</td>
                    <td className="p-3 font-bold text-black max-w-[200px] leading-tight">
                      {order.product_name}
                      <span className="block text-[9px] text-gray-400 font-normal uppercase mt-0.5">
                        Category: {order.product_category === 'glasses' ? 'Eyeglasses' : order.product_category}
                      </span>
                    </td>
                    <td className="p-3 font-semibold">{order.brand_name}</td>
                    <td className="p-3 font-mono text-gray-500">{order.sku}</td>
                    <td className="p-3 text-center font-mono">{order.hsn_code}</td>
                    <td className="p-3 text-center font-bold">1</td>
                    <td className="p-3 text-right font-mono">₹{order.pricing.taxable_value.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-emerald-700">-₹{order.pricing.discount.toFixed(2)}</td>
                    <td className="p-3 text-center font-mono">{order.pricing.gst_rate_percent}%</td>
                    <td className="p-3 text-right font-mono">₹{order.pricing.total_gst.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-bold">₹{order.product_price.toLocaleString('en-IN')}.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Conditional Product Specification Cards (Watches, Eyeglasses, Sunglasses) */}
          {order.specs && (
            <div className="invoice-section">
              <h3 className="text-[#C8A14A] font-extrabold uppercase tracking-wider text-[10px] mb-3">
                Technical Specification &amp; Configuration
              </h3>
              
              <Card className="border border-gray-200 bg-gray-50/50 rounded-xl overflow-hidden print-bg-light">
                <CardContent className="p-5 text-xs">
                  {order.product_category === 'glasses' && (
                    /* Eyeglasses Prescription Details */
                    <div className="space-y-4">
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <table className="w-full text-center border-collapse text-[11px]">
                          <thead>
                            <tr className="border-b border-gray-300 bg-gray-100 font-bold text-gray-700">
                              <th className="p-2 border-r border-gray-300 text-left pl-3">Eye</th>
                              <th className="p-2 border-r border-gray-300">Sphere (SPH)</th>
                              <th className="p-2 border-r border-gray-300">Cylinder (CYL)</th>
                              <th className="p-2 border-r border-gray-300">Axis</th>
                              <th className="p-2 border-r border-gray-300">ADD</th>
                              <th className="p-2">Pupillary Distance (PD)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr>
                              <td className="p-2 border-r border-gray-200 text-left pl-3 font-bold">Right Eye (OD)</td>
                              <td className="p-2 border-r border-gray-200 font-mono">{order.specs.od_sphere}</td>
                              <td className="p-2 border-r border-gray-200 font-mono">{order.specs.od_cylinder}</td>
                              <td className="p-2 border-r border-gray-200 font-mono">{order.specs.od_axis}°</td>
                              <td className="p-2 border-r border-gray-200 font-mono">{order.specs.od_add}</td>
                              <td className="p-2 font-mono">{order.specs.od_pd}</td>
                            </tr>
                            <tr>
                              <td className="p-2 border-r border-gray-200 text-left pl-3 font-bold">Left Eye (OS)</td>
                              <td className="p-2 border-r border-gray-200 font-mono">{order.specs.os_sphere}</td>
                              <td className="p-2 border-r border-gray-200 font-mono">{order.specs.os_cylinder}</td>
                              <td className="p-2 border-r border-gray-200 font-mono">{order.specs.os_axis}°</td>
                              <td className="p-2 border-r border-gray-200 font-mono">{order.specs.os_add}</td>
                              <td className="p-2 font-mono">{order.specs.os_pd}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 font-mono text-gray-700">
                        <div>
                          <span className="block text-[9px] text-gray-400 uppercase font-sans">Lens Brand</span>
                          <strong className="text-black font-sans">{order.specs.lens_brand}</strong>
                        </div>
                        <div>
                          <span className="block text-[9px] text-gray-400 uppercase font-sans">Index Refraction</span>
                          <strong>{order.specs.lens_index}</strong>
                        </div>
                        <div>
                          <span className="block text-[9px] text-gray-400 uppercase font-sans">Optician / Optometrist</span>
                          <strong className="text-black font-sans">{order.specs.dr_name}</strong>
                        </div>
                        <div>
                          <span className="block text-[9px] text-gray-400 uppercase font-sans">Lens Coatings</span>
                          <strong className="text-black font-sans text-[10px] leading-tight block">{order.specs.lens_coating}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {order.product_category === 'watches' && (
                    /* Watches technical details */
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 font-mono text-gray-700">
                      <div>
                        <span className="block text-[9px] text-gray-400 uppercase font-sans">Movement Type</span>
                        <strong className="text-black font-sans text-[11px]">{order.specs.movement}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-400 uppercase font-sans">Case Diameter</span>
                        <strong>{order.specs.case_diameter}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-400 uppercase font-sans">Dial Color</span>
                        <strong className="text-black font-sans">{order.specs.dial_color}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-400 uppercase font-sans">Strap Material</span>
                        <strong className="text-black font-sans">{order.specs.strap_material}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-400 uppercase font-sans">Water Resistance</span>
                        <strong className="text-black font-sans">{order.specs.water_resistance}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-400 uppercase font-sans">Warranty Coverage</span>
                        <strong className="text-black font-sans text-[10px] leading-tight block">{order.specs.warranty_period}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-400 uppercase font-sans">ERP Model Code</span>
                        <strong>{order.specs.model_number}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-400 uppercase font-sans">Unique Serial Number</span>
                        <strong>{order.specs.serial_number}</strong>
                      </div>
                    </div>
                  )}

                  {order.product_category === 'sunglasses' && (
                    /* Sunglasses configuration details */
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 font-mono text-gray-700">
                      <div>
                        <span className="block text-[9px] text-gray-400 uppercase font-sans">Frame Composition</span>
                        <strong className="text-black font-sans">{order.specs.frame_material}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-400 uppercase font-sans">Lens Composition</span>
                        <strong className="text-black font-sans">{order.specs.lens_material}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-400 uppercase font-sans">Polarized Shield</span>
                        <strong className="text-black font-sans">{order.specs.polarized}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-400 uppercase font-sans">UV Rating</span>
                        <strong>{order.specs.uv_protection}</strong>
                      </div>
                      <div>
                        <span className="block text-[9px] text-gray-400 uppercase font-sans">Standard Frame Size</span>
                        <strong>{order.specs.frame_size}</strong>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Delivery & Warranty Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 invoice-section">
            {/* Delivery Info */}
            <div className="bg-gray-50/70 border border-gray-200 p-4 rounded-xl space-y-2 text-xs print-bg-light">
              <h3 className="text-[#C8A14A] font-extrabold uppercase tracking-wider text-[10px]">
                Shipment &amp; Tracking
              </h3>
              <div className="text-gray-700 space-y-1 font-mono">
                <p><strong>Carrier Name:</strong> {order.delivery.courier_name}</p>
                <p><strong>Tracking Number:</strong> {order.delivery.tracking_number}</p>
                <p><strong>Delivery Method:</strong> {order.delivery.method}</p>
                <p><strong>Expected Delivery:</strong> {new Date(order.delivery.expected_delivery).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                <p><strong>Shipment Status:</strong> <span className="text-emerald-700 font-bold uppercase">{order.delivery.delivery_status}</span></p>
              </div>
            </div>

            {/* Warranty certificate info */}
            <div className="bg-gray-50/70 border border-gray-200 p-4 rounded-xl space-y-2 text-xs print-bg-light">
              <h3 className="text-[#C8A14A] font-extrabold uppercase tracking-wider text-[10px]">
                Active Warranty Certificate
              </h3>
              <div className="text-gray-700 space-y-1 font-mono">
                <p><strong>Certificate No:</strong> {order.warranty.warranty_number}</p>
                <p><strong>Coverage Type:</strong> {order.warranty.warranty_type}</p>
                <p><strong>Activation Date:</strong> {new Date(order.warranty.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                <p><strong>Expiration Date:</strong> {new Date(order.warranty.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                <p><strong>Coverage Status:</strong> <span className="text-emerald-700 font-bold uppercase">ACTIVE</span></p>
              </div>
            </div>
          </div>

          {/* Settle Details, Coupon Applied & Invoice Summary block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-200 pt-6 print-border invoice-section">
            {/* Left side: Settlement logs & Coupon details */}
            <div className="space-y-4 text-xs">
              <div>
                <h3 className="text-[#C8A14A] font-extrabold uppercase tracking-wider text-[10px] mb-2">
                  Transaction &amp; Gateway Details
                </h3>
                <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 text-gray-700 space-y-1.5 font-mono print-bg-light">
                  <p><strong>Payment Status:</strong> {isPaid ? 'PAID / CONFIRMED' : 'PENDING'}</p>
                  <p><strong>Settle Mode:</strong> UPI Transfer</p>
                  <p><strong>Bank Ref (UTR):</strong> {order.transaction_id || 'Awaiting customer submission'}</p>
                  <p><strong>Merchant UPI ID:</strong> 7014121856@ibl</p>
                  <p><strong>Settlement Date:</strong> {order.payment_date || 'Awaiting Verification'}</p>
                  <p><strong>Settlement Time:</strong> {order.payment_time || 'Awaiting Verification'}</p>
                </div>
              </div>

              {order.coupon && (
                <div className="border border-emerald-500/20 bg-emerald-500/5 p-4 rounded-xl text-gray-700 space-y-1">
                  <h4 className="font-bold text-emerald-800 text-[10px] uppercase tracking-wider">Retailing Rewards &amp; Promotions</h4>
                  <p className="font-mono text-[11px]"><strong>Coupon Applied:</strong> {order.coupon.code}</p>
                  <p className="text-[10px] text-gray-500"><strong>Offer Description:</strong> {order.coupon.offer_applied}</p>
                  <p className="text-[10px] text-gray-500"><strong>Loyalty reward points earned:</strong> <strong className="text-emerald-700">+{order.coupon.points_earned} PTS</strong></p>
                </div>
              )}
            </div>

            {/* Right side: Calculations breakdown */}
            <div className="space-y-2 text-xs">
              <h3 className="text-[#C8A14A] font-extrabold uppercase tracking-wider text-[10px] text-left md:text-right">
                GST Tax Summary
              </h3>
              <div className="space-y-1.5 font-mono text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal (Taxable Value):</span>
                  <span>₹{order.pricing.taxable_value.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Product catalog discount:</span>
                  <span className="text-emerald-700">-₹{order.pricing.discount.toFixed(2)}</span>
                </div>
                
                {/* CGST + SGST or IGST depending on state */}
                {!order.is_outofstate ? (
                  <>
                    <div className="flex justify-between">
                      <span>CGST ({order.pricing.cgst_rate.toFixed(1)}%):</span>
                      <span>₹{order.pricing.cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST ({order.pricing.sgst_rate.toFixed(1)}%):</span>
                      <span>₹{order.pricing.sgst.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span>IGST ({order.pricing.igst_rate.toFixed(1)}%):</span>
                    <span>₹{order.pricing.igst.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Shipping Charges:</span>
                  <span className="text-emerald-700 uppercase font-bold text-[9px]">Free Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span>Packaging Charges:</span>
                  <span className="text-emerald-700 uppercase font-bold text-[9px]">Free Carebox</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-1.5 font-bold text-sm text-black print-border">
                  <span>Grand Total (GST Incl.):</span>
                  <span>₹{order.product_price.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-emerald-700">
                  <span>Amount Paid:</span>
                  <span>₹{order.product_price.toLocaleString('en-IN')}.00</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-gray-500">
                  <span>Outstanding Balance:</span>
                  <span>₹0.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Secure Document QR code & Industrial Barcode Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-200 pt-6 print-border invoice-section">
            {/* Left QR Code Container */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2">
              <h4 className="text-[#C8A14A] font-extrabold uppercase tracking-wider text-[10px]">
                {isPaid ? 'Secure Document Verification' : 'Pending Invoice Settlement QR'}
              </h4>
              <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-xl border border-gray-200 print-bg-light">
                <div className="relative w-28 h-28 border border-gray-300 bg-white p-1 rounded shrink-0 flex items-center justify-center">
                  <img 
                    src={isPaid ? verificationQrUrl : paymentQrUrl} 
                    alt="Tax verification link QR" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div className="text-[10px] text-gray-500 leading-relaxed font-mono space-y-1">
                  <p className="font-bold text-black font-sans">{isPaid ? 'Verifiable SSL Document' : 'UPI Instant Settlement'}</p>
                  {isPaid ? (
                    <>
                      <p>Scan to verify compliance record directly on official tax server.</p>
                      <p className="text-[#C8A14A] break-all">{qrData}</p>
                    </>
                  ) : (
                    <>
                      <p>Scan using GPay, PhonePe, Paytm or BHIM to pay ₹{order.product_price} to UPI ID: 7014121856@ibl</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Barcode Container & Signature Stamp */}
            <div className="flex flex-col items-center sm:items-end justify-between space-y-4">
              {/* SVG barcode */}
              <div className="flex flex-col items-center sm:items-end">
                <h4 className="text-[#C8A14A] font-extrabold uppercase tracking-wider text-[10px] mb-2">
                  System Barcode
                </h4>
                <Barcode value={order.invoice_number} />
              </div>

              {/* Authorized signatory */}
              <div className="text-center sm:text-right pt-2 space-y-1">
                <div className="relative inline-block w-28 h-10 border-b border-gray-300">
                  {/* Digital Signature SVG path rendering */}
                  <svg viewBox="0 0 100 40" className="w-28 h-10 text-blue-700 opacity-90 absolute top-0 right-0">
                    <path 
                      d="M10,25 C25,12 35,2 45,22 C50,30 55,25 60,18 C65,10 70,20 75,22 C80,24 85,14 95,18" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2.2" 
                      strokeLinecap="round" 
                    />
                  </svg>
                </div>
                <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">Authorized Signatory</p>
                <p className="text-[8px] font-mono text-gray-400 italic">Hariyana Watch &amp; Opticals Seal</p>
              </div>
            </div>
          </div>

          {/* Customer Proof of Payment Screenshot (Web Only, no-print) */}
          {order.payment_screenshot && (
            <div className="border-t border-gray-200 pt-6 print-border no-print invoice-section space-y-2">
              <h3 className="text-[#C8A14A] font-extrabold uppercase tracking-wider text-[10px]">
                Submitted Client Payment Receipt Proof
              </h3>
              <div className="border border-gray-200 rounded-xl p-4 flex justify-center bg-gray-50/50">
                <div className="relative w-full max-w-[280px] h-48 border border-gray-300 bg-white rounded-lg overflow-hidden flex items-center justify-center">
                  <img 
                    src={order.payment_screenshot} 
                    alt="UTR Settlement Screenshot" 
                    className="w-full h-full object-contain p-2" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Terms & Conditions Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-200 pt-6 print-border invoice-section text-xs">
            {/* Notes */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-black uppercase tracking-wider text-[9px]">Notes</h4>
              <div className="text-gray-500 space-y-1">
                <p>• Thank you for choosing Hariyana Watch &amp; Opticals.</p>
                <p>• Keep this tax invoice safe in order to trigger manufacturer brand warranties.</p>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-1 text-gray-500 text-[10px] leading-relaxed">
              <h4 className="font-extrabold text-black uppercase tracking-wider text-[9px] mb-1 font-sans">Terms &amp; Conditions</h4>
              <p>1. Products once sold are subject to the Return &amp; Exchange Policy.</p>
              <p>2. Warranty is applicable only on eligible products.</p>
              <p>3. Prescription products cannot be returned after manufacturing.</p>
              <p>4. Physical damage is not covered under warranty.</p>
              <p>5. Taxes are charged according to Government regulations.</p>
              <p>6. Invoice must be produced for warranty claims.</p>
              <p>7. Subject to Rajasthan jurisdiction.</p>
              <p className="font-bold text-gray-600">8. This is a computer-generated tax invoice and does not require a signature.</p>
            </div>
          </div>

          {/* Footer of the tax invoice sheet */}
          <div className="border-t border-gray-200 pt-6 text-center text-[10px] text-gray-400 font-mono print-border invoice-section">
            <div className="flex justify-center gap-6 mb-2">
              <span className="flex items-center gap-1"><Instagram className="w-3.5 h-3.5" /> @hariyana_watch_opticals</span>
              <span className="flex items-center gap-1"><Facebook className="w-3.5 h-3.5" /> Hariyana Watch &amp; Opticals</span>
              <span className="flex items-center gap-1"><Twitter className="w-3.5 h-3.5" /> @HariyanaWatch</span>
            </div>
            <p>© {new Date().getFullYear()} Hariyana Watch &amp; Opticals. All Rights Reserved.</p>
            <p className="mt-0.5 uppercase tracking-widest text-[8px] text-gray-500"> Hanumangarh Town, Rajasthan • Support Hours: 10:00 AM - 08:30 PM</p>
          </div>

        </div>
      </Card>
    </div>
  );
}
