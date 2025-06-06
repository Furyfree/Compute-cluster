# Node.js version 24 with slim
FROM node:24-slim

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


COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "run", "dev"]
