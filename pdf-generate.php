<?php
// エラーハンドリング
ini_set('display_errors', 1);
error_reporting(E_ALL);

// ログ関数
function writeLog($message) {
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents('pdf_log.txt', "[$timestamp] $message\n", FILE_APPEND);
}

try {
    writeLog('PDF生成処理開始');
    
    // mPDFライブラリ読み込み
    require_once __DIR__ . '/mpdf/vendor/autoload.php';
    
    // PDFインスタンス作成
    $mpdf = new \Mpdf\Mpdf([
        'mode' => 'ja',
        'format' => 'A4',
        'margin_left' => 15,
        'margin_right' => 15,
        'margin_top' => 16,
        'margin_bottom' => 16
    ]);
    
    // タイトル設定
    $mpdf->SetTitle('WordPressサーバー移転見積書');
    
    // 日本語フォント設定
    $mpdf->SetFont('ipag');
    
    // HTML内容
    $html = '
    <style>
        body { font-family: ipag, sans-serif; }
        h1 { text-align: center; font-size: 18pt; margin-bottom: 20px; }
        .date { text-align: right; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        .price-table { width: 100%; border-collapse: collapse; }
        .price-table th { text-align: left; padding: 8px; background-color: #f0f0f0; border: 1px solid #ddd; }
        .price-table td { padding: 8px; border: 1px solid #ddd; }
        .price { text-align: right; }
        .total { font-weight: bold; background-color: #eaf4ff; }
        .note { font-size: 10pt; margin-top: 30px; }
    </style>
    
    <h1>WordPressサーバー移転・ドメイン移管サービス 見積書</h1>
    
    <div class="date">作成日: ' . date('Y年m月d日') . '</div>
    
    <div class="section">
        <h2>料金内訳</h2>
        <table class="price-table">
            <tr><th width="70%">項目</th><th width="30%">金額</th></tr>
            <tr><td>基本料金</td><td class="price">¥12,000</td></tr>
            <tr><td>サイト容量追加料金</td><td class="price">¥0</td></tr>
            <tr><td>サーバー移転料金</td><td class="price">¥0</td></tr>
            <tr><td>ドメイン関連料金</td><td class="price">¥0</td></tr>
            <tr><td>メール設定料金</td><td class="price">¥0</td></tr>
            <tr><td>オプションサービス料金</td><td class="price">¥0</td></tr>
            <tr><td>小計</td><td class="price">¥12,000</td></tr>
            <tr><td>消費税 (10%)</td><td class="price">¥1,200</td></tr>
            <tr class="total"><td>合計金額</td><td class="price">¥13,200</td></tr>
        </table>
    </div>
    
    <div class="note">
        <p>※本見積りの有効期限は発行日より30日間です。</p>
        <p>※料金はすべて税込み表示です。</p>
        <p>※サーバー移転やドメイン移管に関する詳細はご契約時にご説明いたします。</p>
    </div>
    ';
    
    // PDFに書き込み
    $mpdf->WriteHTML($html);
    
    // ダウンロード（D=ダウンロード強制、I=ブラウザ内表示）
    $mpdf->Output('wordpress_estimate_' . date('YmdHis') . '.pdf', 'D');
    
    writeLog('PDF生成成功');
    
} catch (Exception $e) {
    writeLog('エラー: ' . $e->getMessage());
    
    // エラー表示
    echo '<!DOCTYPE html><html><body>';
    echo '<h1>PDF生成エラー</h1>';
    echo '<p>' . $e->getMessage() . '</p>';
    echo '<p><a href="javascript:history.back();">戻る</a></p>';
    echo '</body></html>';
}
