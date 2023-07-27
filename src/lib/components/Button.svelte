<script lang="ts">

//Using typescript to extend native html attributes
import type {HTMLAnchorAttributes, HTMLButtonAttributes} from 'svelte/elements';

//generics are types that can be specified at runtime using user input
type Element = $$Generic<'button' | 'a'>

interface ButtonComponentElements {
	button: HTMLButtonAttributes;
	a: HTMLAnchorAttributes;
}


	type $$Props = ButtonComponentElements[Element] & {
		element: Element;
		variant?: 'solid' | 'outline' | 'danger';
		className?: string;
	}


	// with all the above code we can use native html attributes like 
// href, disabled etc on our custom button element with autocomplete 
// and errors



	export let element: 'button' | 'a';
	export let variant: 'solid' | 'outline' | 'danger' = 'solid';
	export let className: string = '';

	// focus exported //in follow unfollow button on clicking we loose
	//focus so exporting focus here, so that we can use it in /playlist/[id] page
	//in follow/ubfollow button (navigation using tab)

	let node:HTMLAnchorElement | HTMLButtonElement;
	export function focus(){
          node.focus();
	}
</script>

<!-- button can be button or anchor tag  
thus we can use if condition and return either a button or a tag

BETTER WAY

use svelte:element

which has this and this can receive html element

-->
<!-- svelte-ignore a11y-no-static-element-interactions -->

<!-- {...$$restProps} any other props passed to this component  -->
<svelte:element
    bind:this={node}
	this={element}
	class="button button-{variant} {className}"
	on:click
	{...$$restProps}
	
>
	<slot />
</svelte:element>

<style lang="scss">
	.button {
		display: inline-block;
		border: none;
		font-weight: 600;
		font-size: functions.toRem(14);
		border-radius: 20px;
		cursor: pointer;
		padding: 7px 15px;
		text-decoration: none;
		&.button-solid {
			background-color: var(--accent-color);
			color: #000;
			border: 2px solid var(--accent-color);// to have same height as outline button when used together
		}
		&.button-outline {
			background: none;
			color: var(--text-color);
			border: 2px solid;
		}
		&.button-danger {
			background-color: var(--error);
			color: #fff;
			border: 2px solid var(--error);
		}
		&:disabled {
			opacity: 0.8;
			cursor: not-allowed;
		}
		&:hover {
			&.button-solid,
			&.button-danger {
				background-image: linear-gradient(rgba(0, 0, 0, 0.1) 0 0);
			}
			&.button-outline {
				background-image: linear-gradient(rgba(255, 255, 255, 0.1) 0 0);
			}
		}
		&:active {
			&.button-solid,
			&.button-danger {
				background-image: linear-gradient(rgba(255, 255, 255, 0.1) 0 0);
			}
			&.button-outline {
				background-image: linear-gradient(rgba(255, 255, 255, 0.2) 0 0);
			}
		}
	}
</style>