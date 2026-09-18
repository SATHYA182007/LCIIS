import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

# 1. Load the Dataset
print("Loading dataset...")
df = pd.read_csv('Synthetic_patient-HealthCare-Monitoring_dataset.csv')

# Display basic info about the dataset
print(f"Dataset shape: {df.shape}")
print("Columns available:", df.columns.tolist())

# 2. Data Preprocessing & Feature Selection
# We will use physiological vitals to predict the 'Heart Rate Alert' status (NORMAL / ABNORMAL)
# Convert 'Fall Detection' (Yes/No) into binary numerical values (1/0)
if 'Fall Detection' in df.columns:
    df['Fall Detection'] = df['Fall Detection'].map({'Yes': 1, 'No': 0, True: 1, False: 0})

# Select feature columns (independent variables)
feature_cols = [
    'Heart Rate (bpm)', 
    'SpO2 Level (%)', 
    'Systolic Blood Pressure (mmHg)', 
    'Diastolic Blood Pressure (mmHg)', 
    'Body Temperature (°C)', 
    'Fall Detection'
]

X = df[feature_cols]

# Target variable (dependent variable)
# Let's predict 'Heart Rate Alert' (encoded as 1 for ABNORMAL, 0 for NORMAL)
y = df['Heart Rate Alert'].map({'ABNORMAL': 1, 'NORMAL': 0})

# Drop any potential missing rows just in case
data_model = pd.concat([X, y], axis=1).dropna()
X = data_model[feature_cols]
y = data_model['Heart Rate Alert']

# 3. Train-Test Split (80% training, 20% testing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training samples: {X_train.shape[0]}, Testing samples: {X_test.shape[0]}")

# 4. Initialize and Train Random Forest Classifier
print("Training the Random Forest Classifier...")
clf = RandomForestClassifier(n_estimators=100, random_state=42)
clf.fit(X_train, y_train)

# 5. Evaluate the Model
y_pred = clf.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\nModel Accuracy: {accuracy * 100:.2f}%")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# 6. Save the Trained Model for Deployment
model_filename = 'health_monitor_model.joblib'
joblib.dump(clf, model_filename)
print(f"\nModel successfully saved as '{model_filename}'!")