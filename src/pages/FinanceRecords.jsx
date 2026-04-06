import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useCurrency, formatCurrency } from '../App';

const FinanceRecords = () => {
    const [records, setRecords]           = useState([]);
    const [file, setFile]                 = useState(null);
    const [message, setMessage]           = useState('');
    const [msgType, setMsgType]           = useState('info');
    const [errorDetails, setErrorDetails] = useState([]);
    const [filterCategory, setFilterCat] = useState('');
    const [filterType, setFilterType]     = useState('');
    const [newRecord, setNewRecord]       = useState({ date: '', title: '', category: '', amount: '', type: 'expense' });
    const { currency } = useCurrency();
    const navigate = useNavigate();

    // ── Fetch records from API (with optional filters) ──────────
    const fetchRecords = async () => {
        try {
            const params = new URLSearchParams();
            if (filterCategory) params.append('category', filterCategory);
            if (filterType)     params.append('type', filterType);
            const res = await api.get(`finance/records/?${params}`);
            setRecords(res.data);
        } catch (err) {
            if (err.response?.status === 401) navigate('/login');
        }
    };

    useEffect(() => { fetchRecords(); }, [filterCategory, filterType]);

    // ── Upload CSV/XLSX file ─────────────────────────────────────────
    const handleUpload = async (e) => {
        e.preventDefault();
        setMessage('');
        setErrorDetails([]);
        if (!file) { setMessage('Please select a file first.'); setMsgType('error'); return; }

        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post('finance/records/upload_csv/', formData);
            setMessage(res.data.message);
            setMsgType('info');
            fetchRecords();
        } catch (err) {
            setMessage(err.response?.data?.error || err.response?.data?.detail || 'Upload failed. Check your file format.');
            setErrorDetails(err.response?.data?.details || []);
            setMsgType('error');
        }
    };

    // ── Manual Add Record ───────────────────────────────────────
    const handleAddRecord = async (e) => {
        e.preventDefault();
        try {
            await api.post('finance/records/', newRecord);
            setNewRecord({ date: '', title: '', category: '', amount: '', type: 'expense' });
            fetchRecords();
            setMessage('Record successfully added!');
            setMsgType('info');
            setErrorDetails([]);
        } catch (err) {
            setMessage('Failed to add record manually.');
            setMsgType('error');
        }
    };

    // ── Export CSV file ─────────────────────────────────────────
    const handleExport = async () => {
        try {
            const params = new URLSearchParams();
            if (filterCategory) params.append('category', filterCategory);
            if (filterType)     params.append('type', filterType);
            const res = await api.get(`finance/records/export_csv/?${params}`, { responseType: 'blob' });

            const url  = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href  = url;
            link.setAttribute('download', 'finance_records.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch {
            setMessage('Export failed. Please try again.'); setMsgType('error');
        }
    };

    // ── Quick totals from current filtered list ─────────────────
    const totalIncome  = records.filter(r => r.type === 'income') .reduce((s, r) => s + parseFloat(r.amount), 0);
    const totalExpense = records.filter(r => r.type === 'expense').reduce((s, r) => s + parseFloat(r.amount), 0);
    const fmt = n => formatCurrency(n, currency);

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Data Management</h1>
                <p className="page-subtitle">Manage, upload, and filter your finance records</p>
            </div>

            {/* Summary Strip */}
            <div className="stat-cards" style={{ gridTemplateColumns: 'repeat(2,1fr)', marginBottom: 20 }}>
                <div className="stat-card">
                    <div className="stat-top">
                        <div className="stat-label">Filtered Income</div>
                        <div className="stat-icon green"><i className="bi bi-arrow-up-circle-fill"></i></div>
                    </div>
                    <div className="stat-value">{fmt(totalIncome)}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-top">
                        <div className="stat-label">Filtered Expenses</div>
                        <div className="stat-icon red"><i className="bi bi-arrow-down-circle-fill"></i></div>
                    </div>
                    <div className="stat-value">{fmt(totalExpense)}</div>
                </div>
            </div>

            {message && (
                <div className={`alert ${msgType === 'error' ? 'alert-error' : 'alert-info'}`} style={{ marginBottom: 16 }}>
                    {message}
                    {errorDetails.length > 0 && (
                        <ul style={{ marginTop: '8px', marginBottom: 0, paddingLeft: '20px', fontSize: '0.85em' }}>
                            {errorDetails.map((det, i) => <li key={i}>{det}</li>)}
                        </ul>
                    )}
                </div>
            )}

            {/* Actions Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: 16, marginBottom: 20 }}>
                
                {/* Upload zone */}
                <div className="upload-zone" style={{ display: 'flex', flexDirection: 'column', padding: '20px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
                    <div className="upload-icon" style={{ fontSize: '24px', color: 'var(--primary)', marginBottom: '8px'}}><i className="bi bi-cloud-upload"></i></div>
                    <p className="upload-title" style={{ fontWeight: 600, marginBottom: '4px'}}>Bulk Import</p>
                    <p className="upload-hint" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px'}}>Choose CSV or Excel sheet.</p>

                    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
                        <input
                            type="file"
                            accept=".csv, .xlsx, .xls"
                            className="file-input"
                            onChange={e => setFile(e.target.files[0])}
                            style={{ fontSize: '13px', padding: '6px' }}
                        />
                        <button type="submit" className="btn btn-primary btn-full">
                            <i className="bi bi-upload"></i> Upload Max
                        </button>
                    </form>
                </div>

                {/* Manual Add Zone */}
                <div className="filter-bar" style={{ alignContent: 'flex-start', padding: '20px' }}>
                    <p style={{ fontWeight: 600, marginBottom: '10px' }}>Manual Single Entry</p>
                    <form onSubmit={handleAddRecord} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input className="input" type="date" required value={newRecord.date} onChange={e => setNewRecord({...newRecord, date: e.target.value})} />
                        <input className="input" type="number" step="0.01" min="0.01" required placeholder="Amount ($)" value={newRecord.amount} onChange={e => setNewRecord({...newRecord, amount: e.target.value})} />
                        <input className="input" type="text" required placeholder="Title" value={newRecord.title} onChange={e => setNewRecord({...newRecord, title: e.target.value})} />
                        <input className="input" type="text" required placeholder="Category" value={newRecord.category} onChange={e => setNewRecord({...newRecord, category: e.target.value})} />
                        <select className="select" required value={newRecord.type} onChange={e => setNewRecord({...newRecord, type: e.target.value})}>
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                        </select>
                        <button type="submit" className="btn btn-primary"><i className="bi bi-plus"></i> Add Line</button>
                    </form>
                </div>

                {/* Filter bar */}
                <div className="filter-bar" style={{ alignContent: 'flex-start', padding: '20px' }}>
                    <p style={{ fontWeight: 600, marginBottom: '10px' }}>Refine View</p>
                    <div className="filter-group">
                        <label className="filter-label">Category</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="e.g. Salary"
                            value={filterCategory}
                            onChange={e => setFilterCat(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label className="filter-label">Type</label>
                        <select
                            className="select"
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                        <button className="btn btn-outline" onClick={() => { setFilterCat(''); setFilterType(''); }}>
                            <i className="bi bi-x"></i> Clear
                        </button>
                        <button className="btn btn-outline" onClick={handleExport}>
                            <i className="bi bi-download"></i> Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">
                        Transactions
                        <span style={{
                            marginLeft: 8, padding: '2px 10px',
                            background: '#4f46e5', color: '#fff',
                            borderRadius: 999, fontSize: 12, fontWeight: 700
                        }}>{records.length}</span>
                    </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan="5">
                                        <div className="empty-state">
                                            <div className="empty-icon"><i className="bi bi-inbox"></i></div>
                                            <p className="empty-text">No records found. Upload a CSV or adjust filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : records.map(r => (
                                <tr key={r.id}>
                                    <td style={{ color: '#64748b', fontSize: 13 }}>{r.date}</td>
                                    <td style={{ fontWeight: 600 }}>{r.title}</td>
                                    <td><span className="badge badge-cat">{r.category}</span></td>
                                    <td>
                                        <span className={r.type === 'income' ? 'amount-income' : 'amount-expense'}>
                                            {r.type === 'income' ? '+' : '−'}{formatCurrency(parseFloat(r.amount), currency)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${r.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                                            {r.type}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default FinanceRecords;
