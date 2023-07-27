<script lang="ts">
	import { page } from '$app/stores';
	import { Button, ItemPage } from '$components';
	import TrackList from '$components/TrackList.svelte';
	import { Heart } from 'lucide-svelte';
	import type { ActionData, PageData } from './$types';
	import { applyAction, enhance } from '$app/forms';
	import { toasts } from '$stores';

	export let data: PageData;
	export let form: ActionData;// contain data that we return in our actions

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
			<span>{followersFormat.format(playlist.followers.total)}</span>
			<span>{playlist.tracks.total} Tracks</span>
		</p>
	</div>

	<!-- follow unfollow button  -->
	<div class="playlist-actions">
		{#if data.user?.id === playlist.owner.id}
			<Button element="a" variant="outline">Edit Playlist</Button>
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

					// in this case we don't need to invalidate the page;
					//therefore we will use applyAction() instead of update()
					await applyAction(result);
					// apply action will update form prop
					// this function(applyAction) will also perform default behavior
					//of use:enhance but it will not invalidate our page and therefor
					//button will not be updated on it's own
					// so we will do this
					followButton.focus()
					if(result.type === 'success'){
						isFollowing = !isFollowing;
					}
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
				{#if form?.followError}
					<p class="error">{form.followError}</p>
				{/if}
			</form>
		{/if}
	</div>

	{#if playlist.tracks.items.length > 0}
		<TrackList tracks={filteredTracks} />
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