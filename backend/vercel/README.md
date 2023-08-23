## Testing locally

Start ngrok: `ngrok http https://localhost:8082`

Grab the generated URL, example: `https://c0fd-75-166-97-48.ngrok-free.app`

Modify the projectID check in `vercel.HandleLog`

```diff
-       projectVerboseID := r.Header.Get(LogDrainProjectHeader)
-       projectID, err := model2.FromVerboseID(projectVerboseID)
-       if err != nil {
-               log.WithContext(r.Context()).WithError(err).WithField("projectVerboseID", projectVerboseID).Error("failed to parse highlight project id from vercel request")
-               http.Error(w, err.Error(), http.StatusBadRequest)
-               return
-       }
+       // projectVerboseID := r.Header.Get(LogDrainProjectHeader)
+       // projectID, err := model2.FromVerboseID(projectVerboseID)
+       // if err != nil {
+       //      log.WithContext(r.Context()).WithError(err).WithField("projectVerboseID", projectVerboseID).Error("failed to parse highlight project id from
 vercel request")
+       //      http.Error(w, err.Error(), http.StatusBadRequest)
+       //      return
+       // }
+       projectID := 3
```


Set up a log drain using the following config

![Screenshot 2023-08-10 at 1 06 16 PM](https://github.com/highlight/highlight/assets/58678/cf1d18ea-257e-414c-85fc-bf3e46a242c3)

Click "Test Log Drain"

Wait about a minute for the logs to go through the OTEL pipeline

Observe logs in app with the start date set to 2022 (Vercel hardcodes the timestamp to something really old using Test Log Drain)

![Screenshot 2023-08-10 at 1 07 55 PM](https://user-images.githubusercontent.com/58678/259855002-39529705-c85d-4187-90c5-710171665807.png)