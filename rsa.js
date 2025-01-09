// rsa.js
function gcd(a, b) {
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

function modInverse(e, phi) {
    for (let d = 1; d < phi; d++) {
        if ((e * d) % phi === 1) {
            return d;
        }
    }
    return null;
}

function simpleHash(data) {
    let hashValue = 0;
    for (const char of data) {
        hashValue ^= char.charCodeAt(0);
    }
    return hashValue;
}

function generateKeys() {
    const p = 349;
    const q = 397;
    const n = p * q;
    const phi = (p - 1) * (q - 1);
    const e = 17;
    const d = modInverse(e, phi);

    return {
        publicKey: { e, n },
        privateKey: { d, n }
    };
}

function sign(privateKey, document) {
    const { d, n } = privateKey;
    const documentHash = simpleHash(document) % n;
    return BigInt(documentHash) ** BigInt(d) % BigInt(n);
}

function verify(publicKey, document, signature) {
    const { e, n } = publicKey;
    const documentHash = simpleHash(document) % n;
    const calculatedHash = BigInt(signature) ** BigInt(e) % BigInt(n);
    return documentHash === Number(calculatedHash);
}

class Wallet {
    constructor(ownerName) {
        this.ownerName = ownerName;
        const keys = generateKeys();
        this.publicKey = keys.publicKey;
        this.privateKey = keys.privateKey;
    }

    createTransaction(receiverPublicKey, amount) {
        const transaction = new Transaction(this.publicKey, receiverPublicKey, amount);
        transaction.signTransaction(this.privateKey);
        return transaction;
    }
}

class Transaction {
    constructor(sender, receiver, amount) {
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
        this.signature = null;
    }

    signTransaction(privateKey) {
        const document = `${this.sender.e}${this.receiver.e}${this.amount}`;
        this.signature = sign(privateKey, document);
    }
}

function verifyTransaction(transaction) {
    const document = `${transaction.sender.e}${transaction.receiver.e}${transaction.amount}`;
    if (!verify(transaction.sender, document, transaction.signature)) {
        throw new Error("Invalid signature");
    }
    return true;
}