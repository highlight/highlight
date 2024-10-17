import pandas as pd
from prophet import Prophet
import json
import io
from flask import Flask
from flask import request
from flask import Response

app = Flask(__name__)

@app.route("/", methods=['POST'])
def main():
    return generate_prediction(request.get_json())

def generate_prediction(event):
    df = pd.read_json(io.StringIO(json.dumps(event['input'])))

    m = Prophet(changepoint_prior_scale=event['changepoint_prior_scale'], interval_width=event['interval_width'])
    m.fit(df)

    forecast = m.predict(df)
    return Response(forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_json(), mimetype='application/json')
