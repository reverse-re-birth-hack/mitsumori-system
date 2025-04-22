<?php
// GitHubからのWebhookを処理するスクリプト
$log_file = 'deploy-log.txt';
$repo_dir = '/home/besttrust/mitsumori-hack.com/public_html';

// ログ記録関数
function write_log($message) {
  global $log_file;
  file_put_contents($log_file, date('Y-m-d H:i:s') . ": " . $message . "\n", FILE_APPEND);
}

// ログ開始
write_log("Webhook received");

// GitHubからの更新を取得
$output = [];
exec('cd ' . $repo_dir . ' && git pull origin master 2>&1', $output);
$pull_output = implode("\n", $output);
write_log("Git pull output: " . $pull_output);

echo "Deployment completed. Check deploy-log.txt for details.";
?>