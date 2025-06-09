from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone

# Normally you'd keep this secret somewhere safe (like an env file)
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

def create_access_token(data: dict, expires_delta: timedelta = None):
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    #expire = datetime.now() + (expires_delta or timedelta(minutes=15))
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt, expire

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
