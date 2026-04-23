const EncryptionView = {
    template: `
    <div class="space-y-6">
        <div class="glass rounded-2xl p-6 shadow-xl">
            <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <span class="text-indigo-700">🔒</span>
                <span>加密工具</span>
            </h2>

            <div class="flex space-x-2 mb-6 border-b border-gray-200 pb-3">
                <button @click="mainTab = 'rsa'"
                    :class="['px-4 py-2 text-sm rounded-t-lg', mainTab === 'rsa' ? 'bg-indigo-700 text-white' : 'text-gray-600 hover:bg-gray-100']">RSA 非对称</button>
                <button @click="mainTab = 'aes'"
                    :class="['px-4 py-2 text-sm rounded-t-lg', mainTab === 'aes' ? 'bg-indigo-700 text-white' : 'text-gray-600 hover:bg-gray-100']">AES 对称</button>
                <button @click="mainTab = 'des'"
                    :class="['px-4 py-2 text-sm rounded-t-lg', mainTab === 'des' ? 'bg-indigo-700 text-white' : 'text-gray-600 hover:bg-gray-100']">DES 对称</button>
                <button @click="mainTab = '3des'"
                    :class="['px-4 py-2 text-sm rounded-t-lg', mainTab === '3des' ? 'bg-indigo-700 text-white' : 'text-gray-600 hover:bg-gray-100']">3DES 对称</button>
            </div>

            <!-- RSA Section -->
            <div v-if="mainTab === 'rsa'" class="space-y-6" :style="{ height: contentHeight + 'px' }">
                <div class="flex space-x-2 mb-4 border-b border-gray-100 pb-2">
                    <button v-for="t in rsaTabs" :key="t.key" @click="rsaTab = t.key"
                        :class="['px-3 py-1.5 text-xs rounded-lg', rsaTab === t.key ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50']">{{ t.label }}</button>
                </div>

                <!-- RSA Generate -->
                <div v-if="rsaTab === 'generate'" class="space-y-4">
                    <div class="flex items-center space-x-4">
                        <label class="text-sm text-gray-700">密钥长度:</label>
                        <select v-model="rsaKeySize"
                            class="rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                            <option :value="2048">2048</option>
                            <option :value="4096">4096</option>
                        </select>
                        <Button @click="rsaGenerate" variant="primary" size="sm">生成密钥对</Button>
                    </div>
                    <div class="flex gap-2 min-h-150">
                        <div class="flex-1 flex flex-col space-y-2">
                            <div class="flex items-center gap-2">
                                <label class="block text-sm font-medium text-gray-700">私钥</label>
                                <CopyButton v-if="rsaKeys.privateKey" :text="rsaKeys.privateKey"></CopyButton>
                            </div>
                            <textarea v-model="rsaKeys.privateKey" readonly placeholder="私钥..."
                                class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs bg-gray-50 outline-none resize-none"></textarea>
                        </div>
                        <div class="flex-1 flex flex-col space-y-2">
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
                <div v-if="rsaTab === 'compare'" class="flex flex-col space-y-4 min-h-150">
                    <div class="flex-1 flex gap-4">
                        <div class="flex-1 flex flex-col">
                            <label class="block text-sm font-medium text-gray-700 mb-1">私钥</label>
                            <textarea v-model="comparePrivate" rows="8" placeholder="粘贴PEM私钥..."
                                class="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                        </div>
                        <div class="flex-1 flex flex-col">
                            <label class="block text-sm font-medium text-gray-700 mb-1">公钥</label>
                            <textarea v-model="comparePublic" rows="8" placeholder="粘贴PEM公钥..."
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
                <div v-if="rsaTab === 'convert'">
                    <div class="flex flex-col gap-4 min-h-150">
                        <div class="flex-1 flex flex-row gap-4">
                            <div class="flex-1 flex flex-col space-y-4">
                                <label class="block text-sm font-medium text-gray-700 mb-1">PEM密钥</label>
                                <textarea v-model="convertPem" rows="12" placeholder="粘贴PEM密钥..."
                                        class="w-full flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                            </div>
                            <div class="flex-1 flex flex-col space-y-2">
                                <div class="flex items-center justify-between">
                                    <label class="block text-sm font-medium text-gray-700">转换结果</label>
                                    <CopyButton v-if="convertResult" :text="convertResult"></CopyButton>
                                </div>
                                <textarea v-model="convertResult" rows="14" readonly placeholder="转换结果..."
                                    class="w-full flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs bg-gray-50 outline-none resize-none"></textarea>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4">
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
                </div>

                <!-- RSA Encrypt -->
                <div v-if="rsaTab === 'encrypt'">
                    <div class="grid grid-cols-2 gap-6 min-h-150">
                        <div class="flex flex-col space-y-4 gap-4">
                            <div class="flex-1 flex flex-col">
                                <label class="block text-sm font-medium text-gray-700 mb-1">公钥</label>
                                <textarea v-model="rsaEncPublic" rows="4" placeholder="粘贴PEM公钥..."
                                    class="w-full flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                            </div>
                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700 mb-1">明文</label>
                                <textarea v-model="rsaPlaintext" rows="8" placeholder="输入明文..."
                                    class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                            </div>
                            <Button @click="rsaEncrypt" variant="primary" size="sm">加密</Button>
                        </div>
                        <div class="flex flex-col space-y-2">
                            <div class="flex items-center justify-between">
                                <label class="block text-sm font-medium text-gray-700">密文(Base64)</label>
                                <CopyButton v-if="rsaCiphertext" :text="rsaCiphertext"></CopyButton>
                            </div>
                            <textarea v-model="rsaCiphertext" rows="14" readonly placeholder="加密结果..."
                                class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
                        </div>
                    </div>
                </div>

                <!-- RSA Decrypt -->
                <div v-if="rsaTab === 'decrypt'">
                    <div class="grid grid-cols-2 gap-6 min-h-150">
                        <div class="flex flex-col space-y-4 gap-4">
                            <div class="flex-1 flex flex-col">
                                <label class="block text-sm font-medium text-gray-700 mb-1">私钥</label>
                                <textarea v-model="rsaDecPrivate" rows="4" placeholder="粘贴PEM私钥..."
                                    class="w-full flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                            </div>
                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700 mb-1">密文(Base64)</label>
                                <textarea v-model="rsaDecCiphertext" rows="8" placeholder="粘贴Base64密文..."
                                    class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                            </div>
                            <Button @click="rsaDecrypt" variant="primary" size="sm">解密</Button>
                        </div>
                        <div class="flex flex-col space-y-2">
                            <div class="flex items-center justify-between">
                                <label class="block text-sm font-medium text-gray-700">明文</label>
                                <CopyButton v-if="rsaDecResult" :text="rsaDecResult"></CopyButton>
                            </div>
                            <textarea v-model="rsaDecResult" rows="14" readonly placeholder="解密结果..."
                                class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
                        </div>
                    </div>
                </div>

                <!-- RSA XML Convert -->
                <div v-if="rsaTab === 'xml-convert'" class="space-y-6">
                    <div class="flex space-x-2 mb-4 border-b border-gray-100 pb-2">
                        <button @click="xmlConvertDirection = 'pem-to-xml'" :class="['px-3 py-1.5 text-xs rounded-lg', xmlConvertDirection === 'pem-to-xml' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50']">PEM → XML</button>
                        <button @click="xmlConvertDirection = 'xml-to-pem'" :class="['px-3 py-1.5 text-xs rounded-lg', xmlConvertDirection === 'xml-to-pem' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50']">XML → PEM</button>
                    </div>

                    <!-- PEM to XML -->
                    <div v-if="xmlConvertDirection === 'pem-to-xml'" class="space-y-4">
                        <div class="grid grid-cols-2 gap-6 min-h-150">
                            <div class="flex flex-col space-y-4 gap-4">
                                <div class="flex-1 flex flex-col">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">PEM密钥</label>
                                    <textarea v-model="rsaXmlPem" rows="8" placeholder="粘贴PEM密钥..."
                                        class="w-full flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                                </div>
                                <div class="flex items-center space-x-4">
                                    <label class="flex items-center space-x-2">
                                        <input type="checkbox" v-model="rsaXmlIncludePrivate" class="rounded border-gray-300">
                                        <span class="text-sm text-gray-700">包含私钥参数</span>
                                    </label>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">密码（可选）</label>
                                    <input type="text" v-model="rsaXmlPassword" placeholder="密钥密码"
                                        class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
                                </div>
                                <Button @click="rsaConvertToXml" variant="primary" size="sm">转换为XML</Button>
                            </div>
                            <div class="flex flex-col space-y-2">
                                <div class="flex items-center justify-between">
                                    <label class="block text-sm font-medium text-gray-700">XML结果</label>
                                    <CopyButton v-if="rsaXmlResult" :text="rsaXmlResult"></CopyButton>
                                </div>
                                <textarea v-model="rsaXmlResult" rows="14" readonly placeholder="XML结果..."
                                    class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- XML to PEM -->
                    <div v-if="xmlConvertDirection === 'xml-to-pem'" class="space-y-4">
                        <div class="grid grid-cols-2 gap-6 min-h-150">
                            <div class="flex flex-col space-y-4 gap-4">
                                <div class="flex-1 flex flex-col">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">XML密钥</label>
                                    <textarea v-model="rsaXmlXml" rows="8" placeholder="粘贴XML密钥..."
                                        class="w-full flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">目标格式</label>
                                    <select v-model="rsaXmlTargetFormat" class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                                        <option value="pkcs1">PKCS#1</option>
                                        <option value="pkcs8">PKCS#8</option>
                                        <option value="public">公钥(X.509)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">密码（可选）</label>
                                    <input type="text" v-model="rsaXmlPassword" placeholder="密钥密码"
                                        class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">加密算法</label>
                                    <select v-model="rsaXmlEncryptAlgorithm" class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                                        <option value="AES-256-CBC">AES-256-CBC</option>
                                        <option value="AES-192-CBC">AES-192-CBC</option>
                                        <option value="AES-128-CBC">AES-128-CBC</option>
                                    </select>
                                </div>
                                <Button @click="rsaConvertFromXml" variant="primary" size="sm">转换为PEM</Button>
                            </div>
                            <div class="flex flex-col space-y-2">
                                <div class="flex items-center justify-between">
                                    <label class="block text-sm font-medium text-gray-700">PEM结果</label>
                                    <CopyButton v-if="rsaXmlFromXmlResult" :text="rsaXmlFromXmlResult"></CopyButton>
                                </div>
                                <textarea v-model="rsaXmlFromXmlResult" rows="14" readonly placeholder="PEM结果..."
                                    class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RSA Password Operations -->
                <div v-if="rsaTab === 'password'" class="space-y-6">
                    <div class="flex space-x-2 mb-4 border-b border-gray-100 pb-2">
                        <button @click="passwordOperation = 'add'" :class="['px-3 py-1.5 text-xs rounded-lg', passwordOperation === 'add' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50']">添加密码</button>
                        <button @click="passwordOperation = 'remove'" :class="['px-3 py-1.5 text-xs rounded-lg', passwordOperation === 'remove' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-50']">移除密码</button>
                    </div>

                    <!-- Add Password -->
                    <div v-if="passwordOperation === 'add'" class="space-y-4">
                        <div class="grid grid-cols-2 gap-6 min-h-150">
                            <div class="flex flex-col space-y-4 gap-4">
                                <div class="flex-1 flex flex-col">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">PEM密钥</label>
                                    <textarea v-model="rsaPasswordPem" rows="8" placeholder="粘贴PEM密钥..."
                                        class="w-full flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
                                    <input type="text" v-model="rsaPasswordPassword" placeholder="输入密码"
                                        class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">目标加密类型</label>
                                    <select v-model="rsaPasswordTargetEncryptedType" class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                                        <option value="EncryptedPkcs8PrivateKey">Encrypted PKCS#8</option>
                                        <option value="EncryptedPkcs1PrivateKey">Encrypted PKCS#1</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">加密算法</label>
                                    <select v-model="rsaPasswordAlgorithm" class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                                        <option value="AES-256-CBC">AES-256-CBC</option>
                                        <option value="AES-192-CBC">AES-192-CBC</option>
                                        <option value="AES-128-CBC">AES-128-CBC</option>
                                    </select>
                                </div>
                                <Button @click="rsaAddPassword" variant="primary" size="sm">添加密码</Button>
                            </div>
                            <div class="flex flex-col space-y-2">
                                <div class="flex items-center justify-between">
                                    <label class="block text-sm font-medium text-gray-700">加密后的密钥</label>
                                    <CopyButton v-if="rsaPasswordResult" :text="rsaPasswordResult"></CopyButton>
                                </div>
                                <textarea v-model="rsaPasswordResult" rows="14" readonly placeholder="加密后的密钥..."
                                    class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Remove Password -->
                    <div v-if="passwordOperation === 'remove'" class="space-y-4">
                        <div class="grid grid-cols-2 gap-6 min-h-150">
                            <div class="flex flex-col space-y-4 gap-4">
                                <div class="flex-1 flex flex-col">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">加密的PEM密钥</label>
                                    <textarea v-model="rsaRemoveEncryptedPem" rows="8" placeholder="粘贴加密的PEM密钥..."
                                        class="w-full flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
                                    <input type="text" v-model="rsaRemovePassword" placeholder="输入密码"
                                        class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
                                </div>
                                <Button @click="rsaRemovePassword" variant="primary" size="sm">移除密码</Button>
                            </div>
                            <div class="flex flex-col space-y-2">
                                <div class="flex items-center justify-between">
                                    <label class="block text-sm font-medium text-gray-700">解密后的密钥</label>
                                    <CopyButton v-if="rsaRemoveResult" :text="rsaRemoveResult"></CopyButton>
                                </div>
                                <textarea v-model="rsaRemoveResult" rows="14" readonly placeholder="解密后的密钥..."
                                    class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- RSA Enhanced Encrypt -->
                <div v-if="rsaTab === 'encrypt-enhanced'">
                    <div class="grid grid-cols-2 gap-6 min-h-150">
                        <div class="flex flex-col space-y-4 gap-4">
                            <div class="flex-1 flex flex-col">
                                <label class="block text-sm font-medium text-gray-700 mb-1">公钥</label>
                                <textarea v-model="rsaEncEnhancedPublic" rows="4" placeholder="粘贴PEM公钥..."
                                    class="w-full flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                            </div>
                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700 mb-1">明文</label>
                                <textarea v-model="rsaEncEnhancedPlaintext" rows="8" placeholder="输入明文..."
                                    class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">填充模式</label>
                                <select v-model="rsaEncEnhancedPadding" class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                                    <option value="OAEP-SHA256">OAEP-SHA256</option>
                                    <option value="OAEP-SHA384">OAEP-SHA384</option>
                                    <option value="OAEP-SHA512">OAEP-SHA512</option>
                                    <option value="OAEP-SHA1">OAEP-SHA1</option>
                                    <option value="PKCS1">PKCS1</option>
                                </select>
                            </div>
                            <Button @click="rsaEncryptEnhanced" variant="primary" size="sm">加密</Button>
                        </div>
                        <div class="flex flex-col space-y-2">
                            <div class="flex items-center justify-between">
                                <label class="block text-sm font-medium text-gray-700">密文(Base64)</label>
                                <CopyButton v-if="rsaEncEnhancedResult" :text="rsaEncEnhancedResult"></CopyButton>
                            </div>
                            <textarea v-model="rsaEncEnhancedResult" rows="14" readonly placeholder="加密结果..."
                                class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
                        </div>
                    </div>
                </div>

                <!-- RSA Enhanced Decrypt -->
                <div v-if="rsaTab === 'decrypt-enhanced'">
                    <div class="grid grid-cols-2 gap-6 min-h-150">
                        <div class="flex flex-col space-y-4 gap-4">
                            <div class="flex-1 flex flex-col">
                                <label class="block text-sm font-medium text-gray-700 mb-1">私钥</label>
                                <textarea v-model="rsaDecEnhancedPrivate" rows="4" placeholder="粘贴PEM私钥..."
                                    class="w-full flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                            </div>
                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700 mb-1">密文(Base64)</label>
                                <textarea v-model="rsaDecEnhancedCiphertext" rows="8" placeholder="粘贴Base64密文..."
                                    class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">填充模式</label>
                                <select v-model="rsaDecEnhancedPadding" class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                                    <option value="OAEP-SHA256">OAEP-SHA256</option>
                                    <option value="OAEP-SHA384">OAEP-SHA384</option>
                                    <option value="OAEP-SHA512">OAEP-SHA512</option>
                                    <option value="OAEP-SHA1">OAEP-SHA1</option>
                                    <option value="PKCS1">PKCS1</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">密码（可选）</label>
                                <input type="text" v-model="rsaDecEnhancedPassword" placeholder="密钥密码"
                                    class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
                            </div>
                            <Button @click="rsaDecryptEnhanced" variant="primary" size="sm">解密</Button>
                        </div>
                        <div class="flex flex-col space-y-2">
                            <div class="flex items-center justify-between">
                                <label class="block text-sm font-medium text-gray-700">明文</label>
                                <CopyButton v-if="rsaDecEnhancedResult" :text="rsaDecEnhancedResult"></CopyButton>
                            </div>
                            <textarea v-model="rsaDecEnhancedResult" rows="14" readonly placeholder="解密结果..."
                                class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
                        </div>
                    </div>
                </div>

                <!-- RSA Sign -->
                <div v-if="rsaTab === 'sign'">
                    <div class="grid grid-cols-2 gap-6 min-h-150">
                        <div class="flex flex-col space-y-4 gap-4">
                            <div class="flex-1 flex flex-col">
                                <label class="block text-sm font-medium text-gray-700 mb-1">私钥</label>
                                <textarea v-model="rsaSignPrivate" rows="4" placeholder="粘贴PEM私钥..."
                                    class="w-full flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                            </div>
                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700 mb-1">待签名数据</label>
                                <textarea v-model="rsaSignData" rows="8" placeholder="输入待签名数据..."
                                    class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">哈希算法</label>
                                <select v-model="rsaSignHashAlgorithm" class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                                    <option value="SHA256">SHA256</option>
                                    <option value="SHA384">SHA384</option>
                                    <option value="SHA512">SHA512</option>
                                    <option value="SHA1">SHA1</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">填充模式</label>
                                <select v-model="rsaSignPadding" class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                                    <option value="PKCS1">PKCS1</option>
                                    <option value="PSS">PSS</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">密码（可选）</label>
                                <input type="text" v-model="rsaSignPassword" placeholder="密钥密码"
                                    class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
                            </div>
                            <Button @click="rsaSign" variant="primary" size="sm">签名</Button>
                        </div>
                        <div class="flex flex-col space-y-2">
                            <div class="flex items-center justify-between">
                                <label class="block text-sm font-medium text-gray-700">签名(Base64)</label>
                                <CopyButton v-if="rsaSignResult" :text="rsaSignResult"></CopyButton>
                            </div>
                            <textarea v-model="rsaSignResult" rows="14" readonly placeholder="签名结果..."
                                class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
                        </div>
                    </div>
                </div>

                <!-- RSA Verify -->
                <div v-if="rsaTab === 'verify'">
                    <div class="grid grid-cols-2 gap-6 min-h-150">
                        <div class="flex flex-col space-y-4 gap-4">
                            <div class="flex-1 flex flex-col">
                                <label class="block text-sm font-medium text-gray-700 mb-1">公钥</label>
                                <textarea v-model="rsaVerifyPublic" rows="4" placeholder="粘贴PEM公钥..."
                                    class="w-full flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-xs focus:border-indigo-500 outline-none resize-none"></textarea>
                            </div>
                            <div class="flex-1">
                                <label class="block text-sm font-medium text-gray-700 mb-1">原始数据</label>
                                <textarea v-model="rsaVerifyData" rows="8" placeholder="输入原始数据..."
                                    class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">签名(Base64)</label>
                                <textarea v-model="rsaVerifySignature" rows="4" placeholder="粘贴Base64签名..."
                                    class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">哈希算法</label>
                                <select v-model="rsaVerifyHashAlgorithm" class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                                    <option value="SHA256">SHA256</option>
                                    <option value="SHA384">SHA384</option>
                                    <option value="SHA512">SHA512</option>
                                    <option value="SHA1">SHA1</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">填充模式</label>
                                <select v-model="rsaVerifyPadding" class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                                    <option value="PKCS1">PKCS1</option>
                                    <option value="PSS">PSS</option>
                                </select>
                            </div>
                            <Button @click="rsaVerify" variant="primary" size="sm">验签</Button>
                        </div>
                        <div class="flex flex-col space-y-2">
                            <div class="rounded-xl border px-4 py-3 flex items-center justify-center"
                                :class="rsaVerifyResult === null ? 'bg-gray-50' : (rsaVerifyResult ? 'bg-green-50' : 'bg-red-50')">
                                <span v-if="rsaVerifyResult === null" class="text-gray-400 text-sm">点击验签按钮查看结果</span>
                                <span v-else :class="rsaVerifyResult ? 'text-green-600' : 'text-red-600'" class="font-medium">
                                    {{ rsaVerifyResult ? '✓ 签名有效' : '✗ 签名无效' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- AES Section -->
            <div v-if="mainTab === 'aes'" :style="{ height: contentHeight + 'px' }">
                <div class="grid grid-cols-2 gap-6 h-full">
                    <div class="flex flex-col gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">密钥</label>
                            <input type="text" v-model="aesKey" placeholder="输入AES密钥"
                                class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
                        </div>
                        <div v-if="aesMode !== 'ECB'">
                            <label class="block text-sm font-medium text-gray-700 mb-1">IV（必需）</label>
                            <input type="text" v-model="aesIv" placeholder="输入IV"
                                class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">模式</label>
                            <select v-model="aesMode" class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                                <option value="CBC">CBC</option>
                                <option value="ECB">ECB</option>
                                <option value="CFB">CFB</option>
                                <option value="OFB">OFB</option>
                                <option value="CTR">CTR</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">填充</label>
                            <select v-model="aesPadding" class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                                <option value="PKCS7">PKCS7</option>
                                <option value="Zeros">Zeros</option>
                                <option value="ANSIX923">ANSIX923</option>
                                <option value="ISO10126">ISO10126</option>
                                <option value="None">None</option>
                            </select>
                        </div>
                        <div class="flex-1 flex flex-col gap-4">
                            <label class="block text-sm font-medium text-gray-700 mb-1">输入</label>
                            <textarea v-model="aesInput" rows="10" placeholder="输入明文或密文..."
                                class="w-full flex-1 rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                        </div>
                        <div class="flex space-x-2">
                            <Button @click="aesEncryptEnhanced" variant="primary" size="sm">加密</Button>
                            <Button @click="aesDecryptEnhanced" variant="secondary" size="sm">解密</Button>
                        </div>
                    </div>
                    <div class="flex flex-col space-y-2">
                        <div class="flex items-center justify-between">
                            <label class="block text-sm font-medium text-gray-700">输出</label>
                            <CopyButton v-if="aesResult" :text="aesResult"></CopyButton>
                        </div>
                        <textarea v-model="aesResult" rows="14" readonly :placeholder="aesResultPlaceholder"
                            class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
                    </div>
                </div>
            </div>

            <!-- DES Section -->
            <div v-if="mainTab === 'des'" :style="{ height: contentHeight + 'px' }">
                <div class="grid grid-cols-2 gap-6 h-full">
                    <div class="flex flex-col space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">密钥</label>
                            <input type="text" v-model="desKey" placeholder="输入DES密钥"
                                class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
                        </div>
                        <div v-if="desMode !== 'ECB'">
                            <label class="block text-sm font-medium text-gray-700 mb-1">IV（必需）</label>
                            <input type="text" v-model="desIv" placeholder="输入IV"
                                class="w-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">模式</label>
                            <select v-model="desMode" class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                                <option value="CBC">CBC</option>
                                <option value="ECB">ECB</option>
                                <option value="CFB">CFB</option>
                                <option value="OFB">OFB</option>
                                <option value="CTR">CTR</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">填充</label>
                            <select v-model="desPadding" class="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 outline-none">
                                <option value="PKCS7">PKCS7</option>
                                <option value="Zeros">Zeros</option>
                                <option value="ANSIX923">ANSIX923</option>
                                <option value="ISO10126">ISO10126</option>
                                <option value="None">None</option>
                            </select>
                        </div>
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-700 mb-1">输入</label>
                            <textarea v-model="desInput" rows="10" placeholder="输入明文或密文..."
                                class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm focus:border-indigo-500 outline-none resize-none"></textarea>
                        </div>
                        <div class="flex space-x-2">
                            <Button @click="desEncryptEnhanced" variant="primary" size="sm">加密</Button>
                            <Button @click="desDecryptEnhanced" variant="secondary" size="sm">解密</Button>
                        </div>
                    </div>
                    <div class="flex flex-col space-y-2">
                        <div class="flex items-center justify-between">
                            <label class="block text-sm font-medium text-gray-700">输出</label>
                            <CopyButton v-if="desResult" :text="desResult"></CopyButton>
                        </div>
                        <textarea v-model="desResult" rows="14" readonly :placeholder="desResultPlaceholder"
                            class="w-full h-full rounded-xl border border-gray-300 px-4 py-2.5 mono text-sm bg-gray-50 outline-none resize-none"></textarea>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            mainTab: 'rsa',
            rsaTab: 'generate',
            contentHeight: 500,
            rsaTabs: [
                { key: 'generate', label: '生成密钥' },
                { key: 'compare', label: '密钥比对' },
                { key: 'convert', label: '格式转换' },
                { key: 'xml-convert', label: 'XML转换' },
                { key: 'password', label: '密码操作' },
                { key: 'encrypt', label: '加密' },
                { key: 'decrypt', label: '解密' },
                { key: 'encrypt-enhanced', label: '增强加密' },
                { key: 'decrypt-enhanced', label: '增强解密' },
                { key: 'sign', label: '签名' },
                { key: 'verify', label: '验签' }
            ],
            rsaKeySize: 2048,
            rsaKeys: { publicKey: '', privateKey: '' },
            comparePublic: '', comparePrivate: '', compareResult: null,
            convertPem: '', convertTarget: 'pkcs8', convertResult: '',
            rsaEncPublic: '', rsaPlaintext: '', rsaCiphertext: '',
            rsaDecPrivate: '', rsaDecCiphertext: '', rsaDecResult: '',
            // XML转换
            xmlConvertDirection: 'pem-to-xml',
            passwordOperation: 'add',
            rsaXmlPem: '', rsaXmlIncludePrivate: false, rsaXmlPassword: '', rsaXmlResult: '',
            rsaXmlXml: '', rsaXmlTargetFormat: 'pkcs8', rsaXmlEncryptAlgorithm: 'AES-256-CBC', rsaXmlFromXmlResult: '',
            // 密码操作
            rsaPasswordPem: '', rsaPasswordPassword: '', rsaPasswordTargetEncryptedType: 'EncryptedPkcs8PrivateKey', rsaPasswordAlgorithm: 'AES-256-CBC', rsaPasswordResult: '',
            rsaRemoveEncryptedPem: '', rsaRemovePassword: '', rsaRemoveResult: '',
            // 增强加密
            rsaEncEnhancedPublic: '', rsaEncEnhancedPlaintext: '', rsaEncEnhancedPadding: 'OAEP-SHA256', rsaEncEnhancedResult: '',
            // 增强解密
            rsaDecEnhancedPrivate: '', rsaDecEnhancedCiphertext: '', rsaDecEnhancedPadding: 'OAEP-SHA256', rsaDecEnhancedPassword: '', rsaDecEnhancedResult: '',
            // 签名
            rsaSignPrivate: '', rsaSignData: '', rsaSignHashAlgorithm: 'SHA256', rsaSignPadding: 'PKCS1', rsaSignPassword: '', rsaSignResult: '',
            // 验签
            rsaVerifyPublic: '', rsaVerifyData: '', rsaVerifySignature: '', rsaVerifyHashAlgorithm: 'SHA256', rsaVerifyPadding: 'PKCS1', rsaVerifyResult: null,
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
        desResultPlaceholder() { return this.desResult ? '' : '加密/解密结果...'; }
    },
    mounted() {
        this.updateHeight();
        window.addEventListener('resize', this.updateHeight);
        this.rsaGenerate();
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.updateHeight);
    },
    methods: {
        updateHeight() {
            const h = window.innerHeight;
            this.contentHeight = Math.max(400, h - 280);
        },
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
        async rsaEncrypt() {
            try {
                const res = await api('POST', '/encryption/rsa/encrypt', { publicKey: this.rsaEncPublic, plaintext: this.rsaPlaintext });
                this.rsaCiphertext = res.data;
            } catch(e) { alert('加密失败: ' + e.message); }
        },
        async rsaDecrypt() {
            try {
                const res = await api('POST', '/encryption/rsa/decrypt', { privateKey: this.rsaDecPrivate, ciphertext: this.rsaDecCiphertext });
                this.rsaDecResult = res.data;
            } catch(e) { alert('解密失败: ' + e.message); }
        },
        async aesEncrypt() {
            try {
                const res = await api('POST', '/encryption/aes/encrypt', { plaintext: this.aesInput, key: this.aesKey, iv: this.aesIv || null });
                this.aesResult = res.data;
            } catch(e) { alert('加密失败: ' + e.message); }
        },
        async aesDecrypt() {
            try {
                const res = await api('POST', '/encryption/aes/decrypt', { ciphertext: this.aesInput, key: this.aesKey, iv: this.aesIv || null });
                this.aesResult = res.data;
            } catch(e) { alert('解密失败: ' + e.message); }
        },
        async desEncrypt() {
            try {
                const res = await api('POST', '/encryption/des/encrypt', { plaintext: this.desInput, key: this.desKey, iv: this.desIv || null });
                this.desResult = res.data;
            } catch(e) { alert('加密失败: ' + e.message); }
        },
        async desDecrypt() {
            try {
                const res = await api('POST', '/encryption/des/decrypt', { ciphertext: this.desInput, key: this.desKey, iv: this.desIv || null });
                this.desResult = res.data;
            } catch(e) { alert('解密失败: ' + e.message); }
        }
    }
};
