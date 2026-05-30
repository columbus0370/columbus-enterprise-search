from pydantic import BaseModel
from typing import Any


class Company(BaseModel):
    id: str
    name: str
    industry: str | None = None
    sales: int | None = None
    employees: int | None = None
    prefecture: str | None = None
    address: str | None = None
    capital: int | None = None
    established: str | None = None
    phone: str | None = None
    url: str | None = None


class SearchResponse(BaseModel):
    status: str
    data: list[Company]
    total_count: int
    page: int
    per_page: int


class ProposalData(BaseModel):
    proposal_text: str
    subject: str
    tone: str = "professional"
    generated_at: str


class ProposalResponse(BaseModel):
    status: str
    data: ProposalData


class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
    detail: Any = None
