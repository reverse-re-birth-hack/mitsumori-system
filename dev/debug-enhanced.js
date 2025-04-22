/**
 * WordPressサーバー移転見積りフォーム - 拡張デバッグスクリプト
 * バージョン: 1.3.0
 * 作成日: 2025年3月13日
 *
 * このスクリプトは見積りフォームの問題点を解決するためのものです。
 *
 * 実装されている機能:
 * 1. パスワードフィールドをテキストフィールドに変換
 * 2. 見積り金額詳細表示機能の修正
 * 3. メールアカウント追加機能の修正
 * 4. イベントリスナーの最適化
 * 5. エラーハンドリングの強化
 */

// デバッグモード設定（本番環境では false に設定）
const DEBUG_MODE = true;

/**
 * ユーティリティ関数: デバッグログ出力
 * @param {...any} args - ログに出力する引数
 */
function debugLog(...args) {
    if (DEBUG_MODE) {
        console.log('[DEBUG]', ...args);
    }
}

/**
 * ユーティリティ関数: エラーログ出力
 * @param {...any} args - エラーログに出力する引数
 */
function errorLog(...args) {
    if (DEBUG_MODE) {
        console.error('[ERROR]', ...args);
    }
}

// 初期化時の処理
document.addEventListener('DOMContentLoaded', function() {
    debugLog('拡張デバッグスクリプトが読み込まれました');

    // 1. パスワードフィールドの修正
    fixPasswordFields();

    // 2. 見積り金額詳細表示機能の修正
    enhanceDetailsDisplay();

    // 3. メールアカウント追加機能の修正
    enhanceEmailAccountFunctions();

    // 4. イベントリスナーの最適化
    optimizeEventListeners();

    // 5. エラーハンドリングの強化
    setupErrorHandling();

    debugLog('拡張デバッグスクリプトの初期化が完了しました');
});

/**
 * 1. パスワードフィールドの修正関数
 * すべてのパスワードフィールドをテキストフィールドに変更します
 */
function fixPasswordFields() {
    debugLog('パスワードフィールドの修正を開始します');

    // 修正対象のIDリスト
    const passwordFieldIds = [
        'wp_login_password',
        'source_server_login_password',
        'target_server_login_password',
        'source_domain_login_password',
        'target_domain_login_password',
        'source_ftp_password',
        'target_ftp_password',
        'email_password'
    ];

    // 各パスワードフィールドのtype属性を変更
    let changedCount = 0;
    passwordFieldIds.forEach(id => {
        const field = document.getElementById(id);
        if (field && field.type === 'password') {
            field.type = 'text';
            changedCount++;
            debugLog(`パスワードフィールド変更: ${id}`);
        }
    });

    // 動的に生成されるフィールド用にcreateEmailAccountElement関数をオーバーライド
    if (typeof window.createEmailAccountElement === 'function') {
        const originalFunction = window.createEmailAccountElement;

        window.createEmailAccountElement = function(index) {
            debugLog(`メールアカウント要素生成関数をオーバーライド: index=${index}`);

            // オリジナル関数を呼び出し
            const element = originalFunction(index);

            // パスワードフィールドを検索して修正
            if (element) {
                const passwordField = element.querySelector(`input[id^="email_password_"]`);
                if (passwordField && passwordField.type === 'password') {
                    passwordField.type = 'text';
                    debugLog(`動的パスワードフィールド変更: email_password_${index}`);
                }
            }

            return element;
        };

        debugLog('メールアカウント要素生成関数のオーバーライドが完了しました');
    }

    // LocalStorage保存処理の修正（元のパスワードフィールドを特定して保存から除外）
    if (typeof window.saveProgress === 'function') {
        const originalSaveProgress = window.saveProgress;

        window.saveProgress = function() {
            debugLog('saveProgress関数をオーバーライド');

            // オリジナル関数の呼び出し前に処理を実行
            const formData = {};
            const inputs = document.querySelectorAll('input, textarea, select');

            inputs.forEach(input => {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    formData[input.id || input.name] = input.checked;
                } else {
                    // パスワードフィールド（現在はtextに変更されている）の保存をスキップ
                    if (!passwordFieldIds.includes(input.id) &&
                        !input.id?.startsWith('email_password_')) {
                        formData[input.id || input.name] = input.value;
                    }
                }
            });

            localStorage.setItem('wpEstimateFormData', JSON.stringify(formData));
            debugLog('フォームデータを安全にLocalStorageに保存しました');

            // オリジナル関数は呼び出さない（既に処理を実行済み）
            return;
        };
    }

    debugLog(`パスワードフィールドの修正が完了しました。変更数: ${changedCount}`);
}

/**
 * 2. 見積り金額詳細表示機能の修正関数
 * 詳細表示の切り替えを改善します
 */
function enhanceDetailsDisplay() {
    debugLog('見積り金額詳細表示機能の修正を開始します');

    // updateDetailsDisplay関数のオーバーライド
    if (typeof window.updateDetailsDisplay === 'function') {
        const originalUpdateDetailsDisplay = window.updateDetailsDisplay;

        window.updateDetailsDisplay = function(category, options) {
            debugLog(`詳細表示更新関数呼び出し: カテゴリ=${category}, オプション数=${options.length}`);

            // 詳細表示コンテナの取得
            const detailsContainer = document.getElementById(`${category}-details`);
            if (!detailsContainer) {
                errorLog(`詳細表示コンテナが見つかりません: ${category}-details`);
                return;
            }

            debugLog(`詳細コンテナ取得成功: ${category}-details`);
            debugLog(`現在の表示状態: ${detailsContainer.classList.contains('hidden') ? '非表示' : '表示中'}`);

            // オリジナル関数を呼び出し
            originalUpdateDetailsDisplay(category, options);

            // 詳細表示の強制
            if (options.length > 0) {
                // 1. クラスによる制御
                detailsContainer.classList.remove('hidden');

                // 2. 直接スタイル操作による二重保証
                detailsContainer.style.display = 'block';

                debugLog(`詳細表示を強制: ${category}-details (${options.length}個のオプション)`);
            } else {
                // 空の場合は非表示
                detailsContainer.classList.add('hidden');
                detailsContainer.style.display = 'none';

                debugLog(`詳細表示を非表示: ${category}-details (オプションなし)`);
            }
        };

        debugLog('詳細表示更新関数のオーバーライドが完了しました');
    }

    // 詳細表示トグル機能の強化
    const categories = ['server', 'domain', 'email', 'options'];
    categories.forEach(category => {
        const detailsContainer = document.getElementById(`${category}-details`);
        const priceElement = document.getElementById(`${category}-price`);

        if (detailsContainer && priceElement) {
            // 既存のイベントリスナーを一旦削除（クローンして置き換え）
            const newDetailsContainer = detailsContainer.cloneNode(true);
            detailsContainer.parentNode.replaceChild(newDetailsContainer, detailsContainer);

            const newPriceElement = priceElement.cloneNode(true);
            priceElement.parentNode.replaceChild(newPriceElement, priceElement);

            // 改善されたイベントリスナーを設定
            newDetailsContainer.addEventListener('click', function(e) {
                // イベント伝播を停止
                e.stopPropagation();

                // トグル処理
                this.classList.toggle('hidden');
                this.style.display = this.classList.contains('hidden') ? 'none' : 'block';

                debugLog(`詳細表示がクリックされました: ${category}-details`);
            });

            newPriceElement.addEventListener('click', function(e) {
                // イベント伝播を停止
                e.stopPropagation();

                // 詳細表示のトグル
                const container = document.getElementById(`${category}-details`);
                if (container) {
                    container.classList.toggle('hidden');
                    container.style.display = container.classList.contains('hidden') ? 'none' : 'block';

                    debugLog(`価格要素がクリックされました: ${category}-price`);
                }
            });

            // カーソルスタイルとツールチップ
            newPriceElement.style.cursor = 'pointer';
            newPriceElement.title = 'クリックで詳細表示';

            debugLog(`${category}カテゴリの詳細表示トグル機能を強化しました`);
        }
    });

    debugLog('見積り金額詳細表示機能の修正が完了しました');
}

/**
 * 3. メールアカウント追加機能の修正関数
 * メールアカウントの追加・削除機能を強化します
 */
function enhanceEmailAccountFunctions() {
    debugLog('メールアカウント追加機能の修正を開始します');

    // add-email-accountボタンのイベントリスナー再設定
    const addButton = document.getElementById('add-email-account');
    if (addButton) {
        // 既存のイベントリスナーを削除するため、ボタンをクローンして置き換え
        const newAddButton = addButton.cloneNode(true);
        addButton.parentNode.replaceChild(newAddButton, addButton);

        // 新しいイベントリスナーを設定
        newAddButton.addEventListener('click', function() {
            debugLog('メールアカウント追加ボタンがクリックされました');

            try {
                // 現在のアカウント数を取得して1増やす
                const emailAccountCount = document.getElementById('email_account_count');
                if (!emailAccountCount) {
                    errorLog('メールアカウント数入力欄が見つかりません');
                    return;
                }

                const currentCount = parseInt(emailAccountCount.value) || 0;
                debugLog(`現在のメールアカウント数: ${currentCount}`);

                if (currentCount < 10) { // 最大10アカウントまで
                    emailAccountCount.value = currentCount + 1;
                    debugLog(`メールアカウント数を増加: ${currentCount} → ${currentCount + 1}`);

                    // メールアカウント入力欄を更新
                    if (typeof window.updateEmailAccounts === 'function') {
                        window.updateEmailAccounts();
                        debugLog('メールアカウント入力欄を更新しました');
                    } else {
                        errorLog('updateEmailAccounts関数が定義されていません');
                        enhancedUpdateEmailAccounts(); // 代替関数を実行
                    }

                    // 見積もり計算実行
                    const agreeTerms = document.getElementById('agree_terms');
                    if (agreeTerms && agreeTerms.checked && typeof window.calculateTotal === 'function') {
                        window.calculateTotal();
                        debugLog('見積もり計算を実行しました');
                    }
                } else {
                    alert('最大10アカウントまで設定できます');
                    debugLog('最大アカウント数に達しています（10）');
                }
            } catch (err) {
                errorLog('メールアカウント追加処理でエラーが発生しました:', err);
                // エラー時のフォールバック処理
                alert('メールアカウントの追加に失敗しました。ページをリロードしてお試しください。');
            }
        });

        debugLog('メールアカウント追加ボタンのイベントリスナーを再設定しました');
    } else {
        errorLog('メールアカウント追加ボタンが見つかりません');
    }

    // updateEmailAccounts関数の強化版（元の関数が動作しない場合のフォールバック）
    window.enhancedUpdateEmailAccounts = function() {
        debugLog('強化版updateEmailAccounts関数が呼び出されました');

        try {
            const container = document.getElementById('email-accounts-container');
            if (!container) {
                errorLog('メールアカウントコンテナが見つかりません');
                return;
            }

            const count = parseInt(document.getElementById('email_account_count').value) || 0;
            debugLog(`設定するメールアカウント数: ${count}`);

            // 現在のアカウントを確認
            const currentAccounts = container.querySelectorAll('.email-account');
            debugLog(`現在のメールアカウント要素数: ${currentAccounts.length}`);

            // アカウント数が減った場合、余分なアカウントを削除
            if (currentAccounts.length > count) {
                for (let i = count; i < currentAccounts.length; i++) {
                    currentAccounts[i].remove();
                    debugLog(`メールアカウントを削除: インデックス=${i}`);
                }
            }
            // アカウント数が増えた場合、新しいアカウントを追加
            else if (currentAccounts.length < count) {
                for (let i = currentAccounts.length + 1; i <= count; i++) {
                    // 既存のcreateEmailAccountElement関数を使用
                    const accountDiv = typeof window.createEmailAccountElement === 'function' ?
                        window.createEmailAccountElement(i) : createDefaultEmailAccountElement(i);

                    if (accountDiv) {
                        container.appendChild(accountDiv);
                        debugLog(`メールアカウントを追加: インデックス=${i}`);
                    }
                }
            }

            // アカウント番号を更新
            if (typeof window.updateEmailAccountNumbers === 'function') {
                window.updateEmailAccountNumbers();
            } else {
                enhancedUpdateEmailAccountNumbers();
            }

            debugLog('メールアカウント入力欄の更新が完了しました');
        } catch (err) {
            errorLog('メールアカウント更新処理でエラーが発生しました:', err);
        }
    };

    /**
     * デフォルトのメールアカウント要素生成関数
     * @param {number} index - アカウントのインデックス
     * @returns {HTMLElement} - 生成されたアカウント要素
     */
    function createDefaultEmailAccountElement(index) {
        debugLog(`デフォルトのメールアカウント要素生成関数: index=${index}`);

        try {
            const accountDiv = document.createElement('div');
            accountDiv.className = 'email-account';
            accountDiv.dataset.index = index;
            accountDiv.innerHTML = `
                <button type="button" class="remove-account" title="このアカウントを削除">×</button>
                <h3>メールアカウント ${index}</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="email_address_${index}">メールアドレス ${index}</label>
                        <input type="email" id="email_address_${index}" name="email_address_${index}" placeholder="例: info@example.com">
                    </div>
                    <div class="form-group">
                        <label for="email_password_${index}">設定するパスワード ${index}</label>
                        <input type="text" id="email_password_${index}" name="email_password_${index}">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group full-width">
                        <label>転送設定 (+¥1,000/転送先)</label>
                        <div class="forward-destinations">
                            <div class="forward-destination">
                                <input type="email" id="email_forward_${index}_1" name="email_forward_${index}_1" placeholder="例: forwarding@gmail.com">
                            </div>
                        </div>
                        <button type="button" class="add-forward-btn">+ 転送先を追加</button>
                        <p class="help-text">※転送先を入力すると、1転送先につき1,000円が追加されます</p>
                    </div>
                </div>
            `;

            // 削除ボタンのイベントリスナーを設定
            const removeButton = accountDiv.querySelector('.remove-account');
            if (removeButton) {
                removeButton.addEventListener('click', function() {
                    debugLog(`アカウント削除ボタンがクリックされました: index=${index}`);

                    try {
                        // メールアカウント数を減らす
                        const emailAccountCount = document.getElementById('email_account_count');
                        if (emailAccountCount) {
                            const currentCount = parseInt(emailAccountCount.value) || 0;
                            emailAccountCount.value = Math.max(0, currentCount - 1);
                            debugLog(`メールアカウント数を減少: ${currentCount} → ${Math.max(0, currentCount - 1)}`);
                        }

                        // 自身の要素を削除
                        accountDiv.remove();
                        debugLog(`アカウント要素を削除: index=${index}`);

                        // アカウント番号を更新
                        enhancedUpdateEmailAccountNumbers();

                        // 見積もり再計算
                        if (typeof window.calculateTotal === 'function') {
                            window.calculateTotal();
                            debugLog('見積もり計算を実行しました');
                        }
                    } catch (err) {
                        errorLog('アカウント削除処理でエラーが発生しました:', err);
                    }
                });
            }

            // 転送先追加ボタンのイベントリスナーを設定
            const addForwardButton = accountDiv.querySelector('.add-forward-btn');
            if (addForwardButton) {
                addForwardButton.addEventListener('click', function() {
                    debugLog(`転送先追加ボタンがクリックされました: アカウント=${index}`);

                    try {
                        const forwardContainer = accountDiv.querySelector('.forward-destinations');
                        if (forwardContainer) {
                            // 現在の転送先数を確認
                            const currentForwards = forwardContainer.querySelectorAll('.forward-destination');

                            if (currentForwards.length < 5) { // 最大5つまで
                                const forwardIndex = currentForwards.length + 1;

                                // 新しい転送先要素を作成
                                const forwardDiv = document.createElement('div');
                                forwardDiv.className = 'forward-destination';
                                forwardDiv.innerHTML = `
                                    <input type="email" id="email_forward_${index}_${forwardIndex}" name="email_forward_${index}_${forwardIndex}" placeholder="例: forwarding${forwardIndex}@gmail.com">
                                    <button type="button" class="remove-forward" title="この転送先を削除">×</button>
                                `;

                                // 転送先削除ボタンのイベントリスナーを設定
                                const removeForwardButton = forwardDiv.querySelector('.remove-forward');
                                if (removeForwardButton) {
                                    removeForwardButton.addEventListener('click', function() {
                                        debugLog(`転送先削除ボタンがクリックされました: アカウント=${index}, 転送先=${forwardIndex}`);

                                        try {
                                            forwardDiv.remove();
                                            debugLog(`転送先要素を削除: アカウント=${index}, 転送先=${forwardIndex}`);

                                            // 見積もり再計算
                                            if (typeof window.calculateTotal === 'function') {
                                                window.calculateTotal();
                                                debugLog('見積もり計算を実行しました');
                                            }
                                        } catch (err) {
                                            errorLog('転送先削除処理でエラーが発生しました:', err);
                                        }
                                    });
                                }

                                // 転送先をコンテナに追加
                                forwardContainer.appendChild(forwardDiv);
                                debugLog(`転送先を追加: アカウント=${index}, 転送先=${forwardIndex}`);

                                // 見積もり再計算
                                if (typeof window.calculateTotal === 'function') {
                                    window.calculateTotal();
                                    debugLog('見積もり計算を実行しました');
                                }
                            } else {
                                alert('転送先は最大5個まで設定できます');
                                debugLog('最大転送先数に達しています（5）');
                            }
                        }
                    } catch (err) {
                        errorLog('転送先追加処理でエラーが発生しました:', err);
                    }
                });
            }

            return accountDiv;
        } catch (err) {
            errorLog('メールアカウント要素生成でエラーが発生しました:', err);
            return null;
        }
    }

    /**
     * メールアカウント番号を更新する強化版関数
     */
    function enhancedUpdateEmailAccountNumbers() {
        debugLog('強化版updateEmailAccountNumbers関数が呼び出されました');

        try {
            const container = document.getElementById('email-accounts-container');
            if (!container) {
                errorLog('メールアカウントコンテナが見つかりません');
                return;
            }

            const accounts = container.querySelectorAll('.email-account');
            debugLog(`メールアカウント要素数: ${accounts.length}`);

            // 各アカウントのインデックスと表示テキストを更新
            accounts.forEach((account, i) => {
                const index = i + 1;
                account.dataset.index = index;

                // ヘッダーテキストを更新
                const header = account.querySelector('h3');
                if (header) {
                    header.textContent = `メールアカウント ${index}`;
                    debugLog(`ヘッダーテキストを更新: メールアカウント ${index}`);
                }

                // 各ラベルとIDを更新
                updateAccountElements(account, index);
            });

            debugLog('メールアカウント番号の更新が完了しました');
        } catch (err) {
            errorLog('メールアカウント番号更新処理でエラーが発生しました:', err);
        }
    }

    /**
     * アカウント要素の更新ヘルパー関数
     * @param {HTMLElement} account - アカウント要素
     * @param {number} index - 新しいインデックス
     */
    function updateAccountElements(account, index) {
        try {
            // ラベルを更新
            const labels = account.querySelectorAll('label');
            labels.forEach(label => {
                const forAttr = label.getAttribute('for');
                if (forAttr) {
                    // forAttr の "_数字" 部分を分離して新しいインデックスで置換
                    const baseName = forAttr.split('_').slice(0, -1).join('_');
                    label.setAttribute('for', `${baseName}_${index}`);

                    // ラベルテキストも更新
                    if (label.textContent.includes('メールアドレス')) {
                        label.textContent = `メールアドレス ${index}`;
                    } else if (label.textContent.includes('設定するパスワード')) {
                        label.textContent = `設定するパスワード ${index}`;
                    }
                }
            });

            // メールアドレスと設定するパスワードのIDと名前を更新
            const emailAddress = account.querySelector(`input[id^="email_address_"]`);
            if (emailAddress) {
                emailAddress.id = `email_address_${index}`;
                emailAddress.name = `email_address_${index}`;
            }

            const emailPassword = account.querySelector(`input[id^="email_password_"]`);
            if (emailPassword) {
                emailPassword.id = `email_password_${index}`;
                emailPassword.name = `email_password_${index}`;
            }

            // 転送先入力欄のIDと名前を更新
            const forwardInputs = account.querySelectorAll(`input[id^="email_forward_"]`);
            forwardInputs.forEach((input, j) => {
                const forwardIndex = j + 1;
                input.id = `email_forward_${index}_${forwardIndex}`;
                input.name = `email_forward_${index}_${forwardIndex}`;
            });
        } catch (err) {
            errorLog('アカウント要素更新処理でエラーが発生しました:', err);
        }
    }

    debugLog('メールアカウント追加機能の修正が完了しました');
}

/**
 * 4. イベントリスナーの最適化
 * イベントリスナーを最適化して重複を防ぎます
 */
function optimizeEventListeners() {
    debugLog('イベントリスナーの最適化を開始します');

    // toggleSubmitButton関数の強化（既存関数が正しく動作しない場合のフォールバック）
    if (typeof window.toggleSubmitButton !== 'function') {
        window.toggleSubmitButton = function() {
            debugLog('toggleSubmitButton関数を実行');

            try {
                const agreeTerms = document.getElementById('agree_terms');
                const submitButton = document.getElementById('submit-button');

                if (agreeTerms && submitButton) {
                    // 送信ボタンの有効/無効を設定
                    submitButton.disabled = !agreeTerms.checked;
                    debugLog(`送信ボタン状態変更: ${submitButton.disabled ? '無効' : '有効'}`);

                    // 利用規約に同意した場合、計算を実行
                    if (agreeTerms.checked && typeof window.calculateTotal === 'function') {
                        window.calculateTotal();
                        debugLog('見積もり計算を実行しました');
                    }
                } else {
                    errorLog('利用規約チェックボックスまたは送信ボタンが見つかりません');
                }
            } catch (err) {
                errorLog('送信ボタン切替処理でエラーが発生しました:', err);
            }
        };

        debugLog('toggleSubmitButton関数を定義しました');
    }

    // 利用規約同意チェックボックスのイベントリスナーを確実に設定
    const agreeTerms = document.getElementById('agree_terms');
    if (agreeTerms) {
        // 既存のイベントリスナーを一旦削除（クローンして置き換え）
        const newAgreeTerms = agreeTerms.cloneNode(true);
        agreeTerms.parentNode.replaceChild(newAgreeTerms, agreeTerms);

        // 新しいイベントリスナーを設定
        newAgreeTerms.addEventListener('change', function() {
            debugLog(`利用規約同意状態変更: ${this.checked ? '同意' : '未同意'}`);

            // toggleSubmitButton関数を呼び出し
            if (typeof window.toggleSubmitButton === 'function') {
                window.toggleSubmitButton();
            }
        });

        debugLog('利用規約同意チェックボックスのイベントリスナーを再設定しました');
    } else {
        errorLog('利用規約同意チェックボックスが見つかりません');
    }

    debugLog('イベントリスナーの最適化が完了しました');
}

/**
 * 5. エラーハンドリングの強化
 * グローバルエラーハンドラーを設定します
 */
function setupErrorHandling() {
    debugLog('エラーハンドリングの強化を開始します');

    // グローバルエラーハンドラーの設定
    window.addEventListener('error', function(e) {
        errorLog('JavaScriptエラーが発生しました:', e.message);
        errorLog('ファイル:', e.filename, '行番号:', e.lineno, '列番号:', e.colno);

        // ユーザーに通知しない（コンソールにのみ記録）

        // エラーの伝播を止めない
        return false;
    });

    // 非同期エラーハンドラーの設定
    window.addEventListener('unhandledrejection', function(e) {
        errorLog('未処理のPromise拒否が発生しました:', e.reason);

        // ユーザーに通知しない（コンソールにのみ記録）

        // エラーの伝播を止めない
        return false;
    });

    debugLog('エラーハンドリングの強化が完了しました');
}

// コンソールメッセージで初期化を通知
console.log('%c WordPressサーバー移転見積りフォーム - 拡張デバッグスクリプト 実行中 ', 'background: #0056b3; color: white; padding: 4px 8px; border-radius: 4px;');