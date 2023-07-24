// import tippy, { type Props } from 'tippy.js';
// import 'tippy.js/dist/tippy.css';


// 	// actions are very similar to lifecycle functions except
// 	// that they are used on DOM elemnts and not svlete components

// 	//1. Initializing a 3rd party plugin on a DOM element
// 	//2. add custom event handlers on DOM elements

// export default function (node: HTMLElement, options?: Partial<Props>) {
// 	const instance = tippy(node, options);
// 	return {
// 		update(newOptions: Partial<Props>) {
// 			instance.setProps(newOptions);
// 		},
// 		destroy() {
// 			instance.destroy();
// 		}
// 	};
// }

// WITH PLUGINS


	// actions are very similar to lifecycle functions except
	// that they are used on DOM elemnts and not svlete components

	//1. Initializing a 3rd party plugin on a DOM element
	//2. add custom event handlers on DOM elements

import tippy, {
	type ExtendedProps,
	hideOnEsc,
	hideOnPopperBlur,
	hideOthersOnOpen
} from './tippy-plugins';
import 'tippy.js/dist/tippy.css';

export default function (node: HTMLElement, options?: Partial<ExtendedProps>) {
	const plugins = [hideOnEsc, hideOnPopperBlur, hideOthersOnOpen];
	const _options = options ? { ...options, plugins } : { plugins };
	const instance = tippy(node, _options);
	return {
		update(newOptions: Partial<ExtendedProps>) {
			const _newOptions = newOptions ? { ...newOptions, plugins } : { plugins };
			instance.setProps(_newOptions);
		},
		destroy() {
			instance.destroy();
		}
	};
}