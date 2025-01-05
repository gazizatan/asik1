// RSA Encryption Implementation
function generateKeys() {
    const p = generateLargePrime();
    const q = generateLargePrime();
    const n = p * q;
    const phi = (p - 1) * (q - 1);

    let e = 65537; // Common choice for e
    while (gcd(e, phi) !== 1) {
        e++;
    }

    const d = modInverse(e, phi);

    return {
        publicKey: { e, n },
        privateKey: { d, n }
    };
}

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function modInverse(e, phi) {
    let [m0, x0, x1] = [phi, 0, 1];
    while (e > 1) {
        const q = Math.floor(e / phi);
        [phi, e] = [e % phi, phi];
        [x0, x1] = [x1 - q * x0, x0];
    }
    return x1 < 0 ? x1 + m0 : x1;
}

function encrypt(publicKey, message) {
    const { e, n } = publicKey;
    console.log('Encrypting with e:', e, 'n:', n);
    return message
        .split('')
        .map(char => {
            const charCode = BigInt(char.charCodeAt(0)); // Ensure the character code is a BigInt
            console.log('Char Code:', charCode);
            return (charCode ** BigInt(e)) % BigInt(n); // Encrypt with BigInt
        })
        .join(',');
}

function decrypt(privateKey, ciphertext) {
    const { d, n } = privateKey;
    return ciphertext
        .split(',')
        .map(num => String.fromCharCode(Number(BigInt(num) ** BigInt(d) % BigInt(n))))
        .join('');
}

// Digital Signature
function sign(privateKey, document) {
    return encrypt(privateKey, document); // Encrypt the document with the private key
}

function verify(publicKey, document, signature) {
    return decrypt(publicKey, signature) === document;
}

// Blockchain Enhancements
class Transaction {
    constructor(senderPublicKey, receiverPublicKey, amount, signature) {
        this.sender = senderPublicKey;
        this.receiver = receiverPublicKey;
        this.amount = amount;
        this.signature = signature;
    }

    verifyTransaction() {
        const document = `${this.sender.e}:${this.sender.n}->${this.receiver.e}:${this.receiver.n}:${this.amount}`;
        if (!verify(this.sender, document, this.signature)) {
            throw new Error("Signature is wrong");
        }
        return true;
    }
}

class Wallet {
    constructor() {
        const { publicKey, privateKey } = generateKeys(); // Generate the key pair
        this.publicKey = publicKey;  // Public key for the wallet address
        this.privateKey = privateKey; // Private key for signing transactions
    }

    // Create a new transaction
    createTransaction(receiver, amount) {
        const document = `${this.publicKey.e}:${this.publicKey.n}->${receiver.e}:${receiver.n}:${amount}`; // Format the transaction document
        const signature = sign(this.privateKey, document); // Sign the transaction with the private key
        console.log(`Transaction created: ${document}, Signature: ${signature}`);
        return new Transaction(this.publicKey, receiver, amount, signature); // Return the created transaction
    }
}

class Block {
    constructor(previousHash, transactions) {
        this.previousHash = previousHash;
        this.timestamp = new Date().toISOString();
        this.transactions = transactions;
        this.merkleRoot = '';
        this.hash = '';
    }

    async mineBlock() {
        this.merkleRoot = await createMerkleRoot(this.transactions);
        const blockData = this.previousHash + this.timestamp + this.merkleRoot;
        this.hash = await hash(blockData);
    }
}

class Blockchain {
    constructor() {
        this.chain = [];
        this.pendingTransactions = [];
        this.createGenesisBlock();
    }

    createGenesisBlock() {
        const genesisBlock = new Block("0", []);
        genesisBlock.hash = hash("0" + genesisBlock.timestamp);
        this.chain.push(genesisBlock);
    }

    addTransaction(transaction) {
        try {
            if (transaction.verifyTransaction()) {
                console.log("Transaction verified successfully.");
                this.pendingTransactions.push(transaction); // Add the transaction to the list if valid
            }
        } catch (error) {
            console.error("Transaction verification failed: ", error.message);
        }
    }

    async minePendingTransactions() {
        if (this.pendingTransactions.length === 0) {
            alert("No pending transactions to mine.");
            return;
        }

        const lastBlock = this.chain[this.chain.length - 1];
        const newBlock = new Block(lastBlock.hash, this.pendingTransactions);
        await newBlock.mineBlock();
        this.chain.push(newBlock);
        this.pendingTransactions = []; // Clear pending transactions after mining
        alert("Block mined successfully!");
        displayBlockchain(); // Refresh the displayed blockchain
    }

    validateBlockchain() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            const calculatedHash = hash(
                currentBlock.previousHash + currentBlock.timestamp + currentBlock.merkleRoot
            );
            if (currentBlock.hash !== calculatedHash) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

// Supporting Functions
function generateLargePrime() {
    return 61; // Example prime number, replace with actual large prime generation logic
}

function hash(text) {
    return text
        .split('')
        .reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) >>> 0, 0) // Changed this line
        .toString(16);
}

async function createMerkleRoot(transactions) {
    if (transactions.length === 0) {
        return "";
    }

    let layer = transactions.map(tx => hash(JSON.stringify(tx)));
    while (layer.length > 1) {
        const nextLayer = [];
        for (let i = 0; i < layer.length; i += 2) {
            const pair = layer[i] + (layer[i + 1] || layer[i]);
            nextLayer.push(hash(pair));
        }
        layer = nextLayer;
    }
    return layer[0];
}

// DOM Interaction
const blockchain = new Blockchain();
const wallet = new Wallet();

function displayBlockchain() {
    const blockchainDiv = document.getElementById("blockchain");
    blockchainDiv.innerHTML = "";

    blockchain.chain.forEach((block, index) => {
        const blockDiv = document.createElement("div");
        blockDiv.className = "block";

        blockDiv.innerHTML = `
            <strong>Block ${index}</strong><br>
            <strong>Hash:</strong> ${block.hash}<br>
            <strong>Previous Hash:</strong> ${block.previousHash}<br>
            <strong>Merkle Root:</strong> ${block.merkleRoot}<br>
            <strong>Transactions:</strong><br>
            <ul>
                ${block.transactions
            .map(tx => `<li>${JSON.stringify(tx)}</li>`)
            .join("")}
            </ul>
        `;

        blockDiv.innerHTML = `
            <strong>Block ${index}</strong><br>
            <strong>Hash:</strong> ${block.hash}<br>
            <strong>Previous Hash:</strong> ${block.previousHash}<br>
            <strong>Merkle Root:</strong> ${block.merkleRoot}<br>
            <strong>Transactions:</strong><br>
            <ul>
                ${block.transactions
            .map(tx => `<li>${JSON.stringify(tx)}</li>`)
            .join("")}
            </ul>
        `;

        blockchainDiv.appendChild(blockDiv);
    });
}

document.getElementById("mineBlock").addEventListener("click", async () => {
    if (blockchain.pendingTransactions.length === 0) {
        alert("No pending transactions to mine.");
        return;
    }

    await blockchain.minePendingTransactions();
    alert("Block mined successfully!");
    displayBlockchain();
});

document.getElementById("validateBlockchain").addEventListener("click", () => {
    const isValid = blockchain.validateBlockchain();
    alert(isValid ? "Blockchain is valid!" : "Blockchain is invalid!");
});

document.getElementById("createTransaction").addEventListener("click", () => {
    const receiverWallet = new Wallet();
    const transaction = wallet.createTransaction(receiverWallet.publicKey, 10);
    blockchain.addTransaction(transaction);
    alert("Transaction created and added to the pending transactions!");
    displayBlockchain();
});
