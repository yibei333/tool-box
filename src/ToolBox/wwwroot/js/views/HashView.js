const HashView = {
    template: `
    <div class="space-y-6">
        <div class="glass rounded-2xl p-6 shadow-xl">
            <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <span class="text-indigo-700">#️⃣</span>
                <span>哈希计算</span>
            </h2>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">输入文本</label>
                    <textarea v-model="text" rows="4" placeholder="输入要计算哈希的文本..."
                        class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-y"></textarea>
                </div>

                <div class="flex items-center space-x-4">
                    <div class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">算法</label>
                        <select v-model="algorithm"
                            class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 outline-none">
                            <option value="md5">MD5</option>
                            <option value="sha1">SHA1</option>
                            <option value="sha256">SHA256</option>
                            <option value="sha384">SHA384</option>
                            <option value="sha512">SHA512</option>
                            <option value="hmac-md5">HMAC-MD5</option>
                            <option value="hmac-sha1">HMAC-SHA1</option>
                            <option value="hmac-sha256">HMAC-SHA256</option>
                            <option value="hmac-sha384">HMAC-SHA384</option>
                            <option value="hmac-sha512">HMAC-SHA512</option>
                        </select>
                    </div>
                    <div v-if="isHmac" class="flex-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">密钥</label>
                        <input type="text" v-model="key" placeholder="HMAC密钥"
                            class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 outline-none">
                    </div>
                </div>

                <Button @click="compute" variant="primary">计算</Button>

                <div v-if="result" class="flex items-center space-x-2 bg-gray-50 rounded-xl px-4 py-3">
                    <span class="text-sm text-gray-500 shrink-0">结果:</span>
                    <code class="mono text-sm flex-1 break-all select-all">{{ result }}</code>
                    <CopyButton :text="result"></CopyButton>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            text: '',
            algorithm: 'sha256',
            key: '',
            result: ''
        };
    },
    computed: {
        isHmac() { return this.algorithm.startsWith('hmac-'); }
    },
    methods: {
        async compute() {
            if (!this.text) return;
            try {
                if (this.isHmac) {
                    const res = await api('POST', '/hash/hmac', { text: this.text, key: this.key, algorithm: this.algorithm });
                    this.result = res.data;
                } else {
                    const res = await api('POST', '/hash/compute', { text: this.text, algorithm: this.algorithm });
                    this.result = res.data;
                }
            } catch(e) { this.result = '计算失败: ' + e.message; }
        }
    }
};
