const JsonView = {
    template: `
    <h2 class="text-xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
        <span class="text-indigo-700">📄</span>
        <span>JSON工具</span>
    </h2>

    <!-- Desktop tabs -->
    <div class="hidden lg:flex space-x-2 mb-2 border-b border-gray-200 pb-3">
        <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
            :class="['px-4 py-2 text-sm rounded',
                     activeTab === tab.key ? 'bg-indigo-700 text-white' : 'text-gray-600 hover:bg-gray-100']">
            {{ tab.label }}
        </button>
    </div>
    <!-- Mobile dropdown -->
    <div class="lg:hidden mb-2">
        <label class="block text-sm font-medium text-gray-700 mb-2">选择操作</label>
        <SingleSelect v-model="activeTab" :options="tabs.map(t => ({ value: t.key, label: t.label }))" size="md"></SingleSelect>
    </div>

    <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="flex flex-col gap-2">
            <div class="flex-1 flex flex-col gap-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ inputLabel }}</label>
                <textarea v-model="currentInput" :placeholder="inputPlaceholder"
                    class="flex-1 rounded border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
            </div>

            <div v-if="activeTab === 'to-csharp'" class="flex items-center space-x-2">
                <label class="text-sm text-gray-700">根类名:</label>
                <input type="text" v-model="rootName" placeholder="Root"
                    class="w-40 rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
            </div>

            <Button @click="execute" variant="primary">{{ executeLabel }}</Button>
        </div>

        <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between mb-1">
                <label class="block text-sm font-medium text-gray-700">结果</label>
                <CopyButton v-if="currentOutput" :text="currentOutput"></CopyButton>
            </div>
            <textarea v-model="currentOutput" readonly :placeholder="outputPlaceholder"
                class="flex-1 rounded border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 focus:border-indigo-500 outline-none resize-none"></textarea>
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
    methods: {
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
