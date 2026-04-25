const SingleSelect = {
    props: {
        modelValue: { type: [String, Number], default: '' },
        options: { type: Array, required: true },
        size: { type: String, default: 'md' },
        placeholder: { type: String, default: '请选择' }
    },
    emits: ['update:modelValue'],
    data() {
        return {
            isOpen: false,
            selectedLabel: ''
        };
    },
    watch: {
        modelValue: {
            immediate: true,
            handler(val) {
                const opt = this.options.find(o => o.value === val);
                this.selectedLabel = opt ? opt.label : '';
            }
        },
        options: {
            immediate: true,
            handler() {
                const opt = this.options.find(o => o.value === this.modelValue);
                this.selectedLabel = opt ? opt.label : '';
            }
        }
    },
    methods: {
        toggle() {
            this.isOpen = !this.isOpen;
        },
        select(opt) {
            this.$emit('update:modelValue', opt.value);
            this.isOpen = false;
        },
        handleClickOutside(e) {
            if (!this.$el.contains(e.target)) {
                this.isOpen = false;
            }
        }
    },
    mounted() {
        document.addEventListener('click', this.handleClickOutside);
    },
    beforeUnmount() {
        document.removeEventListener('click', this.handleClickOutside);
    },
    template: `
        <div class="relative" @click.stop>
            <div @click="toggle"
                :class="[
                    'w-full rounded border bg-white flex items-center justify-between cursor-pointer',
                    size === 'sm' ? 'px-2 py-1.5 text-xs' : size === 'lg' ? 'px-4 py-2.5 text-base' : 'px-3 py-2 text-sm',
                    isOpen ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-300 hover:border-gray-400'
                ]">
                <span :class="[!selectedLabel ? 'text-gray-400' : 'text-gray-800']">
                    {{ selectedLabel || placeholder }}
                </span>
                <svg :class="['w-4 h-4 text-gray-400', isOpen ? 'rotate-180' : '']" 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
            </div>
                <div v-if="isOpen" class="absolute z-50 mt-1 w-full rounded bg-white shadow-lg border border-gray-200 py-1 overflow-hidden">
                <div
                    v-for="opt in options" 
                    :key="opt.value"
                    @click="select(opt)"
                    :class="[
                        'px-3 py-2 cursor-pointer transition-colors duration-150',
                        size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm',
                        opt.value === modelValue 
                            ? 'bg-indigo-50 text-indigo-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-50'
                    ]">
                    {{ opt.label }}
                </div>
            </div>
        </div>
    `
};
