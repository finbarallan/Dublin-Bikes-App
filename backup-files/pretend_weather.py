import requests
import json
from datetime import datetime


weather_url = "https://api.openweathermap.org/data/2.5/weather?q=Dublin,IE&APPID=e27ae2a7d7babf283e771962901cd48f"

weather_response = requests.get(weather_url)

now = datetime.now()
print(now)

timestamp = 1677665084
then = datetime.fromtimestamp(timestamp)
print(then)