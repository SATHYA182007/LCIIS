"""
=============================================================================
CLINICAL INTELLIGENCE & LONGITUDINAL HEALTH MONITORING SYSTEM
=============================================================================
Architecture Overview:
1. Static Physiological Threshold Guard: Zero-latency medical boundary checks (AHA/NIH).
2. Longitudinal Delta Tracking: Real-time velocity analysis between consecutive readings.
3. Random Forest Machine Learning: 100-tree ensemble multi-vital pattern classification.
4. Trajectory Risk Forecaster: First-order vector extrapolation for early deterioration warning.
=============================================================================
"""

import sys

# Ensure UTF-8 output encoding for Windows command line terminals
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

from flask import Flask, render_template, request, session, redirect, url_for
import pandas as pd
import joblib

app = Flask(__name__)
# Secret key required to track encrypted session cookies for longitudinal tracking
app.secret_key = 'biomed_clinical_intelligence_secret_key'

# Load trained Random Forest model binary
MODEL_PATH = 'health_monitor_model.joblib'
model = joblib.load(MODEL_PATH)

# Input feature schema matching the trained Random Forest model
feature_cols = [
    'Heart Rate (bpm)', 
    'SpO2 Level (%)', 
    'Systolic Blood Pressure (mmHg)', 
    'Diastolic Blood Pressure (mmHg)', 
    'Body Temperature (°C)', 
    'Fall Detection'
]

def log_info(msg=""):
    """Prints unbuffered formatted information to the command line console."""
    print(msg, flush=True)

def check_static_thresholds(vitals):
    """
    ENGINE 1: Static Physiological Threshold Guard.
    Checks vitals against absolute clinical safety boundaries (AHA/NIH/WHO standards).
    """
    alerts = []
    # Heart Rate Bounds (Normal: 60 - 100 bpm)
    if vitals['hr'] > 100:
        alerts.append(f"Heart Rate ({vitals['hr']} bpm) is ABOVE safe limit (> 100 bpm: Tachycardia).")
    elif vitals['hr'] < 60:
        alerts.append(f"Heart Rate ({vitals['hr']} bpm) is BELOW normal limit (< 60 bpm: Bradycardia).")

    # Oxygen Saturation (SpO2) Bounds (Normal: >= 95%)
    if vitals['spo2'] < 95:
        alerts.append(f"SpO2 Level ({vitals['spo2']}%) is BELOW safe threshold (< 95%: Hypoxemia).")

    # Systolic Blood Pressure (Normal: 90 - 120 / 140 mmHg)
    if vitals['sys_bp'] > 140:
        alerts.append(f"Systolic BP ({vitals['sys_bp']} mmHg) is ABOVE hypertension threshold (> 140 mmHg).")
    elif vitals['sys_bp'] < 90:
        alerts.append(f"Systolic BP ({vitals['sys_bp']} mmHg) is BELOW normal limit (< 90 mmHg: Hypotension).")

    # Diastolic Blood Pressure (Normal: 60 - 80 / 90 mmHg)
    if vitals['dia_bp'] > 90:
        alerts.append(f"Diastolic BP ({vitals['dia_bp']} mmHg) is ABOVE normal limit (> 90 mmHg).")
    elif vitals['dia_bp'] < 60:
        alerts.append(f"Diastolic BP ({vitals['dia_bp']} mmHg) is BELOW normal limit (< 60 mmHg).")

    # Body Temperature (Normal: 36.1 - 37.2 / 37.5 °C)
    if vitals['temp'] > 37.5:
        alerts.append(f"Body Temperature ({vitals['temp']} °C) is ABOVE normal (Fever threshold > 37.5 °C).")
    elif vitals['temp'] < 35.5:
        alerts.append(f"Body Temperature ({vitals['temp']} °C) is BELOW normal (Hypothermia threshold < 35.5 °C).")

    # Physical Fall Sensor (1 = Fall Detected)
    if vitals['fall'] == 1:
        alerts.append("Physical Event: Sudden patient fall detected!")

    return alerts

def check_longitudinal_deltas(current, previous):
    """
    ENGINE 2: Longitudinal Shift & Velocity Analyzer.
    Computes rapid physiological shifts (deltas) relative to previous observation.
    """
    if not previous:
        return ["Baseline established. No prior records available for comparison."]
    
    delta_reports = []
    
    # Delta 1: Heart Rate velocity (threshold: >= 20 bpm jump or drop)
    hr_delta = current['hr'] - previous['hr']
    if abs(hr_delta) >= 20:
        status = "spiked" if hr_delta > 0 else "plummeted"
        delta_reports.append(f"Sudden HR Shift: Heart rate {status} by {abs(hr_delta):.1f} bpm (from {previous['hr']} to {current['hr']}).")
        
    # Delta 2: Oxygen Saturation drop (threshold: <= -4% desaturation)
    spo2_delta = current['spo2'] - previous['spo2']
    if spo2_delta <= -4:
        delta_reports.append(f"Acute Desaturation: SpO2 dropped rapidly by {abs(spo2_delta):.1f}% (from {previous['spo2']}% to {current['spo2']}%).")
        
    # Delta 3: Blood Pressure surge or plunge (threshold: >= 25 mmHg shift)
    sys_delta = current['sys_bp'] - previous['sys_bp']
    if abs(sys_delta) >= 25:
        status = "surged" if sys_delta > 0 else "dropped"
        delta_reports.append(f"Acute Blood Pressure Shift: Systolic BP {status} by {abs(sys_delta):.1f} mmHg (from {previous['sys_bp']} to {current['sys_bp']}).")

    if not delta_reports:
        delta_reports.append("Parameters are steady with no acute deviations from the baseline.")

    return delta_reports

def predict_future_trajectory(current, previous):
    """
    ENGINE 4: Predictive Trajectory Engine.
    Extrapolates next-cycle vitals using velocity vectors and feeds into ML model.
    """
    if not previous:
        return {"outlook": "Insufficient longitudinal history for future projection.", "is_risky": False}
    
    # Compute velocity vector
    hr_velocity = current['hr'] - previous['hr']
    spo2_velocity = current['spo2'] - previous['spo2']
    sys_velocity = current['sys_bp'] - previous['sys_bp']
    
    # Extrapolate next cycle values
    future_hr = current['hr'] + hr_velocity
    future_spo2 = current['spo2'] + spo2_velocity
    future_sys = current['sys_bp'] + sys_velocity
    
    # Run ML inference on forecasted physiological state
    future_features = pd.DataFrame([[
        future_hr, future_spo2, future_sys, 
        current['dia_bp'], current['temp'], current['fall']
    ]], columns=feature_cols)
    
    future_pred = model.predict(future_features)[0]
    outlook = "High risk of clinical deterioration in the next cycle [WARNING]" if future_pred == 1 else "Stable trajectory projected for next cycle [OK]"
    
    return {
        "projected_hr": round(future_hr, 1),
        "projected_spo2": round(future_spo2, 1),
        "projected_sys": round(future_sys, 1),
        "outlook": outlook,
        "is_risky": future_pred == 1
    }

@app.route('/', methods=['GET', 'POST'])
def index():
    prediction_result = None
    threshold_alerts = []
    delta_alerts = []
    future_forecast = None
    current_data = None
    
    # Retrieve previous patient vitals from session state
    previous_vitals = session.get('last_patient_record', None)

    if request.method == 'POST':
        try:
            # 1. Parse inbound patient vitals
            current_data = {
                'hr': float(request.form['heart_rate']),
                'spo2': float(request.form['spo2']),
                'sys_bp': float(request.form['systolic_bp']),
                'dia_bp': float(request.form['diastolic_bp']),
                'temp': float(request.form['temperature']),
                'fall': int(request.form['fall_detection'])
            }

            # =================================================================
            # INFORMATIONAL COMMAND LINE OUTPUT: INBOUND TELEMETRY
            # =================================================================
            log_info("\n" + "=" * 68)
            log_info(" [COMMAND LINE INFO] INBOUND PATIENT VITALS TELEMETRY RECEIVED")
            log_info("=" * 68)
            log_info(f"  [+] Heart Rate:        {current_data['hr']} bpm")
            log_info(f"  [+] Oxygen Saturation: {current_data['spo2']}%")
            log_info(f"  [+] Blood Pressure:    {current_data['sys_bp']} / {current_data['dia_bp']} mmHg")
            log_info(f"  [+] Body Temperature:  {current_data['temp']} °C")
            log_info(f"  [+] Fall Sensor State: {'1 (FALL DETECTED [!])' if current_data['fall'] == 1 else '0 (Stable Normal)'}")

            # 2. Execute Engine 1: Static Threshold Guard
            threshold_alerts = check_static_thresholds(current_data)
            log_info("\n [ENGINE 1: STATIC THRESHOLD GUARD]")
            if threshold_alerts:
                for alert in threshold_alerts:
                    log_info(f"  [!] VIOLATION: {alert}")
            else:
                log_info("  [OK] All vitals within safe physiological boundaries.")

            # 3. Execute Engine 2: Longitudinal Delta Tracker
            delta_alerts = check_longitudinal_deltas(current_data, previous_vitals)
            log_info("\n [ENGINE 2: LONGITUDINAL DELTA TRACKER]")
            for delta in delta_alerts:
                log_info(f"  [i] {delta}")

            # 4. Execute Engine 4: Future Trend Prediction
            future_forecast = predict_future_trajectory(current_data, previous_vitals)
            log_info("\n [ENGINE 4: PREDICTIVE TRAJECTORY FORECASTER]")
            if future_forecast and 'projected_hr' in future_forecast:
                log_info(f"  [>] Projected Next Cycle: HR={future_forecast['projected_hr']} bpm, SpO2={future_forecast['projected_spo2']}%, Sys BP={future_forecast['projected_sys']} mmHg")
                log_info(f"  [>] Projected Risk Outlook: {future_forecast['outlook']}")
            else:
                log_info(f"  [i] {future_forecast['outlook']}")

            # 5. Execute Engine 3: Random Forest ML Inference
            input_features = pd.DataFrame([[
                current_data['hr'], current_data['spo2'], 
                current_data['sys_bp'], current_data['dia_bp'], 
                current_data['temp'], current_data['fall']
            ]], columns=feature_cols)

            prediction = model.predict(input_features)[0]
            prediction_result = "ABNORMAL ALERT" if prediction == 1 else "NORMAL"

            log_info("\n [ENGINE 3: RANDOM FOREST ML INFERENCE]")
            log_info(f"  [*] Classifier Decision: {prediction_result}")
            if hasattr(model, 'predict_proba'):
                probs = model.predict_proba(input_features)[0]
                conf = probs[prediction] * 100
                log_info(f"  [*] Confidence Level:    {conf:.1f}% (Normal: {probs[0]*100:.1f}%, Abnormal: {probs[1]*100:.1f}%)")
            log_info("=" * 68 + "\n")

            # Cache current submission in session memory
            session['last_patient_record'] = current_data

        except Exception as err:
            prediction_result = f"Error: {err}"
            log_info(f"\n[ERROR] Telemetry Processing Failed: {err}\n")

    return render_template(
        'index.html',
        prediction=prediction_result,
        threshold_alerts=threshold_alerts,
        delta_alerts=delta_alerts,
        future_forecast=future_forecast,
        current_data=current_data
    )

@app.route('/reset')
@app.route('/reset/')
def reset():
    """Clears the session baseline state and redirects to the clean dashboard."""
    session.pop('last_patient_record', None)
    log_info("\n" + "=" * 68)
    log_info(" [COMMAND LINE INFO] Session baseline reset. Prior history cleared.")
    log_info("=" * 68 + "\n")
    return redirect(url_for('index'))

if __name__ == '__main__':
    # Banner printed upon server launch in the terminal
    log_info("\n" + "=" * 70)
    log_info("  CLINICAL INTELLIGENCE & LONGITUDINAL HEALTH MONITOR (FLASK SERVER)")
    log_info("=" * 70)
    log_info(f"  [*] Loaded ML Architecture:   {type(model).__name__} (100 Decision Trees)")
    log_info(f"  [*] Active Features (6):      {', '.join(feature_cols)}")
    log_info(f"  [*] Clinical Engines:         Threshold Guard | Delta Tracker | ML | Forecaster")
    log_info(f"  [*] Server Access URL:        http://127.0.0.1:5000")
    log_info("=" * 70 + "\n")
    app.run(debug=True)