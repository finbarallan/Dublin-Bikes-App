#!/usr/bin/env python
# coding: utf-8

import requests
import json
import time
from datetime import datetime 
import sqlalchemy as sqla
from sqlalchemy import create_engine

URI = "group26db.charpzg5ii72.eu-west-1.rds.amazonaws.com"
PORT = "3306"
DB = "databaseg26"
USER = "Group26"
PASSWORD = "GroupTwentySix"

engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)

def availability_to_db(text):
    stations = json.loads(text)
    now = datetime.now()
    print(type(stations), len(stations)) 
    for station in stations:
        print (station)
        vals = (int(station.get('number')), int(station.get('available_bikes')),
                int(station.get('available_bike_stands')), datetime.timestamp(now))
        engine.execute("insert into availability values (%s,%s,%s,%s)",vals)
    return

url = "https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=a572dc37b128fb280c9e1621093640367863e160"

while True:
    response = requests.get(url)
    stations = json.loads(response.text)
    availability_to_db(response.text)
    time.sleep(300)




