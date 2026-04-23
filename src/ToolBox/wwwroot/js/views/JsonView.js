const JsonView = {
    template: `
    <div class="space-y-6">
        <div class="glass rounded-2xl p-6 shadow-xl">
            <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <span class="text-indigo-700">📄</span>
                <span>JSON工具</span>
            </h2>

            <div class="flex space-x-2 mb-6 border-b border-gray-200 pb-3">
                <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                    :class="['px-4 py-2 text-sm rounded-t-lg',
                             activeTab === tab.key ? 'bg-indigo-700 text-white' : 'text-gray-600 hover:bg-gray-100']">
                    {{ tab.label }}
                </button>
            </div>

            <div class="grid grid-cols-2 gap-6" :style="{ height: contentHeight + 'px' }">
                <div class="flex flex-col space-y-4">
                    <div class="flex-1 min-h-0">
                        <label class="block text-sm font-medium text-gray-700 mb-1">{{ inputLabel }}</label>
                        <textarea v-model="currentInput" :rows="textareaRows" :placeholder="inputPlaceholder"
                            class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                    </div>

                    <div v-if="activeTab === 'to-csharp'" class="flex items-center space-x-2">
                        <label class="text-sm text-gray-700">根类名:</label>
                        <input type="text" v-model="rootName" placeholder="Root"
                            class="w-40 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    </div>

                    <Button @click="execute" variant="primary">{{ executeLabel }}</Button>
                </div>

                <div class="flex flex-col space-y-4">
                    <div class="flex items-center justify-between mb-1">
                        <label class="block text-sm font-medium text-gray-700">结果</label>
                        <CopyButton v-if="currentOutput" :text="currentOutput"></CopyButton>
                    </div>
                    <textarea v-model="currentOutput" :rows="textareaRows" readonly :placeholder="outputPlaceholder"
                        class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            activeTab: 'format',
            rootName: 'Root',
            tabs: [
                { key: 'format', label: '格式化' },
                { key: 'compress', label: '压缩' },
                { key: 'to-csharp', label: 'JSON转C#' },
                { key: 'from-csharp', label: 'C#转JSON' },
                { key: 'escape', label: '转义' },
                { key: 'unescape', label: '去除转义' }
            ],
            inputs: {},
            outputs: {},
            contentHeight: 500
        };
    },
    computed: {
        textareaRows() {
            return Math.max(10, Math.floor((this.contentHeight - 80) / 24));
        },
        currentInput: {
            get() { return this.inputs[this.activeTab] || ''; },
            set(v) { this.inputs[this.activeTab] = v; }
        },
        currentOutput: {
            get() { return this.outputs[this.activeTab] || ''; },
            set(v) { this.outputs[this.activeTab] = v; }
        },
        inputLabel() {
            return { format: 'JSON输入', compress: 'JSON输入', 'to-csharp': 'JSON输入', 'from-csharp': 'C#类代码', escape: '文本输入', unescape: '转义文本输入' }[this.activeTab];
        },
        inputPlaceholder() {
            return { format: '粘贴JSON...', compress: '粘贴JSON...', 'to-csharp': '粘贴JSON...', 'from-csharp': '粘贴C#类代码...', escape: '输入需要转义的文本...', unescape: '输入需要去除转义的文本...' }[this.activeTab];
        },
        outputPlaceholder() {
            return '结果将在此显示...';
        },
        executeLabel() {
            return { format: '格式化', compress: '压缩', 'to-csharp': '转换', 'from-csharp': '转换', escape: '转义', unescape: '去除转义' }[this.activeTab];
        }
    },
    mounted() {
        this.updateHeight();
        window.addEventListener('resize', this.updateHeight);
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.updateHeight);
    },
    methods: {
        updateHeight() {
            const h = window.innerHeight;
            this.contentHeight = Math.max(400, h - 230);
        },
        async execute() {
            if (!this.currentInput) return;
            this.currentOutput = '';
            try {
                let res;
                switch (this.activeTab) {
                    case 'format': res = await api('POST', '/json/format', { json: this.currentInput }); break;
                    case 'compress': res = await api('POST', '/json/compress', { json: this.currentInput }); break;
                    case 'to-csharp': res = await api('POST', '/json/to-csharp', { json: this.currentInput, rootName: this.rootName }); break;
                    case 'from-csharp': res = await api('POST', '/json/from-csharp', { code: this.currentInput }); break;
                    case 'escape': res = await api('POST', '/json/escape', { json: this.currentInput }); break;
                    case 'unescape': res = await api('POST', '/json/unescape', { json: this.currentInput }); break;
                }
                this.currentOutput = res.data;
            } catch(e) { this.currentOutput = '操作失败: ' + e.message; }
        }
    }
};
