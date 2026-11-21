import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../store';
import { Plus, Trash2, Package, ShoppingBag, Lock, Upload, Settings, Edit2, Check, X, LogOut, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product, SiteConfig } from '../types';
import { getSession, signIn, signOut, uploadImage, supabase } from '../lib/supabase';

const inputClass =
  'w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-mari-teal outline-none';

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  category: 'Arrangements',
  image: '',
  scentNotes: '',
  featured: false,
  inStock: true,
};

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong.');

const ImageUpload = ({ onUploaded, children, className }: { onUploaded: (url: string) => void; children: React.ReactNode; className?: string }) => {
  const [busy, setBusy] = useState(false);
  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5_000_000) {
      alert('Image is too large. Please choose one under 5MB.');
      return;
    }
    setBusy(true);
    try {
      onUploaded(await uploadImage(file));
    } catch (err) {
      alert(`Upload failed: ${errorMessage(err)}`);
    } finally {
      setBusy(false);
    }
  };
  return (
    <label className={`cursor-pointer ${className ?? ''}`}>
      {busy ? <span className="text-xs text-gray-500">Uploading…</span> : children}
      <input type="file" accept="image/*" className="hidden" onChange={handle} disabled={busy} />
    </label>
  );
};

export const Admin = () => {
  const {
    products, orders, siteConfig, isSupabaseEnabled,
    loadProducts, loadOrders, addProduct, updateProduct, removeProduct,
    updateOrderStatus, updateSiteConfig, saveSiteConfig,
  } = useAdminStore();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);

  const categories = Array.from(new Set(['Arrangements', 'Pillars', 'Jars', 'Novelty', ...products.map((p) => p.category)]));

  // Restore an existing session and react to sign-in/out.
  useEffect(() => {
    getSession().then((s) => {
      setIsAuthenticated(!!s);
      setCheckingSession(false);
    });
    const sub = supabase?.auth.onAuthStateChange((_e, s) => setIsAuthenticated(!!s));
    return () => sub?.data.subscription.unsubscribe();
  }, []);

  // Admin sees every product (including out of stock) and all orders.
  useEffect(() => {
    if (!isAuthenticated) return;
    loadProducts(true);
    loadOrders().catch((e) => setError(`Could not load orders: ${errorMessage(e)}`));
    return () => {
      loadProducts(false);
    };
  }, [isAuthenticated]);

  const flash = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  const run = async (action: () => Promise<void>, success?: string) => {
    setError('');
    setSaving(true);
    try {
      await action();
      if (success) flash(success);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
      setPassword('');
    } catch {
      setError('Incorrect email or password');
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newProduct.price);
    if (!newProduct.name || !(price > 0)) return setError('Please enter a name and a price above £0.');
    if (!newProduct.image) return setError('Please upload an image or paste an image URL.');
    run(async () => {
      await addProduct({ ...newProduct, price });
      setNewProduct(emptyProduct);
    }, 'Product published');
  };

  const saveEdit = () => {
    if (!editingProductId) return;
    if (!(Number(editForm.price) > 0)) return setError('Price must be above £0.');
    run(async () => {
      await updateProduct(editingProductId, editForm);
      setEditingProductId(null);
    }, 'Product updated');
  };

  const handleDelete = (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone. (Tip: untick "In stock" to hide it instead.)`)) return;
    run(() => removeProduct(p.id), 'Product deleted');
  };

  if (!isSupabaseEnabled) {
    return (
      <div className="min-h-screen bg-mari-cream flex items-center justify-center px-4 pt-24">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-mari-gold mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-mari-dark mb-2">Admin not set up yet</h2>
          <p className="text-gray-500">Connect the Supabase database (see README) to manage products and orders.</p>
        </div>
      </div>
    );
  }

  if (checkingSession) return <div className="min-h-screen bg-mari-cream" />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-mari-cream flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-md w-full border border-gray-100"
        >
          <div className="w-16 h-16 bg-mari-dark text-white rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-serif text-center text-mari-dark mb-2">Admin Access</h2>
          <p className="text-gray-500 text-center mb-8">Sign in to manage the shop.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={`${inputClass} text-lg`} required />
            <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={`${inputClass} text-lg`} required />
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            <button type="submit" className="w-full bg-mari-dark text-white py-4 rounded-xl font-bold tracking-wide hover:bg-mari-teal transition-colors shadow-lg">
              Unlock Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-serif text-mari-dark">Admin Dashboard</h1>
          <div className="flex flex-wrap gap-2 md:gap-4 bg-white p-1 rounded-xl shadow-sm border border-gray-100">
            {[
              { id: 'products', label: 'Products', icon: ShoppingBag },
              { id: 'orders', label: 'Orders', icon: Package, count: orders.length },
              { id: 'settings', label: 'Site Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 md:px-6 py-2 rounded-lg transition-all font-medium flex items-center gap-2 ${
                  activeTab === tab.id ? 'bg-mari-dark text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label} {tab.count !== undefined && <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">{tab.count}</span>}
              </button>
            ))}
            <button onClick={() => signOut()} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}
        {notice && <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{notice}</div>}

        {activeTab === 'products' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-32 border border-gray-100">
                <h2 className="text-xl font-serif mb-6 flex items-center gap-2 text-mari-dark">
                  <Plus className="w-5 h-5 text-mari-teal" /> New Product
                </h2>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className={inputClass} placeholder="Product Name" required />
                  <input type="number" min="0.01" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className={inputClass} placeholder="Price (£)" required />
                  <input list="categories" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className={inputClass} placeholder="Category" />
                  <datalist id="categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                  <ImageUpload
                    onUploaded={(url) => setNewProduct((p) => ({ ...p, image: url }))}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center hover:bg-mari-teal/5 transition-colors overflow-hidden"
                  >
                    {newProduct.image ? <img src={newProduct.image} alt="" className="w-full h-full object-cover" /> : <Upload className="w-6 h-6 text-gray-400" />}
                  </ImageUpload>
                  <input value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} className={`${inputClass} text-xs`} placeholder="…or paste an image URL" />
                  <input value={newProduct.scentNotes} onChange={(e) => setNewProduct({ ...newProduct, scentNotes: e.target.value })} className={inputClass} placeholder="Scent notes" />
                  <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className={inputClass} placeholder="Description" rows={2} />
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" checked={newProduct.featured} onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })} /> Featured on home page
                  </label>
                  <button type="submit" disabled={saving} className="w-full bg-mari-dark text-white py-4 rounded-xl font-bold tracking-wide shadow-md disabled:opacity-60">
                    {saving ? 'Saving…' : 'Publish'}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {products.map((product) => {
                const editing = editingProductId === product.id;
                return (
                  <div key={product.id} className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-start ${product.inStock === false ? 'opacity-60' : ''}`}>
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 relative">
                      <img src={editing ? editForm.image : product.image} alt="" className="w-full h-full object-cover" />
                      {editing && (
                        <ImageUpload onUploaded={(url) => setEditForm((f) => ({ ...f, image: url }))} className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Upload className="w-4 h-4 text-white" />
                        </ImageUpload>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {editing ? (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <input value={editForm.name ?? ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="px-2 py-1 border rounded" placeholder="Name" />
                          <input type="number" min="0.01" step="0.01" value={editForm.price ?? ''} onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })} className="px-2 py-1 border rounded" placeholder="Price £" />
                          <input list="categories" value={editForm.category ?? ''} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="px-2 py-1 border rounded" placeholder="Category" />
                          <input value={editForm.scentNotes ?? ''} onChange={(e) => setEditForm({ ...editForm, scentNotes: e.target.value })} className="px-2 py-1 border rounded" placeholder="Scent notes" />
                          <textarea value={editForm.description ?? ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="col-span-2 px-2 py-1 border rounded" rows={2} placeholder="Description" />
                          <input value={editForm.image ?? ''} onChange={(e) => setEditForm({ ...editForm, image: e.target.value })} className="col-span-2 px-2 py-1 border rounded text-[10px]" placeholder="Image URL" />
                          <label className="flex items-center gap-2"><input type="checkbox" checked={editForm.inStock !== false} onChange={(e) => setEditForm({ ...editForm, inStock: e.target.checked })} /> In stock</label>
                          <label className="flex items-center gap-2"><input type="checkbox" checked={!!editForm.featured} onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })} /> Featured</label>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-bold text-mari-dark">{product.name}</h3>
                          <p className="text-xs text-gray-500">
                            {product.category} • £{product.price.toFixed(2)}
                            {product.inStock === false && ' • Hidden (out of stock)'}
                            {product.featured && ' • Featured'}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {editing ? (
                        <>
                          <button onClick={saveEdit} disabled={saving} className="p-2 text-green-600 hover:bg-green-50 rounded-full" title="Save"><Check className="w-5 h-5" /></button>
                          <button onClick={() => setEditingProductId(null)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full" title="Cancel"><X className="w-5 h-5" /></button>
                        </>
                      ) : (
                        <button onClick={() => { setEditingProductId(product.id); setEditForm(product); }} className="p-2 text-gray-400 hover:text-mari-teal hover:bg-gray-50 rounded-full" title="Edit"><Edit2 className="w-5 h-5" /></button>
                      )}
                      <button onClick={() => handleDelete(product)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full" title="Delete"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
              <h2 className="text-2xl font-serif text-mari-dark">Visual Branding</h2>
              {([
                { key: 'heroBackground', label: 'Hero Background Atmosphere' },
                { key: 'heroForeground', label: 'Hero Foreground Arched Image' },
                { key: 'storyImage', label: 'Story Section Image' },
                { key: 'aboutImage', label: 'About Section (Mari Photo)' },
                { key: 'reviewsBackground', label: 'Reviews Atmosphere' },
                { key: 'navbarBackground', label: 'Navbar Background Overlay' },
              ] as { key: keyof SiteConfig; label: string }[]).map((item) => (
                <div key={item.key} className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">{item.label}</label>
                  <div className="flex gap-4 items-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0 relative group">
                      <img src={siteConfig[item.key]} alt="" className="w-full h-full object-cover" />
                      <ImageUpload onUploaded={(url) => updateSiteConfig({ [item.key]: url })} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                      </ImageUpload>
                    </div>
                    <div className="flex-1 space-y-2">
                      <input value={siteConfig[item.key]} onChange={(e) => updateSiteConfig({ [item.key]: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white outline-none" placeholder="Direct Image URL" />
                      <p className="text-[10px] text-gray-400">Click the thumbnail to upload or paste a URL above.</p>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => run(saveSiteConfig, 'Site settings saved')} disabled={saving} className="w-full bg-mari-dark text-white py-4 rounded-xl font-bold tracking-wide shadow-md disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Site Settings'}
              </button>
            </div>
            <div className="bg-mari-dark p-8 rounded-3xl text-white shadow-xl h-fit">
              <h3 className="text-xl font-serif mb-4">Tip</h3>
              <p className="text-white/60 text-sm leading-relaxed">
                Upload images under 5MB. The arched layouts work best with portrait (3:4) photos. Changes go live for everyone once you press Save.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-400">No orders yet</h3>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-mari-dark">Order #{order.id.slice(-6).toUpperCase()}</span>
                      <p className="text-xs text-gray-500">{new Date(order.date).toLocaleString('en-GB')}</p>
                    </div>
                    <select
                      value={order.status}
                      onChange={(e) => run(() => updateOrderStatus(order.id, e.target.value as typeof order.status))}
                      className="text-xs border border-gray-200 rounded-lg px-3 py-1 bg-white outline-none focus:ring-1 focus:ring-mari-teal"
                    >
                      <option value="paid">Paid</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div className="p-6 grid md:grid-cols-2 gap-8 text-sm">
                    <div>
                      <p className="font-bold mb-1">{order.customerName}</p>
                      <p className="text-gray-500">{order.email}</p>
                      <p className="text-gray-500 mt-2">{order.address}, {order.city}</p>
                      <p className="text-gray-500">{order.postcode}</p>
                      {order.isGift && (
                        <p className="mt-3 text-mari-gold font-medium">🎁 Gift{order.giftNote ? `: “${order.giftNote}”` : ''}</p>
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between mb-1">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-bold">£{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 mt-3 pt-3 space-y-1">
                        <div className="flex justify-between text-gray-500"><span>Shipping{order.isGift ? ' + gift wrap' : ''}</span><span>£{(order.total - order.subtotal).toFixed(2)}</span></div>
                        <div className="flex justify-between font-bold"><span>Total Paid</span><span>£{order.total.toFixed(2)}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
