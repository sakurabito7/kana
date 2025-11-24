// API BaseURL
const API_BASE = '/api';

/**
 * メッセージを表示
 */
function showMessage(message, type = 'info') {
    const messageArea = document.getElementById('messageArea');
    if (!messageArea) return;

    messageArea.textContent = message;
    messageArea.className = `message-area show ${type}`;

    // 3秒後に自動的に消す
    setTimeout(() => {
        messageArea.className = 'message-area';
    }, 3000);
}

// ページロード時の初期化
document.addEventListener('DOMContentLoaded', () => {
    loadTickets();
    // 今日の日付をデフォルト値に設定
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    // TKT番号にフォーカスを設定
    document.getElementById('tktNumber').focus();
});

/**
 * 年間パスポート一覧を読み込み
 */
async function loadTickets() {
    try {
        console.log('年間パスポート一覧を読み込み中...');
        const response = await fetch(`${API_BASE}/tickets`);
        const data = await response.json();

        console.log('APIレスポンス:', data);

        if (!response.ok) {
            console.error('APIエラー:', data.error);
            showMessage(data.error || '年間パスポート一覧の取得に失敗しました', 'error');
            return;
        }

        const tbody = document.getElementById('ticketsTableBody');
        if (!tbody) {
            console.error('ticketsTableBody要素が見つかりません');
            return;
        }

        tbody.innerHTML = '';
        console.log(`チケット数: ${data.tickets.length}`);

        data.tickets.forEach(ticket => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${ticket.tkt_number}</td>
                <td>${ticket.age}</td>
                <td>${ticket.gender}</td>
                <td>${ticket.ticket_type}</td>
                <td>${formatDate(ticket.start_date)}</td>
                <td>${formatDate(ticket.expiry_date)}</td>
                <td>${ticket.remarks || ''}</td>
                <td>
                    <button onclick="openEditModal('${ticket.tkt_number}')">編集</button>
                    <button class="btn-danger" onclick="deleteTicket('${ticket.tkt_number}')">削除</button>
                </td>
            `;
        });

    } catch (error) {
        console.error('Error:', error);
        showMessage('年間パスポート一覧の取得中にエラーが発生しました', 'error');
    }
}

/**
 * 年間パスポート新規登録
 */
async function registerTicket() {
    console.log('年間パスポート登録開始...');

    const tktNumber = document.getElementById('tktNumber').value.trim();
    const age = document.getElementById('age').value;
    const genderElement = document.querySelector('input[name="gender"]:checked');
    const ticketTypeElement = document.querySelector('input[name="ticketType"]:checked');
    const startDate = document.getElementById('startDate').value;
    const remarks = document.getElementById('remarks').value;

    const gender = genderElement ? genderElement.value : null;
    const ticketType = ticketTypeElement ? ticketTypeElement.value : null;

    console.log('入力値:', { tktNumber, age, gender, ticketType, startDate, remarks });

    // バリデーション
    if (!tktNumber || !age || !gender || !ticketType || !startDate) {
        console.error('必須項目が未入力');
        showMessage('必須項目を入力してください', 'error');
        return;
    }

    const ticketData = {
        tkt_number: tktNumber,
        age: parseInt(age),
        gender: gender,
        ticket_type: ticketType,
        start_date: startDate,
        remarks: remarks
    };

    try {
        const response = await fetch(`${API_BASE}/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData)
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMsg = Array.isArray(data.error) ? data.error.join(', ') : data.error;
            showMessage(errorMsg || '年間パスポート登録に失敗しました', 'error');
            return;
        }

        showMessage('年間パスポートを登録しました', 'success');
        clearForm();
        loadTickets();

        // TKT番号にフォーカスを戻す
        document.getElementById('tktNumber').focus();

        // メモリキャッシュを更新（main.jsの関数が存在する場合）
        if (typeof loadAllTicketsToCache === 'function') {
            await loadAllTicketsToCache();
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage('年間パスポート登録中にエラーが発生しました', 'error');
    }
}

/**
 * フォームをクリア
 */
function clearForm() {
    document.getElementById('tktNumber').value = '';
    document.getElementById('age').value = '';

    // ラジオボタンのチェックを外す
    document.querySelectorAll('input[name="gender"]').forEach(radio => radio.checked = false);
    document.querySelectorAll('input[name="ticketType"]').forEach(radio => radio.checked = false);

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    document.getElementById('remarks').value = '';

    // TKT番号にフォーカスを戻す
    document.getElementById('tktNumber').focus();
}

/**
 * 編集モーダルを開く
 */
async function openEditModal(tktNumber) {
    try {
        const response = await fetch(`${API_BASE}/tickets/${tktNumber}`);
        const data = await response.json();

        if (!response.ok) {
            showMessage(data.error || '年間パスポート情報の取得に失敗しました', 'error');
            return;
        }

        const ticket = data.ticket;

        document.getElementById('editTktNumber').value = ticket.tkt_number;
        document.getElementById('editAge').value = ticket.age;
        document.getElementById('editGender').value = ticket.gender;
        document.getElementById('editTicketType').value = ticket.ticket_type;
        document.getElementById('editStartDate').value = ticket.start_date;
        document.getElementById('editExpiryDate').value = ticket.expiry_date;
        document.getElementById('editRemarks').value = ticket.remarks || '';

        document.getElementById('editModal').style.display = 'block';

    } catch (error) {
        console.error('Error:', error);
        showMessage('年間パスポート情報の取得中にエラーが発生しました', 'error');
    }
}

/**
 * 編集モーダルを閉じる
 */
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

/**
 * 年間パスポート更新
 */
async function updateTicket() {
    const tktNumber = document.getElementById('editTktNumber').value;
    const age = document.getElementById('editAge').value;
    const gender = document.getElementById('editGender').value;
    const ticketType = document.getElementById('editTicketType').value;
    const startDate = document.getElementById('editStartDate').value;
    const expiryDate = document.getElementById('editExpiryDate').value;
    const remarks = document.getElementById('editRemarks').value;

    const ticketData = {
        age: parseInt(age),
        gender: gender,
        ticket_type: ticketType,
        start_date: startDate,
        expiry_date: expiryDate,
        remarks: remarks
    };

    try {
        const response = await fetch(`${API_BASE}/tickets/${tktNumber}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData)
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.error || '年間パスポート更新に失敗しました', 'error');
            return;
        }

        showMessage('年間パスポートを更新しました', 'success');
        closeEditModal();
        loadTickets();

        // メモリキャッシュを更新（main.jsの関数が存在する場合）
        if (typeof loadAllTicketsToCache === 'function') {
            await loadAllTicketsToCache();
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage('年間パスポート更新中にエラーが発生しました', 'error');
    }
}

/**
 * 年間パスポート削除
 */
async function deleteTicket(tktNumber) {
    if (!confirm(`TKT番号 ${tktNumber} を削除しますか？`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/tickets/${tktNumber}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.error || '年間パスポート削除に失敗しました', 'error');
            return;
        }

        showMessage('年間パスポートを削除しました', 'success');
        loadTickets();

        // メモリキャッシュを更新（main.jsの関数が存在する場合）
        if (typeof loadAllTicketsToCache === 'function') {
            await loadAllTicketsToCache();
        }

    } catch (error) {
        console.error('Error:', error);
        showMessage('年間パスポート削除中にエラーが発生しました', 'error');
    }
}

/**
 * 年間パスポートデータをCSV出力
 */
function exportTickets() {
    window.location.href = `${API_BASE}/export/tickets`;
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
