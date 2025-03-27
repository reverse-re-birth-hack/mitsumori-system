/**
 * WordPress見積もりフォーム PDF出力スクリプト
 * @version 1.0.1
 */

// PDF出力機能の実装
function exportToPDF() {
    console.log('PDF出力処理を開始します');

    // 利用規約同意チェック
    if (!document.getElementById('agree_terms').checked) {
        alert('利用規約に同意してください。PDF出力するには利用規約への同意が必要です。');
        return;
    }

    // ローディング表示を追加
    const loadingOverlay = document.createElement('div');
    loadingOverlay.style.position = 'fixed';
    loadingOverlay.style.top = '0';
    loadingOverlay.style.left = '0';
    loadingOverlay.style.width = '100%';
    loadingOverlay.style.height = '100%';
    loadingOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    loadingOverlay.style.display = 'flex';
    loadingOverlay.style.justifyContent = 'center';
    loadingOverlay.style.alignItems = 'center';
    loadingOverlay.style.zIndex = '9999';
    
    const loadingMessage = document.createElement('div');
    loadingMessage.style.backgroundColor = 'white';
    loadingMessage.style.padding = '20px';
    loadingMessage.style.borderRadius = '5px';
    loadingMessage.style.fontWeight = 'bold';
    loadingMessage.textContent = 'PDFを生成しています...';
    
    loadingOverlay.appendChild(loadingMessage);
    document.body.appendChild(loadingOverlay);

    // 安全に要素の値を取得する関数
    function getValueSafely(id) {
        const element = document.getElementById(id);
        return element ? (element.value || '') : '';
    }

    // 安全にテキストコンテンツを取得する関数
    function getTextSafely(id) {
        const element = document.getElementById(id);
        return element ? (element.textContent || '') : '';
    }

    // フォームデータの作成
    const formData = new FormData();

    // 顧客情報
    formData.append('customerName', getValueSafely('customer_name'));
    formData.append('companyName', getValueSafely('company_name'));
    formData.append('email', getValueSafely('email'));
    formData.append('phone', getValueSafely('phone'));

    // サイト情報
    formData.append('siteUrl', getValueSafely('current_url'));
    formData.append('wpVersion', getValueSafely('wp_version'));
    formData.append('phpVersion', getValueSafely('php_version'));
    formData.append('siteSize', getValueSafely('site_size'));

    // 金額情報（円記号とカンマを除去）
    function cleanAmount(text) {
        return (text || '').replace(/[¥,]/g, '');
    }

    formData.append('rawTotal', cleanAmount(getTextSafely('subtotal')));
    formData.append('displayTotal', cleanAmount(getTextSafely('grand-total')));

    // フォームの送信方法をXMLHttpRequestに変更（古いブラウザ対応のため）
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'export-pdf.php', true);
    xhr.responseType = 'blob';

    xhr.onload = function() {
        // ローディング表示を削除
        document.body.removeChild(loadingOverlay);

        if (this.status === 200) {
            const contentType = this.getResponseHeader('content-type');
            
            // エラーレスポンスの場合はJSONとして処理
            if (contentType && contentType.indexOf('application/json') !== -1) {
                const reader = new FileReader();
                reader.onload = function() {
                    try {
                        const errorData = JSON.parse(this.result);
                        console.error('PDF生成エラー:', errorData);
                        alert('PDF生成中にエラーが発生しました: ' + errorData.message);
                    } catch (e) {
                        console.error('エラーレスポンスの解析に失敗:', e);
                        alert('PDF生成中に不明なエラーが発生しました');
                    }
                };
                reader.readAsText(this.response);
                return;
            }
            
            // 正常なPDFファイルを処理
            const blob = new Blob([this.response], {type: 'application/pdf'});
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'wordpress_estimate_' + new Date().getTime() + '.pdf';
            document.body.appendChild(link);
            link.click();
            setTimeout(function() {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 100);
        } else {
            console.error('PDF出力に失敗:', this.status);
            alert('PDF出力に失敗しました。サーバーエラーが発生しました。');
        }
    };

    xhr.onerror = function() {
        // ローディング表示を削除
        document.body.removeChild(loadingOverlay);
        console.error('ネットワークエラー');
        alert('ネットワークエラーが発生しました。インターネット接続を確認してください。');
    };

    xhr.send(formData);
}

// PDF出力ボタンに機能を追加
document.addEventListener('DOMContentLoaded', function() {
    const pdfButton = document.getElementById('export-pdf');
    if (pdfButton) {
        pdfButton.addEventListener('click', exportToPDF);
        console.log('PDF出力ボタンにイベントリスナーを設定しました');
    } else {
        console.warn('PDF出力ボタンが見つかりません');
    }
    
    // モーダル内のPDFボタンも設定
    const pdfModalButton = document.getElementById('export-pdf-modal');
    if (pdfModalButton) {
        pdfModalButton.addEventListener('click', exportToPDF);
        console.log('モーダル内PDF出力ボタンにイベントリスナーを設定しました');
    }
});