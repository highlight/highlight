var full_calendars = {}
Vue.component('highlight', {
	template: `<div  v-bind:id="jp_props.id" :class="jp_props.classes"  :style="jp_props.style" ></div>`,

	methods: {
		identify(calendar) {
			window.H.identify('vadim@highlight.io')
		},
	},

	mounted() {
		this.identify()
	},
	props: {
		jp_props: Object,
	},
})
