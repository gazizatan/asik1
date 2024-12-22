document.addEventListener("DOMContentLoaded", function () {
    function sha256(text) {
        const sha256 = new TextEncoder().encode(text);
        const hashBuffer = crypto.subtle.digest("SHA-256", sha256);  
        return hashBuffer.then(buffer => {
            return Array.from(new Uint8Array(buffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');
        });
    }

    async function createMerkleRoot(transactions) {
        let merkleLayer = transactions.map(tx => sha256(tx));
        while (merkleLayer.length > 1) {
            const tempLayer = [];
            for (let i = 0; i < merkleLayer.length; i += 2) {
                const pair = merkleLayer[i] + (merkleLayer[i + 1] || merkleLayer[i]);
                tempLayer.push(await sha256(pair));
            }
            merkleLayer = tempLayer;
        }
        return merkleLayer[0];
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
            this.hash = await sha256(blockData);
        }
    }

    class Blockchain {
        constructor() {
            this.chain = [];
            this.pendingTransactions = [];
            this.createGenesisBlock();
        }

        createGenesisBlock() {
            const genesisBlock = new Block("0", []); //No hash
            genesisBlock.timestamp = new Date().toISOString();
            genesisBlock.hash = sha256("0" + genesisBlock.timestamp + "");//hash of genesis
            this.chain.push(genesisBlock);
        }

        async addTransaction(sender, receiver, amount) {
            this.pendingTransactions.push(`${sender} -> ${receiver} : ${amount}`);
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
                const validHash = await sha256(blockData);

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
            ${block.transactions.length > 0 ? block.transactions.map(tx => `<li>${tx}</li>`).join("") : "<li>No transactions</li>"}
          </ul>
        `;
                blockchainContainer.appendChild(blockDiv);
            });
        }
    }

    const blockchain = new Blockchain(); //Initialize blockchain
    //Mine block buton click
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
