import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import type { ProductTemplate, LineItem } from '../types';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
  TagIcon,
  DocumentTextIcon,
  RectangleGroupIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export const Products: React.FC = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    productTemplates, 
    addProductTemplate, 
    updateProductTemplate, 
    deleteProductTemplate, 
    settings 
  } = useApp();
  const [activeTab, setActiveTab] = useState<'products' | 'templates'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unitPrice: '',
    category: '',
    taxRate: settings.defaultTaxRate.toString(),
  });
  const [templateFormData, setTemplateFormData] = useState({
    name: '',
    description: '',
    category: '',
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0 }] as LineItem[],
  });

  const categories = ['Development', 'Design', 'Consulting', 'Management', 'Marketing', 'Other'];

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTemplates = productTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency || 'USD',
    }).format(amount);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      unitPrice: '',
      category: '',
      taxRate: settings.defaultTaxRate.toString(),
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.unitPrice) {
      alert('Please fill in the required fields (Name and Unit Price).');
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      unitPrice: parseFloat(formData.unitPrice),
      category: formData.category || 'Other',
      taxRate: parseFloat(formData.taxRate),
    };

    if (editingProduct) {
      const product = products.find(p => p.id === editingProduct);
      if (product) {
        updateProduct({ ...product, ...productData });
      }
    } else {
      addProduct(productData);
    }

    resetForm();
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description,
      unitPrice: product.unitPrice.toString(),
      category: product.category,
      taxRate: product.taxRate.toString(),
    });
    setEditingProduct(product.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      deleteProduct(id);
    }
  };

  // Template management functions
  const resetTemplateForm = () => {
    setTemplateFormData({
      name: '',
      description: '',
      category: '',
      items: [{ id: '1', description: '', quantity: 1, unitPrice: 0 }],
    });
    setEditingTemplate(null);
    setShowTemplateForm(false);
  };

  const addTemplateItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      description: '',
      quantity: 1,
      unitPrice: 0,
    };
    setTemplateFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const updateTemplateItem = (id: string, field: keyof Omit<LineItem, 'id'>, value: string | number) => {
    setTemplateFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
      ),
    }));
  };

  const selectProductForTemplateItem = (itemId: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setTemplateFormData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId 
            ? { ...item, description: product.name, unitPrice: product.unitPrice }
            : item
        ),
      }));
    }
  };

  const removeTemplateItem = (id: string) => {
    setTemplateFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  };

  const handleTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!templateFormData.name || templateFormData.items.length === 0) {
      alert('Please fill in the template name and add at least one item.');
      return;
    }

    const totalPrice = templateFormData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    const templateData = {
      name: templateFormData.name,
      description: templateFormData.description,
      category: templateFormData.category || 'Other',
      items: templateFormData.items,
      totalPrice,
    };

    if (editingTemplate) {
      const template = productTemplates.find(t => t.id === editingTemplate);
      if (template) {
        updateProductTemplate({ ...template, ...templateData });
      }
    } else {
      addProductTemplate(templateData);
    }

    resetTemplateForm();
  };

  const handleEditTemplate = (template: ProductTemplate) => {
    setTemplateFormData({
      name: template.name,
      description: template.description,
      category: template.category,
      items: template.items,
    });
    setEditingTemplate(template.id);
    setShowTemplateForm(true);
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      deleteProductTemplate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Products & Services</h1>
            <p className="text-slate-400 mt-1">
              Manage your catalog of products, services, and reusable templates.
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddForm(true)}
              className={`px-6 py-3 rounded-lg font-medium flex items-center transition-colors ${
                activeTab === 'products' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Product
            </button>
            <button
              onClick={() => setShowTemplateForm(true)}
              className={`px-6 py-3 rounded-lg font-medium flex items-center transition-colors ${
                activeTab === 'templates' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              <RectangleGroupIcon className="w-5 h-5 mr-2" />
              Add Template
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800 rounded-xl p-1 mb-6 border border-slate-700">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'products'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <CubeIcon className="w-5 h-5 mr-2" />
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'templates'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <RectangleGroupIcon className="w-5 h-5 mr-2" />
              Templates ({productTemplates.length})
            </button>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Product/Service Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="Enter product/service name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Unit Price <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.taxRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxRate: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="0.0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="Describe your product or service..."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Template Form Modal */}
        {showTemplateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl p-6 w-full max-w-4xl border border-slate-700 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  {editingTemplate ? 'Edit Product Template' : 'Add New Product Template'}
                </h2>
                <button
                  onClick={resetTemplateForm}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleTemplateSubmit} className="space-y-6">
                {/* Basic Template Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Template Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={templateFormData.name}
                      onChange={(e) => setTemplateFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="e.g., Pro Web Package"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <select
                      value={templateFormData.category}
                      onChange={(e) => setTemplateFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={templateFormData.description}
                    onChange={(e) => setTemplateFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    placeholder="Describe what's included in this template..."
                  />
                </div>

                {/* Template Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-slate-300">
                      Template Items <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addTemplateItem}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {templateFormData.items.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-end bg-slate-700 p-3 rounded-lg">
                        <div className="col-span-5">
                          <label className="block text-xs font-medium text-slate-400 mb-1">
                            Description
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateTemplateItem(item.id, 'description', e.target.value)}
                              className="flex-1 bg-slate-600 border border-slate-500 rounded py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                              placeholder="Item description..."
                            />
                            {products.length > 0 && (
                              <select
                                onChange={(e) => selectProductForTemplateItem(item.id, e.target.value)}
                                className="bg-slate-600 border border-slate-500 rounded py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                                title="Select from products"
                              >
                                <option value="">Select Product</option>
                                {products.map((product) => (
                                  <option key={product.id} value={product.id}>
                                    {product.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-slate-400 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateTemplateItem(item.id, 'quantity', e.target.value)}
                            className="w-full bg-slate-600 border border-slate-500 rounded py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-slate-400 mb-1">
                            Unit Price
                          </label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateTemplateItem(item.id, 'unitPrice', e.target.value)}
                            className="w-full bg-slate-600 border border-slate-500 rounded py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-slate-400 mb-1">
                            Total
                          </label>
                          <div className="py-2 px-3 text-white font-medium text-sm">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </div>
                        </div>
                        <div className="col-span-1">
                          <button
                            type="button"
                            onClick={() => removeTemplateItem(item.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded transition-colors"
                            disabled={templateFormData.items.length === 1}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Template Total */}
                  <div className="flex justify-end mt-4">
                    <div className="bg-slate-700 rounded-lg p-3">
                      <div className="text-right">
                        <p className="text-slate-400 text-sm">Template Total</p>
                        <p className="text-white font-bold text-lg">
                          {formatCurrency(
                            templateFormData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={resetTemplateForm}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    {editingTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search products and services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Content Grid */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {activeTab === 'products' ? (
            // Products Content
            filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <CubeIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">
                  {searchTerm ? 'No products found matching your search.' : 'No products yet'}
                </p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Add your first product or service
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-6 hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                        <CubeIcon className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {product.name}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                            <TagIcon className="w-3 h-3 mr-1" />
                            {product.category}
                          </span>
                        </div>
                        {product.description && (
                          <p className="text-slate-400 text-sm mb-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <span>Tax Rate: {product.taxRate}%</span>
                          <span>Added {format(new Date(product.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {formatCurrency(product.unitPrice)}
                        </div>
                        <div className="text-sm text-slate-400">per unit</div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )
          ) : (
            // Templates Content
            filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <RectangleGroupIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">
                  {searchTerm ? 'No templates found matching your search.' : 'No product templates yet'}
                </p>
                <button
                  onClick={() => setShowTemplateForm(true)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  Create your first template
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-700">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-6 hover:bg-slate-750 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-12 h-12 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                          <RectangleGroupIcon className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {template.name}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                              <TagIcon className="w-3 h-3 mr-1" />
                              {template.category}
                            </span>
                          </div>
                          {template.description && (
                            <p className="text-slate-400 text-sm mb-3">
                              {template.description}
                            </p>
                          )}
                          <div className="space-y-1 mb-3">
                            <p className="text-sm font-medium text-slate-300">Includes:</p>
                            {template.items.slice(0, 4).map((item, index) => (
                              <div key={index} className="text-xs text-slate-400 flex justify-between">
                                <span>• {item.description}</span>
                                <span>{item.quantity} × {formatCurrency(item.unitPrice)}</span>
                              </div>
                            ))}
                            {template.items.length > 4 && (
                              <div className="text-xs text-slate-500">
                                +{template.items.length - 4} more items...
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span>{template.items.length} items</span>
                            <span>Created {format(new Date(template.createdAt), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {formatCurrency(template.totalPrice)}
                          </div>
                          <div className="text-sm text-slate-400">total package</div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Edit template"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                            title="Delete template"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Summary */}
        {((activeTab === 'products' && products.length > 0) || (activeTab === 'templates' && productTemplates.length > 0)) && (
          <div className="mt-6 bg-slate-800 rounded-xl p-6 border border-slate-700">
            {activeTab === 'products' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{products.length}</p>
                  <p className="text-slate-400 text-sm">Total Products</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(
                      products.reduce((sum, product) => sum + product.unitPrice, 0) / products.length || 0
                    )}
                  </p>
                  <p className="text-slate-400 text-sm">Average Price</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {new Set(products.map(p => p.category)).size}
                  </p>
                  <p className="text-slate-400 text-sm">Categories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(Math.max(...products.map(p => p.unitPrice)))}
                  </p>
                  <p className="text-slate-400 text-sm">Highest Price</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{productTemplates.length}</p>
                  <p className="text-slate-400 text-sm">Total Templates</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(
                      productTemplates.reduce((sum, template) => sum + template.totalPrice, 0) / productTemplates.length || 0
                    )}
                  </p>
                  <p className="text-slate-400 text-sm">Average Value</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {new Set(productTemplates.map(t => t.category)).size}
                  </p>
                  <p className="text-slate-400 text-sm">Categories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(Math.max(...productTemplates.map(t => t.totalPrice)))}
                  </p>
                  <p className="text-slate-400 text-sm">Highest Value</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};