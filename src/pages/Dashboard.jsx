import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';

// ── Custom Tooltip ────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 13, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
            <p style={{ fontWeight: 700, marginBottom: 6, color: '#0f172a' }}>{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.color, margin: '2px 0' }}>
                    {p.name}: <strong>${Number(p.value).toLocaleString()}</strong>
                </p>
            ))}
        </div>
    );
};

// ── Stat Card ────────────────────────────────────────────────
const StatCard = ({ label, value, icon, variant }) => (
    <div className="stat-card">
        <div className="stat-top">
            <div>
                <div className="stat-label">{label}</div>
            </div>
            <div className={`stat-icon ${variant}`}>
                <i className={`bi ${icon}`}></i>
            </div>
        </div>
        <div className="stat-value">{value}</div>
    </div>
);

// ── Dashboard ────────────────────────────────────────────────
const Dashboard = () => {
    const [metrics, setMetrics] = useState([]);
    const [summary, setSummary] = useState({ total_income: 0, total_expenses: 0, balance: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const [metricsRes, summaryRes] = await Promise.all([
                    api.get('dashboard/metrics/metrics/'),
                    api.get('dashboard/metrics/summary/'),
                ]);
                setMetrics(metricsRes.data);
                setSummary(summaryRes.data);
            } catch (err) {
                if (err.response?.status === 401) navigate('/login');
            }
        };
        load();
    }, [navigate]);

    const fmt = n => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Your financial overview at a glance</p>
            </div>

            {/* Stat Cards */}
            <div className="stat-cards">
                <StatCard label="Total Income"   value={fmt(summary.total_income)}   icon="bi-arrow-up-circle-fill"   variant="green" />
                <StatCard label="Total Expenses" value={fmt(summary.total_expenses)} icon="bi-arrow-down-circle-fill" variant="red" />
                <StatCard label="Net Balance"    value={fmt(summary.balance)}         icon="bi-wallet2"                variant="indigo" />
            </div>

            {/* Bar Chart */}
            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-header">
                    <span className="card-title">Revenue vs Expenses</span>
                    <span className="card-subtitle">Monthly comparison</span>
                </div>
                <div className="card-body">
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={metrics} barSize={20} barGap={3}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 13 }} />
                            <Bar dataKey="revenue"  name="Revenue"  fill="#4f46e5" radius={[5, 5, 0, 0]} />
                            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[5, 5, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Area Chart */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">Profit Trend</span>
                    <span className="card-subtitle">Month-over-month</span>
                </div>
                <div className="card-body">
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={metrics}>
                            <defs>
                                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%"   stopColor="#10b981" stopOpacity={0.18} />
                                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Tooltip content={<ChartTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="profit"
                                name="Profit"
                                stroke="#10b981"
                                strokeWidth={2.5}
                                fill="url(#profitGrad)"
                                dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
