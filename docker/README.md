This folder contains Docker instructions for running the app locally.

Quick start (PowerShell):

# Build image and start services

docker-compose up --build

# The Next.js app will be available at http://localhost:3000

# Adminer (DB UI) at http://localhost:8080 (login: postgres/postgres)

Notes:

- The compose file configures a Postgres 15 container for development.
- The `web` service uses the project Dockerfile and sets `DATABASE_URL` to connect to the `db` service.
- After first start you may need to run migrations / prisma generate inside the container:
  # Open a shell in the running web container
  docker compose exec web sh
  # Inside container (example)
  npx prisma migrate deploy
  npx prisma generate

Security:

- This compose setup is intended for local development/demo only. Do NOT use these credentials in production.
