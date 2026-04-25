const HttpView = {
    template: `
    <h2 class="text-xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
        <span class="text-indigo-700">🌐</span>
        <span>HTTP模拟器</span>
    </h2>

    <div class="flex-1 flex flex-col gap-2">
        <div class="flex flex-col lg:flex-row lg:items-center gap-2">
            <SingleSelect v-model="method" :options="methods.map(m => ({ value: m, label: m }))" size="md"></SingleSelect>
            <input type="text" v-model="url" placeholder="https://example.com/api"
                class="flex-1 rounded border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
            <Button @click="send" variant="primary" :disabled="loading">{{ loading ? '请求中...' : '发送' }}</Button>
        </div>

        <div>
            <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-medium text-gray-700">请求头</label>
                <Button @click="addHeader" variant="ghost" size="sm" icon>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                </Button>
            </div>
            <div v-for="(h, i) in headers" :key="i" class="flex gap-1 mb-2">
                <input type="text" v-model="h.key" placeholder="键"
                    class="flex-1 min-w-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                <input type="text" v-model="h.value" placeholder="值"
                    class="flex-1 min-w-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                <Button @click="removeHeader(i)" variant="ghost" size="sm" icon>
                    <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </Button>
            </div>
        </div>

        <div v-if="method !== 'GET'">
            <div class="flex flex-col lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4 mb-2">
                <label class="text-sm font-medium text-gray-700">请求体</label>
                <SingleSelect v-model="contentType"
                    :options="[{value:'application/json',label:'application/json'},{value:'application/x-www-form-urlencoded',label:'application/x-www-form-urlencoded'},{value:'multipart/form-data',label:'multipart/form-data'},{value:'text/plain',label:'text/plain'},{value:'text/xml',label:'text/xml'}]"></SingleSelect>
            </div>
            <div v-if="contentType === 'multipart/form-data' || contentType === 'application/x-www-form-urlencoded'">
                <div v-for="(f, i) in formFields" :key="i" class="flex gap-1 mb-2">
                    <SingleSelect v-if="contentType === 'multipart/form-data'" v-model="f.type"
                        :options="[{value:'text',label:'文本'},{value:'file',label:'文件'}]"></SingleSelect>
                    <input type="text" v-model="f.key" placeholder="字段名"
                        class="flex-1 min-w-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    <input v-if="f.type === 'text' || contentType === 'application/x-www-form-urlencoded'" type="text" v-model="f.value" placeholder="字段值"
                        class="flex-1 min-w-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    <input v-else type="file" :ref="el => { if (el) f.fileRef = el }"
                        class="flex-1 min-w-1 text-xs self-center"
                        @change="f.fileName = f.fileRef.files[0]?.name || ''">
                    <span v-if="f.type === 'file' && f.fileName" class="text-xs text-gray-500 truncate self-center max-w-12 lg:max-w-24">{{ f.fileName }}</span>
                    <Button @click="removeFormField(i)" variant="ghost" size="sm" icon>
                        <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </Button>
                </div>
                <Button @click="addFormField" variant="ghost" size="sm">+ 添加字段</Button>
            </div>
            <textarea v-else v-model="body"  placeholder="请求体内容..."
                class="w-full rounded border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-y"></textarea>
        </div>

        <div v-if="response" class="flex-1 flex flex-col space-y-4 border-t border-gray-200 pt-4">
            <div class="flex items-center space-x-4">
                <span :class="['px-3 py-1 rounded text-sm font-bold', response.statusCode < 300 ? 'bg-green-100 text-green-700' : response.statusCode < 400 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700']">
                    {{ response.statusCode }} {{ response.statusText }}
                </span>
                <span class="text-sm text-gray-500">{{ response.duration }}ms</span>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">响应头</label>
                <div class="bg-gray-50 rounded px-4 py-2.5 text-xs mono">
                    <div v-for="(v, k) in response.headers" :key="k">
                        <span class="text-gray-500">{{ k }}:</span> <span class="text-gray-700">{{ v }}</span>
                    </div>
                </div>
            </div>

            <div class="flex-1 flex flex-col ">
                <div class="flex items-center justify-between mb-1">
                    <label class="text-sm font-medium text-gray-700">响应体</label>
                    <div class="flex items-center space-x-2">
                        <button @click="responseView = 'raw'" :class="['px-2 py-1 text-xs rounded', responseView === 'raw' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500']">Raw</button>
                        <button @click="responseView = 'html'" :class="['px-2 py-1 text-xs rounded', responseView === 'html' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500']">HTML</button>
                        <CopyButton :text="response.body"></CopyButton>
                    </div>
                </div>
                <textarea v-if="responseView === 'raw'" v-model="response.body" readonly
                    class="w-full flex-1 min-h-50 rounded border border-gray-300 px-4 py-2.5 mono text-xs bg-gray-50 outline-none resize-y"></textarea>
                <iframe v-else v-bind:srcdoc="response.body" class="flex-1 w-full min-h-50 rounded border border-gray-300 bg-white" style="height: 300px;"></iframe>
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
            formFields: [{ key: '', value: '', type: 'text', fileRef: null, fileName: '' }],
            response: null,
            loading: false,
            responseView: 'raw'
        };
    },
    methods: {
        addHeader() { this.headers.push({ key: '', value: '' }); },
        removeHeader(i) { this.headers.splice(i, 1); },
        addFormField() { this.formFields.push({ key: '', value: '', type: 'text', fileRef: null, fileName: '' }); },
        removeFormField(i) { this.formFields.splice(i, 1); },
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
                        this.formFields.filter(f => f.key).forEach(f => {
                            if (f.type === 'file' && f.fileRef && f.fileRef.files[0]) {
                                formDataObj.append(f.key, f.fileRef.files[0]);
                            } else {
                                formDataObj.append(f.key, f.value);
                            }
                        });
                        isFormData = true;
                    } else if (this.contentType === 'application/x-www-form-urlencoded') {
                        // URL-encoded form data
                        const params = new URLSearchParams();
                        this.formFields.filter(f => f.key).forEach(f => {
                            params.append(f.key, f.value);
                        });
                        body = params.toString();
                        sendContentType = this.contentType;
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
                    config.formData = formDataObj;
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
        async httpSend({ method, url, headers, body, contentType, formData }) {
            const fullUrl = 'api/http/send';
            
            let fetchBody;
            let fetchHeaders = { ...headers };
            
            if (formData) {
                // multipart/form-data - send FormData with method/url in headers
                fetchBody = formData;
                fetchHeaders['X-Http-Method'] = method;
                fetchHeaders['X-Http-Url'] = url;
                // Let browser set Content-Type with boundary
                delete fetchHeaders['Content-Type'];
            } else if (contentType === 'application/x-www-form-urlencoded') {
                // application/x-www-form-urlencoded
                fetchBody = body;
                fetchHeaders['Content-Type'] = contentType;
                fetchHeaders['X-Http-Method'] = method;
                fetchHeaders['X-Http-Url'] = url;
            } else {
                // JSON or other - send as JSON
                fetchBody = JSON.stringify({ method, url, headers, body, contentType });
                fetchHeaders['Content-Type'] = 'application/json';
                fetchHeaders['X-Http-Url'] = url;
            }
            
            const res = await fetch(fullUrl, {
                method: 'POST',
                headers: fetchHeaders,
                body: fetchBody
            });
            const data = await res.json();
            return { data };
        }
    }
};
