document.addEventListener("DOMContentLoaded", function () {
    function sha256(text) {
        const K = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefe2e3f0, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0b5f6, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];

        let hash = new Uint32Array(8);
        hash[0] = 0x6a09e667;
        hash[1] = 0xbb67ae85;
        hash[2] = 0x3c6ef372;
        hash[3] = 0xa54ff53a;
        hash[4] = 0x510e527f;
        hash[5] = 0x9b05688c;
        hash[6] = 0x1f83d9ab;
        hash[7] = 0x5be0cd19;

        const message = new TextEncoder().encode(text);
        const length = message.length * 8;
        const padding = 64 - ((message.length + 9) % 64);

        let paddedMessage = new Uint8Array(message.length + padding + 9);
        paddedMessage.set(message);
        paddedMessage[message.length] = 0x80;
        paddedMessage[paddedMessage.length - 8] = (length >> 56) & 0xff;
        paddedMessage[paddedMessage.length - 7] = (length >> 48) & 0xff;
        paddedMessage[paddedMessage.length - 6] = (length >> 40) & 0xff;
        paddedMessage[paddedMessage.length - 5] = (length >> 32) & 0xff;
        paddedMessage[paddedMessage.length - 4] = (length >> 24) & 0xff;
        paddedMessage[paddedMessage.length - 3] = (length >> 16) & 0xff;
        paddedMessage[paddedMessage.length - 2] = (length >> 8) & 0xff;
        paddedMessage[paddedMessage.length - 1] = length & 0xff;

        for (let i = 0; i < paddedMessage.length; i += 64) {
            let w = new Uint32Array(64);
            for (let j = 0; j < 16; j++) {
                w[j] = (paddedMessage[i + j * 4] << 24) | (paddedMessage[i + j * 4 + 1] << 16) | (paddedMessage[i + j * 4 + 2] << 8) | (paddedMessage[i + j * 4 + 3]);
            }

            for (let j = 16; j < 64; j++) {
                let s0 = (w[j - 15] >>> 7 | w[j - 15] << 25) ^ (w[j - 15] >>> 18 | w[j - 15] << 14) ^ (w[j - 15] >>> 3);
                let s1 = (w[j - 2] >>> 17 | w[j - 2] << 15) ^ (w[j - 2] >>> 19 | w[j - 2] << 13) ^ (w[j - 2] >>> 10);
                w[j] = (w[j - 16] + s0 + w[j - 7] + s1) & 0xffffffff;
            }

            let a = hash[0];
            let b = hash[1];
            let c = hash[2];
            let d = hash[3];
            let e = hash[4];
            let f = hash[5];
            let g = hash[6];
            let h = hash[7];

            for (let j = 0; j < 64; j++) {
                let S1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
                let ch = (e & f) ^ (~e & g);
                let temp1 = h + S1 + ch + K[j] + w[j];
                let S0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
                let maj = (a & b) ^ (a & c) ^ (b & c);
                let temp2 = S0 + maj;

                h = g;
                g = f;
                f = e;
                e = (d + temp1) & 0xffffffff;
                d = c;
                c = b;
                b = a;
                a = (temp1 + temp2) & 0xffffffff;
            }

            hash[0] = (hash[0] + a) & 0xffffffff;
            hash[1] = (hash[1] + b) & 0xffffffff;
            hash[2] = (hash[2] + c) & 0xffffffff;
            hash[3] = (hash[3] + d) & 0xffffffff;
            hash[4] = (hash[4] + e) & 0xffffffff;
            hash[5] = (hash[5] + f) & 0xffffffff;
            hash[6] = (hash[6] + g) & 0xffffffff;
            hash[7] = (hash[7] + h) & 0xffffffff;
        }

        return hash.map(h => h.toString(16).padStart(8, '0')).join('');
    }

    function createMerkleRoot(transactions) {
        while (transactions.length > 1) {
            let temp = [];
            for (let i = 0; i < transactions.length; i += 2) {
                const pair = transactions[i] + (transactions[i + 1] || transactions[i]);
                temp.push(pair);
            }
            transactions = temp.map(t => sha256(t));
        }
        return transactions[0];
    }

    class Block {
        constructor(previousHash, transactions) {
            this.timestamp = new Date().toISOString();
            this.previousHash = previousHash;
            this.transactions = transactions;
            this.merkleRoot = '';
            this.hash = '';
        }

        async mineBlock() {
            this.merkleRoot = await createMerkleRoot(this.transactions);
            const blockData = this.previousHash + this.timestamp + this.merkleRoot;
            this.hash = sha256(blockData);
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
            genesisBlock.timestamp = new Date().toISOString();
            genesisBlock.hash = sha256("0" + genesisBlock.timestamp + "");
            this.chain.push(genesisBlock);
        }

        async addTransaction(sender, receiver, amount) {
            this.pendingTransactions.push({ sender, receiver, amount });
        }

        async minePendingTransactions() {
            if (this.pendingTransactions.length < 10) {
                alert("Waiting for 10 transactions to mine the block.");
                return;
            }

            const lastBlock = this.chain[this.chain.length - 1];
            const newBlock = new Block(lastBlock.hash, this.pendingTransactions);
            await newBlock.mineBlock();
            this.chain.push(newBlock);
            this.pendingTransactions = [];
            this.updateBlockchainDisplay();
        }

        async validateBlockchain() {
            for (let i = 1; i < this.chain.length; i++) {
                const currentBlock = this.chain[i];
                const previousBlock = this.chain[i - 1];

                if (currentBlock.previousHash !== previousBlock.hash) {
                    return false;
                }

                const blockData = currentBlock.previousHash + currentBlock.timestamp + currentBlock.merkleRoot;
                const validHash = sha256(blockData);

                if (currentBlock.hash !== validHash) {
                    return false;
                }
            }
            return true;
        }

        updateBlockchainDisplay() {
            const blockchainContainer = document.getElementById("blockchain");
            blockchainContainer.innerHTML = "";
            this.chain.forEach((block, index) => {
                const blockDiv = document.createElement("div");
                blockDiv.className = "block";
                blockDiv.innerHTML = `
          <h3>Block ${index === 0 ? "0 (Genesis)" : index}</h3>
          <p><strong>Hash:</strong> ${block.hash}</p>
          <p><strong>Previous Hash:</strong> ${block.previousHash}</p>
          <p><strong>Timestamp:</strong> ${block.timestamp}</p>
          <p><strong>Merkle Root:</strong> ${block.merkleRoot || "N/A"}</p>
          <h5>Transactions:</h5>
          <ul>
            ${block.transactions.length > 0 ? block.transactions.map(tx => `<li>${tx.sender} -> ${tx.receiver} : ${tx.amount}</li>`).join("") : "<li>No transactions</li>"}
          </ul>
        `;
                blockchainContainer.appendChild(blockDiv);
            });
        }
    }

    const blockchain = new Blockchain();

    document.getElementById("mineBlock").addEventListener("click", async () => {
        await blockchain.addTransaction("Altair", "Aibar", 10);
        await blockchain.addTransaction("Aibar", "Nurbol", 15);
        await blockchain.addTransaction("Nurbol", "Askar", 20);
        await blockchain.addTransaction("Askar", "Ayazhan", 25);
        await blockchain.addTransaction("Ayazhan", "Nurilya", 30);
        await blockchain.addTransaction("Nurilya", "Aida", 35);
        await blockchain.addTransaction("Aida", "Ruslan", 40);
        await blockchain.addTransaction("Ruslan", "Zhansaya", 45);
        await blockchain.addTransaction("Zhansaya", "Alisher", 50);
        await blockchain.addTransaction("Alisher", "Nurdana", 55);

        await blockchain.minePendingTransactions();
    });

    document.getElementById("validateBlockchain").addEventListener("click", async () => {
        const isValid = await blockchain.validateBlockchain();
        if (isValid) {
            alert("Blockchain is valid.");
        } else {
            alert("Blockchain is invalid.");
        }
    });
});
