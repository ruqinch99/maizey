# Maizey Chat Application

A full-stack chat application that interfaces with the Maizey API, built with Django REST Framework (backend) and Vue.js 3 (frontend).

## Tech Stack

### Backend
- **Django 5.2** - Web framework
- **Django REST Framework** - REST API
- **PostgreSQL** - Database
- **Python 3.12** - Programming language

### Frontend
- **Vue.js 3** - Frontend framework
- **TypeScript** - Type safety
- **Pinia** - State management
- **Tailwind CSS 4** - Styling
- **Vite** - Build tool

### DevOps
- **Docker & Docker Compose** - Containerization
- **PostgreSQL 15** - Database container

## Features

- 💬 Real-time chat interface with Maizey API
- 📝 Conversation history
- ✏️ Inline chat title editing
- 📄 Markdown rendering for bot responses
- 🎨 Modern, responsive UI with Tailwind CSS

## Prerequisites

- Docker and Docker Compose
- `.env` file with required environment variables (see below)

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd maizey
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```bash
# Database Configuration
DJANGO_DB_NAME=maizey
DJANGO_DB_USER=maizey_user
DJANGO_DB_PASSWORD=maizey_password
DJANGO_DB_HOST=
DJANGO_DB_PORT=

# Django settings
SECRET_KEY=your_secret_key_here
DEBUG=True

# Maizey API Configuration
MAIZEY_API_TOKEN=your_token_here
MAIZEY_PROJECT_PK=your_project_pk_here
MAIZEY_API_BASE_URL=https://umgpt.umich.edu/maizey/api
```

### 3. Start the application

```bash
docker-compose up --build
```

This will:
- Build the Docker image
- Start PostgreSQL database
- Start Django backend on port 8000
- Start Vue.js frontend (Vite dev server) on port 5173

### 4. Access the application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Database** (from host): `localhost:5434` (mapped to avoid conflict with local PostgreSQL)

## Development

### Running without Docker

#### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Access

#### Using Docker

```bash
# Connect to Docker PostgreSQL
docker exec -it maizey_db psql -U maizey_user -d maizey

# Or from host machine
psql -U maizey_user -d maizey -h localhost -p 5434
```

#### Using GUI Tools (Postico, pgAdmin, etc.)

- **Host**: `localhost`
- **Port**: `5434`
- **Database**: `maizey`
- **User**: `maizey_user`
- **Password**: (from `.env`)

## Project Structure

```
maizey/
├── backend/
│   ├── chat/              # Django app for conversations
│   │   ├── models.py      # Conversation and Message models
│   │   ├── views.py       # DRF ViewSets
│   │   ├── serializers.py # DRF serializers
│   │   └── urls.py        # URL routing
│   ├── maizey/            # Django project settings
│   ├── utils/
│   │   └── maizey_client.py  # Maizey API client
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Vue components
│   │   ├── stores/        # Pinia stores
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── Dockerfile
└── .env
```

## API Endpoints

- `GET /api/conversations/` - List all conversations
- `POST /api/conversations/` - Create a new conversation
- `GET /api/conversations/{pk}/` - Get a conversation
- `PATCH /api/conversations/{pk}/` - Update conversation (e.g., title)
- `GET /api/conversations/{pk}/messages/` - Get messages for a conversation
- `POST /api/conversations/{pk}/messages/send/` - Send a message

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DJANGO_DB_NAME` | PostgreSQL database name | Yes |
| `DJANGO_DB_USER` | PostgreSQL user | Yes |
| `DJANGO_DB_PASSWORD` | PostgreSQL password | Yes |
| `SECRET_KEY` | Django secret key | Yes |
| `DEBUG` | Django debug mode | No (default: True) |
| `MAIZEY_API_TOKEN` | Maizey API authentication token | Yes |
| `MAIZEY_PROJECT_PK` | Maizey project primary key | Yes |
| `MAIZEY_API_BASE_URL` | Maizey API base URL | No (default: https://umgpt.umich.edu/maizey/api) |

## Troubleshooting

### Database connection issues

If you see `FATAL: database "maizey_user" does not exist`, ensure:
- Docker containers are running: `docker-compose ps`
- Database environment variables match in `docker-compose.yml` and `.env`
- Wait for database healthcheck to pass

### Port conflicts

- **Port 5432**: If you have local PostgreSQL running, Docker maps to port 5434
- **Port 8000**: Django backend
- **Port 5173**: Vite dev server

### View logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs app
docker-compose logs db

# Follow logs
docker-compose logs -f app
```

### Reset database

```bash
# Stop containers and remove volumes
docker-compose down -v

# Rebuild and start
docker-compose up --build
```

## License

[Your License Here]
