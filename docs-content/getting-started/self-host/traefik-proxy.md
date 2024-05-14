---
title: Development deployment guide.
slug: welcome-to-highlight
quickstart: true
---

# Highlight Deployment with Traefik on Docker

## Q1: How to deploy Highlight with Traefik on Docker?

### Question:

Has anyone successfully deployed Highlight with Traefik in front on a Docker machine? I need some ideas on how to change
the `compose.yml` and what ports I need to route over Traefik.

### Answer:

To deploy Highlight with Traefik on Docker, you can follow these steps:

1. **Modify `docker/compose.hobby.yml`**: Update the file for port forwarding and set environment variables
   like `REACT_APP_PRIVATE_GRAPH_URI`, `REACT_APP_PUBLIC_GRAPH_URI`, and `REACT_APP_FRONTEND_URI` with the backend IP
   address and desired ports.

2. **Enable SSL**: Update certificates in `backend/localhostssl` and set the `SSL` environment variable to `true`
   in `docker/.env`. If using Traefik for TLS termination, set `SSL=false`.

3. **Traefik Configuration**:
    - Create a network called `proxy` or `web` and add all containers to this network.
    - Configure Traefik container to listen on ports 443 and 80.
    - Use labels in your Docker configuration to set Traefik rules, services, and middlewares.

4. **Example Configuration**:
   ```yaml
   services:
     backend:
       labels:
         - \"traefik.enable=true\"
         - \"traefik.http.routers.backend.rule=Host(`yourdomain.com`)\"
         - \"traefik.http.services.backend-service.loadbalancer.server.port=8082\"
   ```

5. **Let's Encrypt**: Configure Traefik to use Let's Encrypt for SSL certificate generation.

6. **Testing**: Ensure that your setup routes requests correctly to the Highlight container. If there are issues, check
   if the HTTP request reaches the Highlight backend from Traefik on the specified port.

For detailed guidance, refer to
the [Highlight documentation on self-hosting](https://www.highlight.io/docs/getting-started/self-host/self-hosted-hobby-guide)
and explore Traefik's documentation for additional configurations.

## Q2: How to integrate error monitoring for a React frontend and Flask backend using Highlight?

### Question:

I'm setting up full-stack monitoring for a React frontend and Flask backend using Highlight. How can I ensure that
errors from the backend are captured and linked to the frontend sessions?

### Answer:

To integrate error monitoring for your React frontend and Flask backend with Highlight, follow these steps:

1. **Frontend Initialization**:
   ```javascript
   
   H.init('<YOUR_PROJECT_ID>', {
           tracingOrigins: true,
           networkRecording: {
               enabled: true,
               recordHeadersAndBody: true,
           },
   });
   ```

2. **Backend Initialization**:
   ```python
   import highlight_io
   from highlight_io.integrations.flask import FlaskIntegration as HighlightFlaskIntegration
   
   highlight_io.H('<YOUR_PROJECT_ID>', integrations=[HighlightFlaskIntegration()]);
   ```

3. **Error Simulation**: Introduce a deliberate error (e.g., divide by zero) in your backend endpoint. Ensure the
   frontend can trigger this endpoint.

4. **Check Integration**:
    - Confirm that the frontend is connected and can record sessions in the Highlight UI.
    - Verify that when the backend error occurs, it appears in the Highlight frontend sessions.

5. **Troubleshooting**:
    - If the backend setup process does not complete or errors are not reported, check for any conflicts with other
      integrations (e.g., Sentry).
    - Ensure that the Flask integration is correctly capturing and forwarding errors to Highlight.

6. **Advanced Configuration**:
    - Consider using the `H.trace` context manager in Flask to ensure that manual errors are recorded correctly.
    - Upgrade your Highlight SDK if using an outdated version to benefit from the latest features and fixes.

By following these steps, you should be able to monitor both frontend interactions and backend errors within Highlight,
providing a comprehensive view of your application's health and performance.
