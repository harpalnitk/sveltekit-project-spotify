<script lang="ts">
	import { page } from '$app/stores';
	import {  invalidateAll } from '$app/navigation';
	import { Button, ItemPage, PlaylistForm, TrackList, Modal  } from '$components';
	import { Heart } from 'lucide-svelte';
	// ActionData from types generated in +page.server.ts file Actions
	// PageData from both page.ts and page.server.ts files
	import type { ActionData, PageData } from './$types';
	import type { ActionData as EditActionData } from './edit/$types';
	import { applyAction, enhance } from '$app/forms';
	import { toasts } from '$stores';
	import MicroModal from 'micromodal';
	import { tick } from 'svelte';
	//import { tick } from 'svelte';

	export let data: PageData;
	export let form: ActionData | EditActionData;// contain data that we return in our actions
// we are receiving form data from two forms follow/unfollow form 
// and edit playlist form


    let isLoading = false;
	let isLoadingFollow= false;
	// for focussing on follow/unfollow button using tab navigation
	// after click
	let followButton: Button<'button'>;

	$: color = data.color;
	$: playlist = data.playlist;
	$: tracks = data.playlist.tracks;
	$: isFollowing = data.isFollowing;
	$: currentPage = $page.url.searchParams.get('page') || 1;

// tracks have limit=100(we get only 100 tracks in 
//one go from spotify),total= 300,next(url to fetch next 
//set of 100 tracks)


 // data.playlist.tracks contain array of object which have tracks
 // so we need to extract those tracks
 //little different from what we had in albums page
	let filteredTracks: SpotifyApi.TrackObjectFull[];

	$: {
		filteredTracks = [];
		tracks.items.forEach((item) => {
			if (item.track) filteredTracks = [...filteredTracks, item.track];
		});
	}

	// built in javascript function
	const followersFormat = Intl.NumberFormat('en', { notation: 'compact' });


	const loadMoreTracks = async () => {
		if (!tracks.next) return;
		isLoading = true;
		const res = await fetch(tracks.next.replace('https://api.spotify.com/v1/', '/api/spotify/'));
		const resJSON = await res.json();
		if (res.ok) {
			tracks = { ...resJSON, items: [...tracks.items, ...resJSON.items] };
		} else {
			//alert(resJSON.error.message || 'Could not load data!');
			toasts.error(resJSON.error.message || 'Could not load data!')
		}
		isLoading = false;
	};
</script>

<ItemPage
	title={playlist.name}
	image={playlist.images.length > 0 ? playlist.images[0].url : undefined}
	{color}
	type={playlist.type}
>

<!-- named slot  -->
	<div slot="meta">
		<!-- description can be in html format 
		so adding @html -->
		<p class="playlist-description">{@html playlist.description}</p>
		<p class="meta">
			<span>{playlist.owner.display_name}</span>
			<span>{followersFormat.format(playlist.followers.total)} Followers</span>
			<span>{playlist.tracks.total} Tracks</span>
		</p>
	</div>

	<!-- follow unfollow button  -->
	<div class="playlist-actions">
		{#if data.user?.id === playlist.owner.id}
			<Button element="a" variant="outline"
			href="/playlist/{playlist.id}/edit"
			on:click={(e)=>{
				//if js is enabled prevent default of anchor tag
				//and show modal instead
                 e.preventDefault();
				 MicroModal.show('edit-playlist-modal');
			}}
			>Edit Playlist</Button>
		<!-- if isFollowing is null then it means that the request 
		which we sent in load function of page.ts to check whether the 
		user is following playlist or not has failed and in that case we won't 
		show anything -->
			{:else if isFollowing !== null}
			<form
				class="follow-form"
				method="POST"
				action={`?/${isFollowing ? 'unFollowPlaylist' : 'followPlaylist'}`}
			    use:enhance={
				//this function will be called when we submit our action
				()=>{
				//! By having custom function default behavior will not happen	
					
				isLoadingFollow = true;
				
				
				
				//this function will be called when action is completed with fail,redirect or success
				return async ({result})=>{
				// return ({update})=>{
					isLoadingFollow = false;
					//will resume default behavior of use:enhance
					
					//update();

					// there is delay in updation of ui of button because
					//the page is invalidated and load funcion will run 
					//again to get the playlist data


					// apply action will update form prop
					// this function(applyAction) will also perform default behavior
					//of use:enhance but it will not invalidate our page and therefor
					//button will not be updated on it's own
					// so we will do this
					
					if(result.type === 'success'){
						isFollowing = !isFollowing;
					// in this case we don't need to invalidate the page;
					//therefore we will use applyAction() instead of update()
					await applyAction(result);
					}else if(result.type === 'failure'){
                           toasts.error(result.data?.followError);
						   await tick();
					} else {
						await applyAction(result);
					}
					followButton.focus();
                   // because when we follow or unfollow a playlist
				   // it should be removed from user's playlists displayed
				   // in the sidebar which are loaded in the root layout
				   //invalidateAll() will run the load function of the
				   // root layout
					invalidateAll();
				}
				}}
				>
				<Button 
				bind:this={followButton}
				element="button" type="submit" variant="outline" disabled={isLoadingFollow}>
					<Heart aria-hidden focusable="false" fill={isFollowing ? 'var(--text-color)' : 'none'} />
					{isFollowing ? 'Unfollow' : 'Follow'}
					<!-- for accessibility  -->
					<span class="visually-hidden">{playlist.name} playlist</span>
				</Button>
				<!-- followForm is identifier for this form  -->
				{#if form && 'followForm' in form && form?.followError}
					<p class="error">{form.followError}</p>
				{/if}
			</form>
		{/if}
	</div>

	{#if playlist.tracks.items.length > 0}
		<TrackList tracks={filteredTracks}
		isOwner={data.user?.id === playlist.owner.id} 
		userPlaylists= {data.userAllPlaylists?.filter((pl)=> pl.owner.id === data.user?.id)}/>
		<!-- data.userAllPlaylists from root layout 
		however userAllPlaylists will contain both playlists
	     one which user follows and one wof which user is owner
         so we need to filter to pass only those of which user is owner -->
		{#if tracks.next}
		<div class="load-more">
			<Button element="button" variant="outline" disabled={isLoading} on:click={loadMoreTracks}
				>Load More <span class="visually-hidden">Tracks</span></Button
			>
		</div>
	{/if}
<!-- if js is disabled we will show user next and prev buttons instead 
of load more button  -->

	<div class="pagination">
		<div class="previous">
			{#if tracks.previous}
			<!-- in string literals because it needs to be string 
			`${Number(currentPage) - 1}`
			-->
				<Button
					variant="outline"
					element="a"
					href="{$page.url.pathname}?{new URLSearchParams({
						page: `${Number(currentPage) - 1}`
					}).toString()}">← Previous Page</Button
				>
			{/if}
		</div>
		<div class="next">
			{#if tracks.next}
				<Button
					variant="outline"
					element="a"
					href="{$page.url.pathname}?{new URLSearchParams({
						page: `${Number(currentPage) + 1}`
					}).toString()}">Next Page →</Button
				>
			{/if}
		</div>
	</div>
	{:else}
		<div class="empty-playlist">
			<p>No items added to this playlist yet.</p>
			<Button element="a" href="/search">Search for Content</Button>
			<Button element="a" href="/playlists">View all Playlists</Button>
		</div>
	{/if}
</ItemPage>

<Modal id="edit-playlist-modal" title="Edit {playlist.name}">

<!-- action passed because we are invoking action from a different route  -->
	<PlaylistForm
		action="/playlist/{playlist.id}/edit"
		{playlist}
		form={form && 'editForm' in form ? form : null}
		on:success={() => {
			MicroModal.close('edit-playlist-modal');
			//run load function again
			// invalidate can be called wither with an identifier 
			// or any of the URL in the load function
			
			//invalidate(`/api/spotify/playlists/${playlist.id}`);

			// since we are also fetching allPlaylists in root layout
			// for displaying in sidebar
			// as such on edit of a playlist we need to load the
			//entire app again we need to call invalidateAll
			// instead of just invalidate
			invalidateAll()
		}}
	/>
</Modal>

<style lang="scss">
	.empty-playlist {
		text-align: center;
		margin-top: 40px;
		p {
			font-size: functions.toRem(22);
			font-weight: 600;
		}
		:global(a) {
			margin: 0 10px;
		}
	}
	.playlist-description {
		color: var(--light-gray);
		font-size: functions.toRem(18);
		margin-bottom: 0;
	}
	.meta {
		font-size: functions.toRem(13);
		margin-top: 10px;
		span {
			margin-right: 5px;
			&:first-child {
				font-weight: 600;
			}
		}
	}
	.load-more {
		padding: 15px;
		text-align: center;
		// if js is disabled load more button will not work
		// we need to show user normal pagination links
		:global(html.no-js) &{
			display: none;
		}
	}
	.pagination {
		display: none;
		margin-top: 40px;
		justify-content: space-between;
		:global(html.no-js) & {
			display: flex;
		}
	}
	.playlist-actions {
		display: flex;
		justify-content: flex-end;
		margin: 10px 0 30px;
		.follow-form {
			:global(.button) {
				display: flex;
				align-items: center;
				:global(svg) {
					margin-right: 10px;
					width: 22px;
					height: 22px;
				}
			}
			p.error {
				text-align: right;
				color: var(--error);
				font-size: functions.toRem(14);
			}
		}
	}
</style>