import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import mlflow
import mlflow.sklearn
import mlflow.keras
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.svm import SVR
from sklearn.metrics import mean_absolute_error, mean_squared_error, accuracy_score, f1_score
import joblib

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Dropout

# Setup MLflow
mlflow.set_tracking_uri("sqlite:///mlflow.db")
mlflow.set_experiment("TrafficWise_Congestion_Prediction")

def fetch_or_mock_data():
    # In a real scenario, we connect to Postgres and fetch the last 30 days.
    # For this script to be runnable without the DB, we generate mock data here as a fallback.
    print("Generating mock data for training...")
    dates = pd.date_range(end=pd.Timestamp.now(), periods=1000, freq='15min')
    df = pd.DataFrame({'timestamp': dates})
    
    # Mock base features
    df['segment_id'] = 'mock-segment-1'
    df['avg_speed'] = np.random.uniform(10, 80, size=len(df))
    df['vehicle_count'] = np.random.randint(10, 500, size=len(df))
    df['occupancy'] = np.random.uniform(0.1, 0.9, size=len(df))
    return df

def feature_engineering(df):
    print("Performing feature engineering (LWR & Queueing theory derived)...")
    df = df.sort_values('timestamp')
    
    # 1. Flow Rate (q = k * v) 
    # vehicle_count in 15 mins -> hourly flow rate
    df['flow_rate_hr'] = df['vehicle_count'] * 4 
    
    # 2. Density (k) = Flow / Speed (approx)
    # Avoid division by zero
    df['density'] = df['flow_rate_hr'] / df['avg_speed'].replace(0, 1)
    
    # 3. Queueing arrival/service ratio (rho proxy)
    # Assume arbitrary service rate of 2000 veh/hr for the segment
    df['rho_proxy'] = df['flow_rate_hr'] / 2000.0
    
    # Time-based features
    df['hour'] = df['timestamp'].dt.hour
    df['dayofweek'] = df['timestamp'].dt.dayofweek
    df['is_weekend'] = df['dayofweek'].apply(lambda x: 1 if x >= 5 else 0)
    
    # Create Target: Predict congestion level 15-mins into the future
    # We will predict future 'avg_speed' as the regression target, 
    # and map it to Low/Medium/High for classification metrics.
    df['target_speed'] = df['avg_speed'].shift(-1)
    df = df.dropna()
    
    return df

def map_to_congestion_class(speed, speed_limit=80):
    ratio = speed / speed_limit
    if ratio > 0.7:
        return 0 # Low
    elif ratio > 0.4:
        return 1 # Medium
    else:
        return 2 # High

def create_lstm_model(input_shape):
    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=input_shape),
        Dropout(0.2),
        LSTM(50),
        Dropout(0.2),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mse')
    return model

def create_ann_model(input_dim):
    model = Sequential([
        Dense(64, activation='relu', input_dim=input_dim),
        Dropout(0.2),
        Dense(32, activation='relu'),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mse')
    return model

def train_and_log_models():
    df = fetch_or_mock_data()
    df = feature_engineering(df)
    
    features = ['avg_speed', 'vehicle_count', 'occupancy', 'flow_rate_hr', 'density', 'rho_proxy', 'hour', 'is_weekend']
    X = df[features].values
    y = df['target_speed'].values
    
    # Time-based split (not random)
    split_idx = int(len(df) * 0.8)
    X_train, X_test = X[:split_idx], X[split_idx:]
    y_train, y_test = y[:split_idx], y[split_idx:]
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # True classification labels for metrics
    y_test_class = [map_to_congestion_class(s) for s in y_test]
    
    models = {
        "Linear Regression": LinearRegression(),
        "Decision Tree": DecisionTreeRegressor(max_depth=5),
        "Random Forest": RandomForestRegressor(n_estimators=50, max_depth=5),
        "SVM": SVR(kernel='rbf')
    }
    
    best_rf_model = None
    
    for name, model in models.items():
        with mlflow.start_run(run_name=name):
            print(f"Training {name}...")
            model.fit(X_train_scaled, y_train)
            preds = model.predict(X_test_scaled)
            
            mae = mean_absolute_error(y_test, preds)
            rmse = np.sqrt(mean_squared_error(y_test, preds))
            
            pred_class = [map_to_congestion_class(s) for s in preds]
            acc = accuracy_score(y_test_class, pred_class)
            f1 = f1_score(y_test_class, pred_class, average='weighted')
            
            mlflow.log_metrics({"MAE": mae, "RMSE": rmse, "Accuracy": acc, "F1": f1})
            mlflow.sklearn.log_model(model, "model")
            
            if name == "Random Forest":
                best_rf_model = model
    
    # ANN
    with mlflow.start_run(run_name="ANN"):
        print("Training ANN...")
        ann = create_ann_model(X_train_scaled.shape[1])
        ann.fit(X_train_scaled, y_train, epochs=10, batch_size=32, verbose=0)
        ann_preds = ann.predict(X_test_scaled).flatten()
        
        mae = mean_absolute_error(y_test, ann_preds)
        rmse = np.sqrt(mean_squared_error(y_test, ann_preds))
        pred_class = [map_to_congestion_class(s) for s in ann_preds]
        acc = accuracy_score(y_test_class, pred_class)
        f1 = f1_score(y_test_class, pred_class, average='weighted')
        
        mlflow.log_metrics({"MAE": mae, "RMSE": rmse, "Accuracy": acc, "F1": f1})
        mlflow.keras.log_model(ann, "model")
        
    # LSTM (Requires reshaping [samples, time_steps, features])
    # For simplicity, time_steps = 1
    X_train_lstm = X_train_scaled.reshape((X_train_scaled.shape[0], 1, X_train_scaled.shape[1]))
    X_test_lstm = X_test_scaled.reshape((X_test_scaled.shape[0], 1, X_test_scaled.shape[1]))
    
    best_lstm_model = None
    with mlflow.start_run(run_name="LSTM"):
        print("Training LSTM...")
        lstm = create_lstm_model((X_train_lstm.shape[1], X_train_lstm.shape[2]))
        lstm.fit(X_train_lstm, y_train, epochs=10, batch_size=32, verbose=0)
        lstm_preds = lstm.predict(X_test_lstm).flatten()
        
        mae = mean_absolute_error(y_test, lstm_preds)
        rmse = np.sqrt(mean_squared_error(y_test, lstm_preds))
        pred_class = [map_to_congestion_class(s) for s in lstm_preds]
        acc = accuracy_score(y_test_class, pred_class)
        f1 = f1_score(y_test_class, pred_class, average='weighted')
        
        mlflow.log_metrics({"MAE": mae, "RMSE": rmse, "Accuracy": acc, "F1": f1})
        mlflow.keras.log_model(lstm, "model")
        best_lstm_model = lstm
        
    # Save the ensemble (Random Forest + LSTM components) for production serving
    print("Saving production models and scaler...")
    os.makedirs('apps/ml-service/models', exist_ok=True)
    joblib.dump(scaler, 'apps/ml-service/models/scaler.pkl')
    joblib.dump(best_rf_model, 'apps/ml-service/models/rf_model.pkl')
    best_lstm_model.save('apps/ml-service/models/lstm_model.h5')
    
    print("Training complete. Run 'mlflow ui' to view the comparison report.")

if __name__ == "__main__":
    train_and_log_models()
