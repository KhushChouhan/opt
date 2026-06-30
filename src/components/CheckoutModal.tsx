/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ShoppingCart, RefreshCw, AlertCircle } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
  } | null;
}

export default function CheckoutModal({ isOpen, onClose, product }: CheckoutModalProps) {
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    pincode: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  if (!product) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customer_name || formData.customer_name.trim().length < 2) {
      newErrors.customer_name = 'Name must be at least 2 characters';
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid 10-digit Indian phone number';
    }
    if (!formData.address || formData.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }
    const pincodeRegex = /^\d{6}$/;
    if (!formData.pincode || !pincodeRegex.test(formData.pincode.trim())) {
      newErrors.pincode = 'Enter a valid 6-digit PIN code';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitError('');

    try {
      const orderNum = Math.floor(10000 + Math.random() * 90000);
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const orderId = `HWO-${dateStr}-${orderNum}`;

      // Fire background database write (silent fallback)
      fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          customer_name: formData.customer_name,
          phone: formData.phone,
          address: formData.address,
          pincode: formData.pincode,
        }),
      }).catch(err => {
        console.error('Silent DB write error:', err);
      });

      const queryParams = new URLSearchParams({
        id: orderId,
        product: product.name,
        price: product.price.toString(),
        name: formData.customer_name,
        phone: formData.phone,
        address: formData.address,
        pincode: formData.pincode,
      });

      window.location.href = `/order-success?${queryParams.toString()}`;
      onClose();
    } catch {
      const orderNum = Math.floor(10000 + Math.random() * 90000);
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      const orderId = `HWO-${dateStr}-${orderNum}`;

      const queryParams = new URLSearchParams({
        id: orderId,
        product: product.name,
        price: product.price.toString(),
        name: formData.customer_name,
        phone: formData.phone,
        address: formData.address,
        pincode: formData.pincode,
      });

      window.location.href = `/order-success?${queryParams.toString()}`;
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Your Order">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product summary card */}
        <div className="bg-[#1A2742]/40 border border-white/5 rounded-lg p-4 flex justify-between items-center text-xs">
          <div>
            <p className="text-gray-400 uppercase tracking-widest text-[9px] font-bold">Selected Item</p>
            <p className="text-white font-bold text-sm mt-1">{product.name}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 uppercase tracking-widest text-[9px] font-bold">Total Price</p>
            <p className="text-[#C9A84C] font-bold text-base mt-1">₹{product.price.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {submitError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-md flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        <Input
          label="Your Name"
          name="customer_name"
          placeholder="Enter your full name"
          value={formData.customer_name}
          onChange={handleChange}
          error={errors.customer_name}
          disabled={loading}
          required
        />

        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          placeholder="10-digit mobile number"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          disabled={loading}
          required
        />

        <Textarea
          label="Shipping Address"
          name="address"
          placeholder="Enter your complete delivery address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          disabled={loading}
          required
        />

        <Input
          label="PIN Code"
          name="pincode"
          placeholder="6-digit Indian PIN code"
          value={formData.pincode}
          onChange={handleChange}
          error={errors.pincode}
          disabled={loading}
          required
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#C9A84C] text-[#050c14] hover:bg-[#e8d9a0] flex items-center justify-center font-bold tracking-widest text-xs py-3.5 uppercase"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Confirm Buy Now
            </>
          )}
        </Button>
      </form>
    </Modal>
  );
}
