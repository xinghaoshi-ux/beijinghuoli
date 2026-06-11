from pydantic import BaseModel, ConfigDict


class ApiResponse(BaseModel):
    data: object | None = None
    message: str = "ok"


class PaginatedResponse(BaseModel):
    data: list
    total: int
    page: int
    page_size: int


class OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
