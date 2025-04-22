<?php
// エラー表示
ini_set('display_errors', 1);
error_reporting(E_ALL);

// エラーログ
function writeLog($message) {
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents('pdf_error.log', "[$timestamp] $message\n", FILE_APPEND);
}

try {
    writeLog('テスト開始');
    
    // mPDFパス（確認したパスに修正）
    $mpdfPath = __DIR__ . '/mpdf/vendor/autoload.php';
    writeLog('mPDFパス: ' . $mpdfPath);
    
    if (!file_exists($mpdfPath)) {
        throw new Exception('mPDFが見つかりません: ' . $mpdfPath);
    }
    
    require_once $mpdfPath;
    
    // mPDFインスタンス作成
    $mpdf = new \Mpdf\Mpdf(['mode' => 'ja']);
    $mpdf->WriteHTML('<h1>PDF出力テスト</h1><p>これはテストです。</p>');
    $mpdf->Output('test.pdf', 'D');
    
    writeLog('テスト成功');
} catch (Exception $e) {
    writeLog('エラー: ' . $e->getMessage());
    echo 'PDF生成に失敗しました: ' . $e->getMessage();
}
?>
