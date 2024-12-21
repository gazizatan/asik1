class Transaction {
    constructor(sender, receiver, amount) {
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
    }
    toString() {
        return `${this.sender} -> ${this.receiver}: $${this.amount}`;
    }
}

async function sha256(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

//добавьте сюда что то

async function addBlock() {
    await blockchain.addBlock();
}

async function validateBlockchain() {
    await blockchain.validateBlockchain();
}