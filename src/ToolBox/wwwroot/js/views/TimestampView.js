const TimestampView = {
    template: `
    <h2 class="text-xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
        <span class="text-indigo-700">⏰</span>
        <span>时间戳转换</span>
    </h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-4">
            <label class="block text-sm font-medium text-gray-700">日期时间</label>
            <input type="datetime-local" v-model="datetime"
                class=" rounded-xl border border-gray-300 px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition">
            <Button @click="toUnix" variant="primary">转为时间戳</Button>
            <div v-if="unixResult" class="space-y-2">
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-500 min-w-8">秒:</span>
                    <code class="mono text-sm bg-gray-100 px-2 py-1 rounded flex-1">{{ unixResult.seconds }}</code>
                    <CopyButton :text="String(unixResult.seconds)"></CopyButton>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-500 min-w-8">毫秒:</span>
                    <code class="mono text-sm bg-gray-100 px-2 py-1 rounded flex-1">{{ unixResult.milliseconds }}</code>
                    <CopyButton :text="String(unixResult.milliseconds)"></CopyButton>
                </div>
            </div>
        </div>

        <div class="space-y-4">
            <div class="flex gap-4">
                <label class="block text-sm font-medium text-gray-700">Unix时间戳</label>
                <div class="flex items-center space-x-4">
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" v-model="unit" value="seconds" class="text-indigo-700">
                        <span class="text-sm">秒</span>
                    </label>
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" v-model="unit" value="milliseconds" class="text-indigo-700">
                        <span class="text-sm">毫秒</span>
                    </label>
                </div>
            </div>
            <input type="text" v-model="timestamp" placeholder="输入时间戳（秒或毫秒）"
                class=" rounded-xl border border-gray-300 px-4 py-2.5 mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition">
            <Button @click="toDatetime" variant="primary">转为日期时间</Button>
            <div v-if="datetimeResult" class="space-y-2">
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-500 min-w-8">本地:</span>
                    <code class="mono text-sm bg-gray-100 px-2 py-1 rounded flex-1">{{ datetimeResult.local }}</code>
                    <CopyButton :text="datetimeResult.local"></CopyButton>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-500 min-w-8">UTC:</span>
                    <code class="mono text-sm bg-gray-100 px-2 py-1 rounded flex-1">{{ datetimeResult.utc }}</code>
                    <CopyButton :text="datetimeResult.utc"></CopyButton>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            datetime: '',
            timestamp: '',
            unit: 'seconds',
            unixResult: null,
            datetimeResult: null,
        };
    },
    mounted() {
        this.updateNow();
        this.toUnix();
        this.toDatetime();
    },
    methods: {
        updateNow() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            this.datetime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

            this.timestamp = parseInt(now.getTime() / 1000);
        },
        toUnix() {
            if (!this.datetime) return;
            const ms = new Date(this.datetime).getTime();
            this.unixResult = {
                seconds: Math.floor(ms / 1000),
                milliseconds: ms
            };
        },
        toDatetime() {
            if (!this.timestamp) return;
            let ts = parseInt(this.timestamp);
            if (isNaN(ts)) return;
            if (this.unit === 'seconds') ts *= 1000;
            const date = new Date(ts);
            this.datetimeResult = {
                local: date.toLocaleString('zh-CN', { hour12: false }),
                utc: date.toUTCString()
            };
        }
    }
};
