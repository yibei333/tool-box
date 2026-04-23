const StringView = {
    template: `
    <div class="space-y-6">
        <div class="glass rounded-2xl p-6 shadow-xl">
            <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <span class="text-indigo-700">📝</span>
                <span>字符串工具</span>
            </h2>

            <div class="flex space-x-2 mb-6 border-b border-gray-200 pb-3">
                <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
                    :class="['px-4 py-2 text-sm rounded-t-lg', activeTab === tab.key ? 'bg-indigo-700 text-white' : 'text-gray-600 hover:bg-gray-100']">
                    {{ tab.label }}
                </button>
            </div>

            <!-- Diff -->
            <div v-if="activeTab === 'diff'" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">文本1</label>
                        <textarea v-model="diffText1" rows="10" placeholder="输入文本1..."
                            class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-y"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">文本2</label>
                        <textarea v-model="diffText2" rows="10" placeholder="输入文本2..."
                            class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-y"></textarea>
                    </div>
                </div>
                <Button @click="computeDiff" variant="primary" size="sm">比较</Button>
                <div v-if="diffResult.length" class="space-y-1">
                    <div v-for="(line, i) in diffResult" :key="i"
                        :class="['px-3 py-1 text-sm mono rounded',
                                 line.type === 'add' ? 'bg-green-50 text-green-800' :
                                 line.type === 'del' ? 'bg-red-50 text-red-800' : 'bg-gray-50 text-gray-600']">
                        <span class="mr-2">{{ line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' ' }}</span>{{ line.text }}
                    </div>
                </div>
            </div>

            <!-- Escape/Unescape -->
            <div v-if="activeTab === 'escape'" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">输入文本</label>
                    <textarea v-model="escapeInput" rows="6" placeholder="输入文本..."
                        class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-y"></textarea>
                </div>
                <div class="flex space-x-2">
                    <Button @click="doEscape" variant="primary" size="sm">转义</Button>
                    <Button @click="doUnescape" variant="secondary" size="sm">去除转义</Button>
                </div>
                <div v-if="escapeResult">
                    <div class="flex items-center justify-between mb-1">
                        <label class="text-sm font-medium text-gray-700">结果</label>
                        <CopyButton :text="escapeResult"></CopyButton>
                    </div>
                    <textarea v-model="escapeResult" rows="6" readonly
                        class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-y"></textarea>
                </div>
            </div>

            <!-- Case Conversion -->
            <div v-if="activeTab === 'case'" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">输入文本</label>
                    <textarea v-model="caseInput" rows="4" placeholder="输入文本..."
                        class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-y"></textarea>
                </div>
                <div class="flex flex-wrap gap-2">
                    <Button v-for="ct in caseTypes" :key="ct.value" @click="convertCase(ct.value)" variant="secondary" size="sm">{{ ct.label }}</Button>
                </div>
                <div v-if="caseResult">
                    <div class="flex items-center justify-between mb-1">
                        <label class="text-sm font-medium text-gray-700">结果</label>
                        <CopyButton :text="caseResult"></CopyButton>
                    </div>
                    <textarea v-model="caseResult" rows="4" readonly
                        class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-y"></textarea>
                </div>
            </div>

            <!-- Random String -->
            <div v-if="activeTab === 'random'" class="space-y-4">
                <div class="flex items-center space-x-4">
                    <div class="flex gap-2 items-center">
                        <label class="block text-sm text-gray-700 mb-1">字符集</label>
                        <select v-model="randomCharSet"
                            class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                            <option value="number">纯数字</option>
                            <option value="letter_lower">小写字母</option>
                            <option value="letter_upper">大写字母</option>
                            <option value="letter">字母</option>
                            <option value="number_and_letter">数字+字母</option>
                            <option value="mix">混合(含特殊字符)</option>
                        </select>
                    </div>
                    <div class="flex gap-2 items-center">
                        <label class="block text-sm text-gray-700 mb-1">长度</label>
                        <input type="number" v-model.number="randomLength" min="1" max="256"
                            class="w-24 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    </div>
                    <Button @click="generateRandom" variant="primary" size="sm">生成</Button>
                </div>
                <div v-if="randomResult">
                    <div class="flex items-center space-x-2 bg-gray-50 rounded-xl px-4 py-2.5">
                        <code class="mono text-sm flex-1 select-all">{{ randomResult }}</code>
                        <CopyButton :text="randomResult"></CopyButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            activeTab: 'diff',
            tabs: [
                { key: 'diff', label: '差异比较' },
                { key: 'escape', label: '转义/去除转义' },
                { key: 'case', label: '大小写转换' },
                { key: 'random', label: '随机字符串' }
            ],
            diffText1: '', diffText2: '', diffResult: [],
            escapeInput: '', escapeResult: '',
            caseInput: '', caseResult: '',
            caseTypes: [
                { label: 'UPPER', value: 'upper' },
                { label: 'lower', value: 'lower' },
                { label: 'camelCase', value: 'camelcase' },
                { label: 'PascalCase', value: 'pascalcase' },
                { label: 'snake_case', value: 'snake_case' },
                { label: 'kebab-case', value: 'kebab-case' }
            ],
            randomLength: 16, randomCharSet: 'number_and_letter', randomResult: ''
        };
    },
    mounted() {
        this.generateRandom();
    },
    methods: {
        computeDiff() {
            const lines1 = this.diffText1.split('\n');
            const lines2 = this.diffText2.split('\n');
            const result = [];
            const maxLen = Math.max(lines1.length, lines2.length);
            for (let i = 0; i < maxLen; i++) {
                const l1 = i < lines1.length ? lines1[i] : undefined;
                const l2 = i < lines2.length ? lines2[i] : undefined;
                if (l1 === l2) {
                    result.push({ type: 'eq', text: l1 });
                } else {
                    if (l1 !== undefined) result.push({ type: 'del', text: l1 });
                    if (l2 !== undefined) result.push({ type: 'add', text: l2 });
                }
            }
            this.diffResult = result;
        },
        async doEscape() {
            try {
                const res = await api('POST', '/string/escape', { text: this.escapeInput });
                this.escapeResult = res.data;
            } catch(e) { this.escapeResult = '转义失败: ' + e.message; }
        },
        async doUnescape() {
            try {
                const res = await api('POST', '/string/unescape', { text: this.escapeInput });
                this.escapeResult = res.data;
            } catch(e) { this.escapeResult = '去除转义失败: ' + e.message; }
        },
        async convertCase(targetCase) {
            try {
                const res = await api('POST', '/string/case', { text: this.caseInput, targetCase });
                this.caseResult = res.data;
            } catch(e) { this.caseResult = '转换失败: ' + e.message; }
        },
        async generateRandom() {
            try {
                const res = await api('POST', '/string/random', { length: this.randomLength, charSet: this.randomCharSet });
                this.randomResult = res.data;
            } catch(e) { this.randomResult = '生成失败: ' + e.message; }
        }
    }
};
