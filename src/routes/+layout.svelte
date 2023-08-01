<script lang="ts">
    //sets standard css like padding etc on all pages
    import 'modern-normalize/modern-normalize.css';
    //global styles
    import '../styles/main.scss';

    import type { LayoutData } from './$types';
    import {Navigation, Toasts} from '$components';
	import {Header} from '$components';
	import {page} from '$app/stores';
	import NProgress from 'nprogress';
	import { hideAll } from 'tippy.js';
    import 'nprogress/nprogress.css';
	import { afterNavigate, beforeNavigate } from '$app/navigation';

	//for Modals
	import MicroModal from 'micromodal';
	import { browser } from '$app/environment';
	import { X } from 'lucide-svelte';
	

	// we just need bar and not the spinner
	// color and styles added in main.css
	NProgress.configure({ showSpinner: false });

	//For Modals
	// Only in browser 
	if(browser){
		MicroModal.init();
	}
	
    	
	let topbar: HTMLElement;
	let scrollY: number;
	let headerOpacity = 0;


	// opacity will be 1 when we have scrolled equal to the height of topbar
	$: if (topbar) {
		headerOpacity = scrollY / topbar.offsetHeight < 1 ? scrollY / topbar.offsetHeight : 1;
	}


export let data: LayoutData;
// error thrown by playlist action addItem when adding song to 
// a playlist
$: hasError = $page.url.searchParams.get('error');
$: hasSuccess = $page.url.searchParams.get('success');

$: user = data.user;
$: userAllPlaylists = data.userAllPlaylists;

afterNavigate(() => {
		NProgress.done();
	});

	beforeNavigate(() => {
		NProgress.start();
		hideAll();
	});
</script>

<svelte:window bind:scrollY />
<svelte:head>
	<title>Spotify {$page.data.title ? ` - ${$page.data.title}` : ''}</title>

</svelte:head>


<!-- if user does not want to tab through all links of 
	menu and direcctly want to go to links of main 
	page..functionality implemented in layout.svelte
	 file 
	
	styled in main.css file-->

{#if user}
<a href="#main-content" class="skip-link">Skip to Content</a>
{/if}

<Toasts/>


<div id="main">
	{#if user}
		<div id="sidebar">
			<Navigation desktop={true} {userAllPlaylists}/>
		</div>
	{/if}
	<div id="content">
		{#if hasError || hasSuccess}
			<div class="message" 
			role="status" 
			class:error={hasError} 
			class:success={hasSuccess}>
                {hasError ?? hasSuccess}
				<!--  on clicking close button 
					redirected to same url without any search params  -->
				<a href="{$page.url.pathname}" class="close">
				<X aria-hidden focusable='false'/> 
				<span class='visually-hidden'>
					Close message
				</span>
			</a>
			</div>
		{/if}
		{#if user}
		<div id="topbar" bind:this={topbar}>
			<!-- div to control background color of top bar on scroll
			
			{`${headerOpacity}`}  passed as string  because it is being 
		interpreted as false (0) on inital render on the server
	
	we are getting the header color based on average color calculated
	from album cover in routes/album/[id]/+page.ts file
	
	
	
	-->
			<div
				class="topbar-bg"
				style:background-color={$page.data.color ? $page.data.color: "var(--header-color)"}
				style:opacity={`${headerOpacity}`}
			/>
			<!-- in header we have another navigation to which we need to pass userAllPlaylists  -->
			<Header {userAllPlaylists}/>
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
		//keep sidebar and main content on top of each other 
		// if js is disabled
		:global(html.no-js) &{
			@include breakpoint.down('md'){
               display: block;
			}
		}
		
		#content {
			flex: 1;
			.message{
				position: sticky;
				z-index: 9999;
				padding: 10px 20px;
				top: 0;
				.close{
					position: absolute;
					right: 10px;
					top: 5px;
					&:focus{
						outline-color: #fff;
					}
					:global(svg){
						stroke: var(--text-color);
						vertical-align: middle;
					}
				}
				&.error{
					background-color: var(--error);
				}
				&.success{
					background-color: var(--accent-color);
				}
			}
			#topbar {
				position: fixed;
				height: var(--header-height);
				padding: 0 15px;
				display: flex;
				align-items: center;
				width: 100%;
				z-index: 100;
				:global(html.no-js) &{
			@include breakpoint.down('md'){
              position: sticky;
			  top:0;
			  background-color: var(--header-color);
			  height: auto; // to prevent user menu button
			  //which are always shown in header.svelt file
			  //from collapsing on each other
			  padding: 10px 20px;
			}
		}
				.topbar-bg {
					position: absolute;
					width: 100%;
					height: 100%;
					top: 0;
					left: 0;
					z-index: -1;// need to make sure background is below content
					// if the color from album is too light we want the background to be dark
					// so that links appear
					// 0.2 is opacity
					//0,0,0 is black color
					background-image: linear-gradient(rgba(0,0,0,0.2) 0 0);
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
					
					:global(html.no-js) &{
			         @include breakpoint.down('md'){
                     padding-top: 30px;
			}
		}
				}
			}
		}
	}
</style>
