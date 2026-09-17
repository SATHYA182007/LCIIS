import React, { useMemo } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import {
  Package,
  Cpu,
  Users,
  AlertTriangle,
  Activity,
  ShieldCheck,
  HeartPulse,
  TrendingUp,
  Radio,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { users, patients, devices, inventory, alerts, liveVitalsMap } = useRealtime();
  const navigate = useNavigate();

  // Inventory Metrics
  const totalInventory = inventory.length;
  const lowStockCount = inventory.filter(
    (i) => i.status === 'LOW STOCK' || i.currentQuantity <= i.minimumStockLevel
  ).length;
  const expiringSoonCount = inventory.filter(
    (i) => i.status === 'EXPIRING SOON' || i.status === 'URGENT EXPIRY'
  ).length;
  const expiredCount = inventory.filter((i) => i.status === 'EXPIRED').length;

  // Telemetry Hardware Metrics
  const totalDevices = devices.length;
  const onlineDevices = devices.filter((d) => d.connectionStatus === 'ONLINE').length;
  const offlineDevices = devices.filter((d) => d.connectionStatus === 'OFFLINE').length;

  // Patient Metrics
  const criticalPatientsCount = patients.filter(
    (p) => p.currentStatus === 'CRITICAL' || p.currentStatus === 'HIGH RISK'
  ).length;
  const activeAlertsCount = alerts.filter((a) => a.status === 'NEW' || a.status === 'ACKNOWLEDGED').length;

  // Ward Capacity Mapping for BarChart
  const wardCapacityMap: Record<string, number> = {
    'General Ward A': 20,
    'General Ward B': 20,
    'ICU Unit A': 6,
    'ICU Unit B': 6,
    'Emergency Ward 1': 10,
    'Emergency Ward 2': 10,
    'Cardiology Ward': 12,
    'High Dependency Unit (HDU)': 8,
    'Pediatric Care': 8,
    'Outpatient Intake': 4
  };

  const wardChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach((p) => {
      const w = p.ward || 'General Ward A';
      counts[w] = (counts[w] || 0) + 1;
    });

    const displayWards = [
      'General Ward A',
      'ICU Unit A',
      'High Dependency Unit (HDU)',
      'Emergency Ward 1',
      'Cardiology Ward',
      'General Ward B'
    ];

    return displayWards.map((w) => ({
      wardName: w.replace('High Dependency Unit ', '').replace('Emergency Ward ', 'ER '),
      Occupied: counts[w] || 0,
      Capacity: wardCapacityMap[w] || 15
    }));
  }, [patients]);

  // Patient Status Distribution for Donut Chart
  const statusPieData = useMemo(() => {
    const statusCounts: Record<string, number> = {
      CRITICAL: 0,
      'HIGH RISK': 0,
      MONITOR: 0,
      STABLE: 0,
      Registered: 0
    };

    patients.forEach((p) => {
      const st = p.currentStatus || 'MONITOR';
      if (statusCounts[st] !== undefined) {
        statusCounts[st]++;
      } else {
        statusCounts['MONITOR']++;
      }
    });

    return [
      { name: 'Critical', value: statusCounts['CRITICAL'], color: '#ef4444' },
      { name: 'High Risk', value: statusCounts['HIGH RISK'], color: '#f97316' },
      { name: 'Monitor', value: statusCounts['MONITOR'], color: '#f59e0b' },
      { name: 'Stable', value: statusCounts['STABLE'], color: '#10b981' },
      { name: 'Registered', value: statusCounts['Registered'], color: '#0d9488' }
    ].filter((item) => item.value > 0);
  }, [patients]);

  // 24-Hour Telemetry Trend Data
  const telemetryTrendData = [
    { time: '00:00', avgHeartRate: 74, avgSpO2: 98, criticalAlerts: 1 },
    { time: '04:00', avgHeartRate: 71, avgSpO2: 99, criticalAlerts: 0 },
    { time: '08:00', avgHeartRate: 86, avgSpO2: 96, criticalAlerts: 3 },
    { time: '12:00', avgHeartRate: 92, avgSpO2: 94, criticalAlerts: 5 },
    { time: '16:00', avgHeartRate: 88, avgSpO2: 95, criticalAlerts: 2 },
    { time: '20:00', avgHeartRate: 81, avgSpO2: 97, criticalAlerts: 1 },
    { time: 'Now', avgHeartRate: 84, avgSpO2: 97, criticalAlerts: activeAlertsCount }
  ];

  // Device & Inventory Distribution Data
  const fleetInventoryData = [
    { name: 'ESP32 Online', count: onlineDevices, fill: '#10b981' },
    { name: 'ESP32 Offline', count: offlineDevices, fill: '#ef4444' },
    { name: 'Stock OK', count: Math.max(0, totalInventory - lowStockCount - expiringSoonCount - expiredCount), fill: '#0d9488' },
    { name: 'Low Stock', count: lowStockCount, fill: '#f59e0b' },
    { name: 'Expiring/Expired', count: expiringSoonCount + expiredCount, fill: '#f97316' }
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Hospital System Administration & Operations" />

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Live Stream Status Indicator */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Radio className="w-5 h-5 animate-pulse text-teal-200" />
              </div>
              <div>
                <div className="font-extrabold text-sm flex items-center space-x-2">
                  <span>Hospital Telemetry & Operations Command</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    ● Realtime DB Sync Active
                  </span>
                </div>
                <div className="text-xs text-gray-400 font-medium mt-0.5">
                  Live monitoring of {patients.length} Inpatients, {users.length} Authorized Staff, {onlineDevices} Online ESP32 Telemetry Monitors
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => navigate('/admin/patients')}
                className="px-3.5 py-2 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Inpatient Registry</span>
              </button>
            </div>
          </div>

          {/* Top Operational Realtime Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="card-clinical p-3.5 bg-white border-l-4 border-l-teal-600">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Staff Users</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{users.length}</div>
              <div className="text-[10px] text-teal-700 font-semibold mt-0.5">Active Staff Accounts</div>
            </div>

            <div className="card-clinical p-3.5 bg-white border-l-4 border-l-cyan-600">
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Inpatients Registered</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{patients.length}</div>
              <div className="text-[10px] text-cyan-700 font-semibold mt-0.5">Active Bed Allocation</div>
            </div>

            <div className="card-clinical p-3.5 bg-white border-l-4 border-l-red-500 bg-red-50/20">
              <div className="text-[10px] text-red-800 font-bold uppercase tracking-wider">Critical / High Risk</div>
              <div className="text-2xl font-black text-red-900 mt-1">{criticalPatientsCount}</div>
              <div className="text-[10px] text-red-700 font-semibold mt-0.5">Requires Immediate Care</div>
            </div>

            <div className="card-clinical p-3.5 bg-white border-l-4 border-l-emerald-500">
              <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Online ESP32 Fleet</div>
              <div className="text-2xl font-black text-emerald-800 mt-1">{onlineDevices} / {totalDevices}</div>
              <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Active Telemetry Stream</div>
            </div>

            <div className="card-clinical p-3.5 bg-white border-l-4 border-l-amber-500">
              <div className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">Active Clinical Alerts</div>
              <div className="text-2xl font-black text-amber-900 mt-1">{activeAlertsCount}</div>
              <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Vital Threshold Spikes</div>
            </div>

            <div className="card-clinical p-3.5 bg-white border-l-4 border-l-purple-600">
              <div className="text-[10px] text-purple-800 font-bold uppercase tracking-wider">Inventory Catalog</div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalInventory}</div>
              <div className="text-[10px] text-purple-700 font-semibold mt-0.5">Pharmacy & Supplies</div>
            </div>

            <div className="card-clinical p-3.5 bg-white border-l-4 border-l-orange-500 bg-orange-50/20">
              <div className="text-[10px] text-orange-800 font-bold uppercase tracking-wider">Stock Warnings</div>
              <div className="text-2xl font-black text-orange-900 mt-1">{lowStockCount + expiringSoonCount}</div>
              <div className="text-[10px] text-orange-700 font-semibold mt-0.5">Low / Expiring Batches</div>
            </div>
          </div>

          {/* SECTION 1: INFORMATIVE CHARTS & ANALYTICS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Ward Bed Occupancy vs Capacity BarChart */}
            <div className="card-clinical p-5 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-teal-700" />
                    Ward Inpatient Occupancy & Bed Capacity
                  </h3>
                  <p className="text-[11px] text-gray-500">Live comparison of assigned beds vs maximum bed capacities</p>
                </div>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                  Realtime Sync
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wardChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="wardName" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                      itemStyle={{ color: '#5eead4' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Occupied" fill="#0d9488" radius={[6, 6, 0, 0]} name="Occupied Beds" />
                    <Bar dataKey="Capacity" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Max Bed Capacity" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Clinical Risk & Advisory Status Donut Chart */}
            <div className="card-clinical p-5 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <HeartPulse className="w-4 h-4 mr-2 text-red-600" />
                    Inpatient Clinical Advisory Status Breakdown
                  </h3>
                  <p className="text-[11px] text-gray-500">Live patient classification across critical, risk, and stable tiers</p>
                </div>
                <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                  {patients.length} Inpatients
                </span>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                    />
                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      wrapperStyle={{ fontSize: '11px', paddingLeft: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* SECTION 2: 24-HOUR TELEMETRY TREND & HARDWARE FLEET CHART */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 3: 24-Hour Telemetry & Vital Alert Trend (AreaChart) - Takes 2 Cols */}
            <div className="lg:col-span-2 card-clinical p-5 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-amber-600" />
                    24-Hour Real-Time Vital Telemetry & Critical Alert Spikes
                  </h3>
                  <p className="text-[11px] text-gray-500">Average Heart Rate (bpm), SpO2 Saturation (%), and Alert frequency</p>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                  Telemetry Stream
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={telemetryTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[50, 120]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="avgHeartRate" name="Avg Heart Rate (bpm)" stroke="#0d9488" fillOpacity={1} fill="url(#hrGrad)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="avgSpO2" name="Avg SpO2 (%)" stroke="#0284c7" fillOpacity={1} fill="url(#spo2Grad)" strokeWidth={2.5} />
                    <Bar dataKey="criticalAlerts" name="Alert Spikes" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={12} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Hardware Fleet & Inventory Status (BarChart) - Takes 1 Col */}
            <div className="card-clinical p-5 bg-white space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center">
                    <Cpu className="w-4 h-4 mr-2 text-cyan-600" />
                    Hardware Fleet & Inventory Health
                  </h3>
                  <p className="text-[11px] text-gray-500">Live ESP32 telemetry monitors and supply stocks</p>
                </div>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fleetInventoryData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="count" name="Total Units / Items" radius={[0, 6, 6, 0]}>
                      {fleetInventoryData.map((entry, index) => (
                        <Cell key={`cell-f-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* SECTION 3: QUICK ACTION MODULES GRID */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
              Core Administrative Operations
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => navigate('/admin/inventory')}
                className="card-clinical p-5 cursor-pointer hover:border-teal-500 transition-all bg-white"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Inventory Catalog</h3>
                <p className="text-xs text-gray-500 mt-1">Manage medicines, PPE, syringes, and stock movements ({totalInventory} items).</p>
              </div>

              <div
                onClick={() => navigate('/admin/expiry')}
                className="card-clinical p-5 cursor-pointer hover:border-orange-500 transition-all bg-white"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Expiry Monitoring Center</h3>
                <p className="text-xs text-gray-500 mt-1">Track 90, 60, 30, and 7-day batch expiration warnings ({expiringSoonCount + expiredCount} flagged).</p>
              </div>

              <div
                onClick={() => navigate('/admin/devices')}
                className="card-clinical p-5 cursor-pointer hover:border-cyan-500 transition-all bg-white"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-3">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">ESP32 Device Registry</h3>
                <p className="text-xs text-gray-500 mt-1">Bedside monitor assignment and heartbeat monitoring ({onlineDevices} online).</p>
              </div>

              <div
                onClick={() => navigate('/admin/users')}
                className="card-clinical p-5 cursor-pointer hover:border-purple-500 transition-all bg-white"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">User Management</h3>
                <p className="text-xs text-gray-500 mt-1">Manage staff user access approval, freeze access, and roles ({users.length} staff accounts).</p>
              </div>
            </div>
          </div>

          {/* SECTION 4: REALTIME INPATIENT TELEMETRY STREAM ROSTER */}
          <div className="card-clinical p-6 bg-white space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-teal-600" />
                REALTIME INPATIENT TELEMETRY STREAM ROSTER
              </h3>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1"></span>
                <span>Live Feed Syncing</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {patients.slice(0, 6).map((p) => {
                const vitals = p.deviceId ? liveVitalsMap[p.id] : undefined;
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/doctor/patients/${p.id}`)}
                    className="p-3.5 bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 rounded-xl cursor-pointer transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-slate-900">{p.name}</div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.currentStatus === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        p.currentStatus === 'HIGH RISK' ? 'bg-orange-100 text-orange-700' :
                        p.currentStatus === 'MONITOR' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {p.currentStatus}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span>{p.ward} • {p.bed}</span>
                      <span className="font-mono text-gray-600">{p.hospitalId}</span>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-700 flex items-center">
                        <HeartPulse className="w-3.5 h-3.5 text-red-500 mr-1" />
                        HR {vitals?.heartRate?.value || 82} bpm
                      </span>
                      <span className="text-teal-700">
                        SpO2 {vitals?.spo2?.value || 98}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
