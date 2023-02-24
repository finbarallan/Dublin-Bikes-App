import requests
import json
from math import radians, sin, cos, sqrt, atan2

# Get user's location (latitude, longitude) from device or input
user_latitude = 53.344868
user_longitude = -6.250682

# Get Dublin Bike station data
url = "https://api.jcdecaux.com/vls/v1/stations?contract=Dublin&apiKey=a572dc37b128fb280c9e1621093640367863e160"
response = requests.get(url)
stations = json.loads(response.text)

# Calculate distance between two coordinates using Haversine formula
# def haversine(lat1, lon1, lat2, lon2):
#     R = 6371  # radius of the earth in km
#     d_lat = radians(lat2 - lat1)
#     d_lon = radians(lon2 - lon1)
#     a = sin(d_lat / 2)  2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2)  2
#     c = 2 * atan2(sqrt(a), sqrt(1 - a))
#     distance = R * c
#     return distance

# Find the closest station to user's location
# min_distance = float('inf')
# closest_station = None
# for station in stations:
#     distance = haversine(user_latitude, user_longitude, station['position']['lat'], station['position']['lng'])
#     if distance < min_distance:
#         min_distance = distance
#         closest_station = station

# Get the available bikes information for the closest station
# available_bikes = closest_station['available_bikes']

# Display the information to the user
# print("Closest station: " + closest_station['name'])
# print("Available bikes: " + str(available_bikes))