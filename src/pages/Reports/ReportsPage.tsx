import React, { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { useRealtime } from '../../context/RealtimeContext';
import { exportPatientPDF, exportAlertsCSV, exportInventoryCSV } from '../../utils/exportUtils';
import { FileText, Download, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export const ReportsPage: React.FC = () => {
  const { patients, labResults, liveVitalsMap, doctorRemarks, alerts, inventory } = useRealtime();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || 'P12345');

  const handleExportPDF = () => {
    const patient = patients.find((p) => p.id === selectedPatientId) || patients[0];
    if (!patient) {
      toast.error('No patient selected for PDF export.');
      return;
    }

    try {
      const patientLabs = labResults.filter((l) => l.patientId === patient.id);
      const patientVitals = liveVitalsMap[patient.id] || liveVitalsMap['P12345'];
      const patientRemarks = doctorRemarks.filter((r) => r.patientId === patient.id);

      exportPatientPDF(patient, patientLabs, patientVitals, patientRemarks);
      toast.success(`Downloaded LCIIS Patient Summary PDF for ${patient.name}!`);
    } catch (err) {
      toast.error('Failed to generate PDF report.');
    }
  };

  const handleExportAlerts = () => {
    if (!alerts || alerts.length === 0) {
      toast.error('No alert records available to export.');
      return;
    }

    try {
      exportAlertsCSV(alerts);
      toast.success('Downloaded LCIIS Clinical Risk Alerts CSV file!');
    } catch (err) {
      toast.error('Failed to export CSV report.');
    }
  };

  const handleExportInventory = () => {
    if (!inventory || inventory.length === 0) {
      toast.error('No inventory items available to export.');
      return;
    }

    try {
      exportInventoryCSV(inventory);
      toast.success('Downloaded LCIIS Inventory Expiry CSV file!');
    } catch (err) {
      toast.error('Failed to export CSV report.');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="Clinical Intelligence & Operational Reports" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Hospital Intelligence Reporting Center</h2>
              <p className="text-xs text-gray-500">Generate longitudinal patient reports, audit logs, and inventory summaries.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Patient PDF Report Card */}
            <div className="card-clinical p-5 bg-white space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FileText className="w-6 h-6 text-teal-600" />
                  <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-full border border-teal-200">
                    PDF Document
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Patient Longitudinal Summary Report</h3>
                <p className="text-xs text-gray-500">
                  Consolidated history of bedside vitals, serial lab trends, doctor remarks, and interventions.
                </p>

                <div className="pt-2">
                  <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center">
                    <UserCheck className="w-3.5 h-3.5 mr-1 text-teal-700" />
                    Select Target Patient:
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.hospitalId}) — {p.ward}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleExportPDF}
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center space-x-1 transition-all mt-4"
              >
                <Download className="w-4 h-4" /> <span>Export Patient PDF</span>
              </button>
            </div>

            {/* Alert CSV Report Card */}
            <div className="card-clinical p-5 bg-white space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FileText className="w-6 h-6 text-orange-600" />
                  <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-bold rounded-full border border-orange-200">
                    CSV Spreadsheet
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Clinical Alert & Risk Report</h3>
                <p className="text-xs text-gray-500">
                  Overview of all high/critical advisory risk escalations, anomaly detections, and override logs.
                </p>
                <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-gray-600 font-mono">
                  Contains {alerts.length} total recorded alert entries with severity & status.
                </div>
              </div>

              <button
                onClick={handleExportAlerts}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center space-x-1 transition-all mt-4"
              >
                <Download className="w-4 h-4" /> <span>Export Alert CSV</span>
              </button>
            </div>

            {/* Inventory CSV Report Card */}
            <div className="card-clinical p-5 bg-white space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FileText className="w-6 h-6 text-purple-600" />
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded-full border border-purple-200">
                    CSV Spreadsheet
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">Inventory Expiry & Movement Report</h3>
                <p className="text-xs text-gray-500">
                  Pharmaceutical stock ledgers, batch expiry warnings, minimum threshold alerts, and intake logs.
                </p>
                <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-gray-600 font-mono">
                  Contains {inventory.length} active inventory batch items & stock thresholds.
                </div>
              </div>

              <button
                onClick={handleExportInventory}
                className="w-full py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center space-x-1 transition-all mt-4"
              >
                <Download className="w-4 h-4" /> <span>Export Inventory CSV</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

