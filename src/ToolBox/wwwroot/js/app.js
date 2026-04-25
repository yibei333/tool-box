const { createApp, ref, computed, onMounted } = Vue;
const { createRouter, createWebHashHistory, useRoute, useRouter } = VueRouter;

const navItems = [
    { route: '/timestamp', label: '时间戳', icon: '⏰' },
    { route: '/json', label: 'JSON工具', icon: '📄' },
    { route: '/encryption', label: '加密', icon: '🔒' },
    { route: '/string', label: '字符串', icon: '📝' },
    { route: '/regex', label: '正则测试', icon: '🔍' },
    { route: '/encoding', label: '编码', icon: '🔠' },
    { route: '/hash', label: '哈希', icon: '#️⃣' },
    { route: '/jwt', label: 'JWT', icon: '🔑' },
    { route: '/guid', label: 'GUID', icon: '🆔' },
    { route: '/http', label: 'HTTP', icon: '🌐' },
];

const App = {
    components: { Button },
    template: `
    <div class="h-full gradient-bg flex flex-col lg:flex-row">
        <!-- Mobile header -->
        <header class="block lg:hidden glass border-b border-gray-200 sticky top-0 z-30">
            <div class="flex items-center justify-between p-2">
                <div class="flex items-center space-x-1">
                    <div class="w-8 h-8 rounded bg-indigo-700 flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <span class="text-lg font-bold gradient-text">ToolBox</span>
                </div>
                <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded hover:bg-gray-100">
                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </header>
        <!-- Mobile sidebar overlay -->
        <div v-if="mobileMenuOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden" @click="mobileMenuOpen = false"></div>
        <!-- Mobile sidebar -->
        <aside :class="['fixed h-screen overflow-y-auto left-0 top-0 bottom-0 w-64 glass border-r border-gray-200 z-50 flex flex-col transform transition-transform lg:hidden',
                     mobileMenuOpen ? 'translate-x-0' : '-translate-x-full']">
            <div class="p-2 border-b border-gray-200">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-1">
                        <div class="w-8 h-8 rounded bg-indigo-700 flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </div>
                        <span class="text-lg font-bold gradient-text">ToolBox</span>
                    </div>
                    <button @click="mobileMenuOpen = false" class="p-2 rounded hover:bg-gray-100">
                        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
            </div>
            <nav class="flex-1 p-2 overflow-y-auto">
                <a v-for="item in navItems" :key="item.route"
                   @click="navigate(item.route); mobileMenuOpen = false;"
                   :class="['flex items-center space-x-1 px-3 py-2.5 rounded',
                            currentRoute === item.route
                              ? 'bg-indigo-700/10 text-indigo-700 font-medium border-l-3 border-indigo-700'
                              : 'text-gray-600 hover:bg-gray-100']">
                    <span class="icon-emoji">{{ item.icon }}</span>
                    <span class="text-sm">{{ item.label }}</span>
                </a>
            </nav>
        </aside>

        <!-- Desktop sidebar -->
        <aside class="hidden lg:flex flex-col h-screen overflow-hidden p-8 pr-0">
            <div class="w-60 glass border-r border-gray-200 overlow-y-auto rounded flex-1 flex flex-col">
                <div class="p-4 border-b border-gray-200">
                    <div class="flex items-center space-x-1">
                        <div class="w-8 h-8 rounded bg-indigo-700 flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </div>
                        <span class="text-lg font-bold gradient-text">ToolBox</span>
                    </div>
                </div>
                <nav class="flex-1 p-2 overflow-y-auto">
                    <a v-for="item in navItems" :key="item.route"
                    @click="navigate(item.route)"
                    :class="['flex items-center space-x-1 px-3 py-2.5 rounded',
                                currentRoute === item.route
                                ? 'bg-indigo-700/10 text-indigo-700 font-medium border-l-3 border-indigo-700'
                                : 'text-gray-600 hover:bg-gray-100']">
                        <span class="icon-emoji">{{ item.icon }}</span>
                        <span class="text-sm">{{ item.label }}</span>
                    </a>
                </nav>
            </div>
        </aside>

        <!-- Main content -->
        <main class="flex-1 p-2 lg:p-8 flex flex-col overflow-hidden">
            <div class="flex-1 glass rounded p-2 lg:p-6 shadow-xl flex flex-col overflow-y-auto">
                <router-view v-slot="{ Component }">
                    <keep-alive>
                        <component :is="Component" />
                    </keep-alive>
                </router-view>
            </div>
        </main>
    </div>
    `,
    setup() {
        const router = useRouter();
        const route = useRoute();
        const currentRoute = computed(() => route.path);
        const mobileMenuOpen = ref(false);

        // 移动端底部导航显示所有项目
        const mobileNavItems = navItems;

        function navigate(path) {
            router.push(path);
            mobileMenuOpen.value = false;
        }

        return { navItems, mobileNavItems, currentRoute, mobileMenuOpen, navigate };
    }
};

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        { path: '/', redirect: '/timestamp' },
        { path: '/timestamp', component: TimestampView },
        { path: '/json', component: JsonView },
        { path: '/encryption', component: EncryptionView },
        { path: '/string', component: StringView },
        { path: '/regex', component: RegexView },
        { path: '/encoding', component: EncodingView },
        { path: '/hash', component: HashView },
        { path: '/jwt', component: JwtView },
        { path: '/guid', component: GuidView },
        { path: '/http', component: HttpView },
    ],
});

const app = createApp(App);
app.use(router);
app.component('Button', Button);
app.component('CopyButton', CopyButton);
app.component('SingleSelect', SingleSelect);
app.mount('#app');
