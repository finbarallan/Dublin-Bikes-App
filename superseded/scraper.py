import requests
import json
import time
import traceback
import datetime

name = "Dublin"
stations = "https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=a572dc37b128fb280c9e1621093640367863e160"
api_key = "a572dc37b128fb280c9e1621093640367863e160"

while True:
    try:
        url = "https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=a572dc37b128fb280c9e1621093640367863e160"
        response = requests.get(url)
        stations = json.loads(response.text)
        
        print(response.text)
        file_name = datetime.datetime.now().strftime("%I:%M%p on %B %d, %Y")
        with open(f'{file_name}.json', 'w') as fp:
            json.dump(stations, fp)

        # now sleep for 5 minutes
        time.sleep(5)
    except:
        # if there is any problem, print the traceback
        print(traceback.format_exc())