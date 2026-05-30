from fastapi import HTTPException


class GBizInfoError(Exception):
    def __init__(self, message: str, status_code: int = 502):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class ClaudeAPIError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


def raise_bad_request(message: str):
    raise HTTPException(status_code=400, detail=message)


def raise_service_unavailable(message: str):
    raise HTTPException(status_code=503, detail=message)
