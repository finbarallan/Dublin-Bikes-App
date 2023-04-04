from flask import Flask, g, render_template, jsonify
from sqlalchemy import create_engine
import json

app = Flask(__name__, static_url_path='')


def connect_to_database():
    URI = "dbbikes.ck8yyafvjq4p.eu-west-1.rds.amazonaws.com"
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

@app.route("/")
def hello():
    return "Hello World!"

@app.route('/')
def root():
    return render_template('index.html', MAPS_APIKEY=app.config["MAPS_APIKEY"])

@app.route("/station_info")
def get_stations():
    engine = get_database()
    stations = []
    rows = engine.execute("SELECT * from station;")
    for row in rows:
        stations.append(dict(row))
    return jsonify(stations=stations)

@app.route("/available/<int:station_id>")
def get_station(station_id):
    engine = get_database()
    data = []
    rows = engine.execute("SELECT available_bikes from availability where number = {};".format(station_id))
    for row in rows:
        data.append(dict(row))
    return jsonify(available=data)

@app.route("/stations")
def stations():
    return render_template("stations.html")

if __name__ == "__main__":
    app.run(port=8080)