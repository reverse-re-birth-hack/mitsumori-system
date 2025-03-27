<?php
/**
 * WordPressサーバー移転サービス 見積りフォーム Excel出力スクリプト
 * @version 1.0.0
 */

// エラーレポート設定
error_reporting(E_ALL);
ini_set('display_errors', 1);

// POSTデータを取得（JavaScriptからのリクエスト）
$formData = $_POST;

// 現在の日付を取得
$now = date('YmdHis');
$dateFormatted = date('Y年m月d日');

// POSTデータのデバッグログ（本番環境では無効にしてください）
$logFile = 'export-log.txt';
file_put_contents($logFile, print_r($formData, true));

// PHPSpreadsheetがない場合の代替策（シンプルなCSV出力）
header('Content-Type: text/csv; charset=UTF-8');
header('Content-Disposition: attachment; filename="wordpress_estimate_'.$now.'.csv"');

// 出力バッファを開始
ob_start();

// CSV出力用のファイルポインタを作成
$output = fopen('php://output', 'w');

// BOMを書き込み（Excelで開いた際に文字化けを防ぐ）
fputs($output, "\xEF\xBB\xBF");

// ヘッダー行
fputcsv($output, ['WordPressサーバー移転・ドメイン移管・CMS移行サービス 見積書']);
fputcsv($output, ['作成日:', $dateFormatted]);
fputcsv($output, []);

// 基本情報
fputcsv($output, ['基本情報']);
fputcsv($output, ['サイトURL', $formData['siteUrl'] ?? '']);
fputcsv($output, ['WordPress バージョン', $formData['wpVersion'] ?? '']);
fputcsv($output, ['PHP バージョン', $formData['phpVersion'] ?? '']);
fputcsv($output, ['サイト容量', ($formData['siteSize'] ?? '0') . ' GB']);
fputcsv($output, []);

// サーバー情報
fputcsv($output, ['サーバー情報']);
fputcsv($output, ['現在のサーバー', $formData['currentServer'] ?? '']);
fputcsv($output, ['新しいサーバー', $formData['newServer'] ?? '']);
fputcsv($output, []);

// 見積り内容
fputcsv($output, ['見積り内容']);
fputcsv($output, ['項目', '金額']);
fputcsv($output, ['基本料金', '12,000円']);

// 日時指定
if (isset($formData['dateChoice']) && $formData['dateChoice'] === 'specific') {
    fputcsv($output, ['日時指定あり', '10,000円']);
}

// SNS拡散割引
if (isset($formData['snsDiscount']) && $formData['snsDiscount'] === 'yes') {
    // 数値に変換してから計算
    $rawTotal = isset($formData['rawTotal']) ?
        preg_replace('/[^\d.]/', '', $formData['rawTotal']) : 0;
    $discountAmount = round($rawTotal * 0.05);
    fputcsv($output, ['SNS拡散割引（5%）', '-' . number_format($discountAmount) . '円']);
}

// その他オプション（実際のPOST値に応じて処理）

// 合計金額
fputcsv($output, []);

// すべての金額処理を統一する関数
function cleanNumberFormat($value) {
    // 円記号、カンマ、その他の非数値文字（小数点は除く）を削除
    return preg_replace('/[^\d.]/', '', $value);
}

// 金額処理の改善
function processAmount($amount, $default = 12000) {
    // 数値でない場合やnullの場合はデフォルト値を使用
    if (!isset($amount) || $amount === '' || !is_numeric($amount)) {
        return $default;
    }
    // 数値として処理
    return (float)$amount;
}

// 合計金額の処理（改善版）
$rawTotal = processAmount($formData['rawTotal'] ?? '', 12000);
$taxRate = 0.1; // 10%
$taxAmount = floor($rawTotal * $taxRate);
$totalWithTax = $rawTotal + $taxAmount;

// デバッグログ（計算過程の確認）
file_put_contents($logFile, "\n--- 計算過程 ---\n", FILE_APPEND);
file_put_contents($logFile, "処理後のrawTotal: {$rawTotal}\n", FILE_APPEND);
file_put_contents($logFile, "税額計算: {$taxAmount}\n", FILE_APPEND);
file_put_contents($logFile, "税込合計: {$totalWithTax}\n", FILE_APPEND);

fputcsv($output, ['合計金額（税込）', number_format($totalWithTax) . '円']);

// 出力バッファをフラッシュ
ob_end_flush();
?>