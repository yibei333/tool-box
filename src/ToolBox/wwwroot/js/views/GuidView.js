const GuidView = {
    template: `
    <div class="space-y-6">
        <div class="glass rounded-2xl p-6 shadow-xl">
            <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <span class="text-indigo-700">🆔</span>
                <span>GUID生成器</span>
            </h2>

            <div class="flex py-2">
                <div class="flex gap-2 p-2 border rounded-xl border-gray-300 items-center">
                    <label class="text-sm text-gray-700">00000000-0000-0000-0000-000000000000</label>
                    <CopyButton :text="'00000000-0000-0000-0000-000000000000'"></CopyButton>
                </div>
            </div>

            <div class="space-y-4">
                <div class="flex items-center space-x-6">
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" v-model="format" value="D" class="text-indigo-700">
                        <span class="text-sm">带连字符</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" v-model="format" value="N" class="text-indigo-700">
                        <span class="text-sm">无连字符</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" v-model="format" value="B" class="text-indigo-700">
                        <span class="text-sm">带花括号</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" v-model="format" value="P" class="text-indigo-700">
                        <span class="text-sm">带圆括号</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer ml-auto">
                        <input type="checkbox" v-model="uppercase" class="text-indigo-700 rounded">
                        <span class="text-sm">大写</span>
                    </label>
                </div>

                <div class="flex items-center space-x-4">
                    <label class="text-sm text-gray-700">生成数量</label>
                    <input type="number" v-model.number="count" min="1" max="100"
                        class="w-24 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    <Button @click="generate" variant="primary">生成</Button>
                </div>

                <div v-if="guids.length" class="space-y-1">
                    <div v-for="(g, i) in guids" :key="i"
                        class="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                        <code class="mono text-sm flex-1 select-all">{{ g }}</code>
                        <CopyButton :text="g"></CopyButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            format: 'D',
            uppercase: false,
            count: 5,
            guids: [],
        };
    },
    mounted() {
        this.generate();
    },
    methods: {
        generate() {
            this.guids = [];
            for (let i = 0; i < this.count; i++) {
                const raw = crypto.randomUUID();
                let guid = raw;
                if (this.format === 'N') guid = raw.replace(/-/g, '');
                else if (this.format === 'B') guid = '{' + raw + '}';
                else if (this.format === 'P') guid = '(' + raw + ')';
                if (this.uppercase) guid = guid.toUpperCase();
                this.guids.push(guid);
            }
        }
    }
};
