def build_sales_email_prompt(
    company_name: str,
    industry: str,
    sales: int | None,
    employees: int | None,
    prefecture: str,
    custom_context: str = "",
) -> str:
    sales_str = f"{sales // 10_000:,}万円" if sales else "非公開"
    employees_str = f"{employees:,}名" if employees else "非公開"
    context_block = f"\n追加コンテキスト: {custom_context}" if custom_context else ""

    return f"""あなたは優秀な営業コンサルタントです。
以下の企業情報を分析し、その企業に最適な日本語の営業メールを生成してください。

【企業情報】
- 企業名: {company_name}
- 業種: {industry}
- 売上規模: {sales_str}
- 従業員数: {employees_str}
- 所在地: {prefecture}{context_block}

【生成ルール】
- トーン: 親切で専門的、かつ信頼性を感じさせる
- 長さ: 400〜600文字（本文のみ）
- 構成:
  1. 冒頭の挨拶（2行）
  2. 相手企業の課題・状況の推測（2〜3行）
  3. 提案内容（AI導入支援・DX推進）（3〜4行）
  4. 実績・具体的なメリット（2行）
  5. 締め・次のアクション（2行）
- 避けるべき: 過度な敬語、曖昧な表現、長すぎる文章

【出力フォーマット（このフォーマット厳守）】
件名: 【提案】{company_name}様の業務効率化についてのご提案

本文:
いつもお世話になっております。..."""


SYSTEM_PROMPT = """あなたは営業コンサルタントとして、企業に合わせた営業メールを生成する専門家です。
常に日本語で、プロフェッショナルかつ具体的な内容を生成してください。
出力は「件名:」から始め、次行以降に「本文:」として本文を記載してください。"""
