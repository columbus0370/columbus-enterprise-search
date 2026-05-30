from fastapi import APIRouter, Request, HTTPException
from models.request import SearchRequest
from services.gbizinfo import search_companies, PER_PAGE
from services.rate_limiter import limiter
from utils.validators import validate_search_params
from utils.errors import GBizInfoError

router = APIRouter()

INDUSTRIES = [
    "製造業",
    "卸売業",
    "小売業",
    "情報処理・提供サービス業",
    "建設業",
    "運輸業",
    "通信業",
    "その他",
]


@router.get("/industries")
async def get_industries():
    return {"status": "success", "data": INDUSTRIES}


@router.post("/search")
@limiter.limit("10/minute")
async def search(request: Request, body: SearchRequest):
    validate_search_params(
        body.sales_min, body.sales_max,
        body.employee_min, body.employee_max,
        body.capital_stock_from, body.capital_stock_to,
    )

    try:
        result = await search_companies(
            industry=body.industry,
            sales_min=body.sales_min,
            sales_max=body.sales_max,
            employee_min=body.employee_min,
            employee_max=body.employee_max,
            prefecture=body.prefecture,
            page=body.page,
            name=body.name,
            corporate_number=body.corporate_number,
            corporate_type=body.corporate_type,
            capital_stock_from=body.capital_stock_from,
            capital_stock_to=body.capital_stock_to,
            city=body.city,
            founded_year=body.founded_year,
            exist_flg=body.exist_flg,
        )
    except GBizInfoError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)

    return {
        "status": "success",
        "data": result["results"],
        "total_count": result["max_results"],
        "page": body.page,
        "per_page": PER_PAGE,
    }
