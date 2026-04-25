const EncodingView = {
    template: `
    <h2 class="text-xl font-bold text-gray-800 mb-1 flex items-center space-x-1">
        <span class="text-indigo-700">🔠</span>
        <span>编码转换</span>
    </h2>

    <!-- Desktop tabs -->
    <div class="hidden lg:flex mb-1 border-b border-gray-200 pb-2">
        <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
            :class="['px-4 py-2 text-sm rounded',
                     activeTab === tab.key ? 'bg-indigo-700 text-white' : 'text-gray-600 hover:bg-gray-100']">
            {{ tab.label }}
        </button>
    </div>
    <!-- Mobile dropdown -->
    <div class="lg:hidden mb-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">选择编码类型</label>
        <SingleSelect v-model="activeTab" :options="tabs.map(t => ({ value: t.key, label: t.label }))" size="md"></SingleSelect>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-1">
        <div class="flex flex-col">
            <div class="flex-1">
                <label class="block text-sm font-medium text-gray-700 mb-1">输入</label>
                <textarea v-model="currentInput" :placeholder="inputPlaceholder"
                    class="min-h-50 w-full rounded border border-gray-300 px-3 py-2 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
            </div>
            <div class="flex space-x-1">
                <Button @click="encode" variant="primary" size="sm">{{ encodeLabel }}</Button>
                <Button @click="decode" variant="secondary" size="sm">{{ decodeLabel }}</Button>
            </div>
        </div>

        <div class="flex flex-col">
            <div class="flex items-center justify-between mb-1">
                <label class="block text-sm font-medium text-gray-700">输出</label>
                <CopyButton v-if="currentOutput" :text="currentOutput"></CopyButton>
            </div>
            <textarea v-model="currentOutput"  readonly :placeholder="outputPlaceholder"
                class="min-h-50 w-full rounded border border-gray-300 px-3 py-2 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
        </div>
    </div>
    `,
    data() {
        return {
            activeTab: 'url',
            tabs: [
                { key: 'url', label: 'URL' },
                { key: 'base64', label: 'Base64' },
                { key: 'base64url', label: 'Base64Url' },
                { key: 'utf8', label: 'UTF-8' },
                { key: 'hex', label: 'Hex' }
            ],
            inputs: {},
            outputs: {}
        };
    },
    computed: {
        currentInput: {
            get() { return this.inputs[this.activeTab] || ''; },
            set(v) { this.inputs[this.activeTab] = v; }
        },
        currentOutput: {
            get() { return this.outputs[this.activeTab] || ''; },
            set(v) { this.outputs[this.activeTab] = v; }
        },
        inputPlaceholder() {
            return { url: '输入文本...', base64: '输入文本...', base64url: '输入文本...', utf8: '输入字节数组（空格分隔）...', hex: '输入字节数组（空格分隔）...' }[this.activeTab];
        },
        outputPlaceholder() {
            return '编码/解码结果...';
        },
        encodeLabel() {
            return { url: 'URL编码', base64: 'Base64编码', base64url: 'Base64Url编码', utf8: 'UTF-8编码', hex: 'Hex编码' }[this.activeTab];
        },
        decodeLabel() {
            return { url: 'URL解码', base64: 'Base64解码', base64url: 'Base64Url解码', utf8: 'UTF-8解码', hex: 'Hex解码' }[this.activeTab];
        }
    },
    methods: {
        encode() {
            if (!this.currentInput) return;
            try {
                switch (this.activeTab) {
                    case 'url': this.currentOutput = encodeURIComponent(this.currentInput); break;
                    case 'base64': this.currentOutput = btoa(unescape(encodeURIComponent(this.currentInput))); break;
                    case 'base64url': this.currentOutput = btoa(unescape(encodeURIComponent(this.currentInput))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); break;
                    case 'utf8': this.utf8Encode(); break;
                    case 'hex': this.hexEncode(); break;
                }
            } catch (e) { this.currentOutput = '编码失败: ' + e.message; }
        },
        decode() {
            if (!this.currentInput) return;
            try {
                switch (this.activeTab) {
                    case 'url': this.currentOutput = decodeURIComponent(this.currentInput); break;
                    case 'base64': this.currentOutput = decodeURIComponent(escape(atob(this.currentInput))); break;
                    case 'base64url': 
                        let s = this.currentInput.replace(/-/g, '+').replace(/_/g, '/');
                        while (s.length % 4) s += '=';
                        this.currentOutput = decodeURIComponent(escape(atob(s)));
                        break;
                    case 'utf8': this.utf8Decode(); break;
                    case 'hex': this.hexDecode(); break;
                }
            } catch (e) { this.currentOutput = '解码失败: ' + e.message; }
        },
        async utf8Encode() {
            const arr = this.currentInput.split(/\s+/).filter(v => v).map(Number);
            if (arr.some(isNaN)) { this.currentOutput = '请输入有效的字节数组（空格分隔）'; return; }
            const res = await api('POST', '/encoding/utf8-encode', { data: arr });
            this.currentOutput = res.data;
        },
        async utf8Decode() {
            const res = await api('POST', '/encoding/utf8-decode', { text: this.currentInput });
            this.currentOutput = res.data;
        },
        async hexEncode() {
            const arr = this.currentInput.split(/\s+/).filter(v => v).map(Number);
            if (arr.some(isNaN)) { this.currentOutput = '请输入有效的字节数组（空格分隔）'; return; }
            const res = await api('POST', '/encoding/hex-encode', { data: arr });
            this.currentOutput = res.data;
        },
        async hexDecode() {
            const res = await api('POST', '/encoding/hex-decode', { text: this.currentInput });
            this.currentOutput = res.data;
        }
    }
};
