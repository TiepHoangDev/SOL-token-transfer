const app = Vue.createApp({
    data() {
        return {
            transfer1Data: {
                senderMnemonic: "erode lady picture gun critic injury middle promote motion begin zero fatal",
                receiverMnemonic: "",
                mintAddress: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
                amount: 1.0,
                senderAccountIndex: 1,
                isMainnet: false
            },
            transferNData: {
                senderMnemonic: "erode lady picture gun critic injury middle promote motion begin zero fatal",
                mintAddress: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
                senderAccountIndex: 1,
                isMainnet: false,
                receiversInput: "1.0,genius own blush winter together torch myth north depart auto practice frequent\n2.5,tumbletumbletumbletumbletumbletumble roof rapid describe elite armor twenty update flee setup window swing2"
            },
            transfer1Result: null,
            transfer1Loading: false,
            transferNResult: null,
            transferNLoading: false
        };
    },
    methods: {
        async transfer1() {
            this.transfer1Loading = true;
            this.transfer1Result = null;

            try {
                const formData = {
                    senderMnemonic: this.transfer1Data.senderMnemonic,
                    receiverMnemonic: this.transfer1Data.receiverMnemonic,
                    mintAddress: this.transfer1Data.mintAddress,
                    amount: parseFloat(this.transfer1Data.amount),
                    senderAccountIndex: parseInt(this.transfer1Data.senderAccountIndex),
                    isMainnet: this.transfer1Data.isMainnet
                };

                const response = await axios.post('http://localhost:3000/api/transfer1_1', formData);
                this.transfer1Result = response.data;
            } catch (error) {
                this.transfer1Result = { error: error.message || 'Transfer failed' };
            } finally {
                this.transfer1Loading = false;
            }
        },
        async transferN() {
            this.transferNLoading = true;
            this.transferNResult = null;

            try {
                // Parse receivers from multiline input
                const receivers = this.transferNData.receiversInput
                    .split('\n')
                    .filter(line => line.trim())
                    .map(line => {
                        const [amount, mnemonic] = line.split(',').map(part => part.trim());
                        if (!mnemonic || isNaN(parseFloat(amount))) {
                            throw new Error(`Invalid line format: ${line}. Please use format: amount,mnemonic_phrase`);
                        }
                        return {
                            mnemonic,
                            amount: parseFloat(amount),
                            accountIndex: 0
                        };
                    });

                const formData = {
                    senderMnemonic: this.transferNData.senderMnemonic,
                    senderAccountIndex: parseInt(this.transferNData.senderAccountIndex),
                    receivers,
                    mintAddress: this.transferNData.mintAddress,
                    isMainnet: this.transferNData.isMainnet
                };

                const response = await axios.post('http://localhost:3000/api/transfer1_n', formData);
                this.transferNResult = response.data;
            } catch (error) {
                this.transferNResult = { error: error.message || 'Transfer failed' };
            } finally {
                this.transferNLoading = false;
            }
        }
    }
});

app.mount('#app');

if (!window.axios) {
    window.axios = axios;
}

function displayResultN(result) {
    const resultDiv = document.getElementById('resultNContent');
    const transfersHtml = result.transfers.map(transfer => `
        <div class="${transfer.success ? 'alert alert-success' : 'alert alert-danger'}">
            <h4 class="alert-heading">${transfer.success ? 'Success' : 'Error'}: ${transfer.receiver}</h4>
            ${transfer.success ? `
                <p>Amount: ${transfer.amount}</p>
                <p>Before Balance: ${transfer.beforeBalance}</p>
                <p>After Balance: ${transfer.afterBalance}</p>
            ` : `
                <p>Error: ${transfer.error}</p>
            `}
        </div>
    `).join('');

    resultDiv.innerHTML = `
        <div class="alert alert-info">
            <h4 class="alert-heading">Overall Result</h4>
            <p>Sender: <code>${result.sender}</code></p>
            <p>Mint: <code>${result.mint}</code></p>
            <p>Sender Balance: ${result.senderBalanceBefore} → ${result.senderBalanceAfter}</p>
        </div>
        ${transfersHtml}
    `;
    document.getElementById('resultN').style.display = 'block';
}

function displayErrorN(error) {
    const resultDiv = document.getElementById('resultNContent');
    resultDiv.innerHTML = `
        <div class="alert alert-danger">
            <h4 class="alert-heading">Error</h4>
            <p>${error}</p>
        </div>
    `;
    document.getElementById('resultN').style.display = 'block';
}
