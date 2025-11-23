// API BaseURL
const API_BASE = '/api';

// ページロード時の初期化
document.addEventListener('DOMContentLoaded', () => {
    loadTickets();
    // 今日の日付をデフォルト値に設定
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
});

/**
 * チケット一覧を読み込み
 */
async function loadTickets() {
    try {
        const response = await fetch(`${API_BASE}/tickets`);
        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'チケット一覧の取得に失敗しました');
            return;
        }

        const tbody = document.getElementById('ticketsTableBody');
        tbody.innerHTML = '';

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
        alert('チケット一覧の取得中にエラーが発生しました');
    }
}

/**
 * チケット新規登録
 */
async function registerTicket() {
    const tktNumber = document.getElementById('tktNumber').value.trim();
    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const ticketType = document.getElementById('ticketType').value;
    const startDate = document.getElementById('startDate').value;
    const remarks = document.getElementById('remarks').value;

    // バリデーション
    if (!tktNumber || !age || !gender || !ticketType || !startDate) {
        alert('必須項目を入力してください');
        return;
    }

    if (!/^\d{4,5}$/.test(tktNumber)) {
        alert('TKT番号は4～5桁の数字で入力してください');
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
            const errorMsg = Array.isArray(data.error) ? data.error.join('\n') : data.error;
            alert(errorMsg || 'チケット登録に失敗しました');
            return;
        }

        alert('チケットを登録しました');
        clearForm();
        loadTickets();

    } catch (error) {
        console.error('Error:', error);
        alert('チケット登録中にエラーが発生しました');
    }
}

/**
 * フォームをクリア
 */
function clearForm() {
    document.getElementById('tktNumber').value = '';
    document.getElementById('age').value = '';
    document.getElementById('gender').value = '';
    document.getElementById('ticketType').value = '';
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    document.getElementById('remarks').value = '';
}

/**
 * 編集モーダルを開く
 */
async function openEditModal(tktNumber) {
    try {
        const response = await fetch(`${API_BASE}/tickets/${tktNumber}`);
        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'チケット情報の取得に失敗しました');
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
        alert('チケット情報の取得中にエラーが発生しました');
    }
}

/**
 * 編集モーダルを閉じる
 */
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

/**
 * チケット更新
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
            alert(data.error || 'チケット更新に失敗しました');
            return;
        }

        alert('チケットを更新しました');
        closeEditModal();
        loadTickets();

    } catch (error) {
        console.error('Error:', error);
        alert('チケット更新中にエラーが発生しました');
    }
}

/**
 * チケット削除
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
            alert(data.error || 'チケット削除に失敗しました');
            return;
        }

        alert('チケットを削除しました');
        loadTickets();

    } catch (error) {
        console.error('Error:', error);
        alert('チケット削除中にエラーが発生しました');
    }
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
