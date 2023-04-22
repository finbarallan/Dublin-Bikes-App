from sqlalchemy import create_engine
import pandas as pd
import csv

URI = "dublinbikesdatabase.ck8yyafvjq4p.eu-west-1.rds.amazonaws.com"
PORT = "3306"
DB = "dbbikes"
USER = "Group26"
PASSWORD = "Grouptwentysix"

engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)

avail_conn = engine.connect()
avail_result = avail_conn.execute("SELECT * FROM availability")
avail_data = avail_result.fetchall()
avail_conn.close()

with open("availability.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(avail_data)

weather_conn = engine.connect()
weather_result = weather_conn.execute("SELECT * FROM weather")
weather_data = weather_result.fetchall()
weather_conn.close()

with open("weather.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(weather_data)

stat_conn = engine.connect()
stat_result = stat_conn.execute("SELECT * FROM station")
stat_data = stat_result.fetchall()
stat_conn.close()

with open("station.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerows(stat_data)

dfa = pd.read_csv('availability.csv', names=['number', 'available_bikes', 'available_bike_stands', 'time'])

dfw = pd.read_csv('weather.csv', names=['id', 'main', 'description', 'temp', 'feels_like', 'humidity', 'visibility', 'speed','deg','all','dt'])

dfs = pd.read_csv('station.csv', names=['address', 'banking', 'bike_stands', 'bonus', 'contract_names', 'name', 'number', 'position_lat','position_lng','status'])