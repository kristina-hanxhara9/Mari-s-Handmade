
import React, { useState, useRef } from 'react';
import { useAdminStore } from '../store';
import { Plus, Trash2, Package, ShoppingBag, Lock, Upload, Settings, Edit2, Check, X as CloseIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../types';

export const Admin = () => {
  const { products, orders, siteConfig, addProduct, updateProduct, removeProduct, updateOrderStatus, updateSiteConfig } = useAdminStore();
  
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Product Edit State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Arrangements',
    image: '',
    scentNotes: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'mari123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000000) {
        alert("File is too large! Please choose an image under 2MB or use a URL.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditing = (p: Product) => {
    setEditingProductId(p.id);
    setEditForm(p);
  };

  const saveEdit = () => {
    if (editingProductId) {
      updateProduct(editingProductId, editForm);
      setEditingProductId(null);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    addProduct({
      id: Date.now().toString(),
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      image: newProduct.image || 'https://images.unsplash.com/photo-1602523774026-c23f5b72e022?q=80&w=800&auto=format&fit=crop',
      scentNotes: newProduct.scentNotes
    });

    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: 'Arrangements',
      image: '',
      scentNotes: ''
    });
    alert('Product published successfully!');
  };

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
          <p className="text-gray-500 text-center mb-8">Please enter your password to continue.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-mari-teal focus:border-transparent outline-none text-lg"
            />
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
            <button
              type="submit"
              className="w-full bg-mari-dark text-white py-4 rounded-xl font-bold tracking-wide hover:bg-mari-teal transition-colors shadow-lg"
            >
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
              { id: 'settings', label: 'Site Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 md:px-6 py-2 rounded-lg transition-all font-medium flex items-center gap-2 ${
                  activeTab === tab.id ? 'bg-mari-dark text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label} {tab.count !== undefined && <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">{tab.count}</span>}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-32 border border-gray-100">
                <h2 className="text-xl font-serif mb-6 flex items-center gap-2 text-mari-dark">
                  <Plus className="w-5 h-5 text-mari-teal" /> New Product
                </h2>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <input
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-mari-teal outline-none"
                    placeholder="Product Name"
                    required
                  />
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-mari-teal outline-none"
                    placeholder="Price (£)"
                    required
                  />
                  <select
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-mari-teal outline-none"
                  >
                    <option value="Arrangements">Arrangements</option>
                    <option value="Pillars">Pillars</option>
                    <option value="Jars">Jars</option>
                    <option value="Novelty">Novelty</option>
                  </select>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-mari-teal/5 transition-colors overflow-hidden relative"
                  >
                    {newProduct.image ? <img src={newProduct.image} className="w-full h-full object-cover" /> : <Upload className="w-6 h-6 text-gray-400" />}
                    <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, (url) => setNewProduct({...newProduct, image: url}))} className="hidden" />
                  </div>
                  <input
                    value={newProduct.image}
                    onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-mari-teal outline-none text-xs"
                    placeholder="Image URL (optional)"
                  />
                  <textarea
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-mari-teal outline-none"
                    placeholder="Description"
                    rows={2}
                  />
                  <button type="submit" className="w-full bg-mari-dark text-white py-4 rounded-xl font-bold tracking-wide shadow-md">Publish</button>
                </form>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-4">
              {products.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center group">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 relative group-hover:border-mari-teal transition-colors">
                    <img src={product.image} className="w-full h-full object-cover" />
                    {editingProductId === product.id && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <label className="cursor-pointer p-2">
                                <Upload className="w-4 h-4 text-white" />
                                <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, (url) => setEditForm({...editForm, image: url}))} />
                            </label>
                        </div>
                    )}
                  </div>
                  <div className="flex-1">
                    {editingProductId === product.id ? (
                      <div className="grid grid-cols-2 gap-2">
                        <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="px-2 py-1 border rounded text-sm" />
                        <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})} className="px-2 py-1 border rounded text-sm" />
                        <input value={editForm.image} onChange={e => setEditForm({...editForm, image: e.target.value})} className="col-span-2 px-2 py-1 border rounded text-[10px]" placeholder="Image URL" />
                      </div>
                    ) : (
                      <>
                        <h3 className="font-bold text-mari-dark">{product.name}</h3>
                        <p className="text-xs text-gray-500">{product.category} • £{product.price.toFixed(2)}</p>
                      </>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {editingProductId === product.id ? (
                      <button onClick={saveEdit} className="p-2 text-green-600 hover:bg-green-50 rounded-full"><Check className="w-5 h-5" /></button>
                    ) : (
                      <button onClick={() => startEditing(product)} className="p-2 text-gray-400 hover:text-mari-teal hover:bg-gray-50 rounded-full"><Edit2 className="w-5 h-5" /></button>
                    )}
                    <button onClick={() => removeProduct(product.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
              <h2 className="text-2xl font-serif text-mari-dark">Visual Branding</h2>
              
              {[
                { key: 'heroBackground', label: 'Hero Background Atmosphere' },
                { key: 'heroForeground', label: 'Hero Foreground Arched Image' },
                { key: 'storyImage', label: 'Story Section Image' },
                { key: 'aboutImage', label: 'About Section (Mari Photo)' },
                { key: 'reviewsBackground', label: 'Reviews Atmosphere' },
                { key: 'navbarBackground', label: 'Navbar Background Overlay' }
              ].map((item) => (
                <div key={item.key} className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">{item.label}</label>
                  <div className="flex gap-4 items-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0 relative group">
                        <img src={(siteConfig as any)[item.key]} className="w-full h-full object-cover" />
                        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Upload className="w-6 h-6 text-white" />
                            <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, (url) => updateSiteConfig({ [item.key]: url }))} />
                        </label>
                    </div>
                    <div className="flex-1 space-y-2">
                        <input 
                            value={(siteConfig as any)[item.key]}
                            onChange={(e) => updateSiteConfig({ [item.key]: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white outline-none"
                            placeholder="Direct Image URL"
                        />
                        <p className="text-[10px] text-gray-400">Click the thumbnail to upload or paste a URL above.</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-8">
                <div className="bg-mari-dark p-8 rounded-3xl text-white shadow-xl">
                    <h3 className="text-xl font-serif mb-4">Site Customization Pro-Tip</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                        Use high-quality images from Unsplash or upload your own 2MB shots. The arched layouts work best with portrait-oriented (3:4) photos.
                    </p>
                    <div className="mt-6 flex justify-between items-center border-t border-white/10 pt-6">
                        <span className="text-xs text-mari-gold font-bold tracking-widest uppercase">Admin Active</span>
                        <div className="flex gap-2">
                            <div className="w-2 h-2 rounded-full bg-mari-gold animate-pulse" />
                            <div className="w-2 h-2 rounded-full bg-mari-teal animate-pulse delay-75" />
                        </div>
                    </div>
                </div>
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
              orders.map(order => (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-mari-dark">Order #{order.id.slice(-6).toUpperCase()}</span>
                      <p className="text-xs text-gray-500">{new Date(order.date).toLocaleString()}</p>
                    </div>
                    <select 
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                      className="text-xs border border-gray-200 rounded-lg px-3 py-1 bg-white outline-none focus:ring-1 focus:ring-mari-teal"
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                  <div className="p-6 grid md:grid-cols-2 gap-8 text-sm">
                    <div>
                        <p className="font-bold mb-1">{order.customerName}</p>
                        <p className="text-gray-500">{order.email}</p>
                        <p className="text-gray-500 mt-2">{order.address}, {order.city}</p>
                        <p className="text-gray-500">{order.postcode}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between mb-1">
                                <span>{item.quantity}x {item.name}</span>
                                <span className="font-bold">£{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold">
                            <span>Total Paid</span>
                            <span>£{order.total.toFixed(2)}</span>
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
