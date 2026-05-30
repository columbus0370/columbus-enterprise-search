from pydantic import BaseModel, Field
from typing import Optional


class SearchRequest(BaseModel):
    industry: str
    name: Optional[str] = Field(default=None, max_length=100)
    corporate_number: Optional[str] = Field(default=None, max_length=13)
    corporate_type: Optional[str] = None  # e.g. "301" or "301,302"
    sales_min: int = Field(default=0, ge=0)
    sales_max: Optional[int] = Field(default=None, le=100_000_000_000)
    employee_min: int = Field(default=0, ge=0)
    employee_max: Optional[int] = Field(default=None, le=1_000_000)
    capital_stock_from: Optional[int] = Field(default=None, ge=0)
    capital_stock_to: Optional[int] = Field(default=None, ge=0)
    prefecture: str = "全国"
    city: Optional[str] = Field(default=None, max_length=3)  # 市区町村コード3桁
    founded_year: Optional[str] = Field(default=None, max_length=50)  # カンマ区切り年
    exist_flg: Optional[bool] = None
    page: int = Field(default=1, ge=1)


class ProposalRequest(BaseModel):
    company_name: str = Field(max_length=100)
    industry: str
    sales: int | None = None
    employees: int | None = None
    prefecture: str = ""
    custom_context: str = Field(default="", max_length=300)
