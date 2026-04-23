const HttpView = {
    template: `
    <div class="space-y-6">
        <div class="glass rounded-2xl p-6 shadow-xl">
            <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <span class="text-indigo-700">🌐</span>
                <span>HTTP模拟器</span>
            </h2>

            <div class="space-y-4">
                <div class="flex items-center space-x-4">
                    <select v-model="method"
                        class="rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-bold focus:border-indigo-500 outline-none">
                        <option v-for="m in methods" :key="m" :value="m">{{ m }}</option>
                    </select>
                    <input type="text" v-model="url" placeholder="https://example.com/api"
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
                    <Button @click="send" variant="primary" :disabled="loading">{{ loading ? '请求中...' : '发送' }}</Button>
                </div>

                <div>
                    <div class="flex items-center justify-between mb-2">
                        <label class="text-sm font-medium text-gray-700">请求头</label>
                        <Button @click="addHeader" variant="ghost" size="sm" icon>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        </Button>
                    </div>
                    <div v-for="(h, i) in headers" :key="i" class="flex items-center space-x-2 mb-2">
                        <input type="text" v-model="h.key" placeholder="Header名"
                            class="w-1/3 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                        <input type="text" v-model="h.value" placeholder="Header值"
                            class="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                        <Button @click="removeHeader(i)" variant="ghost" size="sm" icon>
                            <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </Button>
                    </div>
                </div>

                <div v-if="method !== 'GET'">
                    <div class="flex items-center space-x-4 mb-2">
                        <label class="text-sm font-medium text-gray-700">请求体</label>
                        <select v-model="contentType"
                            class="rounded-xl border border-gray-300 px-3 py-1.5 text-xs focus:border-indigo-500 outline-none">
                            <option value="application/json">application/json</option>
                            <option value="application/x-www-form-urlencoded">application/x-www-form-urlencoded</option>
                            <option value="multipart/form-data">multipart/form-data</option>
                            <option value="text/plain">text/plain</option>
                            <option value="text/xml">text/xml</option>
                        </select>
                    </div>
                    <div v-if="contentType === 'multipart/form-data'">
                        <div v-for="(f, i) in formData" :key="i" class="flex items-center space-x-2 mb-2">
                            <select v-model="f.type"
                                class="rounded-xl border border-gray-300 px-2 py-2 text-xs focus:border-indigo-500 outline-none">
                                <option value="text">文本</option>
                                <option value="file">文件</option>
                            </select>
                            <input type="text" v-model="f.key" placeholder="字段名"
                                class="w-1/4 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                            <input v-if="f.type === 'text'" type="text" v-model="f.value" placeholder="字段值"
                                class="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                            <input v-else type="file" :ref="el => { if (el) f.fileRef = el }"
                                class="flex-1 text-xs"
                                @change="f.fileName = f.fileRef.files[0]?.name || ''">
                            <span v-if="f.type === 'file' && f.fileName" class="text-xs text-gray-500 truncate max-w-24">{{ f.fileName }}</span>
                            <Button @click="removeFormData(i)" variant="ghost" size="sm" icon>
                                <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                            </Button>
                        </div>
                        <Button @click="addFormData" variant="ghost" size="sm">+ 添加字段</Button>
                    </div>
                    <textarea v-else v-model="body" rows="6" placeholder="请求体内容..."
                        class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-y"></textarea>
                </div>

                <div v-if="response" class="space-y-4 border-t border-gray-200 pt-4">
                    <div class="flex items-center space-x-4">
                        <span :class="['px-3 py-1 rounded-lg text-sm font-bold', response.statusCode < 300 ? 'bg-green-100 text-green-700' : response.statusCode < 400 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700']">
                            {{ response.statusCode }} {{ response.statusText }}
                        </span>
                        <span class="text-sm text-gray-500">{{ response.duration }}ms</span>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">响应头</label>
                        <div class="bg-gray-50 rounded-xl px-4 py-2.5 text-xs mono max-h-32 overflow-y-auto">
                            <div v-for="(v, k) in response.headers" :key="k">
                                <span class="text-gray-500">{{ k }}:</span> <span class="text-gray-700">{{ v }}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div class="flex items-center justify-between mb-1">
                            <label class="text-sm font-medium text-gray-700">响应体</label>
                            <div class="flex items-center space-x-2">
                                <button @click="responseView = 'raw'" :class="['px-2 py-1 text-xs rounded', responseView === 'raw' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500']">Raw</button>
                                <button @click="responseView = 'html'" :class="['px-2 py-1 text-xs rounded', responseView === 'html' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500']">HTML</button>
                                <CopyButton :text="response.body"></CopyButton>
                            </div>
                        </div>
                        <textarea v-if="responseView === 'raw'" v-model="response.body" rows="12" readonly
                            class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs bg-gray-50 outline-none resize-y"></textarea>
                        <iframe v-else v-bind:srcdoc="response.body" class="w-full rounded-xl border border-gray-300 bg-white" style="height: 300px;"></iframe>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            method: 'GET',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            url: '',
            headers: [{ key: '', value: '' }],
            contentType: 'application/json',
            body: '',
            formData: [{ key: '', value: '', type: 'text', fileRef: null, fileName: '' }],
            response: null,
            loading: false,
            responseView: 'raw'
        };
    },
    methods: {
        addHeader() { this.headers.push({ key: '', value: '' }); },
        removeHeader(i) { this.headers.splice(i, 1); },
        addFormData() { this.formData.push({ key: '', value: '', type: 'text', fileRef: null, fileName: '' }); },
        removeFormData(i) { this.formData.splice(i, 1); },
        async send() {
            if (!this.url) return;
            this.loading = true;
            this.response = null;
            try {
                const headers = {};
                this.headers.filter(h => h.key).forEach(h => { headers[h.key] = h.value; });
                let body = null;
                let sendContentType = null;
                let isFormData = false;
                const formDataObj = new FormData();
                if (this.method !== 'GET') {
                    if (this.contentType === 'multipart/form-data') {
                        this.formData.filter(f => f.key).forEach(f => {
                            if (f.type === 'file' && f.fileRef && f.fileRef.files[0]) {
                                formDataObj.append(f.key, f.fileRef.files[0]);
                            } else {
                                formDataObj.append(f.key, f.value);
                            }
                        });
                        isFormData = true;
                    } else {
                        body = this.body;
                        sendContentType = this.contentType;
                    }
                }
                const startTime = Date.now();
                const config = {
                    method: this.method,
                    url: this.url,
                    headers
                };
                if (isFormData) {
                    config.body = formDataObj;
                } else {
                    config.body = body;
                    config.contentType = sendContentType;
                }
                const res = await this.httpSend(config);
                this.response = res.data;
                this.response.duration = Date.now() - startTime;
            } catch(e) {
                this.response = { statusCode: 0, statusText: 'Error', headers: {}, body: e.message, duration: 0 };
            } finally {
                this.loading = false;
            }
        },
        async httpSend({ method, url, headers, body, contentType }) {
            const apiBase = document.getElementById('app').dataset.apiBase || '';
            const fullUrl = apiBase.startsWith('http') ? apiBase + '/http/send' : (window.location.origin + apiBase + '/http/send');
            const options = {
                method: 'POST',
                headers: { ...headers }
            };
            if (contentType) {
                options.headers['Content-Type'] = contentType;
            }
            if (body) {
                options.body = body;
            }
            const res = await fetch(fullUrl, options);
            const data = await res.json();
            return { data };
        }
    }
};
