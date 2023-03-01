import requests
import json
import time
import traceback
from datetime import datetime 
from sqlalchemy import create_engine

URI = "dbbikes.ck8yyafvjq4p.eu-west-1.rds.amazonaws.com"
PASSWORD = "Grouptwentysix"
PORT = "3306"
DB = "dbbikes"
USER = "Group26"

engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)
bike_url = "https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=a572dc37b128fb280c9e1621093640367863e160"
weather_url = "https://api.openweathermap.org/data/2.5/weather?q=Dublin,IE&APPID=e27ae2a7d7babf283e771962901cd48f"

def availability_to_db(text):
    stations = json.loads(text)
    now = datetime.now()
    print(type(stations), len(stations)) 
    for station in stations:
        print (station)
        bike_vals = (int(station.get('number')), 
                int(station.get('available_bikes')), 
                int(station.get('available_bike_stands')), 
                datetime.timestamp(now))
        engine.execute("insert into availability values (%s,%s,%s,%s)",bike_vals)
    return

def weather_to_db(text):
    weather = json.loads(text)
    weather_vals = (weather["weather"][0]["id"],
                    weather["weather"][0]["main"],
                    weather["weather"][0]["description"],
                    weather["main"]["temp"],
                    weather["main"]["feels_like"],
                    weather["main"]["humidity"],
                    weather["visibility"],
                    weather["wind"]["speed"],
                    weather["wind"]["deg"],
                    weather["clouds"]["all"],
                    weather["dt"])
    print(weather_vals)
    engine.execute("insert into weather values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",weather_vals)
    return

while True:
    try:
        bikes_response = requests.get(bike_url)
        availability_to_db(bikes_response.text)
        weather_response = requests.get(weather_url)
        weather_to_db(weather_response.text)
        time.sleep(5*60)
    except:
        print (traceback.format_exc())