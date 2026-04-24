const EncryptionView = {
    template: `
    <h2 class="text-xl font-bold text-gray-800 mb-2 flex items-center space-x-2">
        <span class="text-indigo-700">🔒</span>
        <span>加密工具</span>
    </h2>

    <!-- Main tabs for desktop -->
    <div class="hidden lg:flex space-x-2 mb-2 border-b border-gray-200 pb-3">
        <button @click="mainTab = 'rsa'"
            :class="['px-4 py-2 text-sm rounded-t-lg', mainTab === 'rsa' ? 'bg-indigo-700 text-white' : 'text-gray-600 hover:bg-gray-100']">RSA 非对称</button>
        <button @click="mainTab = 'aes'"
            :class="['px-4 py-2 text-sm rounded-t-lg', mainTab === 'aes' ? 'bg-indigo-700 text-white' : 'text-gray-600 hover:bg-gray-100']">AES 对称</button>
        <button @click="mainTab = 'des'"
            :class="['px-4 py-2 text-sm rounded-t-lg', mainTab === 'des' ? 'bg-indigo-700 text-white' : 'text-gray-600 hover:bg-gray-100']">DES 对称</button>
        <button @click="mainTab = '3des'"
            :class="['px-4 py-2 text-sm rounded-t-lg', mainTab === '3des' ? 'bg-indigo-700 text-white' : 'text-gray-600 hover:bg-gray-100']">3DES 对称</button>
    </div>
    <!-- Mobile dropdown for main tabs -->
    <div class="lg:hidden mb-2">
        <label class="block text-sm font-medium text-gray-700 mb-2">选择加密算法</label>
        <select v-model="mainTab" class="rounded-xl border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 outline-none">
            <option value="rsa">RSA 非对称</option>
            <option value="aes">AES 对称</option>
            <option value="des">DES 对称</option>
            <option value="3des">3DES 对称</option>
        </select>
    </div>

    <!-- RSA Section -->
    <div v-if="mainTab === 'rsa'" class="flex-1 flex flex-col gap-2">
        <!-- RSA subtabs for desktop -->
        <div class="hidden lg:flex space-x-2 mb-4 border-b border-gray-100 pb-2">
            <button v-for="t in rsaTabs" :key="t.key" @click="rsaTab = t.key"
                :class="['px-3 py-1.5 text-xs rounded-lg', rsaTab === t.key ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50']">{{ t.label }}</button>
        </div>
        <!-- Mobile dropdown for RSA subtabs -->
        <div class="lg:hidden mb-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">选择RSA操作</label>
            <select v-model="rsaTab" class="rounded-xl border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 outline-none">
                <option v-for="t in rsaTabs" :key="t.key" :value="t.key">{{ t.label }}</option>
            </select>
        </div>

        <!-- RSA Generate -->
        <div v-if="rsaTab === 'generate'" class="flex-1 flex flex-col gap-2">
            <div class="flex flex-col lg:items-center items-stretch lg:flex-row gap-2">
                <label class="text-sm text-gray-700">密钥长度:</label>
                <select v-model="rsaKeySize"
                    class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    <option :value="2048">2048</option>
                    <option :value="4096">4096</option>
                </select>
                <Button @click="rsaGenerate" variant="primary" size="sm">生成密钥对</Button>
            </div>
            <div class="flex-1 flex flex-col lg:flex-row gap-2">
                <div class="flex-1 flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                        <label class="block text-sm font-medium text-gray-700">私钥</label>
                        <CopyButton v-if="rsaKeys.privateKey" :text="rsaKeys.privateKey"></CopyButton>
                    </div>
                    <textarea v-model="rsaKeys.privateKey" readonly placeholder="私钥..."
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs bg-gray-50 outline-none resize-none"></textarea>
                </div>
                <div class="flex-1 flex flex-col gap-2">
                    <div class="flex items-center gap-2">
                        <label class="block text-sm font-medium text-gray-700">公钥</label>
                        <CopyButton v-if="rsaKeys.publicKey" :text="rsaKeys.publicKey"></CopyButton>
                    </div>
                    <textarea v-model="rsaKeys.publicKey" readonly placeholder="公钥..."
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs bg-gray-50 outline-none resize-none"></textarea>
                </div>
            </div>
        </div>

        <!-- RSA Compare -->
        <div v-if="rsaTab === 'compare'" class="flex-1 flex flex-col gap-2">
            <div class="flex-1 flex flex-col sm:flex-row gap-2">
                <div class="flex-1 flex flex-col gap-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">私钥</label>
                    <textarea v-model="comparePrivate" placeholder="粘贴PEM私钥..."
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div class="flex-1 flex flex-col gap-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">公钥</label>
                    <textarea v-model="comparePublic" placeholder="粘贴PEM公钥..."
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
            </div>
            <Button @click="rsaCompare" variant="primary" size="sm">比对</Button>
            <div class="rounded-xl border px-4 py-3 flex items-center justify-center"
                :class="compareResult === null ? 'bg-gray-50' : (compareResult ? 'bg-green-50' : 'bg-red-50')">
                <span v-if="compareResult === null" class="text-gray-400 text-sm">点击比对按钮查看结果</span>
                <span v-else :class="compareResult ? 'text-green-600' : 'text-red-600'" class="font-medium">
                    {{ compareResult ? '✓ 密钥匹配' : '✗ 密钥不匹配' }}
                </span>
            </div>
        </div>

        <!-- RSA Convert PEM -->
        <div v-if="rsaTab === 'convert'" class="flex-1 flex flex-col gap-2">
            <div class="flex-1 flex flex-col lg:flex-row gap-2">
                <div class="flex-1 flex flex-col gap-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">PEM密钥</label>
                    <textarea v-model="convertPem" placeholder="粘贴PEM密钥..."
                            class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div class="flex-1 flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                        <label class="block text-sm font-medium text-gray-700">转换结果</label>
                        <CopyButton v-if="convertResult" :text="convertResult"></CopyButton>
                    </div>
                    <textarea v-model="convertResult" readonly placeholder="转换结果..."
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs bg-gray-50 outline-none resize-none"></textarea>
                </div>
            </div>
            <div class="flex flex-col items-start lg:flex-row lg:items-center gap-2">
                <label class="text-sm text-gray-700">目标格式:</label>
                <select v-model="convertTarget"
                    class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    <option value="pkcs1">PKCS#1</option>
                    <option value="pkcs8">PKCS#8</option>
                    <option value="public">公钥(X.509)</option>
                </select>
                <Button @click="rsaConvertPem" variant="primary" size="sm">转换</Button>
            </div>
        </div>

        <!-- RSA XML Convert -->
        <div v-if="rsaTab === 'xml-convert'" class="flex-1 flex flex-col gap-2">
            <div class="flex space-x-2 mb-4 border-b border-gray-100 pb-2">
                <button @click="xmlConvertDirection = 'pem-to-xml'" :class="['px-3 py-1.5 text-xs rounded-lg', xmlConvertDirection === 'pem-to-xml' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50']">PEM → XML</button>
                <button @click="xmlConvertDirection = 'xml-to-pem'" :class="['px-3 py-1.5 text-xs rounded-lg', xmlConvertDirection === 'xml-to-pem' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50']">XML → PEM</button>
            </div>

            <!-- PEM to XML -->
            <div v-if="xmlConvertDirection === 'pem-to-xml'" class="flex-1 flex flex-col gap-2">
                <div class="flex-1 flex flex-col gap-2">
                    <div class="flex-1 flex flex-col">
                        <label class="block text-sm font-medium text-gray-700 mb-1">PEM密钥</label>
                        <textarea v-model="rsaXmlPem" placeholder="粘贴PEM密钥..."
                            class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                    </div>
                </div>
                <div class="flex gap-2">
                    <input type="checkbox" v-model="rsaXmlIncludePrivate" class="rounded border-gray-300">
                    <span class="text-sm text-gray-700">包含私钥参数</span>
                </div>
                <Button @click="rsaConvertToXml" variant="primary" size="sm">转换为XML</Button>
                <div class="flex-1 flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                        <label class="block text-sm font-medium text-gray-700">XML结果</label>
                        <CopyButton v-if="rsaXmlResult" :text="rsaXmlResult"></CopyButton>
                    </div>
                    <textarea v-model="rsaXmlResult" readonly placeholder="XML结果..."
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none break-all"></textarea>
                </div>
            </div>

            <!-- XML to PEM -->
            <div v-if="xmlConvertDirection === 'xml-to-pem'" class="flex-1 flex flex-col gap-2">
                <div class="flex-1 flex flex-col gap-2">
                    <div class="flex-1 flex flex-col">
                        <label class="block text-sm font-medium text-gray-700 mb-1">XML密钥</label>
                        <textarea v-model="rsaXmlXml" placeholder="粘贴XML密钥..."
                            class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none break-all"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">目标格式</label>
                        <select v-model="rsaXmlTargetFormat" class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                            <option value="pkcs1">PKCS#1</option>
                            <option value="pkcs8">PKCS#8</option>
                            <option value="public">公钥(X.509)</option>
                        </select>
                    </div>
                </div>
                <Button @click="rsaConvertFromXml" variant="primary" size="sm">转换为PEM</Button>
                <div class="flex-1 flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                        <label class="block text-sm font-medium text-gray-700">PEM结果</label>
                        <CopyButton v-if="rsaXmlFromXmlResult" :text="rsaXmlFromXmlResult"></CopyButton>
                    </div>
                    <textarea v-model="rsaXmlFromXmlResult" readonly placeholder="PEM结果..."
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
                </div>
            </div>
        </div>

        <!-- RSA Password Operations -->
        <div v-if="rsaTab === 'password'" class="flex-1 flex flex-col gap-2">
            <div class="flex space-x-2 mb-4 border-b border-gray-100 pb-2">
                <button @click="passwordOperation = 'add'" :class="['px-3 py-1.5 text-xs rounded-lg', passwordOperation === 'add' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50']">添加密码</button>
                <button @click="passwordOperation = 'remove'" :class="['px-3 py-1.5 text-xs rounded-lg', passwordOperation === 'remove' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50']">移除密码</button>
            </div>

            <!-- Add Password -->
            <div v-if="passwordOperation === 'add'" class="flex-1 flex flex-col gap-2">
                <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <div class="flex flex-col gap-2">
                        <div class="flex-1 flex flex-col gap-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">PEM密钥</label>
                            <textarea v-model="rsaPasswordPem" placeholder="粘贴PEM密钥..."
                                class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-2">
                            <div class="flex-1 flex flex-col">
                                <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
                                <input type="text" v-model="rsaPasswordPassword" placeholder="输入密码"
                                    class="rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
                            </div>
                            <div class="flex-1 flex flex-col">
                                <label class="block text-sm font-medium text-gray-700 mb-1">加密类型</label>
                                <select v-model="rsaPasswordTargetEncryptedType" class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                                    <option value="EncryptedPkcs8PrivateKey">Encrypted PKCS#8</option>
                                    <option value="EncryptedPkcs1PrivateKey">Encrypted PKCS#1</option>
                                </select>
                            </div>
                            <div v-if="rsaPasswordTargetEncryptedType==='EncryptedPkcs1PrivateKey'" class="flex-1 flex flex-col">
                                <label class="block text-sm font-medium text-gray-700 mb-1">算法</label>
                                <select v-model="rsaPasswordAlgorithm" class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                                    <option value="AES-256-CBC">AES-256-CBC</option>
                                    <option value="DES-EDE3-CBC">DES-EDE3-CBC</option>
                                </select>
                            </div>
                        </div>
                        <Button @click="rsaAddPassword" variant="primary" size="sm">添加密码</Button>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center justify-between">
                            <label class="block text-sm font-medium text-gray-700">加密后的密钥</label>
                            <CopyButton v-if="rsaPasswordResult" :text="rsaPasswordResult"></CopyButton>
                        </div>
                        <textarea v-model="rsaPasswordResult" readonly placeholder="加密后的密钥..."
                            class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
                    </div>
                </div>
            </div>

            <!-- Remove Password -->
            <div v-if="passwordOperation === 'remove'" class="flex-1 flex flex-col gap-2">
                <div class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <div class="flex-1 flex flex-col gap-2">
                        <div class="flex-1 flex flex-col gap-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">加密的PEM密钥</label>
                            <textarea v-model="rsaRemoveEncryptedPem" placeholder="粘贴加密的PEM密钥..."
                                class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                        </div>
                        <div class="flex flex-col">
                            <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
                            <input type="text" v-model="rsaRemovePwd" placeholder="输入密码"
                            class="rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
                        </div>
                        <Button @click="rsaDoRemovePassword" variant="primary" size="sm">移除密码</Button>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center justify-between">
                            <label class="block text-sm font-medium text-gray-700">解密后的密钥</label>
                            <CopyButton v-if="rsaRemoveResult" :text="rsaRemoveResult"></CopyButton>
                        </div>
                        <textarea v-model="rsaRemoveResult" readonly placeholder="解密后的密钥..."
                            class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
                    </div>
                </div>
            </div>
        </div>

        <!-- RSA  Encrypt -->
        <div v-if="rsaTab === 'encrypt'" class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div class="flex flex-col gap-2">
                <div class="flex-1 flex flex-col">
                    <label class="block text-sm font-medium text-gray-700 mb-1">公钥</label>
                    <textarea v-model="rsaEncPublic" placeholder="粘贴PEM公钥..."
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div class="flex-1 flex flex-col gap-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">明文</label>
                    <textarea v-model="rsaEncPlaintext" placeholder="输入明文..."
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">填充模式</label>
                    <select v-model="rsaEncPadding" class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                        <option value="OAEP-SHA256">OAEP-SHA256</option>
                        <option value="OAEP-SHA384">OAEP-SHA384</option>
                        <option value="OAEP-SHA512">OAEP-SHA512</option>
                        <option value="OAEP-SHA1">OAEP-SHA1</option>
                        <option value="PKCS1">PKCS1</option>
                    </select>
                </div>
                <Button @click="rsaEncrypt" variant="primary" size="sm">加密</Button>
            </div>
            <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700">密文(Base64)</label>
                    <CopyButton v-if="rsaEncResult" :text="rsaEncResult"></CopyButton>
                </div>
                <textarea v-model="rsaEncResult" readonly placeholder="加密结果..."
                    class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
            </div>
        </div>

        <!-- RSA  Decrypt -->
        <div v-if="rsaTab === 'decrypt'" class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div class="flex flex-col gap-2">
                <div class="flex-1 flex flex-col">
                    <label class="block text-sm font-medium text-gray-700 mb-1">私钥</label>
                    <textarea v-model="rsaDecPrivate" placeholder="粘贴PEM私钥..."
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div class="flex-1 flex flex-col gap-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">密文(Base64)</label>
                    <textarea v-model="rsaDecCiphertext" placeholder="粘贴Base64密文..."
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div class="flex flex-col lg:flex-row gap-2">
                    <div class="flex-1 flex flex-col gap-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">填充模式</label>
                        <select v-model="rsaDecPadding" class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                            <option value="OAEP-SHA256">OAEP-SHA256</option>
                            <option value="OAEP-SHA384">OAEP-SHA384</option>
                            <option value="OAEP-SHA512">OAEP-SHA512</option>
                            <option value="OAEP-SHA1">OAEP-SHA1</option>
                            <option value="PKCS1">PKCS1</option>
                        </select>
                    </div>
                    <div class="flex-1 flex flex-col gap-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">密码（当私钥有密码保护时传入）</label>
                        <input type="text" v-model="rsaDecPassword" placeholder="密钥密码"
                            class="rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
                    </div>
                </div>
                <Button @click="rsaDecrypt" variant="primary" size="sm">解密</Button>
            </div>
            <div class="flex flex-col">
                <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700">明文</label>
                    <CopyButton v-if="rsaDecResult" :text="rsaDecResult"></CopyButton>
                </div>
                <textarea v-model="rsaDecResult" readonly placeholder="解密结果..."
                    class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
            </div>
        </div>

        <!-- RSA Sign -->
        <div v-if="rsaTab === 'sign'" class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-2">
            <div class="flex flex-col gap-2">
                <div class="flex-1 flex flex-col gap-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">私钥</label>
                    <textarea v-model="rsaSignPrivate" placeholder="粘贴PEM私钥..."
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div class="flex-1 flex flex-col gap-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">待签名数据</label>
                    <textarea v-model="rsaSignData" placeholder="输入待签名数据..."
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div class="flex flex-col lg:flex-row gap-2">
                    <div class="flex-1 flex flex-col gap-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">哈希算法</label>
                        <select v-model="rsaSignHashAlgorithm" class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                            <option value="SHA256">SHA256</option>
                            <option value="SHA384">SHA384</option>
                            <option value="SHA512">SHA512</option>
                            <option value="SHA1">SHA1</option>
                        </select>
                    </div>
                    <div class="flex-1 flex flex-col gap-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">填充模式</label>
                        <select v-model="rsaSignPadding" class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                            <option value="PKCS1">PKCS1</option>
                            <option value="PSS">PSS</option>
                        </select>
                    </div>
                </div>
                <Button @click="rsaSign" variant="primary" size="sm">签名</Button>
            </div>
            <div class="flex flex-col gap-2">
                <div class="flex items-center justify-between">
                    <label class="block text-sm font-medium text-gray-700">签名(Base64)</label>
                    <CopyButton v-if="rsaSignResult" :text="rsaSignResult"></CopyButton>
                </div>
                <textarea v-model="rsaSignResult" readonly placeholder="签名结果..."
                    class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
            </div>
        </div>

        <!-- RSA Verify -->
        <div v-if="rsaTab === 'verify'" class="flex-1 flex flex-col gap-2">
            <div class="flex-1 flex flex-col gap-2">
                <div class="flex-1 flex flex-col gap-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">公钥</label>
                    <textarea v-model="rsaVerifySignPublic" placeholder="粘贴PEM公钥..."
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div class="flex-1 flex flex-col gap-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">原始数据</label>
                    <textarea v-model="rsaVerifySignData" placeholder="输入原始数据..."
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div class="flex-1 flex flex-col gap-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">签名(Base64)</label>
                    <textarea v-model="rsaVerifySignSignature" placeholder="粘贴Base64签名..."
                        class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                </div>
                <div class="flex flex-col lg:flex-row gap-2">
                    <div class="flex-1 flex flex-col gap-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">哈希算法</label>
                        <select v-model="rsaVerifySignHashAlgorithm" class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                            <option value="SHA256">SHA256</option>
                            <option value="SHA384">SHA384</option>
                            <option value="SHA512">SHA512</option>
                            <option value="SHA1">SHA1</option>
                        </select>
                    </div>
                    <div class="flex-1 flex flex-col gap-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">填充模式</label>
                        <select v-model="rsaVerifySignPadding" class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                            <option value="PKCS1">PKCS1</option>
                            <option value="PSS">PSS</option>
                        </select>
                    </div>
                </div>
                <Button @click="rsaVerifySign" variant="primary" size="sm">验签</Button>
            </div>
            <div class="flex flex-col gap-2">
                <div class="rounded-xl border px-4 py-3 flex items-center justify-center"
                    :class="rsaVerifySignResult === null ? 'bg-gray-50' : (rsaVerifySignResult ? 'bg-green-50' : 'bg-red-50')">
                    <span v-if="rsaVerifySignResult === null" class="text-gray-400 text-sm">点击验签按钮查看结果</span>
                    <span v-else :class="rsaVerifySignResult ? 'text-green-600' : 'text-red-600'" class="font-medium">
                        {{ rsaVerifySignResult ? '✓ 签名有效' : '✗ 签名无效' }}
                    </span>
                </div>
            </div>
        </div>
    </div>

    <!-- AES Section -->
    <div v-if="mainTab === 'aes'" class="flex-1 flex flex-col gap-2">
        <div class="flex flex-col gap-2">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">密钥</label>
                <input type="text" v-model="aesKey" placeholder="输入AES密钥"
                    class="rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
            </div>
            <div v-if="aesMode !== 'ECB'">
                <label class="block text-sm font-medium text-gray-700 mb-1">IV（必需）</label>
                <input type="text" v-model="aesIv" placeholder="输入IV"
                    class="rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">模式</label>
                <select v-model="aesMode" class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    <option value="CBC">CBC</option>
                    <option value="ECB">ECB</option>
                    <option value="CFB">CFB</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">填充</label>
                <select v-model="aesPadding" class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    <option value="PKCS7">PKCS7</option>
                    <option value="Zeros">Zeros</option>
                    <option value="ANSIX923">ANSIX923</option>
                    <option value="ISO10126">ISO10126</option>
                    <option value="None">None</option>
                </select>
            </div>
            <div class="flex-1 flex flex-col gap-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">输入</label>
                <textarea v-model="aesInput" placeholder="输入明文或密文..."
                    class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
            </div>
            <div class="flex space-x-2">
                <Button @click="aesEncrypt" variant="primary" size="sm">加密</Button>
                <Button @click="aesDecrypt" variant="secondary" size="sm">解密</Button>
            </div>
        </div>
        <div class="flex-1 flex flex-col gap-2">
            <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-700">输出</label>
                <CopyButton v-if="aesResult" :text="aesResult"></CopyButton>
            </div>
            <textarea v-model="aesResult" readonly :placeholder="aesResultPlaceholder"
                class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
        </div>
    </div>

    <!-- DES Section -->
    <div v-if="mainTab === 'des'" class="flex-1 flex flex-col gap-2">
        <div class="flex-1 flex flex-col gap-2">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">密钥</label>
                <input type="text" v-model="desKey" placeholder="输入DES密钥"
                    class="rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
            </div>
            <div v-if="desMode !== 'ECB'">
                <label class="block text-sm font-medium text-gray-700 mb-1">IV（必需）</label>
                <input type="text" v-model="desIv" placeholder="输入IV"
                    class="rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">模式</label>
                <select v-model="desMode" class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    <option value="CBC">CBC</option>
                    <option value="ECB">ECB</option>
                    <option value="CFB">CFB</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">填充</label>
                <select v-model="desPadding" class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    <option value="PKCS7">PKCS7</option>
                    <option value="Zeros">Zeros</option>
                    <option value="ANSIX923">ANSIX923</option>
                    <option value="ISO10126">ISO10126</option>
                    <option value="None">None</option>
                </select>
            </div>
            <div class="flex-1 flex flex-col gap-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">输入</label>
                <textarea v-model="desInput" placeholder="输入明文或密文..."
                    class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
            </div>
            <div class="flex space-x-2">
                <Button @click="desEncrypt" variant="primary" size="sm">加密</Button>
                <Button @click="desDecrypt" variant="secondary" size="sm">解密</Button>
            </div>
        </div>
        <div class="flex-1 flex flex-col gap-2">
            <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-700">输出</label>
                <CopyButton v-if="desResult" :text="desResult"></CopyButton>
            </div>
            <textarea v-model="desResult" readonly :placeholder="desResultPlaceholder"
                class="rounded-xl flex-1 border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
        </div>
    </div>

    <!-- 3DES Section -->
    <div v-if="mainTab === '3des'" class="flex-1 flex flex-col gap-2">
        <div class="flex-1 flex flex-col gap-2">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">密钥</label>
                <input type="text" v-model="tripleDesKey" placeholder="输入3DES密钥"
                    class="rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
            </div>
            <div v-if="tripleDesMode !== 'ECB'">
                <label class="block text-sm font-medium text-gray-700 mb-1">IV（必需）</label>
                <input type="text" v-model="tripleDesIv" placeholder="输入IV"
                    class="rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">模式</label>
                <select v-model="tripleDesMode" class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    <option value="CBC">CBC</option>
                    <option value="ECB">ECB</option>
                    <option value="CFB">CFB</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">填充</label>
                <select v-model="tripleDesPadding" class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                    <option value="PKCS7">PKCS7</option>
                    <option value="Zeros">Zeros</option>
                    <option value="ANSIX923">ANSIX923</option>
                    <option value="ISO10126">ISO10126</option>
                    <option value="None">None</option>
                </select>
            </div>
            <div class="flex-1 flex flex-col gap-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">输入</label>
                <textarea v-model="tripleDesInput" placeholder="输入明文或密文..."
                    class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
            </div>
            <div class="flex space-x-2">
                <Button @click="tripleDesEncrypt" variant="primary" size="sm">加密</Button>
                <Button @click="tripleDesDecrypt" variant="secondary" size="sm">解密</Button>
            </div>
        </div>
        <div class="flex-1 flex flex-col gap-2">
            <div class="flex items-center justify-between">
                <label class="block text-sm font-medium text-gray-700">输出</label>
                <CopyButton v-if="tripleDesResult" :text="tripleDesResult"></CopyButton>
            </div>
            <textarea v-model="tripleDesResult" readonly :placeholder="tripleDesResultPlaceholder"
                class="rounded-xl flex-1 border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
        </div>
    </div>
    `,
    data() {
        return {
            mainTab: 'rsa',
            rsaTab: 'generate',
            rsaTabs: [
                { key: 'generate', label: '生成密钥' },
                { key: 'compare', label: '密钥比对' },
                { key: 'convert', label: '格式转换' },
                { key: 'xml-convert', label: 'XML转换' },
                { key: 'password', label: '密码操作' },
                { key: 'encrypt', label: '加密' },
                { key: 'decrypt', label: '解密' },
                { key: 'sign', label: '签名' },
                { key: 'verify', label: '验签' }
            ],
            rsaKeySize: 2048,
            rsaKeys: { publicKey: '', privateKey: '' },
            comparePublic: '', comparePrivate: '', compareResult: null,
            convertPem: '', convertTarget: 'pkcs8', convertResult: '',
            // XML转换
            xmlConvertDirection: 'pem-to-xml',
            passwordOperation: 'add',
            rsaXmlPem: '', rsaXmlIncludePrivate: false, rsaXmlPassword: '', rsaXmlResult: '',
            rsaXmlXml: '', rsaXmlTargetFormat: 'pkcs8', rsaXmlFromXmlResult: '',
            // 密码操作
            rsaPasswordPem: '', rsaPasswordPassword: '', rsaPasswordTargetEncryptedType: 'EncryptedPkcs8PrivateKey', rsaPasswordAlgorithm: 'AES-256-CBC', rsaPasswordResult: '',
            rsaRemoveEncryptedPem: '', rsaRemovePwd: '', rsaRemoveResult: '',
            // 加密
            rsaEncPublic: '', rsaEncPlaintext: '', rsaEncPadding: 'OAEP-SHA256', rsaEncResult: '',
            // 解密
            rsaDecPrivate: '', rsaDecCiphertext: '', rsaDecPadding: 'OAEP-SHA256', rsaDecPassword: '', rsaDecResult: '',
            // 签名
            rsaSignPrivate: '', rsaSignData: '', rsaSignHashAlgorithm: 'SHA256', rsaSignPadding: 'PKCS1', rsaSignPassword: '', rsaSignResult: '',
            // 验签
            rsaVerifySignPublic: '', rsaVerifySignData: '', rsaVerifySignSignature: '', rsaVerifySignHashAlgorithm: 'SHA256', rsaVerifySignPadding: 'PKCS1', rsaVerifySignResult: null,
            // AES
            aesKey: '', aesIv: '', aesInput: '', aesResult: '', aesMode: 'CBC', aesPadding: 'PKCS7',
            // DES
            desKey: '', desIv: '', desInput: '', desResult: '', desMode: 'CBC', desPadding: 'PKCS7',
            // 3DES
            tripleDesKey: '', tripleDesIv: '', tripleDesInput: '', tripleDesResult: '', tripleDesMode: 'CBC', tripleDesPadding: 'PKCS7'
        };
    },
    computed: {
        aesResultPlaceholder() { return this.aesResult ? '' : '加密/解密结果...'; },
        desResultPlaceholder() { return this.desResult ? '' : '加密/解密结果...'; },
        tripleDesResultPlaceholder() { return this.tripleDesResult ? '' : '加密/解密结果...'; }
    },
    mounted() {
        this.rsaGenerate();
    },
    methods: {
        async rsaGenerate() {
            try {
                const res = await api('POST', '/encryption/rsa/generate', { keySize: this.rsaKeySize });
                this.rsaKeys = res.data;
            } catch(e) { alert('生成失败: ' + e.message); }
        },
        async rsaCompare() {
            try {
                const res = await api('POST', '/encryption/rsa/compare', { privateKey: this.comparePrivate, publicKey: this.comparePublic });
                this.compareResult = res.data;
            } catch(e) { this.compareResult = false; }
        },
        async rsaConvertPem() {
            try {
                const res = await api('POST', '/encryption/rsa/convert-pem', { pem: this.convertPem, targetFormat: this.convertTarget });
                this.convertResult = res.data;
            } catch(e) { alert('转换失败: ' + e.message); }
        },
        async aesEncrypt() {
            try {
                const res = await api('POST', '/encryption/aes/encrypt', { plaintext: this.aesInput, key: this.aesKey, iv: this.aesIv || null, mode: this.aesMode, padding: this.aesPadding });
                this.aesResult = res.data;
            } catch(e) { alert('加密失败: ' + e.message); }
        },
        async aesDecrypt() {
            try {
                const res = await api('POST', '/encryption/aes/decrypt', { ciphertext: this.aesInput, key: this.aesKey, iv: this.aesIv || null, mode: this.aesMode, padding: this.aesPadding });
                this.aesResult = res.data;
            } catch(e) { alert('解密失败: ' + e.message); }
        },
        async desEncrypt() {
            try {
                const res = await api('POST', '/encryption/des/encrypt', { plaintext: this.desInput, key: this.desKey, iv: this.desIv || null, mode: this.desMode, padding: this.desPadding });
                this.desResult = res.data;
            } catch(e) { alert('加密失败: ' + e.message); }
        },
        async desDecrypt() {
            try {
                const res = await api('POST', '/encryption/des/decrypt', { ciphertext: this.desInput, key: this.desKey, iv: this.desIv || null, mode: this.desMode, padding: this.desPadding });
                this.desResult = res.data;
            } catch(e) { alert('解密失败: ' + e.message); }
        },
        async tripleDesEncrypt() {
            try {
                const res = await api('POST', '/encryption/tripledes/encrypt', { plaintext: this.tripleDesInput, key: this.tripleDesKey, iv: this.tripleDesIv || null, mode: this.tripleDesMode, padding: this.tripleDesPadding });
                this.tripleDesResult = res.data;
            } catch(e) { alert('加密失败: ' + e.message); }
        },
        async tripleDesDecrypt() {
            try {
                const res = await api('POST', '/encryption/tripledes/decrypt', { ciphertext: this.tripleDesInput, key: this.tripleDesKey, iv: this.tripleDesIv || null, mode: this.tripleDesMode, padding: this.tripleDesPadding });
                this.tripleDesResult = res.data;
            } catch(e) { alert('解密失败: ' + e.message); }
        },
        async rsaConvertToXml() {
            try {
                const res = await api('POST', '/encryption/rsa/convert-to-xml', { pem: this.rsaXmlPem, includePrivateParams: this.rsaXmlIncludePrivate});
                this.rsaXmlResult = res.data;
            } catch(e) { alert('转换失败: ' + e.message); }
        },
        async rsaConvertFromXml() {
            try {
                const res = await api('POST', '/encryption/rsa/convert-from-xml', { xml: this.rsaXmlXml, targetFormat: this.rsaXmlTargetFormat });
                this.rsaXmlFromXmlResult = res.data;
            } catch(e) { alert('转换失败: ' + e.message); }
        },
        async rsaAddPassword() {
            try {
                const res = await api('POST', '/encryption/rsa/add-password', { pem: this.rsaPasswordPem, password: this.rsaPasswordPassword, targetEncryptedType: this.rsaPasswordTargetEncryptedType, algorithm: this.rsaPasswordAlgorithm });
                this.rsaPasswordResult = res.data;
            } catch(e) { alert('添加密码失败: ' + e.message); }
        },
        async rsaDoRemovePassword() {
            try {
                const res = await api('POST', '/encryption/rsa/remove-password', { pem: this.rsaRemoveEncryptedPem, password: this.rsaRemovePwd });
                this.rsaRemoveResult = res.data;
            } catch(e) { alert('移除密码失败: ' + e.message); }
        },
        async rsaEncrypt() {
            try {
                const res = await api('POST', '/encryption/rsa/encrypt', { publicKey: this.rsaEncPublic, plaintext: this.rsaEncPlaintext, padding: this.rsaEncPadding });
                this.rsaEncResult = res.data;
            } catch(e) { alert('加密失败: ' + e.message); }
        },
        async rsaDecrypt() {
            try {
                const res = await api('POST', '/encryption/rsa/decrypt', { privateKey: this.rsaDecPrivate, ciphertext: this.rsaDecCiphertext, padding: this.rsaDecPadding, password: this.rsaDecPassword || null });
                this.rsaDecResult = res.data;
            } catch(e) { alert('解密失败: ' + e.message); }
        },
        async rsaSign() {
            try {
                const res = await api('POST', '/encryption/rsa/sign', { privateKey: this.rsaSignPrivate, data: this.rsaSignData, hashAlgorithm: this.rsaSignHashAlgorithm, padding: this.rsaSignPadding, password: this.rsaSignPassword || null });
                this.rsaSignResult = res.data;
            } catch(e) { alert('签名失败: ' + e.message); }
        },
        async rsaVerifySign() {
            try {
                const res = await api('POST', '/encryption/rsa/verify-sign', { publicKey: this.rsaVerifySignPublic, data: this.rsaVerifySignData, signature: this.rsaVerifySignSignature, hashAlgorithm: this.rsaVerifySignHashAlgorithm, padding: this.rsaVerifySignPadding });
                this.rsaVerifySignResult = res.data;
            } catch(e) { this.rsaVerifySignResult = false; }
        }
    }
};
