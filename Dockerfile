FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    supervisor \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy frontend package files
COPY frontend/package*.json ./frontend/

# Install frontend dependencies (this will install correct platform binaries)
WORKDIR /app/frontend
RUN rm -rf node_modules package-lock.json 2>/dev/null || true
RUN npm install

# Copy rest of frontend (but node_modules will be mounted as volume)
WORKDIR /app

# Copy supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create log directories
RUN mkdir -p /var/log/vite /var/log/django

EXPOSE 5173 8000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]