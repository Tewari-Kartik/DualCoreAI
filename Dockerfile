# Use a modern, supported Python version
FROM python:3.12-slim

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements FIRST to leverage Docker cache
COPY backend/requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# DEBUG: List installed packages to verify FastAPI is there
RUN pip list

# Copy the rest of the backend files
COPY backend/ .

# Expose the port Railway uses
EXPOSE 8000

# Start the app
CMD ["python", "main.py"]