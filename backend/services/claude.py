import anthropic
from config import get_settings
from utils.prompts import build_sales_email_prompt, SYSTEM_PROMPT
from utils.errors import ClaudeAPIError

_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        settings = get_settings()
        _client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    return _client


def _parse_subject(text: str) -> tuple[str, str]:
    """メール本文から件名と本文を分離して返す"""
    subject = ""
    body = text

    lines = text.strip().splitlines()
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("件名:") or stripped.startswith("件名："):
            subject = stripped.split(":", 1)[-1].strip().split("：", 1)[-1].strip()
            # 件名以降を本文とする
            rest = "\n".join(lines[i + 1:]).strip()
            # "本文:" ラベルがあれば除去
            if rest.startswith("本文:") or rest.startswith("本文："):
                rest = rest.split(":", 1)[-1].strip().split("：", 1)[-1].strip()
            body = rest
            break

    return subject, body


def generate_sales_email(
    company_name: str,
    industry: str,
    sales: int | None,
    employees: int | None,
    prefecture: str,
    custom_context: str = "",
    sender_name: str = "",
    sender_title: str = "",
    sender_company: str = "",
    sender_email: str = "",
    sender_phone: str = "",
    sender_service: str = "",
) -> tuple[str, str]:
    """Claude API で営業メールを生成し (subject, body) を返す"""
    client = _get_client()
    prompt = build_sales_email_prompt(
        company_name=company_name,
        industry=industry,
        sales=sales,
        employees=employees,
        prefecture=prefecture,
        custom_context=custom_context,
        sender_name=sender_name,
        sender_title=sender_title,
        sender_company=sender_company,
        sender_email=sender_email,
        sender_phone=sender_phone,
        sender_service=sender_service,
    )

    try:
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1500,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic.APIConnectionError as e:
        raise ClaudeAPIError(f"Claude API への接続に失敗しました: {e}")
    except anthropic.RateLimitError:
        raise ClaudeAPIError("Claude API のレート制限に達しました。しばらく待ってから再試行してください")
    except anthropic.APIStatusError as e:
        raise ClaudeAPIError(f"Claude API エラー ({e.status_code}): {e.message}")

    full_text = response.content[0].text
    subject, body = _parse_subject(full_text)

    return subject, body
