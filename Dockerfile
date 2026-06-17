# Use an official Python runtime
FROM python:3.12-slim
# Set the working directory to backend
WORKDIR /app

# Install system dependencies (needed for some Python packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files
COPY backend/ .

# Expose the port Railway will use
EXPOSE 8000

# Start the app using the command you'd run locally
CMD ["python", "main.py"]