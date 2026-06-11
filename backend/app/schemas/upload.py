from pydantic import BaseModel


class UploadOut(BaseModel):
    id: int
    filename: str
    status: str
    total_rows: int | None = None
    valid_rows: int | None = None
    error_rows: int | None = None
    error_log: str | None = None


class ConfirmUploadRequest(BaseModel):
    confirmed_rows: list[int]
    ignored_rows: list[int] = []
