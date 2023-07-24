import tippy, { type Props } from 'tippy.js';
import 'tippy.js/dist/tippy.css';


	// actions are very similar to lifecycle functions except
	// that they are used on DOM elemnts and not svlete components

	//1. Initializing a 3rd party plugin on a DOM element
	//2. add custom event handlers on DOM elements

export default function (node: HTMLElement, options?: Partial<Props>) {
	const instance = tippy(node, options);
	return {
		update(newOptions: Partial<Props>) {
			instance.setProps(newOptions);
		},
		destroy() {
			instance.destroy();
		}
	};
}