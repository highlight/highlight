--- a/packages/predictions/src/main.py
+++ b/packages/predictions/src/main.py
@@ -1,6 +1,6 @@
 import pandas as pd
-from prophet import Prophet
+from sklearn.ensemble import RandomForestRegressor
 import json
 import io
-from flask import Flask
-from flask import request
-from flask import Response
+import bottle

 app = bottle.Bottle()

@@ -10,7 +10,7 @@
 def generate_prediction(event):
     df = pd.read_json(io.StringIO(json.dumps(event['input'])))
 
-    m = Prophet(changepoint_prior_scale=event['changepoint_prior_scale'], interval_width=event['interval_width'])
-    m.fit(df)
+    m = RandomForestRegressor()
+    m.fit(df.drop('ds', axis=1), df['y'])

 # Replace Flask route with Bottle route
@@ -20,7 +20,7 @@
-@app.route("/", methods=['POST'])
+@app.post("/")
 def main():
     return generate_prediction(bottle.request.json)
 
--- /dev/null
+++ b/packages/predictions/src/requirements.txt
@@ -0,0 +1 @@
+bottle
