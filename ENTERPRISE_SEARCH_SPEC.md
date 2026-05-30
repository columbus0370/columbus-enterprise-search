# AI営業アシスタント｜企業検索ツール
## 統合仕様書・実装プロンプト

**作成日**: 2026-05-27  
**最終版**: v1.0  
**プロジェクト名**: columbus-enterprise-search

---

# 【第1部】要件定義書

## 1.1 プロダクト概要

| 項目 | 内容 |
|------|------|
| **プロダクト名** | AI営業アシスタント - 企業検索&提案文生成ツール |
| **対象ユーザー** | フリーランス、営業代行者、DX導入支援者 |
| **主な利用シーン** | 営業ターゲット企業の発掘 → 営業メール自動生成 |
| **コア価値** | 「企業検索 3分 + AI営業メール生成 2分」で営業効率60%削減 |
| **デプロイ先** | Vercel（フロント）+ Render.com（バック） |

---

## 1.2 機能要件（MoSCoW分類）

### 【MUST】最小実行機能

| # | 機能名 | 説明 | 優先度 |
|---|--------|------|--------|
| 1 | 企業検索 | gBizINFO API で企業を検索（業種/売上/従業員数） | P0 |
| 2 | 検索結果表示 | テーブル形式で企業情報を一覧表示 | P0 |
| 3 | AI提案文生成 | 選択企業に対して Claude で営業メール生成 | P0 |
| 4 | 提案文編集 | 生成されたメールをブラウザで編集可能 | P0 |
| 5 | コピー機能 | 生成メールをクリップボードにコピー | P0 |

### 【SHOULD】実装すると良い機能

| # | 機能名 | 説明 | 優先度 |
|---|--------|------|--------|
| 6 | CSV出力 | 検索結果を CSV でダウンロード | P1 |
| 7 | 履歴管理 | 過去の検索・生成メールを保存（localStorage） | P1 |
| 8 | テンプレート機能 | 業種別営業メール テンプレート | P1 |
| 9 | プリセット検索 | 「ベンチャー企業」「製造業」等の定型検索 | P1 |

### 【COULD】将来拡張候補

| # | 機能名 | 説明 |
|---|--------|------|
| 10 | 複数API統合 | 東京商工会議所マスター、国税庁番号検索 |
| 11 | 企業の決算情報 | 売上・利益トレンド表示 |
| 12 | 同業他社分析 | 競合企業との比較 |

---

## 1.3 非機能要件

| 項目 | 要件 |
|------|------|
| **パフォーマンス** | API検索: 3秒以内 / AI生成: 10秒以内 |
| **可用性** | 99% アップタイム（Vercel/Render標準） |
| **セキュリティ** | API Key 環境変数化 / CORS設定 / CSP ヘッダー |
| **スケーラビリティ** | 100社検索 / 日 の範囲で無償API利用を想定 |
| **UI/UX** | レスポンシブ / モバイル対応 / ダークモード対応 |
| **アクセシビリティ** | WCAG 2.1 準拠（最低限） |

---

## 1.4 ユーザーストーリー

```
シナリオ1: 営業ターゲット企業を素早く発掘したい
  Given: ユーザーがツールを開く
  When: 「製造業」「東京都」「従業員数100～500名」で検索
  Then: マッチする企業が30秒以内に一覧表示される
  And: 企業ロゴ、売上、業種が表示される

シナリオ2: 検索した企業に営業メールを送りたい
  Given: 企業検索結果が表示されている
  When: 「営業メール生成」ボタンをクリック
  Then: AI が「その企業の課題に合わせた営業メール」を生成
  And: ユーザーは内容を編集可能
  And: 「コピー」ボタンでメール本文をコピーできる

シナリオ3: 過去に検索した企業を再度確認したい
  Given: ユーザーが過去に「〇〇企業」を検索している
  When: 「履歴」タブを開く
  Then: 過去の検索結果と生成メールが表示される
  And: 同じメールを再利用または編集できる
```

---

## 1.5 データフロー

```
┌─────────────────────────────────────────────────────────────┐
│                      フロントエンド (React)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ SearchForm (検索条件入力)                             │  │
│  │ - 業種選択                                           │  │
│  │ - 売上範囲                                           │  │
│  │ - 従業員数範囲                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ POST /api/search (fetch)                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│               バックエンド (FastAPI + Python)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ POST /api/search                                     │  │
│  │ - 検索条件バリデーション                             │  │
│  │ - gBizINFO API を呼び出し                           │  │
│  │ - 結果を JSON で返す                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ SearchResults (テーブル表示)                         │  │
│  │ - 企業リスト                                         │  │
│  │ - 各行に「メール生成」ボタン                         │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ POST /api/generate-proposal                          │  │
│  │ - 選択企業情報 + Claude API                          │  │
│  │ - プロンプト: 営業メール生成                         │  │
│  │ - Markdown形式でメール本文を返す                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                           ↓                                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   フロントエンド (React)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ ProposalEditor                                       │  │
│  │ - 生成メール表示                                     │  │
│  │ - 編集可能（textarea）                               │  │
│  │ - コピーボタン                                       │  │
│  │ - 再生成ボタン                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

# 【第2部】システム設計書

## 2.1 アーキテクチャ全体図

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Vercel (フロント)                         │
│                                                                       │
│  React 18 + Vite + Tailwind CSS                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Components:                                                   │   │
│  │  - SearchForm                (業種/売上/従業員数 入力)        │   │
│  │  - SearchResults             (テーブル表示)                   │   │
│  │  - CompanyDetail             (企業詳細モーダル)               │   │
│  │  - ProposalEditor            (メール生成・編集)               │   │
│  │  - HistoryPanel              (検索履歴管理)                   │   │
│  │                                                               │   │
│  │ Hooks:                                                        │   │
│  │  - useSearch()               (API検索)                        │   │
│  │  - useProposalGenerate()     (メール生成)                    │   │
│  │  - useHistory()              (localStorage連携)               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                       │
│                    HTTPS (CORS許可)                                  │
│                              ↓                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        Render.com (バック)                          │
│                                                                       │
│  FastAPI + Python 3.11                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ main.py                                                      │   │
│  │  - CORS設定                                                  │   │
│  │  - SecurityHeaders ミドルウェア                              │   │
│  │  - RateLimit (10回/分)                                       │   │
│  │                                                               │   │
│  │ routers/search.py                                            │   │
│  │  - POST /api/search          (企業検索)                      │   │
│  │  - GET /api/industries       (業種マスター)                  │   │
│  │                                                               │   │
│  │ routers/proposal.py                                          │   │
│  │  - POST /api/generate-proposal (メール生成)                 │   │
│  │                                                               │   │
│  │ services/gbizinfo.py         (gBizINFO API ラッパー)        │   │
│  │ services/claude.py           (Claude API ラッパー)          │   │
│  │ utils/validators.py          (入力バリデーション)            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              ↓                                       │
│              (外部 HTTP API呼び出し)                                 │
│                              ↓                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      External APIs                                   │
│                                                                       │
│  - gBizINFO API (無料、認証キー必須)                                 │
│    → 企業検索: https://api.gbizinfo.go.jp/v1/search                 │
│                                                                       │
│  - Anthropic Claude API                                             │
│    → 営業メール生成: https://api.anthropic.com/v1/messages           │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2.2 ディレクトリ構成（最終版）

```
columbus-enterprise-search/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── api/
│   │   │   └── client.js                 # Fetch wrapper
│   │   ├── components/
│   │   │   ├── SearchForm.jsx            # 検索フォーム
│   │   │   ├── SearchResults.jsx         # 検索結果テーブル
│   │   │   ├── CompanyDetailModal.jsx    # 企業詳細モーダル
│   │   │   ├── ProposalEditor.jsx        # メール生成・編集
│   │   │   ├── HistoryPanel.jsx          # 検索履歴
│   │   │   └── LoadingSpinner.jsx        # ローディング
│   │   ├── hooks/
│   │   │   ├── useSearch.js              # 企業検索フック
│   │   │   ├── useProposalGenerate.js    # メール生成フック
│   │   │   └── useHistory.js             # localStorage フック
│   │   ├── styles/
│   │   │   └── globals.css               # Tailwind + カスタムCSS
│   │   └── utils/
│   │       └── formatters.js             # データフォーマット
│   │
│   ├── .env.example
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json                       # デプロイ設定
│   └── package.json
│
├── backend/
│   ├── main.py                           # FastAPI メインアプリ
│   ├── config.py                         # 環境設定
│   ├── requirements.txt
│   ├── routers/
│   │   ├── search.py                     # 企業検索エンドポイント
│   │   └── proposal.py                   # メール生成エンドポイント
│   ├── services/
│   │   ├── gbizinfo.py                   # gBizINFO API ラッパー
│   │   ├── claude.py                     # Claude API ラッパー
│   │   └── rate_limiter.py               # レート制限
│   ├── models/
│   │   ├── request.py                    # リクエストモデル
│   │   └── response.py                   # レスポンスモデル
│   ├── utils/
│   │   ├── validators.py                 # 入力バリデーション
│   │   ├── prompts.py                    # Claude プロンプト定義
│   │   └── errors.py                     # カスタム例外
│   ├── middleware/
│   │   ├── security.py                   # CORS / セキュリティヘッダー
│   │   └── logging.py                    # ロギング
│   └── .env.example
│
├── docs/
│   ├── API_SPEC.md                       # API仕様書
│   ├── DEPLOYMENT.md                     # デプロイ手順
│   └── DEVELOPMENT.md                    # 開発手順
│
└── README.md
```

---

## 2.3 APIエンドポイント設計

### **GET `/api/industries`** — 業種マスター取得

**レスポンス:**
```json
{
  "status": "success",
  "data": [
    "製造業",
    "卸売業",
    "小売業",
    "情報処理・提供サービス業",
    "建設業",
    "運輸業",
    "通信業",
    "その他"
  ]
}
```

---

### **POST `/api/search`** — 企業検索

**リクエスト:**
```json
{
  "industry": "製造業",
  "sales_min": 100000000,
  "sales_max": 500000000,
  "employee_min": 50,
  "employee_max": 500,
  "prefecture": "東京都",
  "page": 1
}
```

**レスポンス:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "1111111111",
      "name": "（株）△△システム",
      "sales": 250000000,
      "employees": 150,
      "industry": "情報処理・提供サービス業",
      "prefecture": "東京都",
      "address": "東京都渋谷区...",
      "capital": 50000000,
      "established": "2010-03-15",
      "phone": "03-xxxx-xxxx",
      "url": "https://example.com"
    }
  ],
  "total_count": 342,
  "page": 1,
  "per_page": 50
}
```

---

### **POST `/api/generate-proposal`** — 営業メール生成

**リクエスト:**
```json
{
  "company_name": "（株）△△システム",
  "industry": "情報処理・提供サービス業",
  "sales": 250000000,
  "employees": 150,
  "prefecture": "東京都",
  "custom_context": "DX導入支援を提案したい"
}
```

**レスポンス:**
```json
{
  "status": "success",
  "data": {
    "proposal_text": "いつもお世話になっております。...",
    "subject": "【DX導入支援】貴社の業務効率化について",
    "tone": "professional",
    "generated_at": "2026-05-27T10:30:00Z"
  }
}
```

---

## 2.4 データベース設計（localStorage）

### ローカルストレージキー構成

```javascript
// 検索履歴
localStorage.setItem(
  'enterprise_search_history',
  JSON.stringify([
    {
      id: 'search_1',
      timestamp: 1685161200000,
      query: {
        industry: "製造業",
        sales_min: 100000000,
        sales_max: 500000000,
        employee_min: 50,
        employee_max: 500,
        prefecture: "東京都"
      },
      results_count: 342,
      results_sample: [/* 最初の5件 */]
    }
  ])
)

// 生成済みメール
localStorage.setItem(
  'generated_proposals',
  JSON.stringify([
    {
      id: 'proposal_1',
      company_name: "（株）△△システム",
      proposal_text: "いつもお世話になっております。...",
      subject: "【DX導入支援】貴社の業務効率化について",
      generated_at: 1685161200000,
      edited: false,
      edited_text: null
    }
  ])
)
```

---

## 2.5 Claude API プロンプト設計

### システムプロンプト（営業メール生成用）

```
あなたは営業コンサルタントです。
与えられた企業情報を分析し、その企業に最適な営業メールを日本語で生成してください。

【生成ルール】
- トーン: 親切で専門的、かつ実績・信頼性を示す
- 長さ: 400～600文字（メール本文のみ）
- 構成: 
  1. 冒頭の挨拶（2行）
  2. 相手企業の課題推測（2～3行）
  3. 提案内容（3～4行）
  4. 実績・メリット（2行）
  5. 締め（2行）
- 避けるべき表現: 過度な敬語、曖昧な表現、長文

【入力情報】
- 企業名: {company_name}
- 業種: {industry}
- 売上: {sales}万円
- 従業員数: {employees}名
- 所在地: {prefecture}

【出力フォーマット】
```
件名: 【提案内容】企業名への営業タイトル

本文:
いつもお世話になっております。...
```
```

---

# 【第3部】Claude Code 実装プロンプト

## 3.1 実装指示（Claude Code に直接入力）

```
# AI営業アシスタント｜企業検索ツール — Claude Code実装

## 📌 プロジェクト概要

フリーランス向けの「企業検索 × AI営業メール生成」ツール。
gBizINFO API で企業を検索し、Claude API でその企業に合わせた営業メールを自動生成する Webアプリ。

### コア機能
1. 業種・売上・従業員数で企業を検索
2. 検索結果を テーブル表示
3. 選択した企業に対して AI が営業メール生成
4. 生成メールをブラウザで編集・コピー可能
5. 検索履歴・生成メールを localStorage で永続保存

### 技術スタック
- **フロント**: React 18 + Vite + Tailwind CSS
- **バック**: FastAPI (Python)
- **外部API**: gBizINFO API / Claude API
- **デプロイ**: Vercel (フロント) + Render.com (バック)

---

## 🎯 実装範囲（優先度順）

### Phase 1: フロントエンド基本構造

#### 1-1) Vite + React プロジェクト初期化
```bash
npm create vite@latest columbus-enterprise-search -- --template react
cd columbus-enterprise-search
npm install
npm run dev  # http://localhost:5173
```

#### 1-2) 依存パッケージインストール
```bash
npm install axios react-icons
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

#### 1-3) App.jsx（メインコンポーネント）

要件:
- 画面構成: ヘッダー + サイドバー + メインエリア
- 3つのタブ: 「検索」「結果」「履歴」
- 状態管理: React.useState で以下を管理
  - searchParams: 検索条件
  - searchResults: 検索結果
  - selectedCompany: 選択企業
  - generatedProposal: 生成メール
  - history: 履歴

デザイン:
- Tailwind CSS のカラー: navy-900 / navy-700 / accent-500
- レスポンシブ: モバイル対応
- ローディング中に Spinner 表示

---

### Phase 2: 検索フォーム実装

#### 2-1) SearchForm.jsx

機能:
- 業種: 選択肢（API から取得）
- 売上範囲: スライダー + 数値入力（100万～1000万円）
- 従業員数: スライダー + 数値入力（1～10000名）
- 都道府県: 選択肢（47都道府県）
- 「検索」ボタン: onClick で `POST /api/search`

バリデーション:
- 売上下限 ≤ 売上上限
- 従業員下限 ≤ 従業員上限
- 業種は必須

状態管理:
- formData: { industry, sales_min, sales_max, employee_min, employee_max, prefecture }
- isLoading: bool
- error: null | string

---

#### 2-2) API クライアント (api/client.js)

実装:
```javascript
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const searchCompanies = async (params) => {
  // POST /api/search
  // エラーハンドリング実装
  // リスポンス: { data: [...], total_count, page, per_page }
};

export const generateProposal = async (companyInfo) => {
  // POST /api/generate-proposal
  // レスポンス: { proposal_text, subject }
};

export const fetchIndustries = async () => {
  // GET /api/industries
};
```

---

### Phase 3: 検索結果表示

#### 3-1) SearchResults.jsx

機能:
- テーブル形式で企業一覧表示
  - 列: 企業名 / 業種 / 売上 / 従業員数 / 所在地
- ページネーション（1ページ50件）
- 各行に「詳細」「メール生成」ボタン
- ソート機能（売上 / 従業員数）

---

#### 3-2) CompanyDetailModal.jsx

機能:
- モーダルで企業詳細表示
  - 企業名、住所、電話、Web サイト、設立日、資本金 等
- モーダル内に「営業メール生成」ボタン

---

### Phase 4: メール生成・編集

#### 4-1) ProposalEditor.jsx

機能:
- 左側: 生成されたメール本文（初期は読み取り専用）
- 右側: 編集モード切り替え
  - 編集ボタンクリック → textarea に切り替え
  - 「完了」で保存、「キャンセル」で破棄
- コピーボタン: クリップボードにメール本文をコピー
- 再生成ボタン: 別のメール案を生成

UI:
- メール本文: Markdown 形式で表示
- 見出し、太字、改行を保持

---

#### 4-2) HistoryPanel.jsx

機能:
- タブ: 「検索履歴」「生成メール履歴」
- 検索履歴: 日時 / 検索条件 / ヒット件数
  - クリック → 同じ検索を再実行
- メール履歴: 企業名 / メール件名 / 生成日時
  - クリック → メール本文を再表示
- 削除ボタン

---

### Phase 5: バックエンド実装

#### 5-1) FastAPI 初期設定 (main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address

app = FastAPI(
    title="Enterprise Search API",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGINS", "http://localhost:5173")],
    allow_methods=["*"],
    allow_headers=["*"]
)

# レート制限
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

# ルーター登録
from routers import search, proposal
app.include_router(search.router, prefix="/api", tags=["search"])
app.include_router(proposal.router, prefix="/api", tags=["proposal"])

@app.get("/health")
def health():
    return {"status": "ok"}
```

---

#### 5-2) gBizINFO API ラッパー (services/gbizinfo.py)

```python
import httpx
import os

GBIZINFO_API_KEY = os.getenv("GBIZINFO_API_KEY")
GBIZINFO_URL = "https://api.gbizinfo.go.jp/v1/search"

async def search_companies(
    industry: str,
    sales_min: int,
    sales_max: int,
    employee_min: int,
    employee_max: int,
    prefecture: str,
    page: int = 1
):
    """
    gBizINFO API で企業検索
    
    戻り値:
    {
        "results": [
            {
                "corporate_number": "1234567890123",
                "name": "△△システム（株）",
                "address": "東京都渋谷区...",
                "capital": 50000000,
                "employees_from": 100,
                "employees_to": 200,
                "establishment_date": "2010-03-15",
                "phone": "03-xxxx-xxxx",
                "url": "https://example.com"
            }
        ],
        "max_results": 342
    }
    """
    
    # API呼び出し処理
    # 従業員数フィルター、売上フィルター実装
    # エラーハンドリング
```

---

#### 5-3) Claude API ラッパー (services/claude.py)

```python
from anthropic import Anthropic
import os

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
client = Anthropic(api_key=ANTHROPIC_API_KEY)

def generate_sales_email(company_info: dict) -> str:
    """
    Claude API で営業メール生成
    
    入力:
    {
        "company_name": "（株）△△システム",
        "industry": "情報処理・提供サービス業",
        "sales": 250000000,
        "employees": 150,
        "prefecture": "東京都"
    }
    
    出力: メール本文（Markdown形式）
    """
    
    prompt = f"""
    あなたは営業コンサルタントです。
    以下の企業情報に基づいて、営業メールを生成してください。
    
    企業名: {company_info['company_name']}
    業種: {company_info['industry']}
    売上: {company_info['sales']}万円
    従業員: {company_info['employees']}名
    所在地: {company_info['prefecture']}
    
    メールは以下の構成で、400～600文字で生成してください:
    1. 冒頭の挨拶
    2. 相手企業の課題推測
    3. 提案内容（AI導入支援 / DX推進）
    4. 実績・メリット
    5. 締め
    
    【出力フォーマット】
    件名: 【...】...
    
    本文:
    いつもお世話になっております。...
    """
    
    response = client.messages.create(
        model="claude-opus-4-7",
        max_tokens=2000,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.content[0].text
```

---

#### 5-4) 企業検索エンドポイント (routers/search.py)

```python
from fastapi import APIRouter, Query
from services.gbizinfo import search_companies
from models.response import SearchResponse
from slowapi.errors import RateLimitExceeded

router = APIRouter()

@router.get("/industries")
async def get_industries():
    """
    業種マスターを返す
    """
    return {
        "status": "success",
        "data": [
            "製造業",
            "卸売業",
            "小売業",
            "情報処理・提供サービス業",
            "建設業",
            "運輸業",
            "通信業",
            "その他"
        ]
    }

@router.post("/search")
@limiter.limit("10/minute")
async def search(request: SearchRequest):
    """
    企業検索（gBizINFO API）
    """
    try:
        results = await search_companies(
            industry=request.industry,
            sales_min=request.sales_min,
            sales_max=request.sales_max,
            employee_min=request.employee_min,
            employee_max=request.employee_max,
            prefecture=request.prefecture,
            page=request.page
        )
        
        return {
            "status": "success",
            "data": results["results"],
            "total_count": results["max_results"],
            "page": request.page,
            "per_page": 50
        }
    
    except Exception as e:
        return {"status": "error", "message": str(e)}
```

---

#### 5-5) メール生成エンドポイント (routers/proposal.py)

```python
from fastapi import APIRouter
from services.claude import generate_sales_email
from models.request import ProposalRequest

router = APIRouter()

@router.post("/generate-proposal")
async def generate_proposal(request: ProposalRequest):
    """
    Claude API で営業メール生成
    """
    try:
        email_text = generate_sales_email(request.dict())
        
        return {
            "status": "success",
            "data": {
                "proposal_text": email_text,
                "subject": "AI導入支援のご提案",
                "generated_at": datetime.now().isoformat()
            }
        }
    
    except Exception as e:
        return {"status": "error", "message": str(e)}
```

---

#### 5-6) モデル定義 (models/request.py)

```python
from pydantic import BaseModel, Field

class SearchRequest(BaseModel):
    industry: str
    sales_min: int = Field(ge=0)
    sales_max: int = Field(le=10000000000)
    employee_min: int = Field(ge=0)
    employee_max: int = Field(le=100000)
    prefecture: str
    page: int = Field(default=1, ge=1)

class ProposalRequest(BaseModel):
    company_name: str = Field(max_length=100)
    industry: str
    sales: int
    employees: int
    prefecture: str
    custom_context: str = Field(default="", max_length=200)
```

---

## ⚙️ 環境設定

### フロント (.env)
```
REACT_APP_API_URL=http://localhost:8000
```

### バック (.env)
```
ANTHROPIC_API_KEY=sk-ant-...
GBIZINFO_API_KEY=...
CORS_ORIGINS=http://localhost:5173,https://your-vercel-app.vercel.app
```

---

## 📦 依存パッケージ

### フロント (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "react-icons": "^4.11.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.3.0"
  }
}
```

### バック (requirements.txt)
```
fastapi==0.115.0
uvicorn[standard]==0.30.6
anthropic>=0.52.0
httpx==0.26.0
pydantic==2.5.0
python-dotenv==1.0.1
slowapi==0.1.9
```

---

## 🚀 実装順序（推奨）

1. **Day 1-2**: フロント基本構造
   - App.jsx / SearchForm.jsx / API client
   
2. **Day 2-3**: バック実装
   - FastAPI / gBizINFO連携 / Claude連携
   
3. **Day 3-4**: 統合 + デバッグ
   - フロント ↔ バック通信確認
   - エラーハンドリング
   
4. **Day 4-5**: ポーリング + デプロイ
   - localStorage実装
   - Vercel / Render デプロイ

---

## ✅ 実装チェックリスト

### フロント
- [ ] App.jsx メインレイアウト完成
- [ ] SearchForm.jsx（検索フォーム）完成
- [ ] SearchResults.jsx（テーブル表示）完成
- [ ] ProposalEditor.jsx（メール編集）完成
- [ ] API client 実装完成
- [ ] Tailwind CSS カスタマイズ完成
- [ ] localStorage 統合完成
- [ ] レスポンシブ対応確認
- [ ] エラーハンドリング実装
- [ ] Vercel デプロイ完成

### バック
- [ ] FastAPI main.py 初期化
- [ ] gBizINFO API ラッパー実装
- [ ] Claude API ラッパー実装
- [ ] search.py エンドポイント実装
- [ ] proposal.py エンドポイント実装
- [ ] 入力バリデーション実装
- [ ] レート制限実装
- [ ] エラーハンドリング実装
- [ ] CORS設定確認
- [ ] ローカル動作確認（http://localhost:8000/docs）
- [ ] Render.com デプロイ完成

---

## 🔍 テスト実行例

### フロント動作確認
```bash
# ローカル開発サーバー起動
npm run dev

# 以下を確認:
# 1. http://localhost:5173 に アクセス → App.jsx 表示
# 2. 検索フォーム入力 → POST /api/search
# 3. 検索結果表示 → テーブル表示
# 4. メール生成ボタンクリック → ProposalEditor 表示
```

### バック動作確認
```bash
# ローカル開発サーバー起動
uvicorn main:app --reload --port 8000

# 以下を確認:
# 1. http://localhost:8000/docs → Swagger UI
# 2. GET /api/industries → 業種一覧取得
# 3. POST /api/search → 企業検索
# 4. POST /api/generate-proposal → メール生成
```

---

## 🚨 注意事項

1. **gBizINFO API**: 
   - 無料で使用可能
   - 事前に API キー取得が必須
   - 詳細: https://info.gbiz.go.jp/

2. **Claude API**:
   - 利用料金が発生（スタンダードプラン推奨）
   - API キーは `.env` で厳密に管理

3. **CORS設定**:
   - Vercel URL が変わる場合、バックの CORS_ORIGINS も更新

4. **デプロイ時**:
   - Vercel: `REACT_APP_API_URL` を本番バックエンドURLに設定
   - Render: `ANTHROPIC_API_KEY` / `GBIZINFO_API_KEY` / `CORS_ORIGINS` を環境変数に設定

---

## 📚 参考資料

- gBizINFO API ドキュメント: https://info.gbiz.go.jp/
- Claude API: https://docs.anthropic.com/
- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/

---

## 🎯 成果物

完成時:
1. Vercel にデプロイされた React フロント
2. Render.com にデプロイされた FastAPI バック
3. GitHub リポジ（columbus-enterprise-search）
4. README + デプロイドキュメント
5. （ボーナス）note/Zenn 記事化

営業活用:
- ポートフォリオに掲載
- 「AI導入支援」の営業ツールとして活用
- クラウドソーシングで「こういう案件受けてます」の実績アピール
```

---

## 3.2 Claude Code への実装フロー

### Step 1: フロント実装

Claude Code を開いて以下を入力:

```
上記の【第3部】実装プロンプトから「Phase 1: フロントエンド基本構造」～「Phase 4: メール生成・編集」を実装してください。

以下を含める:
1. App.jsx (メインコンポーネント)
2. SearchForm.jsx (検索フォーム)
3. SearchResults.jsx (結果表示)
4. ProposalEditor.jsx (メール編集)
5. api/client.js (API通信)
6. Tailwind CSS カスタマイズ
7. React Hooks (useSearch, useHistory)

デザイン指針:
- Tailwind CSS のカラー: navy-900 / navy-700 / accent-500
- レスポンシブ: モバイル対応必須
- ローディング中に Spinner 表示
```

---

### Step 2: バック実装

```
上記の【第3部】実装プロンプトから「Phase 5: バックエンド実装」を実装してください。

以下を含める:
1. main.py (FastAPI セットアップ)
2. services/gbizinfo.py (gBizINFO API ラッパー)
3. services/claude.py (Claude API ラッパー)
4. routers/search.py (企業検索エンドポイント)
5. routers/proposal.py (メール生成エンドポイント)
6. models/request.py (リクエストモデル)
7. requirements.txt (依存パッケージ)

実装ポイント:
- CORS設定: Vercel フロントとの通信許可
- レート制限: 10回/分（search）
- エラーハンドリング: try-catch で例外処理
- セキュリティ: API キー環境変数化
```

---

### Step 3: 統合テスト

```
フロントとバックの通信テストを実施してください。

テストシーン:
1. GET /api/industries → 業種一覧取得
2. POST /api/search → 企業検索
3. POST /api/generate-proposal → メール生成

確認項目:
- リクエスト/レスポンス形式が仕様書通り
- エラーハンドリング正常
- localStorage に検索履歴・メール履歴が保存される
```

---

# 【第4部】デプロイ設定

## 4.1 Vercel デプロイ（フロント）

### 手順

1. GitHub にリポジをプッシュ
2. Vercel に接続
3. 環境変数設定: `REACT_APP_API_URL=<バックエンドURL>`
4. デプロイ実行

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "REACT_APP_API_URL": "@vercel_api_url"
  }
}
```

---

## 4.2 Render.com デプロイ（バック）

### 手順

1. GitHub にリポジをプッシュ
2. Render に接続
3. 環境変数設定:
   - `ANTHROPIC_API_KEY`: Anthropic API キー
   - `GBIZINFO_API_KEY`: gBizINFO API キー
   - `CORS_ORIGINS`: Vercel フロントURL

4. デプロイ実行

---

# 【第5部】営業活用シナリオ

## 営業フロー

```
【営業フロー】
1. ポートフォリオサイト（Columbus）に ツール埋め込み or リンク

2. X で開発過程を発信
   - 「企業検索ツール作成中」
   - 「Claude API + gBizINFO で営業自動化」
   - 「工数削減 60%」

3. クラウドソーシングで案件応募時に「こういう実績あります」

4. 「営業効率化ツール開発」として月5～20万円の受託案件化

5. 「AI導入支援」の営業に直結
   - 「このツールを御社向けにカスタマイズできます」
   - 「月3万～の継続契約」
```

---

# 【第6部】チェックリスト・次ステップ

## 最終チェックリスト

### 実装前
- [ ] gBizINFO API キー取得
- [ ] Claude API キー取得
- [ ] Vercel アカウント作成
- [ ] Render.com アカウント作成
- [ ] GitHub リポジ作成

### フロント実装
- [ ] App.jsx メインレイアウト
- [ ] SearchForm.jsx（検索フォーム）
- [ ] SearchResults.jsx（テーブル表示）
- [ ] ProposalEditor.jsx（メール編集）
- [ ] API client 実装
- [ ] localStorage 統合
- [ ] レスポンシブ対応

### バック実装
- [ ] FastAPI main.py
- [ ] gBizINFO API ラッパー
- [ ] Claude API ラッパー
- [ ] search.py エンドポイント
- [ ] proposal.py エンドポイント
- [ ] 入力バリデーション
- [ ] レート制限

### テスト
- [ ] ローカル動作確認（フロント + バック）
- [ ] API 通信確認
- [ ] エラーハンドリング確認

### デプロイ
- [ ] Vercel デプロイ（フロント）
- [ ] Render デプロイ（バック）
- [ ] 本番環境動作確認

### マーケティング
- [ ] ポートフォリオに掲載
- [ ] X で発信開始
- [ ] note / Zenn 記事化
- [ ] GitHub リポジ公開

---

## 次のステップ（3ヶ月ロードマップ）

```
【Month 1】
✅ AI × 企業検索ツール 完成
✅ X / note で発信開始
✅ GitHub リポジ公開

【Month 2】
✅ SaaS価格比較ツール 完成
✅ クラウドソーシング案件に応募（実績をテコに）
✅ 「案件紹介」DMを受け取り開始

【Month 3】
✅ Notion 自動化ツール 完成 or SaaS化計画
✅ 初受託案件化（⇒単価向上）
✅ 月売上：1万円 → 5～10万円
```

---

**このドキュメントを Claude Code に渡して実装を開始してください。**
