const app = Vue.createApp({
    data() {
        return {
            activeTab: 'transferN',
            transfer1Data: {
                senderMnemonic: "erode lady picture gun critic injury middle promote motion begin zero fatal",
                receiverMnemonic: "",
                mintAddress: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
                amount: 1.0,
                senderAccountIndex: 1,
                isMainnet: false
            },
            transfer1Loading: false,
            transfer1Result: null,
            transferNData: {
                senderMnemonic: "erode lady picture gun critic injury middle promote motion begin zero fatal",
                mintAddress: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
                senderAccountIndex: 1,
                isMainnet: false,
                receiversInput: "1.0,genius own blush winter together torch myth north depart auto practice frequent\n2.5,tumbletumbletumbletumbletumbletumble roof rapid describe elite armor twenty update flee setup window swing2"
            },
            transferNLoading: false,
            transferNResult: null
        };
    },
    methods: {
        formatBalanceChange(before, after) {
            if (!before || !after) return '';
            const change = parseFloat(after) - parseFloat(before);
            return change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2);
        },
        formatAddress(address) {
            if (!address) return '';
            if (typeof address !== 'string') return '';
            return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        },
        toggleTab(tab) {
            this.activeTab = tab;
        },
        async transfer1() {
            this.transfer1Loading = true;
            this.transfer1Result = null;
            try {
                const response = await axios.post('/transfer1', this.transfer1Data);
                this.transfer1Result = response.data;
            } catch (error) {
                console.error('Error:', error);
                this.transfer1Result = {
                    error: error.response?.data?.message || 'An error occurred'
                };
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

                const response = await axios.post('/api/transfer1_n', formData);
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