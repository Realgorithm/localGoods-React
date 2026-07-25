import React, { useState } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, icon, gradient }) => (
    <motion.div className="col-md-6 mb-4">
        <div className="card h-100">
            <div className="card-body p-4 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title text-muted mb-1">{title}</h5>
                    <span className={`fs-2 ${gradient} text-transparent bg-clip-text`}>
                        <i className={`bi ${icon}`}></i>
                    </span>
                </div>
                <p className="card-text fs-2 fw-bold mt-auto">{value}</p>
            </div>
        </div>
    </motion.div>
);

const ReportsPage = () => {
    const [reportData, setReportData] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();

    // Default to the last 7 days
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);

    const [startDate, setStartDate] = useState(lastWeek.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    const generateReport = async () => {
        if (!startDate || !endDate) {
            toast.warn('Please select both a start and end date.');
            return;
        }
        setLoading(true);
        setReportData(null);
        setChartData([]);
        try {
            const [reportRes, chartRes] = await Promise.all([
                api.get('/reports/sales', {
                    params: { startDate, endDate }
                }),
                api.get('/reports/sales-over-time', {
                    params: { startDate, endDate }
                })
            ]);
            setReportData(reportRes.data);
            setChartData(chartRes.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate report.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCsv = () => {
        if (!reportData || !reportData.sales || reportData.sales.length === 0) {
            toast.warn("No data to export.");
            return;
        }

        const csvData = reportData.sales.map(sale => ({
            "Reference #": sale.ref_no,
            "Customer": sale.customer_name || 'N/A',
            "Total Amount": parseFloat(sale.total_amount).toFixed(2),
            "Date": new Date(sale.date_created).toLocaleString()
        }));

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `sales-report-${startDate}-to-${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h1 className="mb-4">Sales & Profit Report</h1>

            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-4">
                            <label htmlFor="startDate" className="form-label">Start Date</label>
                            <input type="date" id="startDate" className="form-control" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className="col-md-4">
                            <label htmlFor="endDate" className="form-label">End Date</label>
                            <input type="date" id="endDate" className="form-control" value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <div className="col-md-4">
                            <button className="btn btn-primary w-100" onClick={generateReport} disabled={loading}>
                                {loading ? 'Generating...' : 'Generate Report'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {loading && <div className="text-center my-5">Generating report...</div>}

            {reportData && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="row">
                        <StatCard title="Total Sales" value={`₹${parseFloat(reportData.summary.totalSales).toFixed(2)}`} icon="bi-cash-coin" gradient="bg-gradient-green" />
                        <StatCard title="Total Profit" value={`₹${parseFloat(reportData.summary.totalProfit).toFixed(2)}`} icon="bi-graph-up-arrow" gradient="bg-gradient-cyan" />
                    </div>

                    {chartData.length > 0 && (
                        <div className="card mt-4">
                            <div className="card-header"><h5 className="mb-0">Sales & Profit Over Time</h5></div>
                            <div className="card-body" style={{ height: '400px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} />
                                        <XAxis dataKey="date" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} /><YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} tickFormatter={(value) => `₹${value}`} />
                                        <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? 'rgba(30, 41, 59, 0.9)' : '#ffffff', borderColor: 'var(--border-color)', color: 'var(--text-color)' }} />
                                        <Legend />
                                        <Line type="monotone" dataKey="totalSales" name="Sales" stroke="#7c3aed" activeDot={{ r: 8 }} />
                                        <Line type="monotone" dataKey="totalProfit" name="Profit" stroke="#db2777" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    <div className="card mt-4">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Sales Details ({reportData.sales.length} transactions)</h5>
                            <button className="btn btn-sm btn-outline-secondary" onClick={handleExportCsv}><i className="bi bi-download me-2"></i> Export to CSV</button>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-striped table-hover">
                                    <thead><tr><th>Ref #</th><th>Customer</th><th>Total Amount</th><th>Date</th></tr></thead>
                                    <tbody>
                                        {reportData.sales.length > 0 ? (
                                            reportData.sales.map(sale => (
                                                <tr key={sale.id}>
                                                    <td>{sale.ref_no}</td>
                                                    <td>{sale.customer_name || 'N/A'}</td><td>₹{parseFloat(sale.total_amount).toFixed(2)}</td>
                                                    <td>{new Date(sale.date_created).toLocaleString()}</td>
                                                </tr>
                                            ))
                                        ) : (<tr><td colSpan="4" className="text-center">No sales found in this date range.</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ReportsPage;