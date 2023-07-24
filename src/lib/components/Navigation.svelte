<script lang="ts">
	import { Home, Search, ListMusic, Menu,X, type Icon } from 'lucide-svelte';
	import { tick, type ComponentType } from 'svelte';
	import logo from '$assets/Spotify_Logo_RGB_White.png';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { beforeNavigate } from '$app/navigation';
	import {IconButton} from '$components';

	export let desktop: boolean;
	let isMobileMenuOpen = false;

	//desktop mode menu is always open and for mobile mode
	// it is opened depending on the var isMobileMenuOpen
	$: isOpen = desktop || isMobileMenuOpen;

	// to move the focus to close button when menu is opened
	// and vice versa
	
	// let openMenuButton: HTMLButtonElement;
	let openMenuButton: IconButton;
	let closeMenuButton: IconButton;

	// to implememnt FOCUS TRAP
	// i.e. while navigating through tab we need to focus back on
	//close button after the focus is shifted from last link
	//rather than focus moving to links on the main content page
	// i.e. focus must remain within opened sidebar menu
	//in mobile mode
	let lastFocusableElement: HTMLAnchorElement;

	const menuItems: { path: string; label: string; icon: ComponentType<Icon> }[] = [
		{
			path: '/',
			label: 'Home',
			icon: Home
		},
		{
			path: '/search',
			label: 'Search',
			icon: Search
		},
		{
			path: '/playlists',
			label: 'Playlists',
			icon: ListMusic
		}
	];

	const openMenu = async () => {
		isMobileMenuOpen = true;
		await tick();
		closeMenuButton.getButton().focus();
	};
	const closeMenu =  () => {
		isMobileMenuOpen = false;
		//tick not needed here because button is already there
		// and it's visibility is not hidden
		openMenuButton.getButton().focus();
	};


	//! IMPLEMENTING FOCUS TRAP

	// if we are on close button and we click shift + Tab
	const moveFocusToBottom = (e: KeyboardEvent) => {
		if (desktop) return;
		if (e.key === 'Tab' && e.shiftKey) {
			e.preventDefault();
			lastFocusableElement.focus();
		}
	};
	const moveFocusToTop = (e: KeyboardEvent) => {
		if (desktop) return;
		if (e.key === 'Tab' && !e.shiftKey) {
			e.preventDefault();
			closeMenuButton.getButton().focus();
		}
	};

	const handleEscape = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			closeMenu();
		}
	};


	// as we click on search or playlists page
	//we need to close the mobile navigation menu
	beforeNavigate(() => {
		isMobileMenuOpen = false;
	});
</script>

<svelte:head>
	<!-- if mobile sidebar menu is open we must disable scrolling 
	of main content -->
	{#if !desktop && isMobileMenuOpen}
		<style>
			body {
				overflow: hidden;
			}
		</style>
	{/if}
</svelte:head>

<div class="nav-content" class:desktop class:mobile={!desktop}>
	{#if !desktop && isMobileMenuOpen}
		<div 
		class="overlay"
		 on:click={closeMenu}
		  transition:fade={{ duration: 200 }}
		  on:keyup={handleEscape} />
	{/if}
	<nav aria-label="Main">
		{#if !desktop}
		<IconButton icon={Menu} 
		label="Open Menu"
		on:click={openMenu} 
		aria-expanded={isOpen} 
		bind:this={openMenuButton}
		class="menu-button"/>
			<!-- <button on:click={openMenu} aria-expanded={isOpen} bind:this={openMenuButton}> Open </button> -->
		{/if}
		<!-- 
			style:visibility={isOpen ? 'visible' : 'hidden'}
			for improving accessibilty i.e. tab buttons will not move through 
		this menu if it is hidden 
	also, add visibility to trnsitions in css -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div
			class="nav-content-inner"
			class:is-hidden={!isOpen}
			style:visibility={isOpen ? 'visible' : 'hidden'}
			on:keyup={handleEscape}
		>
			{#if !desktop}
				<!-- <button 
				on:click={closeMenu} 
				bind:this={closeMenuButton}
				on:keydown={moveFocusToBottom}> Close </button> -->
				<IconButton icon={X} label="Close Menu"
				on:click={closeMenu} 
				bind:this={closeMenuButton}
				on:keydown={moveFocusToBottom}
				class="close-menu-button"
				/>
			{/if}
			<img src={logo} class="logo" alt="Spotify" />
			<ul>
				{#each menuItems as item, index}
				{@const iconProps = {
					focusable: 'false',
					'aria-hidden': true,
					color: 'var(--text-color)',
					size: 26,
					strokeWidth: 2
				}}
					<li class:active={item.path === $page.url.pathname}>
						<!-- for last menu item bind to lastFocusableElement 
						to implememnt focus trap -->
						{#if menuItems.length === index + 1}
						<a bind:this={lastFocusableElement} href={item.path} on:keydown={moveFocusToTop}>
							<svelte:component this={item.icon} {...iconProps} />
							{item.label}
						</a>
					{:else}
						<a href={item.path}>
							<svelte:component this={item.icon} {...iconProps} />
							{item.label}
						</a>
					{/if}
					</li>
				{/each}
			</ul>
		</div>
	</nav>
</div>

<style lang="scss">
	.nav-content {
		// light background on main content when the
		//mobile sidebar menu is opened
		.overlay {
			position: fixed;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
			background-color: var(--sidebar-color);
			opacity: 0.75;
			z-index: 100;
			@include breakpoint.up('md') {
				display: none;
			}
		}
		.logo {
			max-width: 100%;
			width: 130px;
		}
		.nav-content-inner {
			padding: 20px;
			min-width: var(--sidebar-width);
			background-color: var(--sidebar-color);
			height: 100vh;
			overflow: auto;
			display: none;
			ul {
				padding: 0;
				margin: 20px 0 0;
				list-style: none;
				li {
					&.active {
						a {
							opacity: 1;
						}
					}
					a {
						display: flex;
						align-items: center;
						text-decoration: none;
						color: var(--text-color);
						font-size: functions.toRem(14);
						font-weight: 500;
						padding: 5px;
						margin: 10px 0;
						opacity: 0.7;
						transition: opacity 0.2s;
						&:hover,
						&:focus {
							opacity: 1;
						}
						//icon will be rendered as svg by the package
						:global(svg) {
							margin-right: 12px;
						}
					}
				}
			}
		}
		&.desktop {
			position: sticky; // when main content
			//is scrolled sidebar should not scroll
			top: 0;
			.nav-content-inner {
				@include breakpoint.up('md') {
					display: block;
				}
			}
		}
		&.mobile .nav-content-inner {
			position: fixed;
			top: 0;
			left: 0;
			z-index: 100;
			// transition: transform 400ms, opacity 400ms, visibility 400ms;
			transition: transform 400ms, opacity 400ms;
			&.is-hidden {
				// transition moved here because visibility needs ony when
				//menu is hidden not when it is opened 
				transition: transform 400ms, opacity 400ms, visibility 400ms;
				transform: translateX(-100%);
				opacity: 0;
			}
			// display only for medium and small screens
			@include breakpoint.down('md') {
				display: block;
			}
		}
		:global(.menu-button) {
			@include breakpoint.up('md') {
				display: none;
			}
		}
		:global(.close-menu-button) {
			position: absolute;
			right: 20px;
			top: 20px;
		}
	}
</style>
