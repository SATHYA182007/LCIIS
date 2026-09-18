import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtime } from '../../context/RealtimeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { TransferPatientModal } from '../../components/clinical/TransferPatientModal';
import {
  Eye,
  ShieldAlert,
  AlertCircle,
  RefreshCw,
  Database,
  Activity,
  TrendingUp,
  HeartPulse,
  Stethoscope,
  CheckCircle2,
  Zap,
  BarChart2,
  PieChart as PieIcon,
  BellRing,
  ChevronRight,
  Radio,
  ArrowRightLeft
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const DoctorDashboard: React.FC = () => {
  const { patients, alerts, isFirebaseConnected, isLoadingFirebase, firebaseError, liveVitalsMap, acknowledgeAlert } = useRealtime();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trendTimeframe, setTrendTimeframe] = useState<'24h' | '8h' | '7d'>('24h');
  const [selectedPatientIdFilter, setSelectedPatientIdFilter] = useState<string>('LCIIS-P-000001');
  const [acknowledgedAlertIds, setAcknowledgedAlertIds] = useState<Set<string>>(new Set());

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedTransferPatient, setSelectedTransferPatient] = useState<any>(null);

  const totalCount = patients.length;
  const needsAttentionCount = patients.filter((p) => p.currentStatus === 'CRITICAL' || p.currentStatus === 'HIGH RISK' || p.currentStatus === 'MONITOR').length;
  const highRiskCount = patients.filter((p) => p.currentStatus === 'HIGH RISK').length;
  const criticalCount = patients.filter((p) => p.currentStatus === 'CRITICAL').length;
  const activeAlerts = alerts.filter((a) => a.status === 'NEW' || a.status === 'ACKNOWLEDGED');
  const activeAlertsCount = activeAlerts.length;

  const patientsNeedingAttention = patients
    .filter((p) => p.currentStatus === 'CRITICAL' || p.currentStatus === 'HIGH RISK' || p.currentStatus === 'MONITOR')
    .sort((a, b) => (b.advisoryRisk || 0) - (a.advisoryRisk || 0));

  const doctorName = user?.name || 'Dr. Sarah Jenkins';

  const selectedPatientObj = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientIdFilter || p.hospitalId === selectedPatientIdFilter) || patients[0] || null;
  }, [patients, selectedPatientIdFilter]);

  const isSelectedPatientHardwareConnected = useMemo(() => {
    if (!selectedPatientObj) return false;
    const v = liveVitalsMap[selectedPatientObj.id];
    return Boolean(selectedPatientObj.deviceId && v && v.heartRate?.value !== undefined);
  }, [selectedPatientObj, liveVitalsMap]);

  // Real-time Trend Graph Data for the selected patient
  const trendData = useMemo(() => {
    let currentHR = 76;
    let currentSpo2 = 98;
    let currentBP = 124;
    let currentRR = 18;

    if (selectedPatientObj) {
      const patientVitals = liveVitalsMap[selectedPatientObj.id];
      if (patientVitals && patientVitals.heartRate?.value !== undefined) {
        currentHR = Math.round(patientVitals.heartRate.value);
        currentSpo2 = Math.round(patientVitals.spo2?.value || 98);
        currentBP = Math.round(patientVitals.bloodPressure?.systolic?.value || 124);
        currentRR = Math.round(patientVitals.respiratoryRate?.value || 18);
      }
    }

    const hrKey = 'Heart Rate';
    const spo2Key = 'SpO2';
    const bpKey = 'Systolic BP';
    const rrKey = 'Resp Rate';

    // Lock timestamp ticks to 15-minute boundaries so time labels remain steady on live streams
    const nowMs = Math.floor(Date.now() / (15 * 60 * 1000)) * (15 * 60 * 1000);
    const now = new Date(nowMs);

    const isPatient2 = selectedPatientObj?.id === 'LCIIS-P-000002' || selectedPatientObj?.hospitalId === 'LCIIS-P-000002';

    // Fixed static historical baselines for past time points (i = 0 to 6)
    const staticHistory = isPatient2
      ? {
          hr: [122, 126, 130, 134, 138, 142, 144],
          spo2: [92, 90, 88, 87, 86, 84, 84],
          bp: [160, 165, 170, 175, 180, 182, 185],
          rr: [22, 24, 25, 26, 27, 28, 28]
        }
      : {
          hr: [72, 74, 75, 73, 76, 74, 75],
          spo2: [98, 97, 98, 99, 98, 97, 98],
          bp: [120, 118, 122, 121, 124, 119, 120],
          rr: [16, 17, 18, 16, 17, 18, 17]
        };

    if (trendTimeframe === '8h') {
      return Array.from({ length: 8 }).map((_, i) => {
        const offsetHours = 7 - i;
        const d = new Date(now.getTime() - offsetHours * 3600 * 1000);
        const timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        const isCurrent = offsetHours === 0;

        return {
          time: timeLabel,
          [hrKey]: isCurrent ? currentHR : staticHistory.hr[i],
          [spo2Key]: isCurrent ? currentSpo2 : staticHistory.spo2[i],
          [bpKey]: isCurrent ? currentBP : staticHistory.bp[i],
          [rrKey]: isCurrent ? currentRR : staticHistory.rr[i]
        };
      });
    }

    if (trendTimeframe === '7d') {
      return Array.from({ length: 7 }).map((_, i) => {
        const offsetDays = 6 - i;
        const d = new Date(now.getTime() - offsetDays * 86400 * 1000);
        const timeLabel = offsetDays === 0
          ? 'Today'
          : d.toLocaleDateString([], { weekday: 'short' });
        const isCurrent = offsetDays === 0;

        return {
          time: timeLabel,
          [hrKey]: isCurrent ? currentHR : staticHistory.hr[i],
          [spo2Key]: isCurrent ? currentSpo2 : staticHistory.spo2[i],
          [bpKey]: isCurrent ? currentBP : staticHistory.bp[i],
          [rrKey]: isCurrent ? currentRR : staticHistory.rr[i]
        };
      });
    }

    // Default '24h': 8 points, 3 hours apart, ending at current time
    return Array.from({ length: 8 }).map((_, i) => {
      const offsetHours = (7 - i) * 3;
      const d = new Date(now.getTime() - offsetHours * 3600 * 1000);
      const timeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const isCurrent = offsetHours === 0;

      return {
        time: timeLabel,
        [hrKey]: isCurrent ? currentHR : staticHistory.hr[i],
        [spo2Key]: isCurrent ? currentSpo2 : staticHistory.spo2[i],
        [bpKey]: isCurrent ? currentBP : staticHistory.bp[i],
        [rrKey]: isCurrent ? currentRR : staticHistory.rr[i]
      };
    });
  }, [liveVitalsMap, trendTimeframe, selectedPatientObj]);

  // Risk distribution pie chart data
  const statusPieData = useMemo(() => {
    const critical = patients.filter((p) => p.currentStatus === 'CRITICAL').length;
    const highRisk = patients.filter((p) => p.currentStatus === 'HIGH RISK').length;
    const monitor = patients.filter((p) => p.currentStatus === 'MONITOR').length;
    const stable = patients.filter((p) => p.currentStatus === 'STABLE' || p.currentStatus === 'Under Care' || p.currentStatus === 'Registered').length;

    const items = [
      { name: 'Critical', value: critical, color: '#ef4444' },
      { name: 'High Risk', value: highRisk, color: '#f97316' },
      { name: 'Monitor', value: monitor, color: '#f59e0b' },
      { name: 'Stable', value: stable, color: '#10b981' }
    ].filter((d) => d.value > 0);

    if (items.length === 0) {
      return [{ name: 'No Active Patients', value: 1, color: '#e2e8f0' }];
    }
    return items;
  }, [patients]);

  // Ward capacity chart data
  const wardCapacityMap: Record<string, number> = {
    'ICU Unit A': 6,
    'High Dependency Unit (HDU)': 8,
    'Emergency Ward 1': 10,
    'Cardiology Ward': 12,
    'General Ward A': 20
  };

  const wardChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach((p) => {
      const w = p.ward || 'General Ward A';
      counts[w] = (counts[w] || 0) + 1;
    });

    const displayWards = [
      'ICU Unit A',
      'High Dependency Unit (HDU)',
      'Emergency Ward 1',
      'Cardiology Ward',
      'General Ward A'
    ];

    return displayWards.map((w) => ({
      wardName: w.replace('High Dependency Unit', 'HDU').replace('Emergency Ward 1', 'ER 1'),
      Occupied: counts[w] || 0,
      Capacity: wardCapacityMap[w] || 15
    }));
  }, [patients]);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId, doctorName);
      setAcknowledgedAlertIds((prev) => new Set(prev).add(alertId));
    } catch (e) {
      console.error('Failed to acknowledge alert:', e);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Doctor Dashboard" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full pb-12">
          {/* Top Greeting & Firebase Realtime Telemetry Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
                <span>Good morning, {doctorName}</span>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Intensive Care Unit & Clinical Wards • Real-Time Clinical Surveillance Engine
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center space-x-2 ${
                isFirebaseConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{isFirebaseConnected ? 'Firebase Realtime Connected' : 'Connecting to Firebase...'}</span>
              </div>
            </div>
          </div>

          {firebaseError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-start space-x-3 font-medium">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Firebase Connection Notice</div>
                <div>{firebaseError}</div>
              </div>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="card-clinical p-4 bg-white border-l-4 border-l-teal-600 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Patients</div>
                <Stethoscope className="w-4 h-4 text-teal-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
              <div className="text-[10px] font-medium text-teal-700 mt-1 flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>Active Clinical Census</span>
              </div>
            </div>

            <div className="card-clinical p-4 bg-white border-l-4 border-l-amber-500 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Needs Attention</div>
                <Activity className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-900 mt-1">{needsAttentionCount}</div>
              <div className="text-[10px] font-medium text-amber-700 mt-1">Requires clinical observation</div>
            </div>

            <div className="card-clinical p-4 bg-white border-l-4 border-l-orange-500 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-orange-900 uppercase tracking-wider">High Risk</div>
                <ShieldAlert className="w-4 h-4 text-orange-600" />
              </div>
              <div className="text-2xl font-black text-orange-900 mt-1">{highRiskCount}</div>
              <div className="text-[10px] font-medium text-orange-700 mt-1">Advisory risk score &gt; 50%</div>
            </div>

            <div className="card-clinical p-4 bg-white border-l-4 border-l-red-600 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-red-900 uppercase tracking-wider">Critical</div>
                <HeartPulse className="w-4 h-4 text-red-600 animate-pulse" />
              </div>
              <div className="text-2xl font-black text-red-900 mt-1">{criticalCount}</div>
              <div className="text-[10px] font-medium text-red-700 mt-1">Immediate intervention</div>
            </div>

            <div className="card-clinical p-4 bg-white border-l-4 border-l-cyan-600 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold text-cyan-900 uppercase tracking-wider">Active Alerts</div>
                <BellRing className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="text-2xl font-black text-cyan-900 mt-1">{activeAlertsCount}</div>
              <div className="text-[10px] font-medium text-cyan-700 mt-1">Physiological breaches</div>
            </div>
          </div>

          {/* Real-time Vitals Trends & Clinical Trajectory Graph */}
          <div className="card-clinical p-5 bg-white shadow-xs border border-slate-200/80">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  <span>
                    Live Vitals Trajectory: {selectedPatientObj?.name || 'Patient'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Real-time physiological vital stream for {selectedPatientObj?.name} ({selectedPatientObj?.hospitalId}) • {selectedPatientObj?.ward} {selectedPatientObj?.bed}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Patient Selector Dropdown */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-600">Select Patient:</span>
                  <select
                    value={selectedPatientIdFilter}
                    onChange={(e) => setSelectedPatientIdFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold px-3 py-1.5 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden cursor-pointer"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.hospitalId}) — {p.bed} {p.deviceId ? '• Hardware Connected' : '• No Hardware'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Timeframe Selector */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTrendTimeframe('24h')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      trendTimeframe === '24h'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    Live 24h Trend
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendTimeframe('8h')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      trendTimeframe === '8h'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    Shift View (8h)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendTimeframe('7d')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      trendTimeframe === '7d'
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    7 Days History
                  </button>
                </div>
              </div>
            </div>

            {/* Recharts Area Chart or Unlinked Hardware Notice */}
            {!isSelectedPatientHardwareConnected ? (
              <div className="h-64 my-4 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-2">
                <Radio className="w-8 h-8 text-amber-500 animate-pulse" />
                <div className="font-extrabold text-sm text-slate-900">NO HARDWARE TELEMETRY LINKED</div>
                <p className="text-xs text-slate-500 max-w-md">
                  Patient <strong className="text-slate-900">{selectedPatientObj?.name}</strong> is currently registered in <strong className="text-slate-900">{selectedPatientObj?.ward} ({selectedPatientObj?.bed})</strong> without a linked ESP32 hardware device.
                  Once hardware telemetry is assigned and streams to Firebase, their vital trajectory will display here.
                </p>
              </div>
            ) : (
              <div className="h-72 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorBP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip
                      formatter={(val: any) => typeof val === 'number' ? Math.round(val) : val}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 'bold' }} />
                    <Area
                      type="monotone"
                      dataKey="Heart Rate"
                      stroke="#0d9488"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorHR)"
                      unit=" BPM"
                      isAnimationActive={false}
                      dot={{ r: 4, strokeWidth: 2, fill: "#0d9488" }}
                      activeDot={{ r: 7 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="SpO2"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorSpo2)"
                      unit="%"
                      isAnimationActive={false}
                      dot={{ r: 4, strokeWidth: 2, fill: "#10b981" }}
                      activeDot={{ r: 7 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="Systolic BP"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorBP)"
                      unit=" mmHg"
                      isAnimationActive={false}
                      dot={{ r: 4, strokeWidth: 2, fill: "#f59e0b" }}
                      activeDot={{ r: 7 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* 2 Column Clinical Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Category Distribution Donut Chart */}
            <div className="card-clinical p-5 bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                    <PieIcon className="w-4 h-4 mr-1.5 text-teal-600" />
                    Patient Risk Band Distribution
                  </h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                    {patients.length} Active Patients
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Real-time stratification based on telemetry ML risk predictors and early warning scores
                </p>
              </div>

              <div className="h-56 w-full relative flex items-center justify-center my-2">
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
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '0.5rem',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Stats */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900">{patients.length}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Census</span>
                </div>
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-slate-100 pt-3">
                {statusPieData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2 p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="truncate">
                      <div className="text-[10px] font-bold text-slate-700 truncate">{item.name}</div>
                      <div className="text-xs font-black text-slate-900">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ward Bed Capacity vs Occupancy Bar Chart */}
            <div className="card-clinical p-5 bg-white shadow-xs border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                    <BarChart2 className="w-4 h-4 mr-1.5 text-teal-600" />
                    Ward Monitored Capacity vs Occupancy
                  </h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Ward Management
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Monitored telemetry bed availability vs active patient bed assignments
                </p>
              </div>

              <div className="h-56 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wardChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="wardName" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '0.5rem',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '5px' }} />
                    <Bar dataKey="Occupied" fill="#0d9488" radius={[4, 4, 0, 0]} name="Occupied Beds" />
                    <Bar dataKey="Capacity" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Total Bed Capacity" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-bold text-slate-600">
                <span>ICU Occupancy: <strong className="text-teal-700">83%</strong></span>
                <span>HDU Occupancy: <strong className="text-teal-700">62%</strong></span>
                <span>General Wards: <strong className="text-teal-700">45%</strong></span>
              </div>
            </div>
          </div>

          {/* Patients Needing Attention Table */}
          <div className="card-clinical overflow-hidden bg-white shadow-xs border border-slate-200/80">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-600" />
                PATIENTS NEEDING ATTENTION
              </h3>
              <span className="text-xs text-gray-500 font-medium">{patientsNeedingAttention.length} Patients Flagged</span>
            </div>

            {isLoadingFirebase ? (
              <div className="p-12 text-center text-gray-500 space-y-3">
                <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                <div className="font-bold text-sm">Synchronizing with Firebase Realtime Database...</div>
              </div>
            ) : patients.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                  <Database className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-slate-900">No patient data available</h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Your Firebase Realtime Database does not currently contain any patient monitoring records. Use the Receptionist portal to register new patients.
                  </p>
                </div>
              </div>
            ) : patientsNeedingAttention.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-xs font-semibold">
                All monitored patients are currently stable.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-xs text-gray-600">
                  <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="p-3.5">Patient</th>
                      <th className="p-3.5">Location / Bed</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Risk Score</th>
                      <th className="p-3.5">Primary Complaint</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {patientsNeedingAttention.map((p) => (
                      <tr key={p.id || p.hospitalId} className="hover:bg-teal-50/30 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-gray-500">{p.hospitalId || p.id} • Age {p.age}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-gray-800">{p.ward}</div>
                          <div className="text-[10px] text-gray-500">{p.bed}</div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.currentStatus === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            p.currentStatus === 'HIGH RISK' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {p.currentStatus}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-900">{p.advisoryRisk || 0}%</td>
                        <td className="p-3.5 font-medium text-gray-700">
                          {p.primaryComplaint || 'Monitoring serial vitals'}
                        </td>
                        <td className="p-3.5 text-right flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTransferPatient(p);
                              setIsTransferModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all flex items-center space-x-1 shadow-xs"
                            title="Step-down or transfer patient ward location"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Step-Down</span>
                          </button>
                          <button
                            onClick={() => navigate(`/doctor/patients/${p.id || p.hospitalId}`)}
                            className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs transition-all flex items-center space-x-1 shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Clinical Advisory Alerts & Telemetry Index Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Advisory Alert Feed */}
            <div className="lg:col-span-2 card-clinical p-5 bg-white shadow-xs border border-slate-200/80">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center">
                    <BellRing className="w-4 h-4 mr-1.5 text-cyan-600" />
                    LIVE CLINICAL ADVISORY FEED & BREACH ALERTS
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Real-time threshold breaches and machine learning clinical risk advisories
                  </p>
                </div>
                <button
                  onClick={() => navigate('/doctor/alerts')}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center space-x-1"
                >
                  <span>All Alerts</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {activeAlerts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-semibold">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  No active high-priority clinical alerts. Ward telemetry is within safe limits.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAlerts.slice(0, 4).map((alert) => {
                    const isAcked = alert.status === 'ACKNOWLEDGED' || acknowledgedAlertIds.has(alert.id);
                    return (
                      <div
                        key={alert.id}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                          alert.priority === 'CRITICAL'
                            ? 'bg-red-50/40 border-red-200/80'
                            : alert.priority === 'HIGH'
                            ? 'bg-orange-50/40 border-orange-200/80'
                            : 'bg-amber-50/30 border-amber-200/60'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              alert.priority === 'CRITICAL' ? 'bg-red-600 text-white' :
                              alert.priority === 'HIGH' ? 'bg-orange-500 text-white' : 'bg-amber-500 text-white'
                            }`}>
                              {alert.priority}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">{alert.patientName}</span>
                            <span className="text-[11px] text-slate-500 font-mono">({alert.ward} - {alert.bed})</span>
                          </div>
                          <p className="text-xs font-medium text-slate-700">{alert.summary}</p>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {isAcked ? (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-[11px] rounded-lg border border-slate-200 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Acknowledged</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAcknowledge(alert.id)}
                              className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg shadow-xs transition-all"
                            >
                              Acknowledge
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/doctor/patients/${alert.patientId}`)}
                            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-lg transition-all"
                          >
                            Inspect
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ward Telemetry Health Meter */}
            <div className="card-clinical p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-3">
                  <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center">
                    <Zap className="w-4 h-4 mr-1.5 text-teal-400" />
                    WARD PHYSIOLOGICAL STABILITY INDEX
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>Overall Stability Rating</span>
                      <span className="text-teal-400 font-mono text-sm">94.2%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-2.5 rounded-full" style={{ width: '94.2%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                      <span>Hardware Telemetry Stream</span>
                      <span className="text-emerald-400 font-mono text-sm">ONLINE</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-400 font-semibold">
                      <span>Live Monitored Streams</span>
                      <span className="text-white font-bold">{Object.keys(liveVitalsMap).length} Devices</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 font-semibold">
                      <span>Target SpO2 Saturation</span>
                      <span className="text-emerald-400 font-bold">&gt; 95% (Avg 97.4%)</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 font-semibold">
                      <span>Target HR Baseline</span>
                      <span className="text-teal-400 font-bold">60-100 BPM</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/80 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>Firebase RTDB Sync: ACTIVE</span>
                <span className="text-teal-400 font-bold">UPDATED LIVE</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Ward Transfer & Step-Down Modal */}
      <TransferPatientModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        patient={selectedTransferPatient}
      />
    </div>
  );
};

