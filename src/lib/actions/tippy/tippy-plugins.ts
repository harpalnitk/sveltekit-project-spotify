import tippy, { hideAll } from 'tippy.js';
import type { Props, Tippy, Plugin, LifecycleHooks, Instance } from 'tippy.js';

interface CustomProps {
	hideOnPopperBlur: boolean;
	hideOnEsc: boolean;
	hideOthersOnOpen: boolean;
}


// extending the props (input arguments) for tippy to include
//above 3 additional props
type FilteredProps = CustomProps & Omit<Props, keyof CustomProps | keyof LifecycleHooks>;

export type ExtendedProps = FilteredProps & LifecycleHooks<FilteredProps>;


// on focussing out of menu using tab; it closes the menu
export const hideOnPopperBlur: Plugin<ExtendedProps> = {
	name: 'hideOnPopperBlur',
	defaultValue: true,
	fn(instance) {
		return {
			onCreate() {
				instance.popper.addEventListener('focusout', (event) => {
					if (
						instance.props.hideOnPopperBlur &&
						event.relatedTarget &&
						!instance.popper.contains(event.relatedTarget as Node)
					) {
						instance.hide();
					}
				});
			}
		};
	}
};


// hide menu on clicking escape button
export const hideOnEsc: Plugin<ExtendedProps> = {
	name: 'hideOnEsc',
	defaultValue: true,
	fn({ hide, props }) {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') {
				hide();
			}
		}

		return {
			onShow() {
				if (props.hideOnEsc) {
					document.addEventListener('keydown', onKeyDown);
				}
			},
			onHide() {
				if (props.hideOnEsc) {
					document.removeEventListener('keydown', onKeyDown);
				}
			}
		};
	}
};

export const hideOthersOnOpen: Plugin<ExtendedProps> = {
	name: 'hideOthersOnOpen',
	defaultValue: true,
	fn(instance) {
		return {
			onShow() {
				if (instance.props.hideOthersOnOpen) {
					hideAll({ exclude: instance as unknown as Instance<Props> });
				}
			}
		};
	}
};

export default tippy as unknown as Tippy<ExtendedProps>;