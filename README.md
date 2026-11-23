# Fieldnotes — MERN Blog (CSE 3395 Assignment 4)

## 1. Assignment introduction

This project demonstrates containerization, cloud deployment, and CI/CD for a small MERN (MongoDB, Express, React, Node.js) blog. It includes a React interface for reading and publishing posts, an Express API, Dockerfiles, Docker Compose, and GitHub Actions workflows.

The original workspace did not contain an application, so this submission includes a small assignment-sized blog implementation rather than modifying an existing app.

## 2. Project description

Visitors can view blog posts and submit a post with a title, optional author name, and body. Posts are stored in MongoDB. TanStack Query fetches and refreshes the list after a successful post.

## 3. Technologies

- **React and Vite** — browser interface and frontend build
- **TanStack Query** — API fetching, mutation, and cache refresh
- **Node.js and Express** — backend HTTP API
- **Mongoose and MongoDB** — blog post schema and persistence
- **Jest and Supertest** — backend API tests
- **Docker and Docker Compose** — container images and local multi-service setup
- **Docker Hub** — remote image registry (account and push still required)
- **GitHub Actions** — CI checks and main-branch deployment workflow
- **Google Cloud Run** — intended public container hosting (project setup and deployment still required)
- **MongoDB Atlas** — intended managed cloud database (cluster setup and credentials still required)

## 4. Folder structure

```text
.
├── .github/workflows/
│   ├── backend-ci.yml
│   ├── frontend-ci.yml
│   └── deploy.yml
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── models/Post.js
│   │   ├── routes/posts.js
│   │   └── server.js
│   ├── tests/posts.test.js
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── screenshots/README.md
├── .env.example
├── .gitignore
└── docker-compose.yml
```

Each app has its own `package-lock.json`; build outputs and dependencies are not source files.

## 5. API endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Container and deployment health check |
| `GET` | `/api/posts` | Return blog posts, newest first |
| `POST` | `/api/posts` | Create a post |

Example request body:

```json
{
  "title": "A first note",
  "author": "Student",
  "content": "Hello from the blog."
}
```

`title` and `content` are required. The API returns HTTP 400 for missing required fields.

## 6. Dockerfiles and Compose

- `backend/Dockerfile` uses the official Node.js 22 Alpine image, installs production dependencies from the lockfile, copies backend source, and starts Express on port `4000`.
- `frontend/Dockerfile` uses a Node.js build stage to create the Vite production bundle, then copies the output into Nginx. Nginx listens on port `8080`, serves the React single-page app, and proxies `/api/` to the Compose backend. `VITE_API_URL` is a build argument: `/api` locally, or the backend URL for the deployed frontend.
- `.dockerignore` files keep dependency directories, build outputs, Git metadata, and environment files out of image build contexts.
- `docker-compose.yml` runs `frontend`, `backend`, and `mongodb` on one Docker network. MongoDB data is stored in the named volume `mongodb_data`. A normal `docker compose down` keeps the volume.

### Run locally

Install/start Docker Desktop first, then open PowerShell in the project root:

```powershell
docker compose up --build
```

This builds the two application images and starts MongoDB and the applications. Open <http://localhost:8080>. The API is also available at <http://localhost:4000/health>. In another terminal:

```powershell
docker compose ps
docker compose logs
docker compose down
```

To follow one service's logs, use `docker compose logs -f backend` or `docker compose logs -f mongodb`. Do **not** add `-v` to `docker compose down` if you want to keep the MongoDB data. `docker compose down -v` deletes the named data volume.

The Compose default `DATABASE_URL` is `mongodb://mongodb:27017/blog`; `mongodb` is the Compose service name, not `localhost`. To override configuration, copy `.env.example` to `.env` and set values there. Never commit `.env`.

## 7. MongoDB Atlas setup

Atlas is not configured in this workspace; no database URL or credentials have been supplied.

1. Sign in to MongoDB Atlas and create a project and a free/shared cluster suitable for the assignment.
2. In **Database Access**, create a database user and grant read/write access to the application database. Use a unique password; URL-encode special characters when inserting it into a connection URI.
3. In **Network Access**, allow only the public egress IP addresses that need access. For local testing, add your current IP. For Cloud Run, configure an appropriate secure network route/IP strategy for your Atlas tier. Avoid `0.0.0.0/0` except as a short-lived lab diagnostic; remove it afterward.
4. Select **Connect → Drivers** and copy the provided URI. Replace the documented username, password, and database placeholders with your own values. Do not paste credentials into source code, a screenshot, or chat.
5. Test the URI with the application, setting backend `DATABASE_URL` to that exact value. For Cloud Run automation, add it as the GitHub Actions secret `MONGODB_URI`; the workflow passes it to the backend as `DATABASE_URL`.

The URI shape is provided by Atlas; this project does not invent a username, password, host, or connection string.

## 8. Docker Hub image publishing

Create a Docker Hub account, then create two **public** repositories named `blog-backend` and `blog-frontend`. Public images allow Cloud Run to pull them without separate Docker Hub pull credentials. Choose a Docker Hub access token, not your account password.

From the project root in PowerShell, replace the username placeholder by setting an environment variable:

```powershell
$env:DOCKERHUB_USERNAME = Read-Host "Docker Hub username"
docker build -t "$($env:DOCKERHUB_USERNAME)/blog-backend:latest" .\backend
docker build --build-arg VITE_API_URL=https://<BACKEND_CLOUD_RUN_URL> -t "$($env:DOCKERHUB_USERNAME)/blog-frontend:latest" .\frontend
docker login --username $env:DOCKERHUB_USERNAME
docker push "$($env:DOCKERHUB_USERNAME)/blog-backend:latest"
docker push "$($env:DOCKERHUB_USERNAME)/blog-frontend:latest"
```

When `docker login` prompts for a password, provide the access token. Replace `<BACKEND_CLOUD_RUN_URL>` with the actual backend URL after deploying it; do not include angle brackets. The frontend image used locally by Compose is built with `/api` and the Compose Nginx proxy.

Verify the two image tags on your Docker Hub profile. Repository links are **not yet available**; create the repositories and record their actual URLs here for submission:

- Backend: `https://hub.docker.com/r/<DOCKERHUB_USERNAME>/blog-backend`
- Frontend: `https://hub.docker.com/r/<DOCKERHUB_USERNAME>/blog-frontend`

## 9. Google Cloud Run deployment

No Google Cloud project, credentials, or deployment is configured yet. Do not treat example values or this workflow as proof of deployment.

### One-time account setup

1. Create/sign in to a Google Cloud account, create a project, attach billing if required, and note the real project ID.
2. Enable the **Cloud Run**, **Cloud Resource Manager**, and **Identity and Access Management (IAM)** APIs in that project.
3. Install the Google Cloud CLI, then authenticate locally with `gcloud auth login` and `gcloud config set project <PROJECT_ID>`.
4. For GitHub deployment, create a dedicated service account and grant only the needed deployment permissions: Cloud Run Admin (`roles/run.admin`) and Service Account User (`roles/iam.serviceAccountUser`) for the runtime identity used by the service. Follow current Google guidance for service-account key policies; prefer Workload Identity Federation when available. If using the workflow's `GCP_SA_KEY` option, store the JSON key only as a protected GitHub secret and rotate/revoke it when no longer needed.
5. Create the two public Docker Hub repositories and configure the GitHub repository secrets described in the CI/CD section.
6. Create the Atlas cluster and ensure Cloud Run can reach it under Atlas network-access rules.

### Manual deployment outline

Deploy the backend image first, setting its actual `DATABASE_URL` to the Atlas URI and `CORS_ORIGIN=*` temporarily. Obtain the backend URL:

```powershell
gcloud config set project <PROJECT_ID>
gcloud run deploy blog-backend `
  --image docker.io/<DOCKERHUB_USERNAME>/blog-backend:latest `
  --region <REGION> --allow-unauthenticated --port 4000 `
  --set-env-vars "DATABASE_URL=$env:MONGODB_URI,CORS_ORIGIN=*"
$backendUrl = gcloud run services describe blog-backend --region <REGION> --format "value(status.url)"
```

Set `$env:MONGODB_URI` in your current secure shell session to your actual Atlas URI; never replace it with a real credential in a script committed to Git. Build the frontend with the actual backend URL, then deploy it:

```powershell
docker build --build-arg "VITE_API_URL=$backendUrl" `
  -t <DOCKERHUB_USERNAME>/blog-frontend:latest .\frontend
docker push <DOCKERHUB_USERNAME>/blog-frontend:latest
gcloud run deploy blog-frontend `
  --image docker.io/<DOCKERHUB_USERNAME>/blog-frontend:latest `
  --region <REGION> --allow-unauthenticated --port 8080
$frontendUrl = gcloud run services describe blog-frontend --region <REGION> --format "value(status.url)"
gcloud run services update blog-backend --region <REGION> `
  --update-env-vars "CORS_ORIGIN=$frontendUrl"
```

Replace angle-bracketed placeholders before running commands. Use public images or configure authenticated image pulling. Check `$backendUrl/health`, open `$frontendUrl`, and create a post. The backend must use the exact frontend origin for CORS after deployment.

## 10. GitHub Actions CI/CD

- `backend-ci.yml` runs on pushes and pull requests, installs locked Node.js 22 dependencies, and runs Jest.
- `frontend-ci.yml` runs on pushes and pull requests, installs locked dependencies, and builds the React app.
- `deploy.yml` runs on pushes to `main`. It repeats backend tests and the frontend build as prerequisite jobs, publishes backend and frontend images, deploys the backend, builds the frontend with the returned backend URL, deploys the frontend, sets the backend CORS origin to the actual frontend URL, and checks both service URLs.

The deploy workflow needs a GitHub repository with these **Actions secrets**:

| Secret | Value |
|---|---|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `GCP_PROJECT_ID` | Actual Google Cloud project ID |
| `GCP_SA_KEY` | Dedicated deployment service account JSON key (if using key-based auth) |
| `MONGODB_URI` | Actual MongoDB Atlas connection URI |

Optional **Actions variable** `GCP_REGION` selects a Cloud Run region; it defaults to `us-central1`. Do not put secret values in workflow YAML, source files, commits, or screenshots. Ensure the two Docker Hub repositories are public before deploying. A configured workflow does not mean it has run or succeeded.

To confirm CI/CD, inspect the repository's **Actions** tab after pushing. The deployment workflow only runs for `main`, and deployment waits for its own backend and frontend checks to pass.

## 11. Roles of the deployment tools (quick viva notes)

- **Docker:** packages an application and its runtime into a portable container.
- **Dockerfile:** instructions for building one container image.
- **Docker Compose:** starts related containers together and configures their network and storage.
- **Docker Hub:** stores and distributes container images.
- **GitHub Actions:** runs automated jobs when repository events occur.
- **Google Cloud Run:** runs container images as managed web services.
- **MongoDB Atlas:** hosts a managed MongoDB database in the cloud.
- **CI (Continuous Integration):** automatically checks code changes, here by testing the API and building the frontend.
- **CD (Continuous Deployment):** automatically publishes and deploys a passing main-branch change.

## 12. Testing and verification record

Completed locally:

- Backend Jest suite: **3 tests passed** (list posts, create/validate posts, health check).
- Frontend production build: **passed** with Vite.
- `docker compose config`: **passed**; the three services, networking, dependencies, health checks, and persistent volume resolve.

Not verified yet:

- Docker image builds and running containers: Docker Desktop's engine was unavailable when checked (`docker_engine` pipe not found).
- End-to-end browser/database persistence: requires starting Docker Desktop and running Compose.
- Atlas, Docker Hub, GitHub Actions, and Cloud Run: require accounts, credentials, and deployment actions. No deployment URLs or successful remote runs are claimed.

After Docker is running, verify local use by opening `http://localhost:8080`, publishing a post, refreshing the page, and checking that it remains. The application stores local Compose data in the persistent `mongodb_data` volume.

## 13. Challenges and solutions

- **Empty starting workspace:** there was no existing app to preserve, so the app and project setup had to be created for the assignment.
- **Container runtime unavailable during this setup:** Docker Compose configuration validation worked, but image builds and runtime checks must be repeated after Docker Desktop is started.
- **Credentials and accounts are user-specific:** Atlas, Docker Hub, GitHub, and Google Cloud values are placeholders until the student creates accounts and configures secrets. This avoids fabricated URLs, deployment results, and credentials.

## 14. Submission details to fill after deployment

- GitHub repository: **not created or pushed yet**
- Docker Hub backend repository: **not created yet**
- Docker Hub frontend repository: **not created yet**
- Cloud Run frontend URL: **not deployed**
- Cloud Run backend URL: **not deployed**
- Screenshots: see [screenshots/README.md](./screenshots/README.md); capture genuine results after running each stage.
