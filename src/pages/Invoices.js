import React, { useState, useEffect, useCallback } from 'react';
import { getBills, deleteBill } from '../services/api';
import { InvoiceView } from './Billing';
import { useAuth } from '../context/AuthContext';

export default function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices]         = useState([]);
  const [search, setSearch]             = useState('');
  const [filterPay, setFilterPay]       = useState('All');
  const [selectedInv, setSelectedInv]   = useState(null);
  const [loading, setLoading]           = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBills();
      setInvoices([...res.data].reverse());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = invoices.filter(inv => {
    const matchSearch =
      (inv.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv.customer || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv.phone || '').includes(search);
    const matchPay = filterPay === 'All' || inv.payment === filterPay;
    return matchSearch && matchPay;
  });

  const totalAmount = filtered.reduce((s, i) => s + (Number(i.amount) || 0), 0);

  /* Build full inv object for InvoiceView */
  const buildViewObj = (inv) => ({
    invoiceId   : inv.id,
    date        : inv.date || 'N/A',
    customer    : inv.customer,
    phone       : inv.phone || '',
    lineItems   : inv.lineItems || [],
    paymentMethod: inv.payment,
    grandTotal  : inv.amount,
  });

  const handleWhatsApp = (inv) => {
    const li = (inv.lineItems || []);
    const lines = li.length
      ? li.map(it => `• ${it.name} x${it.qty} @ ₹${Number(it.rate).toLocaleString('en-IN')} = ₹${(it.qty * Number(it.rate)).toLocaleString('en-IN')}`).join('\n')
      : `Total items: ${inv.items}`;
    const msg = `🌸 *Anyaa Textiles* 🌸\nInvoice: *${inv.id}*\nDate: ${inv.date || ''}\nCustomer: ${inv.customer}\n\n${lines}\n\n*Total: ₹${Number(inv.amount).toLocaleString('en-IN')}*\nPayment: ${inv.payment}\n\nThank you for shopping! 💐`;
    const ph = (inv.phone || '').replace(/\D/g, '');
    window.open(ph ? `https://wa.me/91${ph}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handlePrint = () => window.print();

  const handleDelete = async (inv) => {
    if (!window.confirm(`Delete invoice ${inv.id}?`)) return;
    try { await deleteBill(inv.id); await load(); } catch (e) { alert('Delete failed'); }
  };

  const PAY_COLORS = {
    Cash: 'inv-pay-cash', UPI: 'inv-pay-upi', Card: 'inv-pay-card',
  };

  return (
    <>
      <style>{`
        /* ── Page ── */
        .inv-page { display: flex; flex-direction: column; gap: 20px; }

        /* ── Stats bar ── */
        .inv-stats {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;
        }
        .inv-stat {
          background: #fff; border: 1px solid #f0e0ec; border-radius: 16px;
          padding: 16px 20px; box-shadow: 0 2px 10px rgba(139,58,106,.06);
        }
        .inv-stat-label { font-size: 11px; font-weight: 600; color: #a07090; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 4px; }
        .inv-stat-val   { font-size: 22px; font-weight: 800; color: #4a1942; }

        /* ── Table card ── */
        .inv-card {
          background: #fff; border: 1px solid #f0e0ec; border-radius: 18px;
          box-shadow: 0 2px 14px rgba(139,58,106,.06); overflow: hidden;
        }
        .inv-toolbar {
          padding: 16px 22px; border-bottom: 1px solid #f5edf3;
          display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
        }
        .inv-search {
          flex: 1; min-width: 200px; border: 1px solid #e8d4e4; border-radius: 10px;
          padding: 8px 14px; font-size: 13px; outline: none; background: #fdf6fa;
          color: #333; font-family: inherit;
        }
        .inv-search:focus { border-color: #c07a9c; }
        .pay-filter {
          display: flex; gap: 6px;
        }
        .pf-btn {
          padding: 6px 14px; border-radius: 20px; font-size: 11px; font-weight: 700;
          border: 1px solid #e8d4e4; cursor: pointer; background: #fff; color: #8b3a6a;
          transition: .15s;
        }
        .pf-btn.active { background: #8b3a6a; color: #fff; border-color: #8b3a6a; }
        .inv-refresh {
          padding: 7px 14px; border-radius: 10px; border: 1px solid #e8d4e4;
          background: #fff; cursor: pointer; font-size: 12px; font-weight: 600; color: #8b3a6a;
          transition: .15s;
        }
        .inv-refresh:hover { background: #fdf0f8; }

        /* ── Table ── */
        .inv-table-wrap { overflow-x: auto; }
        .inv-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .inv-table thead tr { background: #f7eef5; }
        .inv-table th {
          padding: 11px 14px; text-align: left; font-size: 10px; font-weight: 700;
          color: #8b3a6a; text-transform: uppercase; letter-spacing: .5px;
          border-bottom: 2px solid #e8d4e4;
        }
        .inv-table td { padding: 11px 14px; border-bottom: 1px solid #f8f0f6; vertical-align: middle; }
        .inv-table tbody tr:hover { background: #fdf6fa; }
        .inv-table .inv-id { font-family: monospace; font-weight: 700; color: #8b3a6a; font-size: 12px; }
        .inv-table .inv-cust { font-weight: 600; color: #3a1a34; }
        .inv-table .inv-phone { font-size: 11px; color: #a07090; }
        .inv-table .inv-amt { font-weight: 800; color: #4a1942; font-size: 14px; }
        .inv-pay-cash { background: #e8f9ef; color: #1a7a3a; border: 1px solid #b4e4c4; }
        .inv-pay-upi  { background: #f0ecff; color: #5a36c0; border: 1px solid #ccc4f4; }
        .inv-pay-card { background: #e8f4ff; color: #1a60c0; border: 1px solid #b4d4f4; }
        .pay-badge {
          display: inline-block; padding: 4px 10px; border-radius: 20px;
          font-size: 10px; font-weight: 700;
        }
        .action-cell { display: flex; gap: 6px; justify-content: flex-end; }
        .tbl-btn {
          padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 700;
          cursor: pointer; border: none; transition: .15s;
        }
        .tbl-view  { background: #f7eef5; color: #8b3a6a; }
        .tbl-view:hover  { background: #8b3a6a; color: #fff; }
        .tbl-wa    { background: #e8f9ef; color: #1a7a3a; }
        .tbl-wa:hover    { background: #25d366; color: #fff; }
        .tbl-del   { background: #fff0f3; color: #c04070; }
        .tbl-del:hover   { background: #ffb8d0; }

        /* Empty */
        .inv-empty { text-align: center; padding: 48px; color: #ccc; font-size: 14px; }

        /* ── Invoice Modal ── */
        .inv-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.55);
          backdrop-filter: blur(4px); z-index: 9999;
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .inv-sheet {
          background: #fff; border-radius: 18px; width: 700px; max-height: 92vh;
          overflow-y: auto; box-shadow: 0 24px 70px rgba(0,0,0,.3);
          animation: slideUp .25s ease;
        }
        @keyframes slideUp { from{transform:translateY(28px);opacity:0} to{transform:translateY(0);opacity:1} }
        .inv-modal-actions {
          display: flex; gap: 10px; padding: 14px 20px;
          border-bottom: 1px solid #f0e0ec; justify-content: flex-end; flex-wrap: wrap;
        }
        .mact-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 10px; font-size: 12px; font-weight: 700;
          cursor: pointer; border: none; transition: .15s;
        }
        .mact-wa    { background: #25d366; color: #fff; }
        .mact-wa:hover { background: #1aad54; }
        .mact-print { background: #4a90e2; color: #fff; }
        .mact-print:hover { background: #3178c6; }
        .mact-close { background: #f5f5f5; color: #555; }
        .mact-close:hover { background: #ffe0e0; color: #c04040; }

        /* Print */
        @media print {
          body * { visibility: hidden !important; }
          #printable-invoice, #printable-invoice * { visibility: visible !important; }
          #printable-invoice { position: fixed; inset: 0; padding: 24px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="inv-page">
        {/* ── Page title ── */}
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#4a1942', margin: 0 }}>All Invoices</h1>
          <p style={{ fontSize: 12, color: '#a07090', marginTop: 4 }}>View, print, and share generated bills.</p>
        </div>

        {/* ── Stats ── */}
        <div className="inv-stats">
          <div className="inv-stat">
            <div className="inv-stat-label">Total Invoices</div>
            <div className="inv-stat-val">{filtered.length}</div>
          </div>
          <div className="inv-stat">
            <div className="inv-stat-label">Total Amount</div>
            <div className="inv-stat-val">₹{totalAmount.toLocaleString('en-IN')}</div>
          </div>
          <div className="inv-stat">
            <div className="inv-stat-label">Cash / UPI / Card</div>
            <div className="inv-stat-val" style={{ fontSize: 16, paddingTop: 4 }}>
              {filtered.filter(i => i.payment === 'Cash').length} /&nbsp;
              {filtered.filter(i => i.payment === 'UPI').length} /&nbsp;
              {filtered.filter(i => i.payment === 'Card').length}
            </div>
          </div>
        </div>

        {/* ── Table Card ── */}
        <div className="inv-card">
          <div className="inv-toolbar">
            <input
              className="inv-search"
              placeholder="🔍  Search by Invoice ID, Customer or Phone…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="pay-filter">
              {['All','Cash','UPI','Card'].map(p => (
                <button key={p} className={`pf-btn ${filterPay === p ? 'active' : ''}`} onClick={() => setFilterPay(p)}>{p}</button>
              ))}
            </div>
            <button className="inv-refresh" onClick={load}>🔄 Refresh</button>
          </div>

          <div className="inv-table-wrap">
            <table className="inv-table">
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'center' }}>Items</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Payment</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="inv-empty">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="inv-empty">No invoices found.</td></tr>
                ) : filtered.map(inv => (
                  <tr key={inv.id}>
                    <td><span className="inv-id">{inv.id}</span></td>
                    <td>
                      <div className="inv-cust">{inv.customer}</div>
                      {inv.phone && <div className="inv-phone">📞 {inv.phone}</div>}
                    </td>
                    <td style={{ fontSize: 12, color: '#888' }}>{inv.date || inv.time || '—'}</td>
                    <td style={{ textAlign: 'center', color: '#888', fontSize: 13 }}>{inv.items}</td>
                    <td style={{ textAlign: 'right' }}><span className="inv-amt">₹{Number(inv.amount).toLocaleString('en-IN')}</span></td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`pay-badge ${PAY_COLORS[inv.payment] || 'inv-pay-cash'}`}>{inv.payment}</span>
                    </td>
                    <td>
                      <div className="action-cell">
                        <button className="tbl-btn tbl-view" onClick={() => setSelectedInv(inv)}>View</button>
                        <button className="tbl-btn tbl-wa"   onClick={() => handleWhatsApp(inv)}>WA</button>
                        {user?.role === 'Admin' && (
                          <button className="tbl-btn tbl-del"  onClick={() => handleDelete(inv)}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Invoice Preview Modal ── */}
      {selectedInv && (
        <div className="inv-overlay" onClick={() => setSelectedInv(null)}>
          <div className="inv-sheet" onClick={e => e.stopPropagation()}>
            <div className="inv-modal-actions no-print">
              <button className="mact-btn mact-wa" onClick={() => handleWhatsApp(selectedInv)}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.121 1.533 5.849L.057 23.716a.5.5 0 00.612.612l5.867-1.476A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.943 0-3.763-.524-5.33-1.438l-.382-.228-3.483.877.893-3.483-.228-.382A9.952 9.952 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                WhatsApp
              </button>
              <button className="mact-btn mact-print" onClick={handlePrint}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <polyline points="6 9 6 2 18 2 18 9"/>
                  <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print
              </button>
              <button className="mact-btn mact-close" onClick={() => setSelectedInv(null)}>✕ Close</button>
            </div>
            {/* Exact same InvoiceView component used in Billing */}
            <InvoiceView inv={buildViewObj(selectedInv)} />
          </div>
        </div>
      )}
    </>
  );
}
