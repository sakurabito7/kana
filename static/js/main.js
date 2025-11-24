// API BaseURL
const API_BASE = '/api';

// チケットデータをメモリにキャッシュ
let ticketCache = new Map();

// ページロード時の初期化
document.addEventListener('DOMContentLoaded', async () => {
    // TKT入力フィールドでEnterキー押下時に判定実行
    const tktInput = document.getElementById('tktInput');
    if (tktInput) {
        tktInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performJudgement();
            }
        });
        tktInput.focus();
    }

    // 最新の履歴を読み込み
    loadRecentHistory();

    // 全チケットデータをメモリに読み込み
    await loadAllTicketsToCache();
});

/**
 * 全チケットデータをメモリに読み込み
 */
async function loadAllTicketsToCache() {
    try {
        const response = await fetch(`${API_BASE}/tickets`);
        const data = await response.json();

        if (!response.ok) {
            console.error('チケットデータの読み込みに失敗しました');
            return;
        }

        // キャッシュをクリアして再構築
        ticketCache.clear();
        data.tickets.forEach(ticket => {
            ticketCache.set(ticket.tkt_number, ticket);
        });

        console.log(`${ticketCache.size}件のチケットデータをメモリに読み込みました`);

    } catch (error) {
        console.error('チケットデータ読み込みエラー:', error);
    }
}

/**
 * サーバから特定のチケットを取得してキャッシュに追加
 */
async function fetchAndCacheTicket(tktNumber) {
    try {
        const response = await fetch(`${API_BASE}/tickets/${tktNumber}`);
        const data = await response.json();

        if (response.ok && data.ticket) {
            // キャッシュに追加
            ticketCache.set(tktNumber, data.ticket);
            return data.ticket;
        }

        return null;

    } catch (error) {
        console.error('チケット取得エラー:', error);
        return null;
    }
}

/**
 * 入場判定を実行
 */
async function performJudgement() {
    const tktInput = document.getElementById('tktInput');
    const tktNumber = tktInput.value.trim();

    if (!tktNumber) {
        // TKT番号未入力の場合は単にフォーカスを戻す
        tktInput.focus();
        return;
    }

    try {
        // 1. まずキャッシュから検索（高速化のため）
        let ticket = ticketCache.get(tktNumber);

        // 2. キャッシュに無ければサーバから取得を試みる
        if (!ticket) {
            console.log(`TKT番号 ${tktNumber} がキャッシュに無いため、サーバから取得を試みます`);
            ticket = await fetchAndCacheTicket(tktNumber);
        }

        // 3. サーバに判定リクエストを送信（登録なしの場合も送信して履歴に記録）
        const response = await fetch(`${API_BASE}/entry/judge`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tkt_number: tktNumber })
        });

        const data = await response.json();

        if (!response.ok) {
            // サーバエラーの場合、エラーメッセージを表示して処理を中断
            console.error('サーバエラー:', data.error);

            // エラーもNG判定として表示
            const errorData = {
                judgement: {
                    valid: false,
                    result: 'NG',
                    comment: data.error || '判定処理に失敗',
                    ticket: null
                },
                entry_log: {
                    tkt_number: tktNumber,
                    entry_time: new Date().toISOString(),
                    result: 'NG',
                    comment: data.error || '判定処理に失敗'
                }
            };

            displayJudgementResult(errorData);

            tktInput.value = '';
            tktInput.focus();

            // エラーの場合も履歴を更新（サーバで記録された可能性があるため）
            loadRecentHistory();
            return;
        }

        // 判定結果を表示（OK/NG両方、音声も再生される）
        displayJudgementResult(data);

        // 入力フィールドをクリア
        tktInput.value = '';
        tktInput.focus();

        // 履歴テーブルを更新
        loadRecentHistory();

    } catch (error) {
        console.error('Error:', error);

        // エラーもNG判定として表示
        const errorData = {
            judgement: {
                valid: false,
                result: 'NG',
                comment: '判定処理中にエラーが発生しました',
                ticket: null
            },
            entry_log: {
                tkt_number: tktNumber,
                entry_time: new Date().toISOString(),
                result: 'NG',
                comment: '判定処理中にエラーが発生しました'
            }
        };

        displayJudgementResult(errorData);

        tktInput.value = '';
        tktInput.focus();
    }
}

/**
 * 判定結果を画面に表示
 */
function displayJudgementResult(data) {
    const { judgement, entry_log } = data;
    const { valid, result, comment, ticket } = judgement;

    // ステータス更新
    const statusLabel = document.getElementById('statusLabel');
    statusLabel.textContent = valid ? '判定可能' : '判定不可';
    statusLabel.className = valid ? 'status-label status-ok' : 'status-label status-ng';

    // 現在時刻
    const now = new Date();
    const timeString = formatDateTime(now);

    // 大きな入園確認パネルを更新
    const judgementDisplay = document.getElementById('judgementDisplay');
    const judgementValue = document.getElementById('judgementValue');

    // 色とスタイルを設定
    judgementDisplay.className = 'judgement-display';

    if (result === 'OK') {
        // OK時の表示
        judgementDisplay.classList.add('judgement-ok');

        let genderAge = '';
        if (ticket) {
            genderAge = `<div style="font-size: 50px; margin-top: 10px;">${ticket.gender} ${ticket.age}歳</div>`;
        }

        if (comment) {
            // 再入場の場合
            judgementValue.innerHTML = `<div style="font-size: 80px;">${result}</div><div style="font-size: 40px; margin-top: 10px;">(${comment})</div>${genderAge}`;
        } else {
            judgementValue.innerHTML = `<div style="font-size: 80px;">${result}</div>${genderAge}`;
        }

    } else if (result === 'NG') {
        // NG時の表示（背景赤、理由を明確に表示）
        judgementDisplay.classList.add('judgement-ng');

        if (comment) {
            // NGの理由を大きく表示
            judgementValue.innerHTML = `<div style="font-size: 100px; font-weight: bold;">${result}</div><div style="font-size: 50px; margin-top: 20px; font-weight: bold;">${comment}</div>`;
        } else {
            judgementValue.innerHTML = `<div style="font-size: 100px; font-weight: bold;">${result}</div>`;
        }
    }

    // 情報表示エリア更新
    document.getElementById('displayTktNumber').textContent = entry_log.tkt_number;
    document.getElementById('displayEntryTime').textContent = timeString;

    if (ticket) {
        document.getElementById('displayExpiry').textContent = formatDate(ticket.expiry_date);
        document.getElementById('displayTicketType').textContent = ticket.ticket_type;
        document.getElementById('displayGender').textContent = ticket.gender;
        document.getElementById('displayAge').textContent = ticket.age;
    } else {
        document.getElementById('displayExpiry').textContent = '-';
        document.getElementById('displayTicketType').textContent = '-';
        document.getElementById('displayGender').textContent = '-';
        document.getElementById('displayAge').textContent = '-';
    }

    // 音声再生（OK/NGに応じて）
    if (result === 'OK') {
        playSound('/static/sounds/ok.wav');
    } else if (result === 'NG') {
        playSound('/static/sounds/ng.wav');
    }
}

/**
 * 音声を再生（連続再生対応）
 */
function playSound(soundPath) {
    try {
        // 毎回新しいAudioオブジェクトを作成することで連続再生を実現
        const audio = new Audio(soundPath);
        audio.play().catch(error => {
            console.error('音声再生エラー:', error);
        });
    } catch (error) {
        console.error('音声再生エラー:', error);
    }
}

/**
 * 最新の履歴を読み込み
 */
async function loadRecentHistory() {
    try {
        const response = await fetch(`${API_BASE}/history?limit=20`);
        const data = await response.json();

        if (!response.ok) {
            console.error('履歴の取得に失敗しました');
            return;
        }

        const tbody = document.getElementById('resultTableBody');
        tbody.innerHTML = '';

        data.logs.forEach(log => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${log.id}</td>
                <td>${log.result}</td>
                <td>${log.tkt_number}</td>
                <td>${formatDateTime(log.entry_time)}</td>
                <td>${log.comment || ''}</td>
                <td>${log.is_reentry ? '○' : ''}</td>
            `;
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

/**
 * CSV読込ダイアログを表示
 */
function showImportDialog() {
    document.getElementById('importModal').style.display = 'block';
}

/**
 * CSV読込ダイアログを閉じる
 */
function closeImportDialog() {
    document.getElementById('importModal').style.display = 'none';
    document.getElementById('csvFile').value = '';
}

/**
 * CSVファイルをアップロード
 */
async function uploadCSV() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];

    if (!file) {
        alert('ファイルを選択してください');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_BASE}/tickets/import`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'アップロードに失敗しました');
            return;
        }

        alert(data.message);
        closeImportDialog();

        // キャッシュを再読み込み
        await loadAllTicketsToCache();

    } catch (error) {
        console.error('Error:', error);
        alert('アップロード中にエラーが発生しました');
    }
}

/**
 * 履歴データをCSV出力
 */
function exportHistory() {
    window.location.href = `${API_BASE}/export/history`;
}

/**
 * 日時をフォーマット (YYYY/MM/DD HH:MM:SS)
 */
function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 日付をフォーマット (YYYY/MM/DD)
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}
