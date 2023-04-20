from flask import Flask, g, request, render_template, jsonify
from sqlalchemy import create_engine
from unpickle import pickle_predict
import json

app = Flask(__name__, static_url_path='')

def connect_to_database():
    URI = "dublinbikesdatabase.ck8yyafvjq4p.eu-west-1.rds.amazonaws.com"
    PASSWORD = "Grouptwentysix"
    PORT = "3306"
    DB = "dbbikes"
    USER = "Group26"
    engine = create_engine("mysql+mysqldb://{}:{}@{}:{}/{}".format(USER, PASSWORD, URI, PORT, DB), echo=True)
    return engine.connect()

def get_database():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = connect_to_database()
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

#station-info info means back end
@app.route("/station-info/<int:station_id>")
def get_station_info(station_id):
    engine = get_database()
    data = []
    rows = engine.execute("SELECT * from station where number = {};".format(station_id))
    for row in rows:
        data.append(dict(row))
    return jsonify(data)

#bike info means back end
@app.route("/bike-info")
def get_bike_info():
    engine = get_database()
    stations = []
    rows = engine.execute("SELECT * from station;")
    for row in rows:
        stations.append(dict(row))
    return jsonify(stations)

#bike info means back end
@app.route("/bike-info/<int:station_id>")
def get_bike_availability(station_id):
    engine = get_database()
    data = []
    rows = engine.execute("SELECT * from availability where number = {};".format(station_id))
    for row in rows:
        data.append(dict(row))
    return jsonify(data)

#will need to update index.html to latest code
@app.route("/index")
@app.route("/")
def index():
    return render_template("index.html")

#station means front end
@app.route("/station/all")
def all_stations():
    return render_template("stations-all.html")

#station means front end
@app.route("/station/<int:station_id>")
def specific_stations(station_id):
    return render_template("stations-specific.html", station_id=station_id)

#about means front end
@app.route("/about")
def about():
    return render_template("about.html")

@app.route('/predict', methods=['POST'])
def predict():
    # Get user input values from request object
    station_number = request.form.get('station_number')
    weather = request.form.get('weather')
    description = request.form.get('description')
    temp = request.form.get('temp')
    feels_like = request.form.get('feels_like')
    humidity = request.form.get('humidity')
    wind_speed = request.form.get('wind_speed')
    day = request.form.get('date')
    hour = request.form.get('hour')

    # Call pickle_predict() function with user input values
    prediction = pickle_predict(station_number, weather, description, temp, feels_like, humidity, wind_speed, day, hour)

    # Return predicted values as JSON response
    response = {'available_bikes': prediction[0], 'available_stands': prediction[1]}
    return jsonify(response)


if __name__ == "__main__":
    app.run(port=8080)

#need to add availability functionality route
#need to add distance calculation functionality route
#need to ad weather information route
#reconnect to server