# Highlight.io WordPress Plugin Testing Environment

This Docker setup provides a local WordPress environment for testing the Highlight.io WordPress plugin.

## Prerequisites

- Docker
- Docker Compose

## Setup

1. Navigate to the `e2e/wordpress` directory in your terminal.

2. Start the Docker containers:

   ```
   docker-compose up -d
   ```

   This command will start a WordPress instance and a MySQL database.

3. Access the WordPress site at `http://localhost:8000`.

4. Complete the WordPress installation process.

5. Log in to the WordPress admin panel at `http://localhost:8000/wp-admin`.

6. Navigate to "Plugins" in the WordPress admin sidebar.

7. Activate the "Highlight.io Session Recording" plugin.

## Plugin Development

The Highlight.io plugin directory is mounted as a volume in the WordPress container. This means you can make changes to the plugin files in your local `sdk/highlight-wordpress/highlight-io` directory, and they will be immediately reflected in the Docker WordPress environment.

## Stopping the Environment

To stop the Docker containers, run:

```
docker-compose down
```

To stop the containers and remove all data (database included), run:

```
docker-compose down -v
```

## Troubleshooting

If you encounter any issues:

1. Ensure Docker is running on your machine.
2. Check the Docker logs for any error messages:
   ```
   docker-compose logs
   ```
3. If changes to the plugin aren't reflecting, try restarting the containers:
   ```
   docker-compose restart
   ```

## Note

This setup is for development and testing purposes only. Do not use it in a production environment.
