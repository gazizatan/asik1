document.addEventListener("DOMContentLoaded", function () {
    function hash(text) {
        const data = new Array(text.length);
        for (let i = 0; i < text.length; i++) {
            data[i] = text.charCodeAt(i);
        }
        const originalBitLength = data.length * 8;
        data.push(0x80);
        while (data.length % 64 !== 56) {
            data.push(0);
        }
        for (let i = 7; i >= 0; i--) {
            data.push((originalBitLength >>> (i * 8)) & 0xFF);
        }
        const K = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b,
            0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01,
            0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7,
            0xc19bf174, 0xe49b69c1, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
            0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d,
            0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351,
            0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
            0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1,
            0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624,
            0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x3c6ef372,
            0x4f67c38e, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f,
            0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
            0xc67178f2
        ];
        let H = [
            0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f,
            0x9b05688c, 0x1f83d9ab, 0x5be0cd19
        ];
        for (let i = 0; i < data.length; i += 64) {
            let W = new Array(64);
            let block = data.slice(i, i + 64);
            for (let t = 0; t < 16; t++) {
                W[t] = (block[t * 4] << 24) | (block[t * 4 + 1] << 16) |
                    (block[t * 4 + 2] << 8) | block[t * 4 + 3];
            }
            for (let t = 16; t < 64; t++) {
                const s0 = (W[t - 15] >>> 7 | W[t - 15] << (32 - 7)) ^ (W[t - 15] >>> 18 | W[t - 15] << (32 - 18)) ^ (W[t - 15] >>> 3);
                const s1 = (W[t - 2] >>> 17 | W[t - 2] << (32 - 17)) ^ (W[t - 2] >>> 19 | W[t - 2] << (32 - 19)) ^ (W[t - 2] >>> 10);
                W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
            }
            let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
            for (let t = 0; t < 64; t++) {
                const S1 = (e >>> 6 | e << (32 - 6)) ^ (e >>> 11 | e << (32 - 11)) ^ (e >>> 25 | e << (32 - 25));
                const ch = (e & f) ^ (~e & g);
                const temp1 = (h + S1 + ch + K[t] + W[t]) | 0;
                const S0 = (a >>> 2 | a << (32 - 2)) ^ (a >>> 13 | a << (32 - 13)) ^ (a >>> 22 | a << (32 - 22));
                const maj = (a & b) ^ (a & c) ^ (b & c);
                const temp2 = (S0 + maj) | 0;
                h = g;
                g = f;
                f = e;
                e = (d + temp1) | 0;
                d = c;
                c = b;
                b = a;
                a = (temp1 + temp2) | 0;
            }
            H[0] = (H[0] + a) | 0;
            H[1] = (H[1] + b) | 0;
            H[2] = (H[2] + c) | 0;
            H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0;
            H[5] = (H[5] + f) | 0;
            H[6] = (H[6] + g) | 0;
            H[7] = (H[7] + h) | 0;
        }
        return H.map(h => ("00000000" + h.toString(16)).slice(-8)).join('');
    }

    async function createMerkleRoot(transactions) {
        if (transactions.length === 0) return "";
        let layer = transactions.map(tx => hash(tx));
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

        addTransaction(sender, receiver, amount) {
            const transaction = `${sender} -> ${receiver} : ${amount}`;
            this.pendingTransactions.push(transaction);
        }

        async minePendingTransactions() {
            if (this.pendingTransactions.length === 0) {
                console.log("No transactions to mine.");
                return;
            }
            const lastBlock = this.chain[this.chain.length - 1];
            const newBlock = new Block(lastBlock.hash, this.pendingTransactions);
            await newBlock.mineBlock();
            this.chain.push(newBlock);
            this.pendingTransactions = [];
        }

        validateBlockchain() {
            for (let i = 1; i < this.chain.length; i++) {
                const currentBlock = this.chain[i];
                const previousBlock = this.chain[i - 1];
                const calculatedHash = hash(currentBlock.previousHash + currentBlock.timestamp + currentBlock.merkleRoot);
                if (currentBlock.hash !== calculatedHash || currentBlock.previousHash !== previousBlock.hash) {
                    return false;
                }
            }
            return true;
        }
    }

    // Example Usage
    const myBlockchain = new Blockchain();
    console.log("Genesis Block:", myBlockchain.chain[0]);

    myBlockchain.addTransaction("Alice", "Bob", 100);
    myBlockchain.addTransaction("Bob", "Charlie", 50);

    myBlockchain.minePendingTransactions().then(() => {
        console.log("Blockchain:", myBlockchain.chain);
        console.log("Is valid:", myBlockchain.validateBlockchain());
    });
});
