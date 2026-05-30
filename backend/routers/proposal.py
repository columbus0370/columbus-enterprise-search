from datetime import datetime, timezone
from fastapi import APIRouter, Request, HTTPException
from models.request import ProposalRequest
from services.claude import generate_sales_email
from services.rate_limiter import limiter
from utils.errors import ClaudeAPIError

router = APIRouter()


@router.post("/generate-proposal")
@limiter.limit("20/minute")
async def generate_proposal(request: Request, body: ProposalRequest):
    try:
        subject, body_text = generate_sales_email(
            company_name=body.company_name,
            industry=body.industry,
            sales=body.sales,
            employees=body.employees,
            prefecture=body.prefecture,
            custom_context=body.custom_context,
        )
    except ClaudeAPIError as e:
        raise HTTPException(status_code=503, detail=e.message)

    return {
        "status": "success",
        "data": {
            "proposal_text": body_text,
            "subject": subject,
            "tone": "professional",
            "generated_at": datetime.now(timezone.utc).isoformat(),
        },
    }
