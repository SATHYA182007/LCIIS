import React from 'react';
import { Header } from '../../components/layout/Header';
import { Sidebar } from '../../components/layout/Sidebar';
import { Cpu, Code2, AlertTriangle } from 'lucide-react';


export const HardwareIntegrationPage: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header title="ESP32 Telemetry & Pocket Device Integration Guide" />

        <main className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="bg-slate-900 text-white p-6 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>PROTOTYPE ENVIRONMENT HARDWARE SPECIFICATION</span>
            </div>
            <h2 className="text-xl font-black text-white">ESP32 Wi-Fi Telemetry & Arduino IDE Firmware Specification</h2>
            <p className="text-xs text-slate-300">
              The browser application connects directly to Firebase Realtime Database. Arduino IDE is only used to flash the physical ESP32 microcontroller.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* JSON Payload Spec */}
            <div className="card-clinical p-5 bg-white space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Cpu className="w-4 h-4 mr-1.5 text-teal-600" /> Hardware Telemetry JSON Structure
              </h3>
              <p className="text-xs text-gray-500">
                ESP32 nodes post JSON payloads to <code>/liveVitals/{'{patientId}'}</code> over Firebase RTDB REST or Client SDK:
              </p>
              <pre className="p-4 bg-slate-950 text-cyan-300 font-mono text-xs rounded-xl overflow-x-auto">
{`{
  "deviceId": "ESP32-ICU-001",
  "patientId": "LCIIS-P-000001",
  "timestamp": 1757476800000,
  "heartRate": 112,
  "spo2": 92,
  "systolicBP": 138,
  "diastolicBP": 84,
  "respiratoryRate": 24,
  "temperature": 38.2,
  "batteryLevel": 87
}`}
              </pre>
            </div>

            {/* Arduino IDE Code Snippet */}
            <div className="card-clinical p-5 bg-white space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center">
                <Code2 className="w-4 h-4 mr-1.5 text-teal-600" /> ESP32 C++ Firmware Snippet
              </h3>
              <p className="text-xs text-gray-500">Sample Arduino IDE snippet for posting vitals over Firebase RTDB:</p>
              <pre className="p-4 bg-slate-950 text-emerald-300 font-mono text-xs rounded-xl overflow-x-auto max-h-64">
{`#include <WiFi.h>
#include <FirebaseESP32.h>

void sendTelemetry() {
  FirebaseJson json;
  json.set("heartRate", 112);
  json.set("spo2", 92);
  json.set("timestamp", millis());
  
  if (Firebase.setJSON(fbdo, "/liveVitals/P12345", json)) {
    Serial.println("Telemetry sent to LCIIS Cloud");
  }
}`}
              </pre>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
