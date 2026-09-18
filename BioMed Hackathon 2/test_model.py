import sys
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

# Ensure UTF-8 output encoding for Windows terminals
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

def run_evaluation():
    print("=" * 65)
    print("      HEALTHCARE MONITOR ML MODEL - ACCURACY & EVALUATION")
    print("=" * 65)

    # 1. Load Trained Model
    model_path = 'health_monitor_model.joblib'
    print(f"\n[1] Loading saved model from: {model_path}")
    model = joblib.load(model_path)
    print(f"    Model Architecture: {type(model).__name__}")
    if hasattr(model, 'n_estimators'):
        print(f"    Number of Decision Trees: {model.n_estimators}")
    if hasattr(model, 'classes_'):
        print(f"    Classes: {model.classes_} (0: NORMAL, 1: ABNORMAL)")

    # 2. Load Dataset
    data_path = 'Synthetic_patient-HealthCare-Monitoring_dataset.csv'
    print(f"\n[2] Loading dataset from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"    Total Patient Records: {df.shape[0]:,}")
    print(f"    Total Columns:         {df.shape[1]}")

    # 3. Data Preprocessing
    if 'Fall Detection' in df.columns:
        df['Fall Detection'] = df['Fall Detection'].map({'Yes': 1, 'No': 0, True: 1, False: 0})

    feature_cols = [
        'Heart Rate (bpm)', 
        'SpO2 Level (%)', 
        'Systolic Blood Pressure (mmHg)', 
        'Diastolic Blood Pressure (mmHg)', 
        'Body Temperature (°C)', 
        'Fall Detection'
    ]

    target_col = 'Heart Rate Alert'
    y_raw = df[target_col].map({'ABNORMAL': 1, 'NORMAL': 0})
    X_raw = df[feature_cols]

    # Handle missing values
    combined = pd.concat([X_raw, y_raw], axis=1).dropna()
    X = combined[feature_cols]
    y = combined[target_col].astype(int)

    print(f"    Cleaned Samples:       {len(combined):,} (Missing dropped: {len(df) - len(combined)})")
    class_counts = y.value_counts()
    print(f"    Class Distribution:    NORMAL (0) = {class_counts.get(0, 0):,} ({class_counts.get(0, 0)/len(y)*100:.2f}%), "
          f"ABNORMAL (1) = {class_counts.get(1, 0):,} ({class_counts.get(1, 0)/len(y)*100:.2f}%)")

    # 4. Holdout Split (80% Train, 20% Test) matching train_model.py
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"\n[3] Holdout Split:")
    print(f"    Training samples:      {X_train.shape[0]:,} (80%)")
    print(f"    Testing samples:       {X_test.shape[0]:,} (20%)")

    # 5. Evaluate on Holdout Test Set (Unseen Data)
    y_pred_test = model.predict(X_test)
    y_prob_test = model.predict_proba(X_test)[:, 1] if hasattr(model, "predict_proba") else None

    test_acc = accuracy_score(y_test, y_pred_test)
    test_prec = precision_score(y_test, y_pred_test, zero_division=0)
    test_rec = recall_score(y_test, y_pred_test, zero_division=0)
    test_f1 = f1_score(y_test, y_pred_test, zero_division=0)
    test_roc_auc = roc_auc_score(y_test, y_prob_test) if y_prob_test is not None else None

    cm = confusion_matrix(y_test, y_pred_test)
    tn, fp, fn, tp = cm.ravel()
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0

    print("\n" + "=" * 65)
    print("           HOLDOUT TEST SET METRICS (Unseen Data)")
    print("=" * 65)
    print(f"  >>> Accuracy:          {test_acc * 100:.2f}%")
    print(f"      Precision:         {test_prec * 100:.2f}%")
    print(f"      Recall / Sens.:    {test_rec * 100:.2f}%")
    print(f"      Specificity:       {specificity * 100:.2f}%")
    print(f"      F1-Score:          {test_f1 * 100:.2f}%")
    if test_roc_auc is not None:
        print(f"      ROC-AUC Score:     {test_roc_auc:.4f}")

    print("\n[Confusion Matrix on 12,000 Test Records]:")
    print(f"                             Predicted NORMAL (0)   Predicted ABNORMAL (1)")
    print(f"  Actual NORMAL (0):         TN = {tn:<10}       FP = {fp:<10}")
    print(f"  Actual ABNORMAL (1):       FN = {fn:<10}       TP = {tp:<10}")

    print("\n[Detailed Classification Report]:")
    print(classification_report(y_test, y_pred_test, target_names=['NORMAL (0)', 'ABNORMAL (1)'], digits=4))

    # 6. Evaluate on Training Set to Check Overfitting
    y_pred_train = model.predict(X_train)
    train_acc = accuracy_score(y_train, y_pred_train)
    print("[Generalization & Overfitting Check]:")
    print(f"    Training Set Accuracy: {train_acc * 100:.2f}%")
    print(f"    Test Set Accuracy:     {test_acc * 100:.2f}%")
    print(f"    Generalization Gap:    {(train_acc - test_acc) * 100:.2f}%")

    # 7. Evaluate on Full Dataset
    y_pred_all = model.predict(X)
    full_acc = accuracy_score(y, y_pred_all)
    print(f"    Full Dataset Accuracy: {full_acc * 100:.2f}% ({len(X):,} records)")

    # 8. Stratified K-Fold Cross Validation
    print("\n[4] 5-Fold Stratified Cross-Validation:")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model, X, y, cv=cv, scoring='accuracy')
    fold_strs = [f"{s * 100:.2f}%" for s in cv_scores]
    print(f"    Fold Accuracies:       {', '.join(fold_strs)}")
    print(f"    Mean CV Accuracy:      {cv_scores.mean() * 100:.2f}% (+/- {cv_scores.std() * 100:.2f}%)")
    ci_lower = max(0.0, (cv_scores.mean() - 1.96 * cv_scores.std()) * 100)
    ci_upper = min(100.0, (cv_scores.mean() + 1.96 * cv_scores.std()) * 100)
    print(f"    95% Confidence Interval: [{ci_lower:.2f}%, {ci_upper:.2f}%]")

    # 9. Feature Importances
    if hasattr(model, 'feature_importances_'):
        print("\n[5] Feature Importances (Random Forest Gini Impurity):")
        importances = pd.Series(model.feature_importances_, index=feature_cols).sort_values(ascending=False)
        for rank, (feat, imp) in enumerate(importances.items(), 1):
            bar = "#" * int(imp * 30)
            print(f"    {rank}. {feat:<34} : {imp * 100:6.2f}% | {bar}")

    # 10. Sample Test Predictions
    print("\n[6] Clinical Vitals Sample Testing:")
    test_cases = [
        {"name": "Patient A (Healthy Normal Vitals: HR 75, BP 120/80)", "data": [75, 98, 120, 80, 36.6, 0]},
        {"name": "Patient B (Tachycardia: High HR 140 bpm, Low SpO2 88%)", "data": [140, 88, 170, 105, 39.2, 1]},
        {"name": "Patient C (Borderline High HR: 102 bpm)", "data": [102, 97, 125, 82, 37.0, 0]},
        {"name": "Patient D (Borderline Normal HR: 98 bpm)", "data": [98, 97, 125, 82, 37.0, 0]},
        {"name": "Patient E (Bradycardia in dataset profile: HR 56 bpm, BP 149/114)", "data": [56, 96, 149, 114, 36.5, 0]},
    ]
    for case in test_cases:
        df_case = pd.DataFrame([case['data']], columns=feature_cols)
        pred = model.predict(df_case)[0]
        prob = model.predict_proba(df_case)[0] if hasattr(model, 'predict_proba') else [None, None]
        label = "ABNORMAL ALERT [!]" if pred == 1 else "NORMAL [OK]"
        prob_str = f" (Confidence: {prob[pred]*100:.1f}%)" if prob[0] is not None else ""
        print(f"    * {case['name']}")
        print(f"      Vitals: HR={case['data'][0]} bpm, SpO2={case['data'][1]}%, BP={case['data'][2]}/{case['data'][3]}, Temp={case['data'][4]}C, Fall={case['data'][5]}")
        print(f"      Result: {label}{prob_str}\n")

    print("=" * 65)
    print("                       TESTING COMPLETE")
    print("=" * 65)

if __name__ == '__main__':
    run_evaluation()
