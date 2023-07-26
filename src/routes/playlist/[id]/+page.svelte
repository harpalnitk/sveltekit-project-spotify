<script lang="ts">
	import { page } from '$app/stores';
	import { Button, ItemPage } from '$components';
	import TrackList from '$components/TrackList.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let isLoading = false;

	$: color = data.color;
	$: playlist = data.playlist;
	$: tracks = data.playlist.tracks;
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
			alert(resJSON.error.message || 'Could not load data!');
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
</style>