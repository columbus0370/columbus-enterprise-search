from .errors import raise_bad_request


def validate_search_params(
    sales_min: int,
    sales_max: int | None,
    employee_min: int,
    employee_max: int | None,
    capital_stock_from: int | None = None,
    capital_stock_to: int | None = None,
):
    if sales_max is not None and sales_min > sales_max:
        raise_bad_request("sales_min は sales_max 以下にしてください")
    if employee_max is not None and employee_min > employee_max:
        raise_bad_request("employee_min は employee_max 以下にしてください")
    if capital_stock_from is not None and capital_stock_to is not None:
        if capital_stock_from > capital_stock_to:
            raise_bad_request("capital_stock_from は capital_stock_to 以下にしてください")
