import pickle
import pandas as pd
from sklearn.model_selection import train_test_split

station_number = '50'  # replace with the desired station number

bikes_model_filename = f"machine-learning/pickle-files/bikes_station_{station_number}.pkl"
stands_model_filename = f"machine-learning/pickle-files/stands_station_{station_number}.pkl"

bikes_model = pickle.load(open(bikes_model_filename, 'rb'))
stands_model = pickle.load(open(stands_model_filename, 'rb'))

# Load the cleaned_training_dataset_2.csv file
df = pd.read_csv('cleaned_training_dataset_2.csv')

# Filter the data for the specific station
df_station = df[df['Station'] == int(station_number)]

# One-hot encode the categorical features
DF = pd.get_dummies(df_station, columns=['Station', 'Weather', 'Description', 'Day'])

# Separate features and targets
X = DF.drop(['Available Bikes', 'Available Stands'], axis=1)
y_bikes = DF['Available Bikes']
y_stands = DF['Available Stands']

# Split the data into train and test sets
X_train, X_test, y_train_bikes, y_test_bikes, y_train_stands, y_test_stands = train_test_split(X, y_bikes, y_stands, test_size=0.2, random_state=36)

# Prepare input data for prediction (replace with actual values)
input_data = {
    'Weather': 'Clear',
    'Description': 'clear sky',
    'Temp': None,  # Make Temp optional
    'Feels Like': None,  # Make Feels Like optional
    'Humidity': None,  # Make Humidity optional
    'Wind Speed': None,  # Make Wind Speed optional
    'Day': 'Weekday',
    'Hour': '14'  # 2 PM
}

# Set default values for optional properties
default_values = {
    'Temp': df['Temp'].mean(),
    'Feels Like': df['Feels Like'].mean(),
    'Humidity': df['Humidity'].mean(),
    'Wind Speed': df['Wind Speed'].mean()
}

# Replace None values in input_data with default values
for key, value in default_values.items():
    if input_data[key] is None:
        input_data[key] = value

input_df = pd.DataFrame([input_data])

# Perform one-hot encoding for categorical features (similar to the training data)
input_df = pd.get_dummies(input_df, columns=['Weather', 'Description', 'Day', 'Hour'])

# Make sure the columns in the input dataframe are in the same order as the training data.
# Add missing columns with all 0s
missing_columns = set(X_train.columns) - set(input_df.columns)
for col in missing_columns:
    input_df[col] = 0

input_df = input_df[X_train.columns]  # Reorder columns to match the training data

predicted_bikes = bikes_model.predict(input_df)
predicted_stands = stands_model.predict(input_df)

print(f"Predicted available bikes at station {station_number}: {predicted_bikes[0]:.0f}")
print(f"Predicted available bike stands at station {station_number}: {predicted_stands[0]:.0f}")