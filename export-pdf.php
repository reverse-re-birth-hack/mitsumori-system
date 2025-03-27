<?php
/**
 * WordPressサーバー移転サービス 見積りフォーム PDF出力スクリプト
 * @version 1.0.2
 */

// エラー出力を無効化（PDFに混入するのを防ぐ）
error_reporting(0);
ini_set('display_errors', 0);

// エラーのみログファイルに記録
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/pdf_error.log');

// ログ出力関数
function logError($message) {
    $logFile = __DIR__ . '/pdf_error.log';
    $timestamp = date('[Y-m-d H:i:s] ');
    file_put_contents($logFile, $timestamp . $message . PHP_EOL, FILE_APPEND);
}

// 出力バッファリングを有効化（ヘッダー前の出力を防ぐ）
ob_start();

try {
    // ディレクトリの確認と作成
    $tempDir = __DIR__ . '/kaiseki/mpdf/tmp';
    $fontDir = __DIR__ . '/kaiseki/mpdf/ttfontdata';

    if (!is_dir($tempDir)) {
        mkdir($tempDir, 0777, true);
        chmod($tempDir, 0777);
        logError("一時ディレクトリを作成: " . $tempDir);
    }

    if (!is_dir($fontDir)) {
        mkdir($fontDir, 0777, true);
        chmod($fontDir, 0777);
        logError("フォントディレクトリを作成: " . $fontDir);
    }

    // mPDF読み込み
    $vendorPath = __DIR__ . '/kaiseki/vendor/autoload.php';
    if (!file_exists($vendorPath)) {
        throw new Exception("エラー: autoload.php が見つかりません: " . $vendorPath);
    }
    
    require_once $vendorPath;
    logError("mPDF読み込み成功");

    // POSTデータ取得
    $postData = json_decode(file_get_contents('php://input'), true);
    if (!$postData) {
        // POST データが JSON でない場合は直接 $_POST を使用
        $postData = $_POST;
    }

    $customerName = $postData['customerName'] ?? '未入力';
    $companyName = $postData['companyName'] ?? '未入力';
    $email = $postData['email'] ?? '未入力';
    $phone = $postData['phone'] ?? '未入力';
    $siteUrl = $postData['siteUrl'] ?? '未入力';
    $wpVersion = $postData['wpVersion'] ?? '未入力';
    $phpVersion = $postData['phpVersion'] ?? '未入力';
    $siteSize = $postData['siteSize'] ?? '0';

    // 金額データ
    $rawTotal = isset($postData['rawTotal']) && is_numeric($postData['rawTotal'])
        ? (float)$postData['rawTotal'] : 12000;
    $taxRate = 0.1;
    $taxAmount = floor($rawTotal * $taxRate);
    $totalWithTax = $rawTotal + $taxAmount;

    // 日時データ
    $now = date('Y年m月d日 H:i');

    // 出力バッファをクリア（安全のため）
    while (ob_get_level()) {
        ob_end_clean();
    }

    // mPDFオブジェクト生成
    $mpdf = new \Mpdf\Mpdf([
        'mode' => 'utf-8',
        'format' => 'A4',
        'tempDir' => $tempDir
    ]);

    logError("mPDFインスタンス作成成功");

    // シンプルなHTMLコンテンツ
    $html = '
    <!DOCTYPE html>
    <html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <style>
            body { font-family: sans-serif; }
            h1 { color: #0056b3; font-size: 18pt; text-align: center; }
            h2 { color: #0056b3; font-size: 14pt; border-left: 4px solid #0056b3; padding-left: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { padding: 6px; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; text-align: left; width: 30%; }
            .total { color: #e74c3c; font-weight: bold; }
            .footer { font-size: 10pt; text-align: center; margin-top: 30px; }
        </style>
    </head>
    <body>
        <h1>WordPress見積書</h1>
        <p style="text-align: right;">作成日: ' . $now . '</p>

        <h2>お客様情報</h2>
        <table>
            <tr><th>お名前</th><td>' . htmlspecialchars($customerName) . '</td></tr>
            <tr><th>会社名</th><td>' . htmlspecialchars($companyName) . '</td></tr>
            <tr><th>メールアドレス</th><td>' . htmlspecialchars($email) . '</td></tr>
            <tr><th>電話番号</th><td>' . htmlspecialchars($phone) . '</td></tr>
        </table>

        <h2>サイト情報</h2>
        <table>
            <tr><th>サイトURL</th><td>' . htmlspecialchars($siteUrl) . '</td></tr>
            <tr><th>WPバージョン</th><td>' . htmlspecialchars($wpVersion) . '</td></tr>
            <tr><th>PHPバージョン</th><td>' . htmlspecialchars($phpVersion) . '</td></tr>
            <tr><th>サイト容量</th><td>' . htmlspecialchars($siteSize) . ' GB</td></tr>
        </table>

        <h2>料金内訳</h2>
        <table>
            <tr><th>基本料金</th><td>¥12,000</td></tr>
            <tr><th>小計</th><td>¥' . number_format($rawTotal) . '</td></tr>
            <tr><th>消費税(10%)</th><td>¥' . number_format($taxAmount) . '</td></tr>
            <tr><th>合計金額</th><td class="total">¥' . number_format($totalWithTax) . '</td></tr>
        </table>

        <p class="footer">
            ※本見積りの有効期限は発行日より30日間です。
        </p>
    </body>
    </html>';

    // PDFに変換・出力
    $mpdf->WriteHTML($html);
    logError("HTML書き込み完了");
    
    // ファイル名の設定
    $companyPrefix = $companyName ? preg_replace('/[^a-zA-Z0-9]/', '', $companyName) : 'wp';
    $filename = 'wordpress_estimate_' . $companyPrefix . '_' . date('Ymd') . '.pdf';
    
    // PDFを出力
    $mpdf->Output($filename, \Mpdf\Output\Destination::DOWNLOAD);
    logError("PDF出力完了: " . $filename);

    exit;
} catch (Exception $e) {
    // エラーをログに記録
    logError("PDFエラー: " . $e->getMessage());

    // バッファをクリア
    while (ob_get_level()) {
        ob_end_clean();
    }

    // エラーメッセージをJSON形式で返す
    header('Content-Type: application/json');
    echo json_encode([
        'error' => true,
        'message' => 'PDF生成エラー: ' . $e->getMessage(),
        'detail' => $e->getTraceAsString()
    ]);

    exit;
}
?>