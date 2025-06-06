# Python version 3.12 with slim
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    gfortran \
    libssl-dev \
    libffi-dev \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    libblas-dev \
    liblapack-dev \
    libpq-dev \
    python3-dev \
    git \
    && rm -rf /var/lib/apt/lists/*


COPY requirements.txt .

RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"

RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
