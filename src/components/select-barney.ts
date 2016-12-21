import * as m from 'mithril'

interface Attrs {
	selected: boolean
}

interface State {
	active: boolean
	focusCapture (dom: HTMLElement, e: FocusEvent): void
}

const Select = {
	active : false,

	oncreate ({dom}) {
		window.addEventListener(
			'focus', (e) => {this.focusCapture(dom as HTMLElement, e)}, true
		)
	},

	onremove() {
		//window.removeEventListener('focus', this.focusCapture, true)
	},

	focusCapture (dom, e) {
		console.log(e.currentTarget)
		//console.log( window.activeElement )
		if (!dom.contains(e.currentTarget as Node))
			this.active = false
	},

	view ({state, attrs}) {
		return [
			m('.Select',
				{
					tabIndex : 0,

					onclick: (e: Event) => {
						this.active = !this.active
					},

					onkeyup: (e: KeyboardEvent) => {
						if (e.keyCode === 13) {
							this.active = !state.active
						} else if (e.keyCode === 27) {
							const el = e.currentTarget as HTMLElement
							el.blur()
						}
					}
				},

				m('.selection', attrs.selected),

				m('.options',
					{style: {display : state.active ? 'block' : 'none'}},
					attrs.options.map(option =>
						m('.option',
							{
								tabIndex: 0,
								onclick: (e: Event) => {
									attrs.callback(option)
								},

								onkeypress: (e: KeyboardEvent) => {
									if (e.keyCode === 13 || e.keyCode === 32) {
										attrs.callback( option )
									}
								}
							},
							option
						)
					)
				)
			)
		]
	}
} as Mithril.Component<Attrs,State>

m.mount(document.body,
	{
		countries: ['UK', 'Canada', 'Germany', 'Romania'],

		country	 : '',

		view : ( { state } ) => [
			m( 'h1', 'Please select a country' ),

			m( Select, {
				options	: state.countries,
				selected : state.country,
				callback : selection =>
					state.country = selection
			} ),

			(
				state.country
			? m( 'p', 'You selected ', state.country )
			: null
			),

			m( 'button', 'Done' )
		]
	}
)
