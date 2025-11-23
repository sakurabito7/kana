// API BaseURL
const API_BASE = '/api';

// ページロード時の初期化
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
});

/**
 * 履歴一覧を読み込み
 */
async function loadHistory(tktNumber = null) {
    try {
        let url = `${API_BASE}/history`;
        if (tktNumber) {
            url += `?tkt_number=${tktNumber}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            alert(data.error || '履歴一覧の取得に失敗しました');
            return;
        }

        const tbody = document.getElementById('historyTableBody');
        tbody.innerHTML = '';

        data.logs.forEach(log => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${log.id}</td>
                <td>${log.tkt_number}</td>
                <td>${formatDateTime(log.entry_time)}</td>
                <td>${log.result}</td>
                <td>${log.comment || ''}</td>
                <td>${log.is_reentry ? '○' : ''}</td>
                <td>
                    <button onclick="openEditModal(${log.id})">編集</button>
                    <button class="btn-danger" onclick="deleteHistory(${log.id})">削除</button>
                </td>
            `;
        });

    } catch (error) {
        console.error('Error:', error);
        alert('履歴一覧の取得中にエラーが発生しました');
    }
}

/**
 * 履歴を検索
 */
function searchHistory() {
    const tktNumber = document.getElementById('searchTktNumber').value.trim();
    if (tktNumber) {
        loadHistory(tktNumber);
    } else {
        loadHistory();
    }
}

/**
 * 検索条件をクリア
 */
function clearSearch() {
    document.getElementById('searchTktNumber').value = '';
    loadHistory();
}

/**
 * 編集モーダルを開く
 */
async function openEditModal(logId) {
    try {
        const response = await fetch(`${API_BASE}/history/${logId}`);
        const data = await response.json();

        if (!response.ok) {
            alert(data.error || '履歴情報の取得に失敗しました');
            return;
        }

        const log = data.log;

        document.getElementById('editLogId').value = log.id;
        document.getElementById('editTktNumber').value = log.tkt_number;

        // 日時をdatetime-local形式に変換
        const entryTime = new Date(log.entry_time);
        const year = entryTime.getFullYear();
        const month = String(entryTime.getMonth() + 1).padStart(2, '0');
        const day = String(entryTime.getDate()).padStart(2, '0');
        const hours = String(entryTime.getHours()).padStart(2, '0');
        const minutes = String(entryTime.getMinutes()).padStart(2, '0');
        document.getElementById('editEntryTime').value = `${year}-${month}-${day}T${hours}:${minutes}`;

        document.getElementById('editResult').value = log.result;
        document.getElementById('editComment').value = log.comment || '';
        document.getElementById('editIsReentry').checked = log.is_reentry;

        document.getElementById('editModal').style.display = 'block';

    } catch (error) {
        console.error('Error:', error);
        alert('履歴情報の取得中にエラーが発生しました');
    }
}

/**
 * 編集モーダルを閉じる
 */
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

/**
 * 履歴更新
 */
async function updateHistory() {
    const logId = document.getElementById('editLogId').value;
    const entryTime = document.getElementById('editEntryTime').value;
    const result = document.getElementById('editResult').value;
    const comment = document.getElementById('editComment').value;
    const isReentry = document.getElementById('editIsReentry').checked;

    const historyData = {
        entry_time: new Date(entryTime).toISOString(),
        result: result,
        comment: comment,
        is_reentry: isReentry
    };

    try {
        const response = await fetch(`${API_BASE}/history/${logId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(historyData)
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || '履歴更新に失敗しました');
            return;
        }

        alert('履歴を更新しました');
        closeEditModal();
        loadHistory();

    } catch (error) {
        console.error('Error:', error);
        alert('履歴更新中にエラーが発生しました');
    }
}

/**
 * 履歴削除
 */
async function deleteHistory(logId) {
    if (!confirm(`ID ${logId} の履歴を削除しますか？`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/history/${logId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || '履歴削除に失敗しました');
            return;
        }

        alert('履歴を削除しました');
        loadHistory();

    } catch (error) {
        console.error('Error:', error);
        alert('履歴削除中にエラーが発生しました');
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
