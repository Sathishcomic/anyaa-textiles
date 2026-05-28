import React, { useState } from 'react';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  FileText,
  Save,
  Percent,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Image,
  Globe,
  CreditCard,
  Download
} from 'lucide-react';

export default function Settings() {
  const [storeDetails, setStoreDetails] = useState({
    name: 'Anyaa Textiles',
    address: '123, T Nagar Main Road, Chennai - 600017, Tamil Nadu',
    phone: '+91 44 2815 4321',
    email: 'info@anyaatextiles.com',
    website: 'www.anyaatextiles.com',
    gstin: '33AABCU9603R1ZM',
    pan: 'AABCU9603R',
  });

  const [taxRates, setTaxRates] = useState([
    { id: 1, category: 'Cotton & Natural Fibers', gst: 5, description: 'All cotton, jute, natural fiber fabrics below ₹1000' },
    { id: 2, category: 'Silk & Premium Fabrics', gst: 12, description: 'Silk, chiffon, georgette, velvet materials' },
    { id: 3, category: 'Accessories & Trims', gst: 18, description: 'Zari, embroidery threads, buttons, borders' },
    { id: 4, category: 'Ready-made Garments (≤₹1000)', gst: 5, description: 'Ready-to-wear items priced up to ₹1000' },
    { id: 5, category: 'Ready-made Garments (>₹1000)', gst: 12, description: 'Ready-to-wear items priced above ₹1000' },
  ]);

  const [showSaved, setShowSaved] = useState(false);
  const [newTaxCategory, setNewTaxCategory] = useState({ category: '', gst: '', description: '' });
  const [showAddTax, setShowAddTax] = useState(false);
  const [activeSection, setActiveSection] = useState('store');

  const handleSave = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2500);
  };

  const addTaxRate = () => {
    if (!newTaxCategory.category || !newTaxCategory.gst) return;
    setTaxRates(prev => [...prev, { id: Date.now(), ...newTaxCategory, gst: Number(newTaxCategory.gst) }]);
    setNewTaxCategory({ category: '', gst: '', description: '' });
    setShowAddTax(false);
  };

  const removeTaxRate = (id) => {
    setTaxRates(prev => prev.filter(t => t.id !== id));
  };

  const updateTaxRate = (id, field, value) => {
    setTaxRates(prev => prev.map(t =>
      t.id === id ? { ...t, [field]: field === 'gst' ? Number(value) : value } : t
    ));
  };

  const sections = [
    { id: 'store', label: 'Store Details', icon: Store },
    { id: 'tax', label: 'Tax Configuration', icon: Percent },
    { id: 'invoice', label: 'Invoice Settings', icon: FileText },
    { id: 'export', label: 'Database & Export', icon: Download },
  ];

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left: Section Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card border border-surface-100 p-3 space-y-1 lg:sticky lg:top-20">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-surface-600 hover:bg-surface-50'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Content */}
        <div className="lg:col-span-3 space-y-5">
          {/* Store Details */}
          {activeSection === 'store' && (
            <div className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-surface-100">
                <h3 className="text-lg font-display font-bold text-surface-800">Store Information</h3>
                <p className="text-sm text-surface-500">Manage your store's identity and contact details</p>
              </div>
              <div className="p-6 space-y-5">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">Store Logo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 border-2 border-dashed border-primary-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors">
                      <Image className="w-8 h-8 text-primary-400 mb-1" />
                      <span className="text-[10px] text-primary-500 font-medium">Upload</span>
                    </div>
                    <div>
                      <p className="text-sm text-surface-600">Drag & drop or click to upload</p>
                      <p className="text-xs text-surface-400">PNG, JPG up to 2MB. Recommended: 256×256px</p>
                    </div>
                  </div>
                </div>

                {/* Store Name */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Store Name</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="text"
                      value={storeDetails.name}
                      onChange={e => setStoreDetails(p => ({ ...p, name: e.target.value }))}
                      className="input-field !pl-10"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Full Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-surface-400" />
                    <textarea
                      value={storeDetails.address}
                      onChange={e => setStoreDetails(p => ({ ...p, address: e.target.value }))}
                      className="input-field !pl-10 min-h-[80px] resize-none"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                      <input
                        type="tel"
                        value={storeDetails.phone}
                        onChange={e => setStoreDetails(p => ({ ...p, phone: e.target.value }))}
                        className="input-field !pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                      <input
                        type="email"
                        value={storeDetails.email}
                        onChange={e => setStoreDetails(p => ({ ...p, email: e.target.value }))}
                        className="input-field !pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">Website</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                      <input
                        type="text"
                        value={storeDetails.website}
                        onChange={e => setStoreDetails(p => ({ ...p, website: e.target.value }))}
                        className="input-field !pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Tax IDs */}
                <div className="pt-4 border-t border-surface-100">
                  <h4 className="text-sm font-semibold text-surface-700 mb-3">Tax Registration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1.5">GSTIN</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                          type="text"
                          value={storeDetails.gstin}
                          onChange={e => setStoreDetails(p => ({ ...p, gstin: e.target.value }))}
                          className="input-field !pl-10 font-mono"
                          placeholder="22AAAAA0000A1Z5"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1.5">PAN</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                          type="text"
                          value={storeDetails.pan}
                          onChange={e => setStoreDetails(p => ({ ...p, pan: e.target.value }))}
                          className="input-field !pl-10 font-mono"
                          placeholder="AAAAA0000A"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-surface-100 bg-surface-50 rounded-b-2xl flex justify-end">
                <button onClick={handleSave} className="btn-primary text-sm flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Tax Configuration */}
          {activeSection === 'tax' && (
            <div className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-surface-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-display font-bold text-surface-800">GST Rate Configuration</h3>
                  <p className="text-sm text-surface-500">Set default tax rates for different textile categories</p>
                </div>
                <button
                  onClick={() => setShowAddTax(true)}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>

              <div className="divide-y divide-surface-100">
                {taxRates.map(tax => (
                  <div key={tax.id} className="px-6 py-4 hover:bg-surface-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-emerald-700">{tax.gst}%</span>
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={tax.category}
                            onChange={e => updateTaxRate(tax.id, 'category', e.target.value)}
                            className="text-sm font-semibold text-surface-800 bg-transparent border-none outline-none w-full focus:text-primary-700"
                          />
                          <input
                            type="text"
                            value={tax.description}
                            onChange={e => updateTaxRate(tax.id, 'description', e.target.value)}
                            className="text-xs text-surface-400 bg-transparent border-none outline-none w-full mt-0.5"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-surface-500">GST:</label>
                          <input
                            type="number"
                            value={tax.gst}
                            onChange={e => updateTaxRate(tax.id, 'gst', e.target.value)}
                            className="w-16 text-sm text-center py-1.5 rounded-lg border border-surface-200 focus:border-primary-400 outline-none font-semibold"
                            min="0"
                            max="28"
                          />
                          <span className="text-xs text-surface-400">%</span>
                        </div>
                        <button
                          onClick={() => removeTaxRate(tax.id)}
                          className="p-2 rounded-lg text-surface-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Info */}
              <div className="px-6 py-4 bg-blue-50/50 border-t border-blue-100">
                <p className="text-xs text-blue-600 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  GST rates are applied automatically during billing based on product category assignment.
                </p>
              </div>

              <div className="px-6 py-4 border-t border-surface-100 bg-surface-50 rounded-b-2xl flex justify-end">
                <button onClick={handleSave} className="btn-primary text-sm flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Tax Rates
                </button>
              </div>
            </div>
          )}

          {/* Invoice Settings */}
          {activeSection === 'invoice' && (
            <div className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-surface-100">
                <h3 className="text-lg font-display font-bold text-surface-800">Invoice Settings</h3>
                <p className="text-sm text-surface-500">Customize your invoice appearance and numbering</p>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">Invoice Prefix</label>
                    <input type="text" defaultValue="INV" className="input-field font-mono" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">Next Invoice Number</label>
                    <input type="number" defaultValue="848" className="input-field font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">Invoice Footer Text</label>
                  <textarea
                    defaultValue="Thank you for shopping at Anyaa Textiles! Goods once sold cannot be returned without original invoice. All disputes subject to Chennai jurisdiction."
                    className="input-field min-h-[100px] resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">Currency</label>
                    <input type="text" defaultValue="INR (₹)" className="input-field" readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5">Date Format</label>
                    <input type="text" defaultValue="DD/MM/YYYY" className="input-field" readOnly />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-surface-100 bg-surface-50 rounded-b-2xl flex justify-end">
                <button onClick={handleSave} className="btn-primary text-sm flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* Database & Export */}
          {activeSection === 'export' && (
            <div className="bg-white rounded-2xl shadow-card border border-surface-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-surface-100">
                <h3 className="text-lg font-display font-bold text-surface-800">Database & Export</h3>
                <p className="text-sm text-surface-500">Backup your store data or export it to Excel</p>
              </div>
              <div className="p-6">
                <div className="p-5 border border-indigo-100 bg-indigo-50/50 rounded-xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-indigo-900 mb-1">Export Complete Database</h4>
                    <p className="text-xs text-indigo-700 mb-4">
                      Download all Products, Customers, and Billing history into a single Excel workbook. This is useful for backups and external accounting.
                    </p>
                    <button 
                      onClick={async () => {
                        const { exportAllData } = await import('../utils/exportData');
                        const success = await exportAllData();
                        if (success) {
                          setShowSaved(true); // Reusing toast for success
                          setTimeout(() => setShowSaved(false), 2500);
                        }
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export Data to Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Tax Category Modal */}
      {showAddTax && (
        <div className="modal-overlay" onClick={() => setShowAddTax(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-surface-100">
              <h3 className="text-lg font-display font-bold text-surface-800">Add Tax Category</h3>
              <button onClick={() => setShowAddTax(false)} className="p-2 rounded-lg hover:bg-surface-100">
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Category Name</label>
                <input
                  type="text"
                  value={newTaxCategory.category}
                  onChange={e => setNewTaxCategory(p => ({ ...p, category: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Synthetic Fabrics"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">GST Rate (%)</label>
                <input
                  type="number"
                  value={newTaxCategory.gst}
                  onChange={e => setNewTaxCategory(p => ({ ...p, gst: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., 12"
                  min="0"
                  max="28"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Description</label>
                <input
                  type="text"
                  value={newTaxCategory.description}
                  onChange={e => setNewTaxCategory(p => ({ ...p, description: e.target.value }))}
                  className="input-field"
                  placeholder="Brief description"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-100 bg-surface-50 rounded-b-2xl">
              <button onClick={() => setShowAddTax(false)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={addTaxRate} className="btn-primary text-sm">Add Category</button>
            </div>
          </div>
        </div>
      )}

      {/* Save Success Toast */}
      {showSaved && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-xl shadow-xl shadow-emerald-500/30 animate-slide-up z-50">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">Settings saved successfully!</span>
        </div>
      )}
    </div>
  );
}
