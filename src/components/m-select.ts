import * as mithril from 'mithril';
import * as m from 'mithril'

export interface Option {
	value: string
	label?: string
	component?: Mithril.Component<any,any>
}

interface Attrs {
	options: Option[]
	label?: string
	defaultValue?: string
	class?: string
	onSelect?: (value: string) => void
}

interface State {
	value?: string
	isOpen: boolean
	isFocused: boolean
	focusListener: EventListener
	blurListener: EventListener
	dom: HTMLElement
	toggle (this: State, options: Option[]): void
	open (this: State, options: Option[]): void
	close (this: State): void
}

/**
 * Standalone event handler that can be bound, then attached
 * and detached on component remove.
 */
function onFocus (this: MSelect, el: HTMLElement, e: FocusEvent) {
	console.log('global focus event element:', e.target)
	if (e.target instanceof Node && el.contains(e.target)) {
		console.log('child focus event')
		this.isFocused = true
	}
}

/**
 * Standalone event handler
 */
function onBlur (this: MSelect, el: HTMLElement, e: FocusEvent) {
	console.log('global blur event element:', e.target)
	if (e.target instanceof Node && el.contains(e.target)) {
		console.log('child blur event')
		this.isFocused = false
		// Elements will blur THEN focus, so there is a moment where none of the
		// select's elements will be focused. In order to prevent closing the
		// select in these cases, we delay a frame to be sure no elements
		// are going to be focused and that the select should really close.
		requestAnimationFrame(() => {
			if (this.isOpen && !this.isFocused) {
				this.isOpen = false
				m.redraw()
			}
		})
	}
}

type MSelect = Mithril.Component<Attrs,State> & State

/**
 * m-select Component
 */
export default {
	value: undefined,
	isOpen: false,
	isFocused: false,
	focusListener: undefined as any,
	blurListener: undefined as any,
	dom: undefined as any,

	oninit ({attrs: {defaultValue, options}}) {
		if (defaultValue) {
			if (typeof defaultValue !== 'string') {
				console.warn("defaultValue must be a string")
				return
			}
			const o = options.find(o => o.value === defaultValue)
			if (!o) {
				console.warn("defaultValue does not exist in supplied MSelect Options")
				return
			}
			this.value = defaultValue
		}
	},

	oncreate ({dom}) {
		this.focusListener = onFocus.bind(this, dom)
		window.addEventListener('focus', this.focusListener, true)
		this.blurListener = onBlur.bind(this, dom)
		window.addEventListener('blur', this.blurListener, true)
		this.dom = dom as HTMLElement
	},

	onremove() {
		window.removeEventListener('focus', this.focusListener, true)
		window.removeEventListener('blur', this.blurListener, true)
	},

	view ({attrs: {label, options, onSelect, class: klass}}) {
		let headLabel = label
		if (this.value) {
			headLabel = (options.find(o => this.value === o.value) as Option).label
		}
		if (!headLabel) {
			if (options && options.length > 0) {
				headLabel = options[0].label
			} else {
				headLabel = ''
			}
		}

		return (
			m('.m-select', {class: klass},
				m('.m-select-head',
					{
						tabIndex: '0',
						onclick: (e: MouseEvent) => {
							if (!this.isOpen) e.preventDefault()
							this.toggle(options)
							console.log("head clicked. isOpen:", this.isOpen)
						},
						onkeyup: (e: KeyboardEvent) => {
							if (e.keyCode === 32) {
								this.toggle(options)
								console.log("head space pressed. isOpen:", this.isOpen)
							} else if (e.keyCode === 27) {
								if (this.isOpen) {
									this.close()
									// Re-focus head on close
									requestAnimationFrame(() => {
										(this.dom.childNodes[0] as HTMLElement).focus()
									})
								}
							}
						}
					},
					headLabel
				),
				m('.m-select-body',
					{class: this.isOpen ? 'm-select-body-open' : undefined},
					m('.m-select-options',
						options.map((o, index) =>
							m('.m-select-option',
								{
									tabIndex: '-1',
									onclick: (e: Event) => {
										this.value = o.value
										this.isFocused = false
										this.close()
										// Re-focus head on close
										requestAnimationFrame(() => {
											(this.dom.childNodes[0] as HTMLElement).focus()
										})
										onSelect && onSelect(o.value)
									},
									onkeydown: (e: KeyboardEvent) => {
										if (e.keyCode === 13) {
											// Enter selects
											this.value = o.value
											this.isFocused = false
											this.close()
											// Re-focus head on close
											requestAnimationFrame(() => {
												(this.dom.childNodes[0] as HTMLElement).focus()
											})
											onSelect && onSelect(o.value)
										} else if (e.keyCode === 27) {
											// Escape closes
											this.close()
											// Re-focus head on close
											requestAnimationFrame(() => {
												(this.dom.childNodes[0] as HTMLElement).focus()
											})
										} else if (e.keyCode === 37 || e.keyCode === 38) {
											// Left or up keys - focus previous
											const i = pmod(index - 1, options.length)
											const elOpt = this.dom.childNodes[1].childNodes[0].childNodes[i] as HTMLElement
											console.log(`focusing [${i}]:`, elOpt)
											// Must delay a frame before focusing
											requestAnimationFrame(() => {
												elOpt.focus()
											})
										} else if (e.keyCode === 39 || e.keyCode === 40) {
											// Right or down keys - focus next
											const i = pmod(index + 1, options.length)
											const elOpt = this.dom.childNodes[1].childNodes[0].childNodes[i] as HTMLElement
											console.log(`focusing [${i}]:`, elOpt)
											requestAnimationFrame(() => {
												elOpt.focus()
											})
										}
									}
								},
								o.component ? o.component : o.label || ''
							)
						)
					)
				)
			)
		)
	},

	toggle (options) {
		if (!this.isOpen) {
			this.open(options)
		} else {
			this.close()
		}
	},

	open (options) {
		this.isOpen = true
		// When the component is opened, the idea is to focus
		// either the currently selected option or the first one
		// (like a native browser select.)
		// Then we want to allow the arrow keys to move up & down.
		if (options && options.length > 0) {
			let i = 0
			if (this.value) {
				i = options.findIndex(o => o.value === this.value) as number
			} else {
				i = 0
			}
			const elOpt = this.dom.childNodes[1].childNodes[0].childNodes[i] as HTMLElement
			console.log(`focusing [${i}]:`, elOpt)
			// Must delay a frame before focusing
			requestAnimationFrame(() => {
				elOpt.focus()
			})
		}
	},

	close() {
		this.isOpen = false
	}

} as MSelect

/**  Always positive modulus */
function pmod (n: number, m: number) {
	return ((n % m + m) % m)
}
