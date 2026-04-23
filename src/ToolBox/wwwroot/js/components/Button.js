const Button = {
    props: {
        variant: { type: String, default: 'primary' },
        size: { type: String, default: 'md' },
        disabled: { type: Boolean, default: false },
        type: { type: String, default: 'button' },
        icon: { type: Boolean, default: false }
    },
    emits: ['click'],
    template: `
        <button :type="type" :disabled="disabled" @click="$emit('click', $event)"
            :class="buttonClasses">
            <slot></slot>
        </button>
    `,
    computed: {
        buttonClasses() {
            const base = 'rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2';
            const sizes = {
                sm: this.icon ? 'p-1.5' : 'px-3 py-1.5 text-sm',
                md: this.icon ? 'p-2' : 'px-4 py-2 text-sm',
                lg: this.icon ? 'p-2.5' : 'px-5 py-2.5 text-base',
                noPadding: 'p-0'
            };
            const variants = {
                primary: 'bg-indigo-700 text-white hover:bg-indigo-800 shadow',
                secondary: 'bg-white shadow text-gray-700 hover:bg-gray-50 hover:shadow-md border border-gray-200',
                danger: 'bg-red-600 text-white hover:bg-red-700 shadow',
                ghost: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            };
            return `${base} ${sizes[this.size]} ${variants[this.variant]}`;
        }
    }
};
