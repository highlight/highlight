import pandas as pd
from prophet import Prophet
from prophet.plot import plot_plotly, plot_components_plotly
import plotly.io as pio
pio.renderers.default = "vscode"

df = pd.read_json('./test.json')
print(df.tail())

m = Prophet(changepoint_prior_scale=0.25, interval_width=0.90)
m.fit(df)

future = m.make_future_dataframe(periods=1, freq="h")

forecast = m.predict(future)
print(forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].to_json())

plot_plotly(m, forecast)
# plot_components_plotly(m, forecast)
