const JwtView = {
    template: `
    <h2 class="text-xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
        <span class="text-indigo-700">🔑</span>
        <span>JWT工具</span>
    </h2>

    <!-- Desktop tabs -->
    <div class="hidden lg:flex space-x-2 mb-2 border-b border-gray-200 pb-3">
        <button @click="activeTab = 'generate'"
            :class="['px-4 py-2 text-sm rounded-t-lg', activeTab === 'generate' ? 'bg-indigo-700 text-white' : 'text-gray-600 hover:bg-gray-100']">生成Token</button>
        <button @click="activeTab = 'parse'"
            :class="['px-4 py-2 text-sm rounded-t-lg', activeTab === 'parse' ? 'bg-indigo-700 text-white' : 'text-gray-600 hover:bg-gray-100']">解析Token</button>
    </div>
    <!-- Mobile dropdown -->
    <div class="lg:hidden mb-2">
        <label class="block text-sm font-medium text-gray-700 mb-2">选择操作</label>
        <SingleSelect v-model="activeTab" :options="[{value:'generate',label:'生成Token'},{value:'parse',label:'解析Token'}]" size="md"></SingleSelect>
    </div>

    <!-- Generate -->
    <div v-if="activeTab === 'generate'" class="flex flex-col gap-2">
        <div>
            <label class="block mb-2 text-sm text-gray-700">算法</label>
            <SingleSelect v-model="genAlgorithm" :options="[{value:'HS256',label:'HS256 (HMAC)'},{value:'RS256',label:'RS256 (RSA)'}]" size="md"></SingleSelect>
        </div>

        <div>
            <label class="block mb-2 text-sm font-medium text-gray-700 mb-1">Payload (JSON)</label>
            <textarea v-model="genPayload" rows="6" placeholder='{"sub":"1234567890","name":"John"}'
                class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-y"></textarea>
        </div>

        <div v-if="genAlgorithm === 'HS256'">
            <label class="block mb-2 text-sm font-medium text-gray-700 mb-1">密钥</label>
            <input type="text" v-model="genSecret" placeholder="输入HMAC密钥"
                class=" rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
        </div>

        <div v-if="genAlgorithm === 'RS256'">
            <div>
                <label class="block mb-2 text-sm font-medium text-gray-700 mb-1">RSA私钥(PEM)</label>
                <textarea v-model="genRsaKey" rows="5" placeholder="粘贴PEM私钥..."
                    class="w-full min-h-40 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-y"></textarea>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">密钥密码（可选）</label>
                <input type="password" v-model="genRsaPassword" placeholder="私钥密码"
                    class=" rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
            </div>
        </div>

        <Button @click="generate" variant="primary">生成</Button>

        <div v-if="genResult">
            <div class="flex items-center justify-between mb-1">
                <label class="block mb-2 text-sm font-medium text-gray-700">Token</label>
                <CopyButton :text="genResult"></CopyButton>
            </div>
            <textarea v-model="genResult" rows="4" readonly
                class="w-full min-h-40 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs bg-gray-50 outline-none resize-y"></textarea>
        </div>
    </div>

    <!-- Parse -->
    <div v-if="activeTab === 'parse'" class="flex flex-col gap-2">
        <div>
            <label class="block mb-2 text-sm font-medium text-gray-700 mb-1">JWT Token</label>
            <textarea v-model="parseToken" rows="4" placeholder="粘贴JWT token..."
                class="w-full min-h-40 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-y"></textarea>
        </div>

        <div>
            <label class="block mb-2 text-sm text-gray-700">算法</label>
            <SingleSelect v-model="parseAlgorithm" :options="[{value:'HS256',label:'HS256'},{value:'RS256',label:'RS256'}]" size="md"></SingleSelect>
        </div>

        <div v-if="parseAlgorithm === 'HS256'">
            <label class="block mb-2 text-sm font-medium text-gray-700 mb-1">密钥</label>
            <input type="text" v-model="parseSecret" placeholder="输入HMAC密钥"
                class=" rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
        </div>

        <div v-if="parseAlgorithm === 'RS256'">
            <label class="block mb-2 text-sm font-medium text-gray-700 mb-1">RSA公钥(PEM)</label>
            <textarea v-model="parseRsaKey" rows="3" placeholder="粘贴PEM公钥..."
                class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-y"></textarea>
        </div>

        <Button @click="parse" variant="primary">解析/验证</Button>

        <div v-if="parseResult" class="space-y-3">
            <div :class="['px-4 py-2 rounded-xl text-sm', parseResult.isVerified ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700']">
                {{ parseResult.isVerified ? '签名验证通过' : '签名验证失败' }}
            </div>
            <div v-if="parseResult.header">
                <label class="block mb-2 text-sm font-medium text-gray-700 mb-1">Header</label>
                <textarea v-model="parseResult.header" rows="1" readonly
                    class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs bg-gray-50 outline-none resize-y"></textarea>
            </div>
            <div v-if="parseResult.payload">
                <label class="block mb-2 text-sm font-medium text-gray-700 mb-1">Payload</label>
                <textarea v-model="parseResult.payload" rows="5" readonly
                    class="w-full min-h-40 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs bg-gray-50 outline-none resize-y"></textarea>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            activeTab: 'generate',
            genAlgorithm: 'HS256',
            genPayload: '{\n  "sub": "1234567890",\n  "name": "John Doe",\n  "iat": 1516239022\n}',
            genSecret: 'your-256-bit-secret',
            genRsaKey: '', genRsaPassword: '',
            genResult: '',
            parseToken: '', parseAlgorithm: 'HS256',
            parseSecret: '', parseRsaKey: '',
            parseResult: null
        };
    },
    methods: {
        async generate() {
            try {
                let res;
                if (this.genAlgorithm === 'HS256') {
                    res = await api('POST', '/jwt/generate-hmac', { payload: this.genPayload, secret: this.genSecret });
                } else {
                    res = await api('POST', '/jwt/generate-rsa', { payload: this.genPayload, privateKey: this.genRsaKey, password: this.genRsaPassword || null });
                }
                this.genResult = res.data;
            } catch(e) { alert('生成失败: ' + e.message); }
        },
        async parse() {
            try {
                let res;
                if (this.parseAlgorithm === 'HS256') {
                    res = await api('POST', '/jwt/verify-hmac', { token: this.parseToken, secret: this.parseSecret });
                } else {
                    res = await api('POST', '/jwt/verify-rsa', { token: this.parseToken, publicKey: this.parseRsaKey });
                }
                this.parseResult = res.data;
            } catch(e) { alert('解析失败: ' + e.message); }
        }
    }
};
