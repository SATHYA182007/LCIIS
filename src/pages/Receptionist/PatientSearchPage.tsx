import React, { useState } from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { Search, UserCheck, Phone, MapPin, User } from 'lucide-react';

export const PatientSearchPage: React.FC = () => {
  const { patients } = useRealtime();
  const [query, setQuery] = useState('');

  const searchResults = query.trim()
    ? patients.filter((p) => {
        const q = query.toLowerCase().trim();
        const pid = (p.hospitalId || p.id).toLowerCase();
        const pname = p.name.toLowerCase();
        const pphone = (p.phone || '').replaceAll(' ', '').replaceAll('-', '');
        const cleanQ = q.replaceAll(' ', '').replaceAll('-', '');

        return pid.includes(q) || pname.includes(q) || pphone.includes(cleanQ);
      })
    : [];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Patient Search" />

        <main className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto w-full">
          {/* Main Search Input Box */}
          <div className="card-clinical p-6 bg-white space-y-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center">
                <Search className="w-5 h-5 mr-2 text-teal-700" />
                SEARCH PATIENT DATABASE
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Lookup registered hospital patients by Patient ID (e.g. LCIIS-P-000001), Full Name, or Phone Number.
              </p>
            </div>

            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter Patient ID, Full Name, or Contact Phone Number..."
                className="w-full pl-12 pr-4 py-3 text-sm bg-slate-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden shadow-2xs"
              />
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-400 font-semibold pt-1">
              <span>Quick Examples:</span>
              <button onClick={() => setQuery('LCIIS-P-000001')} className="hover:text-teal-700 font-mono">LCIIS-P-000001</button>
              <button onClick={() => setQuery('Test Patient')} className="hover:text-teal-700">Test Patient</button>
              <button onClick={() => setQuery('Marcus')} className="hover:text-teal-700">Marcus</button>
            </div>
          </div>

          {/* Results Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 px-1">
              <span>{query ? `Search Results (${searchResults.length})` : 'Type a query above to search'}</span>
            </div>

            {query && searchResults.length === 0 ? (
              <div className="card-clinical p-12 text-center text-gray-400 bg-white space-y-2">
                <User className="w-10 h-10 mx-auto text-gray-300" />
                <div className="font-bold text-sm text-slate-800">No patient found matching "{query}"</div>
                <p className="text-xs text-gray-500">Verify the Patient ID, spelling, or phone number and try again.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {searchResults.map((p) => (
                  <div key={p.id || p.hospitalId} className="card-clinical p-5 bg-white space-y-3 hover:border-teal-300 transition-all">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-teal-800 text-sm">{p.hospitalId || p.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.currentStatus === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            p.currentStatus === 'HIGH RISK' ? 'bg-orange-100 text-orange-700' :
                            p.currentStatus === 'MONITOR' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.currentStatus || 'Registered'}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-base mt-0.5">{p.name}</h3>
                      </div>

                      <div className="text-xs text-gray-500 font-semibold">
                        Registered: {p.registeredAt ? new Date(p.registeredAt).toLocaleDateString() : p.admissionDate}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <UserCheck className="w-4 h-4 text-teal-700 shrink-0" />
                        <span>{p.age} yrs • {p.gender} • Blood: <strong>{p.bloodGroup || 'N/A'}</strong></span>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="w-4 h-4 text-teal-700 shrink-0" />
                        <span className="font-mono">{p.phone}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
                        <span>{p.ward || 'Intake'} ({p.bed || 'Triage'})</span>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-1">
                      <div><strong>Emergency Contact:</strong> {p.emergencyContact}</div>
                      {p.address && <div><strong>Address:</strong> {p.address}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
