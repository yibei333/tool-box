const RegexView = {
    template: `
    <h2 class="text-xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
        <span class="text-indigo-700">🔍</span>
        <span>正则表达式测试</span>
    </h2>

    <div class="flex-1 flex flex-col lg:flex-row gap-2">
        <div class="flex-0 lg:flex-3 flex flex-col gap-2">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">正则表达式</label>
                <input type="text" v-model="pattern" placeholder="输入正则表达式..."
                    class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
            </div>

            <div class="flex items-center space-x-4">
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" v-model="ignoreCase" class="rounded text-indigo-700">
                    <span class="text-sm">忽略大小写</span>
                </label>
                <label class="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" v-model="multiline" class="rounded text-indigo-700">
                    <span class="text-sm">多行模式</span>
                </label>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">测试文本</label>
                <textarea v-model="text" rows="6" placeholder="输入测试文本..."
                    class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-y"></textarea>
            </div>

            <Button @click="test" variant="primary">测试</Button>

            <div v-if="result">
                <div v-if="!result.isValid" class="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
                    无效的正则表达式: {{ result.error }}
                </div>
                <div v-else class="space-y-3">
                    <div class="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm">
                        找到 {{ result.matches.length }} 个匹配
                    </div>
                    <div v-for="(m, i) in result.matches" :key="i" class="bg-gray-50 rounded-xl px-4 py-2">
                        <div class="text-sm text-gray-600">匹配 {{ i + 1 }}: 索引 {{ m.index }}, 长度 {{ m.length }}</div>
                        <code class="mono text-sm text-indigo-700">{{ m.value }}</code>
                        <div v-if="m.groups.length" class="mt-1">
                            <div v-for="(g, gi) in m.groups" :key="gi" class="text-xs text-gray-500">
                                组 {{ g.name || gi }}: <span class="text-gray-700">{{ g.value }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex-1">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">常用正则</h3>
            <div class="space-y-2 overflow-y-auto">
                <div v-for="p in patterns" :key="p.name"
                    @click="usePattern(p)"
                    class="bg-gray-50 rounded-xl px-3 py-2 cursor-pointer hover:bg-indigo-50">
                    <div class="text-sm font-medium text-gray-700">{{ p.name }}</div>
                    <div class="text-xs text-gray-500 truncate">{{ p.description }}</div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            pattern: '',
            text: '',
            ignoreCase: false,
            multiline: false,
            result: null,
            patterns: []
        };
    },
    async mounted() {
        try {
            const res = await api('GET', '/regex/patterns');
            this.patterns = res.data;
        } catch(e) {}
    },
    methods: {
        async test() {
            if (!this.pattern) return;
            try {
                const res = await api('POST', '/regex/test', {
                    pattern: this.pattern,
                    text: this.text,
                    ignoreCase: this.ignoreCase,
                    multiline: this.multiline
                });
                this.result = res.data;
            } catch(e) {
                this.result = { isValid: false, error: e.message, matches: [] };
            }
        },
        usePattern(p) {
            this.pattern = p.pattern;
        }
    }
};
