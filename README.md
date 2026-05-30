# AI営業アシスタント — 企業検索 × 営業メール自動生成

> フリーランス・営業代行者向け。日本の法人データベースから企業を絞り込み、Claude AI が相手企業に合わせた営業メールを即生成。

**🔗 Live Demo:** https://columbus-enterprise-search.vercel.app

---

## 📌 概要

営業活動で最も時間がかかる「ターゲット企業の選定」と「初回メールの作成」を自動化するWebアプリです。

| ステップ | 作業 | 時間 |
|----------|------|------|
| 従来 | 企業リスト収集 → 一社ずつメール作成 | 60〜90分 |
| **このツール** | 条件で企業検索 → AIメール生成 | **5分以内** |

### こんな方に向いています

- **フリーランス**（エンジニア・デザイナー・コンサルタント）の新規開拓
- **営業代行**で多業種に毎日アプローチしている方
- **DX推進・SaaS営業**でリスト作成に時間を取られている方

---

## ✨ 機能

### 企業検索
- 国内50万社以上の法人データベース（[gBizINFO](https://info.gbiz.go.jp/)）を検索
- 業種・都道府県・売上高・従業員数・資本金・設立年で絞り込み
- 検索結果のCSVダウンロード対応

### AI営業メール生成
- 検索した企業の情報を元に Claude AI が営業メールを自動生成
- **事業者情報を登録**しておくと、署名・自己紹介・提案内容が自動でパーソナライズ
- 生成したメールはブラウザ上で編集可能
- 件名・本文を1クリックでコピー

### その他
- 検索履歴・メール生成履歴をブラウザに保存
- ダークモード対応
- スマートフォン対応（レスポンシブ）

---

## 🖥 スクリーンショット

| 企業検索 | 営業メール生成 | 事業者情報登録 |
|----------|---------------|----------------|
| 業種・地域・財務条件で絞り込み | ワンクリックでAIが文面を生成 | 担当者情報を登録して自動反映 |

---

## 🛠 技術スタック

### フロントエンド
| 技術 | 採用理由 |
|------|---------|
| React 19 + Vite | 高速な開発体験とビルドパフォーマンス |
| Tailwind CSS v3 | ユーティリティファーストで一貫したUI |
| Axios | API通信の一元管理 |

### バックエンド
| 技術 | 採用理由 |
|------|---------|
| FastAPI (Python) | 高速な非同期APIサーバー、OpenAPI自動生成 |
| Anthropic SDK | Claude Haiku でコスト効率の高いメール生成 |
| httpx | 非同期HTTP通信でgBizINFO APIを呼び出し |
| slowapi | レート制限によるAPI保護 |
| Pydantic v2 | 型安全なリクエスト/レスポンスのバリデーション |

### インフラ
| 技術 | 用途 |
|------|------|
| Vercel | フロントエンドのホスティング（CDN自動配信） |
| Render.com | バックエンドAPIサーバー |
| gBizINFO REST API v1 | 国内法人情報データベース |
| Claude Haiku API | 営業メール生成AI |

---

## 🏗 アーキテクチャ

```
[ブラウザ]
    │
    ▼
[Vercel] React + Vite
    │ HTTPS
    ▼
[Render.com] FastAPI
    ├── /api/search      → gBizINFO API（企業検索）
    └── /api/generate-proposal → Claude Haiku API（メール生成）
```

---

## 🚀 ローカル開発

### 必要なもの
- Node.js 18+
- Python 3.11+
- [gBizINFO APIトークン](https://info.gbiz.go.jp/common/index.html)（無料登録）
- [Anthropic APIキー](https://console.anthropic.com/)

### セットアップ

```bash
git clone https://github.com/columbus0370/columbus-enterprise-search.git
cd columbus-enterprise-search
```

#### バックエンド

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # Mac/Linux

pip install -r requirements.txt

# .env を作成
cp .env.example .env
# ANTHROPIC_API_KEY と GBIZINFO_API_KEY を設定

uvicorn main:app --port 8001 --reload
# → http://localhost:8001/docs でAPIドキュメント確認
```

#### フロントエンド

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## 📦 デプロイ

### Render.com（バックエンド）

1. [render.com](https://render.com) でリポジトリを連携
2. Root Directory: `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. 環境変数を設定:

| 変数名 | 内容 |
|--------|------|
| `ANTHROPIC_API_KEY` | Anthropic APIキー |
| `GBIZINFO_API_KEY` | gBizINFO APIトークン |
| `CORS_ORIGINS` | VercelのURL（例: `https://your-app.vercel.app`） |

### Vercel（フロントエンド）

1. [vercel.com](https://vercel.com) でリポジトリを連携
2. Root Directory: `frontend`
3. 環境変数を設定:

| 変数名 | 内容 |
|--------|------|
| `VITE_API_URL` | RenderのURL（例: `https://your-api.onrender.com`） |

---

## 📁 ディレクトリ構成

```
columbus-enterprise-search/
├── backend/
│   ├── main.py              # FastAPIエントリポイント
│   ├── config.py            # 設定管理（pydantic-settings）
│   ├── models/
│   │   └── request.py       # リクエストモデル
│   ├── routers/
│   │   ├── search.py        # 企業検索エンドポイント
│   │   └── proposal.py      # メール生成エンドポイント
│   ├── services/
│   │   ├── gbizinfo.py      # gBizINFO API クライアント
│   │   └── claude.py        # Claude API クライアント
│   └── utils/
│       └── prompts.py       # プロンプトテンプレート
└── frontend/
    └── src/
        ├── App.jsx           # レイアウト・状態管理
        ├── components/       # UIコンポーネント
        └── hooks/            # カスタムフック
```

---

## 🔐 APIについて

| API | 料金 | 用途 |
|-----|------|------|
| gBizINFO REST API | **無料** | 企業情報の検索 |
| Claude Haiku | 従量課金（$0.25/1M tokens） | メール生成（1通あたり約$0.001） |

---

## 📄 ライセンス

MIT License

---

## 👤 作者

**columbus0370**
- GitHub: [@columbus0370](https://github.com/columbus0370)

---

*本ツールで使用している gBizINFO は経済産業省が提供する法人情報プラットフォームです。*
