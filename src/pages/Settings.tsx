import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import {
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  PaintBrushIcon,
  BellIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [activeTab, setActiveTab] = useState<'company' | 'invoice' | 'appearance' | 'notifications'>('company');
  const [formData, setFormData] = useState(settings);

  const tabs = [
    { id: 'company' as const, label: 'Company Details', icon: BuildingOfficeIcon },
    { id: 'invoice' as const, label: 'Invoice Settings', icon: DocumentTextIcon },
    { id: 'appearance' as const, label: 'Appearance', icon: PaintBrushIcon },
    { id: 'notifications' as const, label: 'Notifications', icon: BellIcon },
  ];

  const handleSave = () => {
    updateSettings(formData);
    alert('Settings saved successfully!');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCompanyDetailsChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      companyDetails: {
        ...prev.companyDetails,
        [field]: value,
      },
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logoUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({
      ...prev,
      logoUrl: undefined,
    }));
  };

  const currencies = [
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'JPY', name: 'Japanese Yen' },
  ];

  const templates = [
    { id: 'classic', name: 'Classic Professional' },
    { id: 'modern', name: 'Modern Minimalist' },
    { id: 'creative', name: 'Creative Touch' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-1">
            Configure your application preferences and business details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <IconComponent className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
              {/* Company Details Tab */}
              {activeTab === 'company' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <BuildingOfficeIcon className="w-6 h-6 text-blue-400" />
                    <h2 className="text-2xl font-semibold text-white">Company Details</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={formData.companyDetails.name}
                        onChange={(e) => handleCompanyDetailsChange('name', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        placeholder="Your Company Name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.companyDetails.email}
                        onChange={(e) => handleCompanyDetailsChange('email', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        placeholder="company@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.companyDetails.phone}
                        onChange={(e) => handleCompanyDetailsChange('phone', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Currency
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                      >
                        {currencies.map((currency) => (
                          <option key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Company Address
                    </label>
                    <textarea
                      value={formData.companyDetails.address}
                      onChange={(e) => handleCompanyDetailsChange('address', e.target.value)}
                      rows={3}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      placeholder="123 Main Street, City, State, ZIP Code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Company Logo
                    </label>
                    <div className="mt-2 flex items-center space-x-4">
                      <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-600 overflow-hidden">
                        {formData.logoUrl ? (
                          <img 
                            src={formData.logoUrl} 
                            alt="Company Logo" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <PhotoIcon className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer inline-block text-center"
                        >
                          Upload Logo
                        </label>
                        {formData.logoUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Remove Logo
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mt-2">
                      Recommended size: 200x100px. Supported formats: PNG, JPG, SVG
                    </p>
                  </div>
                </div>
              )}

              {/* Invoice Settings Tab */}
              {activeTab === 'invoice' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <DocumentTextIcon className="w-6 h-6 text-blue-400" />
                    <h2 className="text-2xl font-semibold text-white">Invoice Settings</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Invoice Prefix
                      </label>
                      <input
                        type="text"
                        value={formData.invoicePrefix}
                        onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        placeholder="INV"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Next Invoice Number
                      </label>
                      <input
                        type="number"
                        value={formData.nextInvoiceNumber}
                        onChange={(e) => handleInputChange('nextInvoiceNumber', parseInt(e.target.value))}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Default Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        value={formData.defaultTaxRate}
                        onChange={(e) => handleInputChange('defaultTaxRate', parseFloat(e.target.value))}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Default Payment Terms (Days)
                      </label>
                      <input
                        type="number"
                        value={formData.defaultPaymentTerms}
                        onChange={(e) => handleInputChange('defaultPaymentTerms', parseInt(e.target.value))}
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Default Invoice Template
                    </label>
                    <select
                      value={formData.defaultTemplate}
                      onChange={(e) => handleInputChange('defaultTemplate', e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500"
                    >
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <PaintBrushIcon className="w-6 h-6 text-blue-400" />
                    <h2 className="text-2xl font-semibold text-white">Appearance</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-4">
                      Theme
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => handleInputChange('theme', 'light')}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          formData.theme === 'light'
                            ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-white rounded border border-gray-300"></div>
                          <div>
                            <p className="font-medium text-white">Light Theme</p>
                            <p className="text-sm text-slate-400">Clean and bright interface</p>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => handleInputChange('theme', 'dark')}
                        className={`p-4 rounded-lg border-2 transition-colors ${
                          formData.theme === 'dark'
                            ? 'border-blue-500 bg-blue-500 bg-opacity-10'
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-slate-800 rounded border border-slate-600"></div>
                          <div>
                            <p className="font-medium text-white">Dark Theme</p>
                            <p className="text-sm text-slate-400">Easy on the eyes</p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <BellIcon className="w-6 h-6 text-blue-400" />
                    <h2 className="text-2xl font-semibold text-white">Notifications</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-750 rounded-lg border border-slate-600">
                      <div>
                        <h3 className="font-medium text-white">Email Reminders</h3>
                        <p className="text-sm text-slate-400">
                          Send automatic payment reminders to customers
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notifications.emailReminders}
                          onChange={(e) => handleNotificationChange('emailReminders', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-750 rounded-lg border border-slate-600">
                      <div>
                        <h3 className="font-medium text-white">Overdue Alerts</h3>
                        <p className="text-sm text-slate-400">
                          Get notified when invoices become overdue
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notifications.overdueAlerts}
                          onChange={(e) => handleNotificationChange('overdueAlerts', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-750 rounded-lg border border-slate-600">
                      <div>
                        <h3 className="font-medium text-white">Payment Confirmations</h3>
                        <p className="text-sm text-slate-400">
                          Receive notifications when payments are received
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.notifications.paymentConfirmations}
                          onChange={(e) => handleNotificationChange('paymentConfirmations', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-6 mt-8 border-t border-slate-700">
                <button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Cog6ToothIcon className="w-5 h-5 mr-2" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};