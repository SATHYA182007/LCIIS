import pandas as pd
import joblib

# Load the saved model
model = joblib.load('health_monitor_model.joblib')

# Define feature columns matching your training data
feature_cols = [
    'Heart Rate (bpm)', 
    'SpO2 Level (%)', 
    'Systolic Blood Pressure (mmHg)', 
    'Diastolic Blood Pressure (mmHg)', 
    'Body Temperature (°C)', 
    'Fall Detection'
]

# Create samples as DataFrames with column names
sample_patient_normal = pd.DataFrame([[75, 98, 120, 80, 36.6, 0]], columns=feature_cols)
sample_patient_abnormal = pd.DataFrame([[140, 88, 170, 105, 39.2, 1]], columns=feature_cols)

# Make predictions cleanly without warnings
for i, sample in enumerate([sample_patient_normal, sample_patient_abnormal], 1):
    prediction = model.predict(sample)
    status = "ABNORMAL ALERT 🚨" if prediction[0] == 1 else "NORMAL ✅"
    print(f"Sample {i} Prediction: {status}")