# LCIIS — Longitudinal Clinical Investigation Intelligence System
> **Team**: GREENMINDS  
> **Tagline**: *"Don't just view the latest result. Understand the patient's clinical trajectory."*

---

## 1. Project Overview & Philosophy

**LCIIS** is a hospital-based longitudinal clinical intelligence and physiological monitoring platform. It unifies fragmented EMR demographics, HIS bed assignments, LIS laboratory results, real-time vital telemetry, and nurse/doctor observations into **ONE Explainable Longitudinal Clinical Picture**.

### Core Clinical Principle
**Individual values may not tell the whole story.** A laboratory measurement remaining strictly within a standard reference range (e.g. Creatinine $0.9 \to 1.3\text{ mg/dL}$) can still represent a dangerous, progressive trajectory when evaluated over time in conjunction with escalating inflammatory CRP and declining oxygen saturation.

LCIIS evaluates:
- **What** changed?
- **When** did it change?
- **How much** and **how fast** did it change?
- Is the change **persistent** or **accelerating**?
- Is the current reading divergent from the **patient's specific baseline**?
- Are **multiple parameters changing concurrently**?

---

## 2. Core Architecture & System Workflows

```
  [ ESP32 Telemetry / Sensor Node ] ──────► [ Firebase Realtime Database ]
                                                        │
  [ LIS Lab Entry / EMR Records ]   ──────► [ Cloud Firestore Database ]
                                                        │
                                                        ▼
                            ┌──────────────────────────────────────────────────────┐
                            │            Clinical Intelligence Pipeline            │
                            ├──────────────────────────────────────────────────────┤
                            │ 1. TrendAnalysisEngine (Velocity, Baseline, Slope)   │
                            │ 2. AnomalyEngine (Z-Score & Rate-of-Change Outliers) │
                            │ 3. RiskAggregator & RiskPredictionModel Adapter      │
                            │ 4. PatientStatusEngine (STABLE → CRITICAL)           │
                            │ 5. ExplanationEngine ("WHY" Plain-Language Reasoning)│
                            └──────────────────────────────────────────────────────┘
                                                        │
                                                        ▼
                            ┌──────────────────────────────────────────────────────┐
                            │            Alert & Notification Engine               │
                            ├──────────────────────────────────────────────────────┤
                            │ • Deduplication & Priority Banding                   │
                            │ • Doctor Override & Action Workflow                  │
                            │ • Pocket Alert Device Channel (OLED, Buzzer, Haptic) │
                            └──────────────────────────────────────────────────────┘
                                                        │
                                                        ▼
                           ┌────────────────────────────────────────────────────────┐
                           │                    Role Dashboards                     │
                           ├──────────────┬──────────────┬──────────────┬───────────┤
                           │ Doctor View  │ Nurse View   │ Lab View     │ Admin View│
                           └──────────────┴──────────────┴──────────────┴───────────┘
```

---

## 3. Four Primary User Roles

LCIIS routes authenticated users to dedicated, role-tailored workspaces:

| Role | Primary Route | Capabilities |
| :--- | :--- | :--- |
| **Doctor** | `/doctor/dashboard` | Accesses Patient Command Center, reviews the **"WHAT CHANGED?"** centerpiece card, analyzes Recharts graphs, prescribes medications, adds remarks, records interventions, acknowledges/overrides alerts. |
| **Nurse** | `/nurse/dashboard` | Subscribes to live ward vital telemetry grid, records AVPU consciousness, pain scores, fluid intake/output, and nursing notes. |
| **Laboratory** | `/laboratory/dashboard` | Enters laboratory results (Biochemistry, Inflammatory, Hematology, etc.), validates reference bounds, verifies reports, and triggers the intelligence pipeline. |
| **Admin** | `/admin/dashboard` | Manages stock movements, monitors the **Expiry Center** (90, 60, 30, 7-day warning bands), tracks ESP32 device heartbeats, and inspects the **Immutable Audit Logs**. |

---

## 4. Deterministic Calculation Engines

1. **TrendAnalysisEngine (`src/services/trendService.ts`)**: Evaluates rate of change per hour ($\frac{dV}{dt}$), directional linear regression slope, persistence across $k$ consecutive observations, acceleration ($\frac{d^2V}{dt^2}$), volatility (standard deviation), and patient baseline $\mu_{\text{patient}}$.
2. **AnomalyEngine (`src/services/anomalyService.ts`)**: Detects statistical $z$-score outliers ($\ge 2.5\sigma$) and range-relative jump spikes.
3. **RiskAggregator (`src/services/riskService.ts`)**: Aggregates multi-component scores:
   $$\text{Risk Score} = 0.30 \cdot S_{\text{rule}} + 0.25 \cdot S_{\text{trend}} + 0.10 \cdot S_{\text{anomaly}} + 0.35 \cdot S_{\text{ml}}$$
   Advisory Risk Bands: `0–25` (STABLE), `26–50` (MONITOR), `51–75` (HIGH RISK), `76–100` (CRITICAL).
4. **PatientStatusEngine (`src/services/statusService.ts`)**: Computes advisory status (`STABLE`, `MONITOR`, `HIGH RISK`, `CRITICAL`). Missing data or device offline states do **not** equal patient deterioration.
5. **ExplanationEngine (`src/services/explanationService.ts`)**: Generates actionable "WHY" reasoning explaining multi-parameter changes.

---

## 5. Hardware Architecture & Hardware Simulation

- **ESP32 Microcontroller Node**: Sends telemetry JSON payloads to `/liveVitals/{patientId}` over Firebase Realtime Database.
- **Pocket Alert Hardware Device**: Dongle with OLED display, piezo buzzer, haptic vibration motor, and alert LEDs.
- **Interactive Hardware Simulation Engine (`/simulation`)**: Streams scenario telemetry step-by-step into Firebase RTDB at 1x, 2x, 5x, 10x speeds.
- **Virtual Pocket Alert Dongle (`/device-monitor`)**: Interactive hardware mockup for visual alert delivery and single-click `[ ACK ]` triggers.

---

## 6. Running Locally & Production Build

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation & Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production (Vercel / static hosting ready)
npm run build
```

### Environment Variables (`.env.example`)
Create a `.env` file in the project root:
```env
VITE_FIREBASE_API_KEY=AIzaSyYourApiKeyHere
VITE_FIREBASE_AUTH_DOMAIN=lciis-health.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lciis-health
VITE_FIREBASE_STORAGE_BUCKET=lciis-health.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
VITE_FIREBASE_DATABASE_URL=https://lciis-health-default-rtdb.firebaseio.com
```

---

## 7. Clinical & Synthetic Data Disclaimer

> **IMPORTANT**: This platform provides advisory decision-support analysis of available patient, laboratory, and physiological telemetry data. It does **not** diagnose disease, prescribe treatment, or replace professional clinical judgment. Final clinical decisions remain with authorized healthcare professionals.
> 
> **DEMO ENVIRONMENT**: All records, names, and measurements within this application are synthetic and fictional. Not a clinically validated medical device.
