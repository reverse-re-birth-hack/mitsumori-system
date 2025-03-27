<?php
/**
 * PDFエクスポート処理
 * WordPressサーバー移転サービス見積フォーム用
 */

// セッションスタート
session_start();

// エラー表示設定（本番環境では0にすることを推奨）
ini_set('display_errors', 0);
error_reporting(E_ALL);

// タイムゾーン設定
date_default_timezone_set('Asia/Tokyo');

// 必要なファイルの読み込み
require_once 'includes/config.php';
require_once 'includes/functions.php';
require_once 'includes/pdf-template.php';

// POSTリクエストのみ処理
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    log_error('POSTリクエスト以外からのアクセスがありました。');
    header('Location: index.php?error=invalid_request');
    exit;
}

// CSRF対策（トークン検証）
if (!isset($_POST['token']) || $_POST['token'] !== $_SESSION['pdf_token']) {
    log_error('トークンが無効です。');
    header('Location: index.php?error=invalid_token');
    exit;
}

try {
    // フォームデータの取得
    $form_data = get_form_data();
    
    if ($form_data === false) {
        throw new Exception('フォームデータの取得に失敗しました。');
    }
    
    // PDFテンプレートのインスタンス化
    $pdf_template = new QuotePdfTemplate($form_data);
    
    // PDFの生成
    $mpdf = $pdf_template->generate();
    
    // 会社名から安全なファイル名を生成
    $company_name = $form_data['company'];
    $safe_filename = preg_replace('/[^a-zA-Z0-9_]/', '_', $company_name);
    $filename = 'server_migration_quote_' . $safe_filename . '.pdf';
    
    // PDFの出力
    $mpdf->Output($filename, 'D');
    
    // セッションのクリア
    unset($_SESSION['pdf_token']);
    
} catch (Exception $e) {
    // エラーログに記録
    log_error('PDF生成エラー: ' . $e->getMessage());
    
    // エラーページにリダイレクト
    header('Location: index.php?error=pdf_generation');
    exit;
}
