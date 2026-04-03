import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const FinanceRecords = () => {
    const [records, setRecords]           = useState([]);
    const [file, setFile]                 = useState(null);
    const [message, setMessage]           = useState('');
    const [msgType, setMsgType]           = useState('info');
    const [filterCategory, setFilterCat] = useState('');
    const [filterType, setFilterType]     = useState('');
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

    // ── Upload CSV file ─────────────────────────────────────────
    const handleUpload = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!file) { setMessage('Please select a CSV file first.'); setMsgType('error'); return; }

        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await api.post('finance/records/upload_csv/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage(res.data.message);
            setMsgType('info');
            fetchRecords();
        } catch (err) {
            setMessage(err.response?.data?.error || 'Upload failed. Check your file format.');
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
    const fmt = n => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

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

            {/* Upload + Filter Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {/* Upload zone */}
                <div className="upload-zone">
                    <div className="upload-icon"><i className="bi bi-cloud-upload"></i></div>
                    <p className="upload-title">Bulk Import via CSV</p>
                    <p className="upload-hint">
                        Required columns: <code>date, title, category, amount, type</code>
                    </p>

                    {message && (
                        <div className={`alert ${msgType === 'error' ? 'alert-error' : 'alert-info'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <input
                            type="file"
                            accept=".csv"
                            className="file-input"
                            onChange={e => setFile(e.target.files[0])}
                        />
                        <button type="submit" className="btn btn-primary btn-full">
                            <i className="bi bi-upload"></i> Upload Records
                        </button>
                    </form>
                </div>

                {/* Filter bar */}
                <div className="filter-bar" style={{ alignContent: 'flex-start' }}>
                    <div className="filter-group">
                        <label className="filter-label">Category</label>
                        <input
                            className="input"
                            type="text"
                            placeholder="e.g. Salary, Rent"
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
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-outline"
                            onClick={() => { setFilterCat(''); setFilterType(''); }}
                        >
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
                                            {r.type === 'income' ? '+' : '−'}${parseFloat(r.amount).toLocaleString()}
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
