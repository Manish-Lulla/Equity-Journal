let trades = [];

function loadCSVFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const csvContent = e.target.result;
            parseCSVContent(csvContent);
        };
        reader.readAsText(file);
    }
}

function parseCSVContent(csvContent) {
    const lines = csvContent.split('\n');
    trades = [];

    lines.slice(1).forEach(line => {
        const [stockName, entryPrice, targetPrice, stopLossPrice, duration, result, percentage] = line.split(',');
        if (stockName && entryPrice && targetPrice && stopLossPrice && duration) {
            const trade = {
                stockName,
                entryPrice: parseFloat(entryPrice),
                targetPrice: parseFloat(targetPrice),
                stopLossPrice: parseFloat(stopLossPrice),
                duration,
                result: result || '',
                percentage: parseFloat(percentage) || 0
            };
            trades.push(trade);
        }
    });

    updateJournal();
}

function addTrade() {
    const stockName = document.getElementById('stockName').value;
    const entryPrice = parseFloat(document.getElementById('entryPrice').value);
    const targetPrice = parseFloat(document.getElementById('targetPrice').value);
    const stopLossPrice = parseFloat(document.getElementById('stopLossPrice').value);
    const duration = document.getElementById('duration').value;
    
    if (!stockName || !entryPrice || !targetPrice || !stopLossPrice || !duration) {
        alert("Please fill out all fields.");
        return;
    }

    const trade = {
        stockName,
        entryPrice,
        targetPrice,
        stopLossPrice,
        duration,
        result: '',
        percentage: 0
    };

    trades.push(trade);
    updateJournal();
    clearForm();
}

function updateJournal() {
    const journalBody = document.getElementById('journalBody');
    journalBody.innerHTML = '';

    trades.forEach((trade, index) => {
        const row = document.createElement('tr');

        const percentageMove = ((trade.targetPrice - trade.entryPrice) / trade.entryPrice) * 100;
        const stopLossMove = ((trade.stopLossPrice - trade.entryPrice) / trade.entryPrice) * 100;

        trade.percentage = trade.result === 'target' ? percentageMove : stopLossMove;

        row.innerHTML = `
            <td>${trade.stockName}</td>
            <td>${trade.entryPrice.toFixed(2)}</td>
            <td>${trade.targetPrice.toFixed(2)}</td>
            <td>${trade.stopLossPrice.toFixed(2)}</td>
            <td>${trade.duration}</td>
            <td>${trade.result}</td>
            <td>${trade.percentage.toFixed(2)}%</td>
            <td class="action-btns">
                <button class="target" onclick="markAsTarget(${index})">Target</button>
                <button class="stoploss" onclick="markAsStopLoss(${index})">Stop Loss</button>
                <button class="edit" onclick="editTrade(${index})">Edit</button>
                <button class="delete" onclick="deleteTrade(${index})">Delete</button>
            </td>
        `;

        journalBody.appendChild(row);
    });
}

function markAsTarget(index) {
    trades[index].result = 'target';
    updateJournal();
}

function markAsStopLoss(index) {
    trades[index].result = 'stoploss';
    updateJournal();
}

function editTrade(index) {
    const trade = trades[index];
    document.getElementById('stockName').value = trade.stockName;
    document.getElementById('entryPrice').value = trade.entryPrice;
    document.getElementById('targetPrice').value = trade.targetPrice;
    document.getElementById('stopLossPrice').value = trade.stopLossPrice;
    document.getElementById('duration').value = trade.duration;

    document.getElementById('addTradeBtn').onclick = function () {
        updateTrade(index);
    };
}

function updateTrade(index) {
    trades[index].stockName = document.getElementById('stockName').value;
    trades[index].entryPrice = parseFloat(document.getElementById('entryPrice').value);
    trades[index].targetPrice = parseFloat(document.getElementById('targetPrice').value);
    trades[index].stopLossPrice = parseFloat(document.getElementById('stopLossPrice').value);
    trades[index].duration = document.getElementById('duration').value;

    updateJournal();
    clearForm();
    document.getElementById('addTradeBtn').onclick = addTrade;
}

function deleteTrade(index) {
    trades.splice(index, 1);
    updateJournal();
}

function clearForm() {
    document.getElementById('stockName').value = '';
    document.getElementById('entryPrice').value = '';
    document.getElementById('targetPrice').value = '';
    document.getElementById('stopLossPrice').value = '';
    document.getElementById('duration').value = '';
}

function saveAsCsv() {
    let csvContent = "Stock Name,Entry Price,Target Price,Stop Loss,Duration,Result,Percentage Move\n";
    
    trades.forEach(trade => {
        const row = `${trade.stockName},${trade.entryPrice},${trade.targetPrice},${trade.stopLossPrice},${trade.duration},${trade.result},${trade.percentage.toFixed(2)}`;
        csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'equity_journal.csv');
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
}
