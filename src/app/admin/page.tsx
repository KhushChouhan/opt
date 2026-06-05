'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { 
  ClipboardList, 
  Package, 
  TrendingUp, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  Truck, 
  AlertCircle, 
  RefreshCw, 
  Upload,
  Phone
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Textarea, Select } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

interface Product {
  id: string;
  name: string;
  category: 'glasses' | 'sunglasses' | 'watches';
  price: number;
  description: string;
  image_url: string;
  overlay_image_url: string;
  stock: number;
  created_at: string;
}

interface Order {
  id: string;
  product_id: string;
  customer_name: string;
  phone: string;
  address: string;
  pincode: string;
  status: 'pending' | 'confirmed' | 'delivered';
  created_at: string;
  products?: Product;
}

export default function AdminDashboard() {
  // Tabs: 'orders' | 'products'
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  // Fetching Data
  const { data: orders, error: ordersError, isLoading: ordersLoading, mutate: mutateOrders } = useSWR<Order[]>('/api/orders');
  const { data: products, error: productsError, isLoading: productsLoading, mutate: mutateProducts } = useSWR<Product[]>('/api/products');

  // Product Modals & Forms State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'glasses',
    price: '',
    description: '',
    image_url: '',
    overlay_image_url: '',
    stock: '0',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cloudinary Upload States
  const [uploadingField, setUploadingField] = useState<'main' | 'overlay' | null>(null);

  // Status counters
  const totalOrders = orders ? orders.length : 0;
  const pendingOrders = orders ? orders.filter(o => o.status === 'pending').length : 0;
  
  // Total Revenue estimation
  const totalRevenue = orders
    ? orders
        .filter(o => o.status !== 'pending' && o.products)
        .reduce((sum, o) => sum + (o.products ? Number(o.products.price) : 0), 0)
    : 0;

  // Handle Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: 'pending' | 'confirmed' | 'delivered') => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      mutateOrders();
    } catch (err) {
      console.error(err);
      alert('Error updating order status. Please check your credentials.');
    }
  };

  // Cloudinary Direct Upload
  const handleCloudinaryUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'main' | 'overlay') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Restriction: Image MIME types only
    if (!file.type.startsWith('image/')) {
      alert('File type not supported. Please upload an image file (PNG/JPG/WebP).');
      return;
    }

    // Restriction: Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit. Please upload a smaller image.');
      return;
    }

    setUploadingField(field);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'hariyana_preset');

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      const imageUrl = data.secure_url;
      setProductForm(prev => ({
        ...prev,
        [field === 'main' ? 'image_url' : 'overlay_image_url']: imageUrl,
      }));

    } catch (err: unknown) {
      console.error('Cloudinary upload error:', err);
      const errMsg = err instanceof Error ? err.message : 'Unknown upload error';
      alert(`Cloudinary upload failed: ${errMsg}. Please verify preset config.`);
    } finally {
      setUploadingField(null);
    }
  };

  // Product CRUD Handlers
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: 'glasses',
      price: '',
      description: '',
      image_url: '',
      overlay_image_url: '',
      stock: '10',
    });
    setFormError('');
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      description: product.description || '',
      image_url: product.image_url,
      overlay_image_url: product.overlay_image_url,
      stock: product.stock.toString(),
    });
    setFormError('');
    setIsProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const { name, price, image_url, overlay_image_url, stock } = productForm;

    if (!name.trim()) {
      setFormError('Product name is required.');
      setIsSubmitting(false);
      return;
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      setFormError('Please enter a valid positive price.');
      setIsSubmitting(false);
      return;
    }

    if (isNaN(parseInt(stock)) || parseInt(stock) < 0) {
      setFormError('Please enter a valid stock level.');
      setIsSubmitting(false);
      return;
    }

    if (!image_url.startsWith('http')) {
      setFormError('Please upload or provide a valid showcase image URL.');
      setIsSubmitting(false);
      return;
    }

    if (!overlay_image_url.startsWith('http') && !overlay_image_url.startsWith('/')) {
      setFormError('Please upload or provide a valid transparent overlay PNG path.');
      setIsSubmitting(false);
      return;
    }

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save product.');
      }

      setIsProductModalOpen(false);
      mutateProducts();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred';
      setFormError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This will fail if there are historical orders for it.')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete product.');
      }
      mutateProducts();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error deleting product';
      alert(errMsg);
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards Dashboard HUD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-[#0b132b]/40 border-gray-800">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="p-3 bg-[#1c2541] rounded-md border border-[#d4af37]/20 text-[#d4af37]">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Total Orders</p>
              <h3 className="text-xl font-bold text-white mt-0.5">{totalOrders}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0b132b]/40 border-gray-800">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="p-3 bg-amber-500/10 rounded-md border border-amber-500/20 text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Pending Requests</p>
              <h3 className="text-xl font-bold text-white mt-0.5">{pendingOrders}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0b132b]/40 border-gray-800">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 rounded-md border border-emerald-500/20 text-emerald-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Sales (Est. INR)</p>
              <h3 className="text-xl font-bold text-white mt-0.5">₹{totalRevenue.toLocaleString('en-IN')}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0b132b]/40 border-gray-800">
          <CardContent className="p-5 flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-md border border-blue-500/20 text-blue-500">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Total Catalog</p>
              <h3 className="text-xl font-bold text-white mt-0.5">{products ? products.length : 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Controller */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 text-sm font-semibold uppercase tracking-wider transition-all ${
            activeTab === 'orders'
              ? 'border-[#d4af37] text-[#d4af37]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Orders List</span>
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center space-x-2 px-6 py-3 border-b-2 text-sm font-semibold uppercase tracking-wider transition-all ${
            activeTab === 'products'
              ? 'border-[#d4af37] text-[#d4af37]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products Inventory</span>
        </button>
      </div>

      {/* Active Tab Panel */}
      <div>
        {activeTab === 'orders' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white font-luxury">Customer Order Logs</h2>
              <Button variant="outline" size="sm" onClick={() => mutateOrders()} className="flex items-center">
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
              </Button>
            </div>

            {ordersLoading && (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="w-6 h-6 text-[#d4af37] animate-spin" />
              </div>
            )}

            {ordersError && (
              <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-400 rounded text-sm text-center">
                Failed to fetch customer orders.
              </div>
            )}

            {!ordersLoading && !ordersError && totalOrders === 0 && (
              <div className="p-12 border border-dashed border-gray-800 rounded-lg text-center text-gray-500">
                No orders recorded yet.
              </div>
            )}

            {!ordersLoading && !ordersError && totalOrders > 0 && (
              <div className="overflow-x-auto w-full glass-panel rounded-lg border border-gray-800">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-black/30 text-gray-400 border-b border-gray-800 text-xs font-bold uppercase tracking-wider">
                      <th className="p-4">Customer</th>
                      <th className="p-4">Product</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Address</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {orders?.map((order) => (
                      <tr key={order.id} className="hover:bg-white/2 transition-colors">
                        <td className="p-4 font-bold text-white">{order.customer_name}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-white font-semibold">{order.products?.name || 'Deleted Product'}</span>
                            <span className="text-[10px] text-gray-500 capitalize">{order.products?.category} (₹{order.products?.price})</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <a href={`tel:+91${order.phone}`} className="flex items-center text-xs text-[#d4af37] hover:underline">
                            <Phone className="w-3.5 h-3.5 mr-1" />
                            {order.phone}
                          </a>
                        </td>
                        <td className="p-4 text-xs max-w-[200px] truncate" title={`${order.address}, PIN: ${order.pincode}`}>
                          {order.address}, PIN: {order.pincode}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider border ${
                            order.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                            order.status === 'confirmed' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                              className="p-1.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all"
                              title="Confirm Order"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                              className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                              title="Mark Delivered"
                            >
                              <Truck className="w-4 h-4" />
                            </button>
                          )}
                          <span className="text-xs text-gray-600">—</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-white font-luxury">Catalog Stock Control</h2>
              <Button onClick={openAddProductModal} className="flex items-center text-xs">
                <Plus className="w-4 h-4 mr-1.5" /> Add New Product
              </Button>
            </div>

            {productsLoading && (
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="w-6 h-6 text-[#d4af37] animate-spin" />
              </div>
            )}

            {productsError && (
              <div className="p-4 bg-red-950/40 border border-red-500/20 text-red-400 rounded text-sm text-center">
                Failed to fetch products.
              </div>
            )}

            {!productsLoading && !productsError && products?.length === 0 && (
              <div className="p-12 border border-dashed border-gray-800 rounded-lg text-center text-gray-500">
                No items in catalog yet.
              </div>
            )}

            {!productsLoading && !productsError && products && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="bg-[#0b132b]/40 border-gray-800 relative">
                    <div className="absolute top-2 right-2 z-10 flex space-x-1">
                      <button
                        onClick={() => openEditProductModal(product)}
                        className="p-1.5 rounded bg-black/60 hover:bg-black text-[#d4af37] border border-[#d4af37]/20 transition-all"
                        title="Edit Product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 rounded bg-black/60 hover:bg-red-900 text-red-400 border border-red-900/20 transition-all"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="relative h-40 bg-black/20 w-full overflow-hidden border-b border-gray-800">
                      {product.image_url && (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 300px"
                        />
                      )}
                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/55 text-xs font-semibold rounded text-amber-500 border border-amber-500/20 capitalize">
                        {product.category}
                      </span>
                    </div>

                    <CardContent className="p-4 space-y-3">
                      <h3 className="text-sm font-bold text-white truncate" title={product.name}>
                        {product.name}
                      </h3>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Price:</span>
                        <span className="font-bold text-[#d4af37]">₹{product.price}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Current Stock:</span>
                        <span className={`font-semibold ${product.stock <= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {product.stock} units
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 truncate mt-1">
                        Overlay: <code className="bg-black/30 px-1 py-0.5 rounded select-all">{product.overlay_image_url}</code>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Add / Edit Modal */}
      <Modal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        title={editingProduct ? 'Update Product Details' : 'Register New Product'}
      >
        <form onSubmit={handleProductSubmit} className="space-y-4 text-xs sm:text-sm">
          {formError && (
            <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-400 rounded text-xs font-medium flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label="Product Name"
            type="text"
            placeholder="e.g. Ray-Ban Wayfarer Classic"
            required
            value={productForm.name}
            onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Department Category"
              options={[
                { value: 'glasses', label: 'Eyeglasses' },
                { value: 'sunglasses', label: 'Sunglasses' },
                { value: 'watches', label: 'Watches' },
              ]}
              required
              value={productForm.category}
              onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value as 'glasses' | 'sunglasses' | 'watches' }))}
            />

            <Input
              label="Retail Price (₹)"
              type="number"
              placeholder="e.g. 1999"
              required
              value={productForm.price}
              onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Starting Stock Units"
              type="number"
              placeholder="e.g. 15"
              required
              value={productForm.stock}
              onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
            />
            
            <div className="self-end" />
          </div>

          <Textarea
            label="Product Description"
            placeholder="Introduce details about frames, lens characteristics, sizing or materials..."
            value={productForm.description}
            onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
          />

          {/* Cloudinary Showcase Image Upload Field */}
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
              Product Listing Image (Showcase)
            </span>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="https://res.cloudinary.com/... or Upload image"
                required
                value={productForm.image_url}
                onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
                className="flex-grow"
              />
              <label className="flex items-center justify-center px-4 bg-[#1c2541] hover:bg-[#253258] border border-gray-700 text-white rounded-md cursor-pointer transition-all min-w-[100px] text-center">
                {uploadingField === 'main' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#d4af37]" />
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-1.5 shrink-0" />
                    <span>Upload</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCloudinaryUpload(e, 'main')}
                  disabled={uploadingField !== null}
                  className="hidden"
                />
              </label>
            </div>
            {productForm.image_url && (
              <div className="relative w-16 h-16 rounded border border-gray-800 overflow-hidden bg-black/10">
                <Image src={productForm.image_url} alt="Preview" fill className="object-cover" />
              </div>
            )}
          </div>

          {/* Cloudinary Overlay PNG Upload Field */}
          <div className="space-y-1.5">
            <span className="block text-xs font-semibold uppercase tracking-wider text-gray-300">
              Transparent Overlay Image (PNG for virtual Try-On)
            </span>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="https://res.cloudinary.com/... or Upload transparent PNG"
                required
                value={productForm.overlay_image_url}
                onChange={(e) => setProductForm(prev => ({ ...prev, overlay_image_url: e.target.value }))}
                className="flex-grow"
              />
              <label className="flex items-center justify-center px-4 bg-[#1c2541] hover:bg-[#253258] border border-gray-700 text-white rounded-md cursor-pointer transition-all min-w-[100px] text-center">
                {uploadingField === 'overlay' ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#d4af37]" />
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-1.5 shrink-0" />
                    <span>Upload</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCloudinaryUpload(e, 'overlay')}
                  disabled={uploadingField !== null}
                  className="hidden"
                />
              </label>
            </div>
            {productForm.overlay_image_url && !productForm.overlay_image_url.startsWith('/') && (
              <div className="relative w-16 h-16 rounded border border-gray-800 overflow-hidden bg-black/30">
                <Image src={productForm.overlay_image_url} alt="Preview overlay" fill className="object-contain" />
              </div>
            )}
          </div>

          <div className="pt-2 flex space-x-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsProductModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" isLoading={isSubmitting}>
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
