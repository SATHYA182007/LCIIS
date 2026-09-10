import React, { useState } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { History, Filter } from 'lucide-react';


export const AuditLogsPage: React.FC = () => {
  const { auditLogs } = useRealtime();
  const [filterAction, setFilterAction] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    if (filterAction === 'ALL') return true;
    return log.action.includes(filterAction);
  });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Immutable System Audit Ledger" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Hospital Security & Clinical Event Audit Trail</h2>
              <p className="text-xs text-gray-500">Immutable record of all clinical, lab, inventory, device, and override actions.</p>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-hidden"
              >
                <option value="ALL">All Actions ({auditLogs.length})</option>
                <option value="LAB">Lab Entries</option>
                <option value="ALERT">Alert Actions & Overrides</option>
                <option value="RISK">Risk Escalations</option>
                <option value="INVENTORY">Inventory Movements</option>
                <option value="DEVICE">Device Heartbeats</option>
              </select>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="card-clinical overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <History className="w-4 h-4 mr-2 text-teal-600" />
                IMMUTABLE AUDIT LOG STREAM
              </h3>
              <span className="text-xs text-gray-500 font-mono">Total Logged: {filteredLogs.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-100/70 text-gray-700 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User / System</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Action Event</th>
                    <th className="p-3">Resource</th>
                    <th className="p-3">Patient ID</th>
                    <th className="p-3">Event Details & Diff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-teal-50/30 transition-colors">
                      <td className="p-3 font-mono text-gray-500">
                        {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{log.userName}</div>
                        <div className="text-[10px] font-mono text-gray-400">{log.userId}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                          {log.role}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-teal-800">{log.action}</td>
                      <td className="p-3 font-mono text-gray-600">{log.resource}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">{log.patientId || 'N/A'}</td>
                      <td className="p-3 text-slate-800">
                        <div>{log.details}</div>
                        {log.previousValue && log.newValue && (
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                            Diff: <span className="line-through">{log.previousValue}</span> → <span className="font-bold text-teal-700">{log.newValue}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
