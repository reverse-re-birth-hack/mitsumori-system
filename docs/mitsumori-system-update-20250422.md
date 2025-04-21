# WordPress見積システム開発プロジェクトマニュアル

更新日時: 2025年4月22日

## 1. プロジェクト概要

### プロジェクト情報
- **プロジェクト名**: WordPress見積フォームPDF出力機能
- **ドメイン**: mitsumori-hack.com
- **リポジトリ**: https://github.com/reverse-re-birth-hack/mitsumori-system.git
- **サーバー環境**: Xserver (sv16.sixcore.ne.jp)
- **FTP接続情報**:
  - ホスト: sv16.sixcore.ne.jp
  - ユーザー名: admin@mitsumori-hack.com
  - パスワード: [pass304130]
  - ポート: 21
- **サーバー環境詳細**:
  - SSHユーザー名: besttrust
  - SSH接続ポート: 10022
  - ドキュメントルート: /home/besttrust/mitsumori-hack.com/public_html/

### プロジェクト目的
WordPressサーバー移転・ドメイン移管サービス見積りフォームに、PDF出力機能を実装するプロジェクトです。既に見積り計算とExcel出力機能は実装・動作していますが、PDF出力機能の改良と拡張が必要です。

### ディレクトリ構造
```
mitsumori-system/
├── index.html             # メインの見積りフォーム
├── css/                   # スタイルシート
│   └── style.css
├── js/                    # JavaScriptファイル
│   ├── script.js          # メイン処理
│   ├── pdf-export.js      # PDF出力処理
│   └── form-validation.js # フォームバリデーション
├── includes/              # PHP含有ファイル
│   ├── config.php         # 設定ファイル
│   ├── pdf-template.php   # PDFテンプレート
│   └── functions.php      # 共通関数
├── export-pdf.php         # PDF出力処理
├── export-excel.php       # Excel出力処理
├── new-export-pdf.php     # 新PDF出力
├── pdf-button.html        # PDFボタン用HTML
├── pdf-export.js          # PDF出力用JavaScript
├── pdf-generate.php       # PDF生成処理
├── pdf-test.php           # テスト用スクリプト
├── debug-enhanced.js      # デバッグ機能強化
├── export-log.txt         # 出力ログ
├── file_structure.txt     # ファイル構造説明
├── mpdf/                  # mPDFライブラリディレクトリ
├── tmp/                   # 一時ファイル用ディレクトリ
├── docs/                  # ドキュメントディレクトリ
├── .gitattributes
├── .gitignore             # Git管理から除外するファイル
├── .htaccess              # サーバー設定ファイル
├── README.md
└── その他ディレクトリ/ファイル
```

## 2. 環境セットアップと開発ワークフロー

### ローカル環境のセットアップ

```bash
# 方法1: 新規リポジトリをクローン
git clone https://github.com/reverse-re-birth-hack/mitsumori-system.git
cd mitsumori-system

# 方法2: 既存ディレクトリでリポジトリを初期化
git init
git remote add origin https://github.com/reverse-re-birth-hack/mitsumori-system.git
git fetch
git pull origin master
```

### 開発環境

- **AI支援**: Claude、MCP
- **検索**: Braveサーチ（ファイルシステムズ機能を活用）
- **ファイル管理**: Dropbox（メインファイル保管場所）
- **ローカル作業ディレクトリ**: C:\\Users\\info\\OneDrive\\デスクトップ\\GitHub\\mitsumori-system
- **コードエディタ**: Visual Studio Code（VS Code Copilot併用）
- **サーバー接続**: PuTTY（SSL接続）
- **ファイル転送**: FileZilla

### 開発の基本ワークフロー

プロジェクトはGitコマンドベースでのワークフローで進めています：

```bash
# 最新の変更を取得
git pull origin master

# 変更を確認
git status

# 変更をステージング
git add .
# または特定のファイルのみ
git add index.html css/style.css

# コミット
git commit -m "変更内容の説明"

# プッシュ
git push origin master
```

### ブランチ管理（必要に応じて）

```bash
# 新しい機能用のブランチを作成
git checkout -b feature-name

# 変更をステージングしてコミット
git add .
git commit -m "機能の説明"

# ブランチをプッシュ
git push origin feature-name

# GitHub上でPull Requestを作成
# その後、マージして完了
```

## 3. 主要機能の実装とメンテナンス

### PDF出力機能

PDF出力機能は以下のファイルで構成されています：
- **export-pdf.php**: メインのPDF出力処理用PHPスクリプト
- **js/pdf-export.js**: PDF出力用JavaScriptファイル
- **includes/pdf-template.php**: PDFのテンプレート
- **includes/config.php**: 設定ファイル
- **includes/functions.php**: 共通関数

#### export-pdf.php の実装

```php
<?php
/**
 * WordPressサーバー移転・ドメイン移管サービス 見積りフォーム PDF出力スクリプト
 * @version 1.1.0
 * @date 2025-03-25
 */

// 設定ファイルの読み込み
require_once __DIR__ . '/includes/config.php';

// エラー表示設定（開発時のみ有効、本番環境では無効化）
ini_set('display_errors', 1);
error_reporting(E_ALL);

// ログ関数
function writeLog($message) {
    global $config;
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents($config['log_file'], "[$timestamp] $message\n", FILE_APPEND);
}

try {
    // mPDFライブラリのロード
    require_once __DIR__ . '/mpdf/vendor/autoload.php';

    // 共通関数の読み込み
    require_once __DIR__ . '/includes/functions.php';
    
    // POSTデータの取得方法を検出
    $data = getRequestData();
    
    // データがない場合はエラー
    if ($data === null) {
        throw new Exception('有効なデータが受信されませんでした');
    }
    
    // mPDFインスタンスを作成
    $mpdf = new \Mpdf\Mpdf([
        'mode' => 'ja', 
        'format' => 'A4',
        'margin_left' => 15,
        'margin_right' => 15,
        'margin_top' => 16,
        'margin_bottom' => 16,
        'margin_header' => 9,
        'margin_footer' => 9
    ]);
    
    // PDFメタデータを設定
    $mpdf->SetTitle('WordPressサーバー移転サービス見積書');
    $mpdf->SetAuthor('WordPress移転サービス');
    $mpdf->SetCreator('WordPress移転サービス見積システム');
    
    // フォント設定
    $mpdf->SetFont('ipag');
    
    // ヘッダー情報
    $mpdf->SetHTMLHeader('
        <div style="text-align: right; font-weight: bold;">
            WordPressサーバー移転・ドメイン移管サービス 見積書
        </div>
    ');
    
    // フッター情報
    $mpdf->SetHTMLFooter('
        <div style="text-align: right; font-size: 8pt;">
            {PAGENO} / {nbpg}
        </div>
    ');
    
    // PDFテンプレートの読み込み
    ob_start();
    include __DIR__ . '/includes/pdf-template.php';
    $html = ob_get_clean();
    
    // HTMLをPDFに設定
    $mpdf->WriteHTML($html);
    
    // 出力方法の判定
    $outputMode = isset($data['outputMode']) ? $data['outputMode'] : 'download';
    
    if ($outputMode === 'base64') {
        // Base64エンコードしてJSONで返す
        $pdfContent = $mpdf->Output('', 'S');
        $base64Pdf = base64_encode($pdfContent);
        
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'pdf' => $base64Pdf,
            'filename' => 'wordpress_estimate_' . date('YmdHis') . '.pdf'
        ]);
    } else {
        // 直接ダウンロード
        $mpdf->Output('wordpress_estimate_' . date('YmdHis') . '.pdf', 'D');
    }
    
    writeLog('PDFが正常に生成されました');

} catch (Exception $e) {
    // エラーログを記録
    writeLog('エラー: ' . $e->getMessage());
    
    // クライアントにエラーを返す
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'PDF生成に失敗しました: ' . $e->getMessage()
    ]);
}
?>
```

#### HTML実装（PDF出力ボタン）

```html
<!-- PDF出力ボタン -->
<div class="control-buttons">
  <button type="button" id="calculate-button" class="btn btn-primary">見積り計算</button>
  <button type="button" id="pdf-export-button" class="btn btn-danger">PDFで出力</button>
  <button type="button" id="excel-export-button" class="btn btn-success">Excelで出力</button>
</div>
```

#### JavaScriptの実装（pdf-export.js）

```javascript
/**
 * PDF出力機能用JavaScript
 * @version 1.0.0
 * @date 2025-04-22
 */

$(document).ready(function() {
    // PDFエクスポートボタンのクリックイベント
    $('#pdf-export-button').on('click', function() {
        // フォームが計算済みかチェック
        if (!isFormCalculated()) {
            alert('先に見積り計算ボタンをクリックしてください。');
            return;
        }
        
        // フォームデータの収集
        const formData = collectFormData();
        
        // PDFエクスポートの実行
        exportToPdf(formData);
    });
    
    // フォームが計算済みかチェックする関数
    function isFormCalculated() {
        // 合計金額が計算されているかで判断
        return $('#grand-total').text() !== '' && $('#grand-total').text() !== '0';
    }
    
    // フォームデータを収集する関数
    function collectFormData() {
        return {
            // 顧客情報
            customerName: $('#customer-name').val(),
            companyName: $('#company-name').val(),
            email: $('#email').val(),
            phone: $('#phone').val(),
            
            // WordPress情報
            siteUrl: $('#site-url').val(),
            wpVersion: $('#wp-version').val(),
            phpVersion: $('#php-version').val(),
            siteSize: $('#site-size').val(),
            
            // 価格情報
            basicPrice: $('#basic-price').text().replace(/[^0-9]/g, ''),
            siteSizePrice: $('#site-size-price').text().replace(/[^0-9]/g, ''),
            serverPrice: $('#server-price').text().replace(/[^0-9]/g, ''),
            domainPrice: $('#domain-price').text().replace(/[^0-9]/g, ''),
            emailPrice: $('#email-price').text().replace(/[^0-9]/g, ''),
            optionsPrice: $('#options-price').text().replace(/[^0-9]/g, ''),
            
            // 割引情報
            snsDiscount: $('#sns-discount-checkbox').is(':checked'),
            discountValue: $('#discount-value').text().replace(/[^0-9]/g, ''),
            
            // 合計金額
            subtotal: $('#subtotal').text().replace(/[^0-9]/g, ''),
            tax: $('#tax').text().replace(/[^0-9]/g, ''),
            grandTotal: $('#grand-total').text().replace(/[^0-9]/g, ''),
            
            // 選択されたオプション
            selectedOptions: getSelectedOptions(),
            
            // 出力モード
            outputMode: 'download' // または 'base64'
        };
    }
    
    // 選択されたオプションを取得する関数
    function getSelectedOptions() {
        const options = [];
        
        // チェックボックスの値を収集
        $('input[type="checkbox"]:checked').each(function() {
            const optionLabel = $(this).parent().text().trim();
            if (optionLabel && !optionLabel.includes('SNS')) { // SNS割引は除外
                options.push(optionLabel);
            }
        });
        
        // セレクトボックスの値を収集
        $('select').each(function() {
            const value = $(this).val();
            const optionLabel = $(this).find('option:selected').text().trim();
            if (value && value !== '0' && optionLabel) {
                options.push(optionLabel);
            }
        });
        
        return options;
    }
    
    // PDF出力の実行関数
    function exportToPdf(formData) {
        // ローディング表示
        showLoading('PDFを生成中...');
        
        // Ajax通信でPDF出力リクエスト
        $.ajax({
            url: 'export-pdf.php',
            type: 'POST',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                // ローディング非表示
                hideLoading();
                
                if (response.success) {
                    // 成功時の処理
                    if (formData.outputMode === 'base64') {
                        // Base64エンコードされたPDFをダウンロード
                        downloadBase64Pdf(response.pdf, response.filename);
                    } else {
                        // 直接ダウンロードの場合は何もしない（ブラウザが処理）
                        console.log('PDF出力成功');
                    }
                } else {
                    // エラー処理
                    showError('PDF生成に失敗しました: ' + response.message);
                }
            },
            error: function(xhr, status, error) {
                // ローディング非表示
                hideLoading();
                
                // エラー処理
                showError('通信エラーが発生しました: ' + error);
                console.error('Ajax error:', xhr.responseText);
            }
        });
    }
    
    // Base64エンコードされたPDFをダウンロードする関数
    function downloadBase64Pdf(base64Data, filename) {
        const blob = base64ToBlob(base64Data, 'application/pdf');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename || 'estimate.pdf';
        link.click();
        URL.revokeObjectURL(link.href);
    }
    
    // Base64データをBlobに変換する関数
    function base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        
        return new Blob(byteArrays, { type: mimeType });
    }
    
    // ローディング表示関数
    function showLoading(message) {
        // ローディング表示の実装
        $('body').append('<div id="loading-overlay"><div class="spinner"></div><div class="message">' + message + '</div></div>');
    }
    
    // ローディング非表示関数
    function hideLoading() {
        $('#loading-overlay').remove();
    }
    
    // エラー表示関数
    function showError(message) {
        alert(message);
    }
});
```

### ファイル構造の最適化

ファイル構造を整理し、メンテナンス性を向上させるために以下のディレクトリ構成に最適化しました：

1. **includes/** ディレクトリの追加
   - 共通設定・関数を分離し、再利用性を向上
   - PDF生成テンプレートを個別ファイルとして管理

2. **js/** ディレクトリの整理
   - 機能ごとにJavaScriptファイルを分割
   - 各ファイルに明確な役割を設定

3. **バックアップ体制の確立**
   - 重要な変更前には必ずバックアップを作成
   - `/backup/YYYYMMDD/` 形式でバックアップを保存

## 4. 自動デプロイシステム

現時点では自動デプロイは未実装です。ファイルの更新は手動で行います。

### 手動デプロイ (FTP)

FileZillaを使用して、以下の手順でファイルをアップロードします：

```
【ツール: FileZilla】
- ホスト: sv16.sixcore.ne.jp
- ユーザー名: admin@mitsumori-hack.com
- パスワード: [pass304130]
- ポート: 21（標準FTPポート）
```

操作手順:
1. FileZillaを起動し、サーバーに接続
2. ローカルサイト（左側）でファイルを選択
3. リモートサイト（右側）の適切なディレクトリにドラッグ＆ドロップ
4. ブラウザでサイトにアクセスして変更を確認

## 5. トラブルシューティング

### PDF生成エラー

**問題**: PDFダウンロードボタンをクリックしても反応がない

**解決方法**:
1. ブラウザのコンソールでエラーを確認
2. PHPエラーログを確認（/pdf_error.log）
3. mPDFライブラリのパスが正しいか確認
4. メモリ制限を確認（memory_limit）

### 日本語文字化け

**問題**: PDFで日本語が正しく表示されない

**解決方法**:
1. mPDFのフォント設定を確認（ipagフォントが正しく設定されているか）
2. エンコーディングがUTF-8であることを確認
3. PDF-export.jsでのデータ送信エンコードを確認

### サーバー接続エラー

**問題**: Ajax通信が失敗する

**解決方法**:
1. .htaccessでのアクセス制限を確認
2. PHPバージョンの互換性確認
3. サーバー負荷状況の確認

### レイアウト崩れ

**問題**: PDFのレイアウトが崩れている

**解決方法**:
1. CSS設定の見直し
2. テーブル構造の確認
3. 長文入力時の対応を実装

### デバッグ方法

ログを利用したデバッグ：
```php
// デバッグログ記録
function debug_log($message, $data = null) {
    $log_file = __DIR__ . '/debug.log';
    $timestamp = date('Y-m-d H:i:s');
    $log_message = "[$timestamp] $message";
    
    if ($data !== null) {
        $log_message .= "\nData: " . print_r($data, true);
    }
    
    file_put_contents($log_file, $log_message . "\n\n", FILE_APPEND);
}
```

## 6. 本番環境へのデプロイ

### 準備とチェックリスト

1. **テスト環境での動作確認**
   - PDF出力が正常に機能するか確認
   - 日本語フォントが正しく表示されるか確認
   - エラーハンドリングが機能するか確認

2. **バックアップ作成**
   ```bash
   # サーバーにSSH接続
   ssh besttrust@sv16.sixcore.ne.jp -p 10022
   
   # バックアップを作成
   cd /home/besttrust/mitsumori-hack.com/public_html
   mkdir -p backup/$(date +%Y%m%d)
   cp -r *.php *.html .htaccess css js mpdf backup/$(date +%Y%m%d)/
   ```

3. **ファイル転送**
   - FileZillaを使用してファイルをアップロード
   - ファイルの所有者とパーミッションを確認

4. **動作確認**
   - 本番環境で見積フォームを開く
   - テストデータを入力して見積り計算を実行
   - PDF出力ボタンをクリックしてPDFを生成

### FTP経由のデプロイ

FileZillaを使用して以下の手順で本番環境にデプロイします：

1. **接続情報の入力**
   - ホスト: sv16.sixcore.ne.jp
   - ユーザー名: admin@mitsumori-hack.com
   - パスワード: [pass304130]
   - ポート: 21

2. **ファイルの転送**
   - 更新したファイルを選択
   - リモートサイトの適切なディレクトリにドラッグ＆ドロップ

3. **パーミッションの確認**
   - PHPファイル: 644
   - ディレクトリ: 755
   - 実行可能ファイル: 755

4. **デプロイ後の確認**
   - PDF出力機能が正常に動作するか確認
   - エラーログに問題がないか確認

## 7. プロジェクト固有の注意点

### mPDFライブラリの設定

- **パス**: `/home/besttrust/mitsumori-hack.com/public_html/mpdf/`
- **バージョン**: v6.1.3（現時点で使用中）
- **日本語フォント**: ipagフォントを使用

### ファイルパーミッション

- **PHPファイル**: 644
- **ディレクトリ**: 755
- **設定ファイル**: 640
- **ログファイル**: 666（書き込み権限が必要）

### エラーハンドリング

本番環境では詳細なエラー情報を表示しないよう設定を変更：
```php
// 本番環境での設定
ini_set('display_errors', 0);
error_reporting(0);
```

### セキュリティ対策

1. **入力検証**
   - すべてのユーザー入力に対してバリデーション
   - HTMLインジェクション対策としてhtmlspecialchars()を使用

2. **ファイルアクセス制限**
   - 一時ディレクトリへのアクセスを制限
   ```apache
   # .htaccessに追加
   <Directory "/home/besttrust/mitsumori-hack.com/public_html/tmp">
       Deny from all
   </Directory>
   <Directory "/home/besttrust/mitsumori-hack.com/public_html/includes">
       Deny from all
   </Directory>
   ```

## 8. 今後の参考情報

### メンテナンス計画

1. **定期的なコードレビュー**
   - 3か月ごとにコードの品質チェック
   - 不要なファイルやログの削除
   - パフォーマンス最適化

2. **ライブラリの更新確認**
   - mPDFライブラリの新バージョンリリース確認
   - セキュリティアップデートの適用
   - 互換性テストの実施

3. **エラーログの監視**
   - エラーログを週1回確認
   - 頻発するエラーがある場合は迅速に対応
   - ログローテーション設定（1MB以上でローテーション）

### 将来の拡張可能性

1. **フォーム連携の強化**
   - Contact Form 7との連携
   - データベース保存機能の追加
   - 多言語対応（英語など）

2. **デザイン強化**
   - 複数のPDFテンプレート選択機能
   - カスタムロゴや画像の挿入機能
   - モバイルフレンドリーなレスポンシブデザイン

3. **ユーザーエクスペリエンス向上**
   - PDFプレビュー機能の追加
   - 自動メール送信機能
   - 見積履歴管理機能

### 参考資料

1. **mPDF公式ドキュメント**
   - URL: https://mpdf.github.io/
   - バージョン: v6.1.3
   - 特に参考にしたセクション: 「Japanese support」「HTML/CSS support」

2. **WordPress開発者向けドキュメント**
   - URL: https://developer.wordpress.org/
   - 特に参考にしたセクション: 「Plugin Development」「WordPress Coding Standards」

3. **PHP公式マニュアル**
   - URL: https://www.php.net/manual/ja/
   - 特に参考にしたセクション: 「ファイル操作」「エラーハンドリング」

---

最終更新日: 2025年4月22日
