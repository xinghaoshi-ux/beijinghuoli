from fastapi import Request
from fastapi.responses import JSONResponse


class AppException(Exception):  # noqa: N818
    def __init__(self, detail: str, code: str, status_code: int = 400):
        self.detail = detail
        self.code = code
        self.status_code = status_code


class NotFoundError(AppException):
    def __init__(self, detail: str, code: str = "NOT_FOUND"):
        super().__init__(detail=detail, code=code, status_code=404)


class ConflictError(AppException):
    def __init__(self, detail: str, code: str = "CONFLICT"):
        super().__init__(detail=detail, code=code, status_code=409)


class ValidationAppError(AppException):
    def __init__(self, detail: str, code: str = "VALIDATION_ERROR"):
        super().__init__(detail=detail, code=code, status_code=422)


async def app_exception_handler(_: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "code": exc.code},
    )
