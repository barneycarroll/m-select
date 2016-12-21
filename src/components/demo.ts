import * as m from 'mithril'
import mSelect, {Option} from './m-select'

const countries = [
	{value: "canada", label: "Canada"},
	{value: "germany", label: "Germany"},
	{value: "romania", label: "Romania"},
	{value: "uk", label: "United Kingdom"},
	{value: "usa", label: "United States"}
]

const colours = [
	{value: "red", label: "Red"},
	{value: "blue", label: "Blue"},
	{value: "green", label: "Green"},
	{value: "yellow", label: "Yellow"},
	{value: "orange", label: "Orange"},
	{value: "pink", label: "Pink"}
]

interface State {
	country: string
	colour: string
}

export default {
	country: "",
	colour: "",

	view() {
		return [
			m('p', "Country: " + this.country),
			m('p', "Colour: " + this.colour),
			m(mSelect,
				{
					// This select has a default label until an option is picked
					label: "Select Country",
					options: countries,
					class: "app-select",
					onSelect: (val: string) => {
						const c = countries.find(c => c.value === val)
						this.country = c ? c.label : ""
					}
				}
			),
			m(mSelect,
				{
					// This select defaults to the first option
					options: colours,
					class: "app-select",
					onSelect: (val: string) => {
						const c = colours.find(c => c.value === val)
						this.colour = c ? c.label : ""
					}
				}
			)
		]
	}
} as Mithril.Component<{},State>
