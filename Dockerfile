FROM python:3.10

WORKDIR /app

# Copy only requirements first (better stability)
COPY requirements.txt .

# Install dependencies (more stable)
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy rest of project
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
