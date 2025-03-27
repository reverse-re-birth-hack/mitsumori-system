# WordPress見積フォームPDF出力機能 技術仕様書

作成日時: 2025年3月28日
更新日時: 2025年3月28日

## 1. プロジェクト概要

WordPressサーバー移転・ドメイン移管サービス見積りフォームのPDF出力機能開発プロジェクト。

### 1.1 目的
- PDF出力機能の改良
- ファイル構造の整理（WordPress風）
- 日本語フォント対応の確認
- エラーハンドリングの強化

## 2. 主要ファイル構造

### 2.1 フロントエンド関連
- **index.html**: メインの見積りフォーム
- **css/style.css**: メインスタイルシート
- **js/script.js**: フォーム制御と計算処理
- **js/pdf-export.js**: PDF出力用JavaScript処理

### 2.2 バックエンド関連
- **export-pdf.php**: PDF生成処理
- **includes/pdf-template.php**: PDFのテンプレート
- **includes/functions.php**: 共通関数
- **includes/config.php**: 設定情報

### 2.3 PDF生成関連（mPDF）
- **mpdf/**: mPDFライブラリディレクトリ
- **mpdf/ttfonts/**: 日本語フォントを含むフォントファイル群

## 3. パーミッション設定

重要なパーミッション設定と推奨値:
- ディレクトリ: 755（drwxr-xr-x）
- PHPファイル: 644（-rw-r--r--）
- 設定ファイル: 644（-rw-r--r--）

## 4. GitHub連携

- リポジトリ名: mitsumori-system
- ブランチ: master
- 認証方法: Personal Access Token

### 4.1 基本的なGit操作
```bash
# 変更を追加
git add .

# コミット
git commit -m "変更内容の説明"

# プッシュ
git push

# 最新状態を取得
git pull
# さらに詳細な情報を追加
cat >> /home/besttrust/mitsumori-hack.com/public_html/docs/tech_spec.md << 'EOL'

## 5. 今後の開発計画

### 5.1 開発環境
- **AI支援**: Claude MCP仕様
- **検索ツール**: Braveサーチ（ファイルシステムズ機能使用）
- **エディタ**: VSCode（Copilot仕様）
- **サーバー接続**: PuTTY SSH接続
- **パッケージ管理**: Composer（導入済み）
- **開発方針**: コマンドラインベース、効率重視

### 5.2 開発ルール
1. 既存コードの保護
   - 元からあるプログラムは勝手に変更しない
   - 元からあった見た目は勝手に変更しない
   - 改良を加えたい場合は、事前に連絡を取る

2. 効率化ポリシー
   - Claudeの待ち時間が長くなる処理は事前に連絡
   - コマンドラインでの操作を優先し効率化
   - 技術仕様書の作成は重要なため、待ち時間が長くなっても問題なし

## 6. ディレクトリ構造詳細

### 6.1 現在のディレクトリ構造（tree）
