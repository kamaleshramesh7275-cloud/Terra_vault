"""Terra_vault — MinIO client utilities"""
import asyncio
from pathlib import Path

from minio import Minio
from minio.error import S3Error

from core.config import settings

_client = Minio(
    settings.MINIO_ENDPOINT,
    access_key=settings.MINIO_ACCESS_KEY,
    secret_key=settings.MINIO_SECRET_KEY,
    secure=settings.MINIO_SECURE,
)


async def ensure_bucket(bucket_name: str):
    """Create MinIO bucket if it doesn't exist."""
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _ensure_bucket_sync, bucket_name)


def _is_minio_reachable() -> bool:
    import socket
    try:
        host, port = settings.MINIO_ENDPOINT.split(":")
        with socket.create_connection((host, int(port)), timeout=0.5):
            return True
    except Exception:
        return False


def _ensure_bucket_sync(bucket_name: str):
    if not _is_minio_reachable():
        return
    try:
        if not _client.bucket_exists(bucket_name):
            _client.make_bucket(bucket_name)
    except Exception:
        pass


def upload_file_sync(local_path: str, object_name: str) -> str:
    """Upload file to MinIO and return the object URL. Fallbacks to local static directory if offline."""
    if _is_minio_reachable():
        try:
            _client.fput_object(
                settings.MINIO_BUCKET,
                object_name,
                local_path,
            )
            return f"http://{settings.MINIO_ENDPOINT}/{settings.MINIO_BUCKET}/{object_name}"
        except Exception:
            pass
    import shutil
    dest = Path(settings.DATA_DIR) / "static" / object_name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(local_path, dest)
    return f"http://localhost:8000/static/{object_name}"


async def upload_file(local_path: str, object_name: str) -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, upload_file_sync, local_path, object_name)


def get_presigned_url(object_name: str, expires_hours: int = 24) -> str:
    """Generate a pre-signed URL for temporary access."""
    from datetime import timedelta
    try:
        url = _client.presigned_get_object(
            settings.MINIO_BUCKET, object_name,
            expires=timedelta(hours=expires_hours)
        )
        return url
    except Exception:
        return f"http://localhost:8000/static/{object_name}"
