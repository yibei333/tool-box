const GuidView = {
    template: `
    <h2 class="text-xl font-bold text-gray-800 mb-1 flex items-center space-x-1">
        <span class="text-indigo-700">🆔</span>
        <span>GUID生成器</span>
    </h2>

    <div class="flex py-2">
        <div class="flex gap-1 p-2 border rounded border-gray-300 items-center">
            <label class="text-sm text-gray-700">00000000-0000-0000-0000-000000000000</label>
            <CopyButton :text="'00000000-0000-0000-0000-000000000000'"></CopyButton>
        </div>
    </div>

    <div class="flex flex-col gap-1">
        <div class="flex flex-col lg:flex-row lg:items-center lg:space-y-0 lg:space-x-1">
            <label class="flex items-center space-x-1 cursor-pointer">
                <input type="radio" v-model="format" value="D" class="text-indigo-700">
                <span class="text-sm">带连字符</span>
            </label>
            <label class="flex items-center space-x-1 cursor-pointer">
                <input type="radio" v-model="format" value="N" class="text-indigo-700">
                <span class="text-sm">无连字符</span>
            </label>
            <label class="flex items-center space-x-1 cursor-pointer">
                <input type="radio" v-model="format" value="B" class="text-indigo-700">
                <span class="text-sm">带花括号</span>
            </label>
            <label class="flex items-center space-x-1 cursor-pointer">
                <input type="radio" v-model="format" value="P" class="text-indigo-700">
                <span class="text-sm">带圆括号</span>
            </label>
            <label class="flex items-center space-x-1 cursor-pointer">
                <input type="checkbox" v-model="uppercase" class="text-indigo-700 rounded">
                <span class="text-sm">大写</span>
            </label>
        </div>

        <div class="flex flex-col lg:flex-row lg:items-center gap-1">
            <label class="text-sm text-gray-700">生成数量</label>
            <input type="number" v-model.number="count" min="1" max="100"
                class="w-24 rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
            <Button @click="generate" variant="primary">生成</Button>
        </div>

        <div v-if="guids.length" class="space-y-1">
            <div v-for="(g, i) in guids" :key="i"
                class="flex items-center space-x-1 bg-gray-50 rounded px-3 py-2">
                <code class="mono text-sm flex-1 select-all">{{ g }}</code>
                <CopyButton :text="g"></CopyButton>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            format: 'D',
            uppercase: true,
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
                const raw = this.generateUUID();
                let guid = raw;
                if (this.format === 'N') guid = raw.replace(/-/g, '');
                else if (this.format === 'B') guid = '{' + raw + '}';
                else if (this.format === 'P') guid = '(' + raw + ')';
                if (this.uppercase) guid = guid.toUpperCase();
                this.guids.push(guid);
            }
        },
        generateUUID() {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                return crypto.randomUUID();
            }
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }
    }
};
