from flask import Flask, render_template, request, jsonify
import pandas as pd
import joblib

app = Flask(__name__)

# Load the trained model
model = joblib.load('health_monitor_model.joblib')

# Define feature columns matching training data
feature_cols = [
    'Heart Rate (bpm)', 
    'SpO2 Level (%)', 
    'Systolic Blood Pressure (mmHg)', 
    'Diastolic Blood Pressure (mmHg)', 
    'Body Temperature (°C)', 
    'Fall Detection'
]

@app.route('/', methods=['GET', 'POST'])
def index():
    prediction_result = None
    if request.method == 'POST':
        try:
            # Get values from the HTML form
            hr = float(request.form['heart_rate'])
            spo2 = float(request.form['spo2'])
            sys_bp = float(request.form['systolic_bp'])
            dia_bp = float(request.form['diastolic_bp'])
            temp = float(request.form['temperature'])
            fall = int(request.form['fall_detection'])
            
            # Create DataFrame with proper feature names
            input_data = pd.DataFrame([[hr, spo2, sys_bp, dia_bp, temp, fall]], columns=feature_cols)
            
            # Make prediction
            pred = model.predict(input_data)[0]
            prediction_result = "ABNORMAL ALERT 🚨" if pred == 1 else "NORMAL ✅"
            
        except Exception as e:
            prediction_result = f"Error in input data: {e}"
            
    return render_template('index.html', prediction=prediction_result)

@app.route('/api/predict', methods=['POST'])
def api_predict():
    try:
        data = request.get_json(force=True) or {}
        hr = float(data.get('heart_rate', 75))
        spo2 = float(data.get('spo2', 98))
        sys_bp = float(data.get('systolic_bp', 120))
        dia_bp = float(data.get('diastolic_bp', 80))
        temp = float(data.get('temperature', 36.6))
        fall = int(data.get('fall_detection', 0))
        
        input_data = pd.DataFrame([[hr, spo2, sys_bp, dia_bp, temp, fall]], columns=feature_cols)
        pred = int(model.predict(input_data)[0])
        prediction_result = "ABNORMAL ALERT 🚨" if pred == 1 else "NORMAL ✅"
        
        return jsonify({
            'status': 'success',
            'prediction': prediction_result,
            'is_abnormal': pred == 1,
            'features': {
                'heart_rate': hr,
                'spo2': spo2,
                'systolic_bp': sys_bp,
                'diastolic_bp': dia_bp,
                'temperature': temp,
                'fall_detection': fall
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)