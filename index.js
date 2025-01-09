// index.js
const blockchain = [];
const pendingTransactions = [];

document.getElementById("addTransaction").addEventListener("click", () => {
    const alice = new Wallet("Alice");
    const bob = new Wallet("Bob");

    const transaction = alice.createTransaction(bob.publicKey, 50);

    try {
        if (verifyTransaction(transaction)) {
            pendingTransactions.push(transaction);
            alert("Transaction added to pending transactions.");
            renderPendingTransactions();
        }
    } catch (error) {
        alert("Transaction failed: " + error.message);
    }
});

document.getElementById("mineBlock").addEventListener("click", () => {
    if (pendingTransactions.length === 0) {
        alert("No transactions to mine.");
        return;
    }

    const block = {
        index: blockchain.length + 1,
        transactions: [...pendingTransactions],
        timestamp: new Date().toISOString(),
    };

    blockchain.push(block);
    pendingTransactions.length = 0;

    alert("Block mined successfully!");
    renderBlockchain();
    renderPendingTransactions();
});

document.getElementById("validateBlockchain").addEventListener("click", () => {
    const isValid = blockchain.every((block) =>
        block.transactions.every(verifyTransaction)
    );

    if (isValid) {
        alert("Blockchain is valid!");
    } else {
        alert("Blockchain is invalid!");
    }
});

function renderBlockchain() {
    const blockchainDiv = document.getElementById("blockchain");
    blockchainDiv.innerHTML = "<h2>Blockchain:</h2>";
    blockchain.forEach((block, index) => {
        const blockDiv = document.createElement("div");
        blockDiv.className = "block";
        blockDiv.innerHTML = `
            <strong>Block ${index + 1}</strong><br>
            <strong>Timestamp:</strong> ${block.timestamp}<br>
            <strong>Transactions:</strong><br>
            <ul>
                ${block.transactions
            .map(
                (tx) => `
                    <li>
                        Sender: e=${tx.sender.e}, n=${tx.sender.n}<br>
                        Receiver: e=${tx.receiver.e}, n=${tx.receiver.n}<br>
                        Amount: ${tx.amount}<br>
                        Signature: ${tx.signature}
                    </li>
                `
            )
            .join("")}
            </ul>
        `;
        blockchainDiv.appendChild(blockDiv);
    });
}

function renderPendingTransactions() {
    const blockchainDiv = document.getElementById("blockchain");
    const pendingDiv = document.createElement("div");
    pendingDiv.className = "block";
    pendingDiv.innerHTML = `
        <strong>Pending Transactions:</strong><br>
        <ul>
            ${pendingTransactions
        .map(
            (tx) => `
                <li>
                    Sender: e=${tx.sender.e}, n=${tx.sender.n}<br>
                    Receiver: e=${tx.receiver.e}, n=${tx.receiver.n}<br>
                    Amount: ${tx.amount}<br>
                    Signature: ${tx.signature}
                </li>
            `
        )
        .join("")}
        </ul>
    `;
    blockchainDiv.appendChild(pendingDiv);
}