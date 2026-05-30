import httpx
import asyncio
from config import get_settings
from utils.errors import GBizInfoError

GBIZINFO_BASE = "https://info.gbiz.go.jp/hojin"
SEARCH_URL = f"{GBIZINFO_BASE}/v1/hojin"
DETAIL_URL = f"{GBIZINFO_BASE}/v1/hojin/{{corporate_number}}"

PER_PAGE = 50

# 全国地方公共団体コード 先頭2桁
PREFECTURE_CODES: dict[str, str] = {
    "北海道": "01", "青森県": "02", "岩手県": "03", "宮城県": "04",
    "秋田県": "05", "山形県": "06", "福島県": "07", "茨城県": "08",
    "栃木県": "09", "群馬県": "10", "埼玉県": "11", "千葉県": "12",
    "東京都": "13", "神奈川県": "14", "新潟県": "15", "富山県": "16",
    "石川県": "17", "福井県": "18", "山梨県": "19", "長野県": "20",
    "岐阜県": "21", "静岡県": "22", "愛知県": "23", "三重県": "24",
    "滋賀県": "25", "京都府": "26", "大阪府": "27", "兵庫県": "28",
    "奈良県": "29", "和歌山県": "30", "鳥取県": "31", "島根県": "32",
    "岡山県": "33", "広島県": "34", "山口県": "35", "徳島県": "36",
    "香川県": "37", "愛媛県": "38", "高知県": "39", "福岡県": "40",
    "佐賀県": "41", "長崎県": "42", "熊本県": "43", "大分県": "44",
    "宮崎県": "45", "鹿児島県": "46", "沖縄県": "47",
}


def _headers() -> dict[str, str]:
    token = get_settings().gbizinfo_api_key
    return {
        "X-hojinInfo-api-token": token,
        "Accept": "application/json",
    }


async def search_companies(
    industry: str,
    sales_min: int,
    sales_max: int | None,
    employee_min: int,
    employee_max: int | None,
    prefecture: str,
    page: int = 1,
    name: str | None = None,
    corporate_number: str | None = None,
    corporate_type: str | None = None,
    capital_stock_from: int | None = None,
    capital_stock_to: int | None = None,
    city: str | None = None,
    founded_year: str | None = None,
    exist_flg: bool | None = None,
) -> dict:
    params: dict[str, str | int] = {
        "page": min(page, 10),
        "limit": PER_PAGE,
        "corporate_type": corporate_type or "301",
    }

    # 法人番号（完全一致）
    if corporate_number:
        params["corporate_number"] = corporate_number

    # 都道府県コード
    if prefecture and prefecture != "全国":
        code = PREFECTURE_CODES.get(prefecture)
        if code:
            params["prefecture"] = code
            if city:
                params["city"] = city

    # 従業員数
    if employee_min > 0:
        params["employee_number_from"] = employee_min
    if employee_max is not None:
        params["employee_number_to"] = employee_max

    # 売上高
    if sales_min > 0:
        params["net_sales_summary_of_business_results_from"] = sales_min
    if sales_max is not None:
        params["net_sales_summary_of_business_results_to"] = sales_max

    # 資本金
    if capital_stock_from is not None:
        params["capital_stock_from"] = capital_stock_from
    if capital_stock_to is not None:
        params["capital_stock_to"] = capital_stock_to

    # 創業年・設立年
    if founded_year:
        params["founded_year"] = founded_year

    # 法人活動情報あり
    if exist_flg is not None:
        params["exist_flg"] = "true" if exist_flg else "false"

    # 法人名検索：直接指定時のみ
    if name:
        params["name"] = name


    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(SEARCH_URL, params=params, headers=_headers())
            if resp.status_code == 404:
                return {"results": [], "max_results": 0}
            resp.raise_for_status()
            raw = resp.json()
    except httpx.TimeoutException:
        raise GBizInfoError("gBizINFO API タイムアウト")
    except httpx.HTTPStatusError as e:
        body = e.response.text
        raise GBizInfoError(f"gBizINFO API エラー {e.response.status_code}: {body}")
    except Exception as e:
        raise GBizInfoError(f"企業検索に失敗しました: {e}")

    hits = raw.get("hojin-infos") or []
    total = len(hits)

    # 基本検索レスポンスは name/location のみなので、上位 10 件は詳細取得
    enriched = await _enrich_batch(hits[:10], client_headers=_headers())
    basic = [_normalize_basic(h, industry) for h in hits[10:]]

    companies = enriched + basic
    return {"results": companies, "max_results": total}


async def _enrich_batch(hits: list[dict], client_headers: dict) -> list[dict]:
    """上位件の詳細情報を並列取得"""
    if not hits:
        return []

    async def fetch_one(item: dict) -> dict:
        cn = item.get("corporate_number", "")
        if not cn:
            return _normalize_basic(item, "")
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(
                    DETAIL_URL.format(corporate_number=cn),
                    headers=client_headers,
                )
                if resp.status_code == 200:
                    detail_list = resp.json().get("hojin-infos") or []
                    if detail_list:
                        return _normalize_detail(detail_list[0])
        except Exception:
            pass
        return _normalize_basic(item, "")

    results = await asyncio.gather(*[fetch_one(h) for h in hits])
    return list(results)


def _normalize_basic(item: dict, industry: str) -> dict:
    return {
        "id": item.get("corporate_number", ""),
        "name": item.get("name", ""),
        "industry": industry,
        "sales": None,
        "employees": None,
        "prefecture": _extract_prefecture(item.get("location", "")),
        "address": item.get("location", ""),
        "capital": None,
        "established": None,
        "phone": None,
        "url": None,
    }


def _normalize_detail(item: dict) -> dict:
    finance = item.get("finance") or {}
    mgmt = (finance.get("management_index") or [{}])[0]

    industry_list = item.get("industry") or []
    industry_str = "、".join(industry_list) if industry_list else ""

    return {
        "id": item.get("corporate_number", ""),
        "name": item.get("name", ""),
        "industry": industry_str,
        "sales": mgmt.get("net_sales_summary_of_business_results"),
        "employees": item.get("employee_number"),
        "prefecture": _extract_prefecture(item.get("location", "")),
        "address": item.get("location", ""),
        "capital": item.get("capital_stock"),
        "established": str(item.get("founding_year", "")) or None,
        "phone": None,
        "url": item.get("company_url", "") or None,
    }


def _extract_prefecture(location: str) -> str:
    """住所文字列から都道府県を抽出"""
    for pref in PREFECTURE_CODES:
        if location.startswith(pref):
            return pref
    return location[:4] if location else ""
