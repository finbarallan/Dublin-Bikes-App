from flask import Flask, g, render_template, jsonify
from sqlalchemy import create_engine
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

#bike info means back end
@app.route("/bike_info")
def get_station_info():
    engine = get_database()
    stations = []
    rows = engine.execute("SELECT * from station;")
    for row in rows:
        stations.append(dict(row))
    return jsonify(stations=stations)

#bike info means back end
@app.route("/bike_info/<int:station_id>")
def get_station_availability(station_id):
    engine = get_database()
    data = []
    rows = engine.execute("SELECT available_bikes from availability where number = {};".format(station_id))
    for row in rows:
        data.append(dict(row))
    return jsonify(available=data)

#will need to update index.html to latest code
@app.route("/index")
@app.route("/")
def index():
    return render_template("index.html")

#station means front end
@app.route("/station/all")
def all_stations():
    return render_template("station.html")

#station means front end
@app.route("/station/<int:station_id>")
def specific_stations(station_id):
    return render_template("specific_station.html", station_id=station_id)

if __name__ == "__main__":
    app.run(port=8080)

#need to add availability functionality route
#need to add distance calculation functionality route
#need to ad weather information route