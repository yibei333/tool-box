const HashView = {
    template: `
    <h2 class="text-xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
        <span class="text-indigo-700">#️⃣</span>
        <span>哈希计算</span>
    </h2>

    <div class="space-y-4">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">输入文本</label>
            <textarea v-model="text" placeholder="输入要计算哈希的文本..."
                class="min-h-50 w-full rounded border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-y"></textarea>
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-2">算法</label>
                <div class="flex flex-wrap gap-2">
                    <button v-for="algo in algorithms" :key="algo.value" @click="algorithm = algo.value"
                        :class="['px-3 py-1.5 rounded text-sm font-medium transition-colors',
                            algorithm === algo.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
                        {{ algo.label }}
                    </button>
                </div>
            </div>
            <div v-if="isHmac" class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">密钥</label>
                <input type="text" v-model="key" placeholder="HMAC密钥"
                    class=" rounded border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 outline-none">
            </div>
        </div>

        <Button @click="compute" variant="primary">计算</Button>

        <div v-if="result" class="flex items-center space-x-2 bg-gray-50 rounded px-4 py-3">
            <code class="mono text-sm flex-1 break-all select-all">{{ result }}</code>
            <CopyButton :text="result"></CopyButton>
        </div>
    </div>
    `,
    data() {
        return {
            text: '',
            algorithm: 'sha256',
            key: '',
            result: '',
            algorithms: [
                { value: 'md5', label: 'MD5' },
                { value: 'sha1', label: 'SHA1' },
                { value: 'sha256', label: 'SHA256' },
                { value: 'sha384', label: 'SHA384' },
                { value: 'sha512', label: 'SHA512' },
                { value: 'hmac-md5', label: 'HMAC-MD5' },
                { value: 'hmac-sha1', label: 'HMAC-SHA1' },
                { value: 'hmac-sha256', label: 'HMAC-SHA256' },
                { value: 'hmac-sha384', label: 'HMAC-SHA384' },
                { value: 'hmac-sha512', label: 'HMAC-SHA512' }
            ]
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
