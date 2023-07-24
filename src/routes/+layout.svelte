<script lang="ts">
    //sets standard css like padding etc on all pages
    import 'modern-normalize/modern-normalize.css';
    //global styles
    import '../styles/main.scss';

    import type { LayoutData } from './$types';
    import {Navigation} from '$components';
	import {Header} from '$components';

	let topbar: HTMLElement;
	let scrollY: number;
	let headerOpacity = 0;


	// opacity will be 1 when we have scrolled equal to the height of topbar
	$: if (topbar) {
		headerOpacity = scrollY / topbar.offsetHeight < 1 ? scrollY / topbar.offsetHeight : 1;
	}


export let data: LayoutData;
$: user = data.user;
</script>

<svelte:window bind:scrollY />

<div id="main">
	{#if user}
		<div id="sidebar">
			<Navigation desktop={true} />
		</div>
	{/if}
	<div id="content">
		{#if user}
		<div id="topbar" bind:this={topbar}>
			<!-- div to control background color of top bar on scroll
			
			{`${headerOpacity}`}  passed as string  because it is being 
		interpreted as false (0) on inital render on the server-->
			<div
				class="topbar-bg"
				style:background-color="var(--header-color)"
				style:opacity={`${headerOpacity}`}
			/>
			<Header/>
		</div>
		{/if}
		<main id="main-content" class:logged-in={user} style="height:1000px">
			<slot />
		</main>
	</div>
</div>

<style lang='scss'>

	#main {
		display: flex;
		
		#content {
			flex: 1;
			
			#topbar {
				position: fixed;
				height: var(--header-height);
				padding: 0 15px;
				display: flex;
				align-items: center;
				width: 100%;
				z-index: 100;
				.topbar-bg {
					position: absolute;
					width: 100%;
					height: 100%;
					top: 0;
					left: 0;
					z-index: -1;// need to make sure background is below content
				}
				@include breakpoint.up('md') {
					padding: 0 30px;
					width: calc(100% - var(--sidebar-width));
				}
			}

			main#main-content {
				padding: 30px 15px 60px;
				@include breakpoint.up('md') {
					padding: 30px 30px 60px;
				}
				// on logout we don'y have header
				// so we don't need padding top
				&.logged-in {
					padding-top: calc(30px + var(--header-height));
				}
			}
		}
	}
</style>
