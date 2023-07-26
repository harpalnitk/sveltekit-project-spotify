<script lang="ts">
	import { getCopyrightSymbol } from '$helpers';
	import { Album } from 'lucide-svelte';
	import type { PageData } from './$types';
	import {ItemPage, TrackList} from '$components';

	export let data: PageData;

	$: album = data.album;
	$: color = data.color;
	// we also change the color of header based on this color in layout

</script>

<!-- color that we will pass to the album page will be determined
based on the average color of the album cover by using a npm package
called sharp on the server in an endpoint /api/average-color -->
<ItemPage
title={album.name}
	type={album.album_type}
	color={color}
	image={album.images.length > 0 ? album.images[0].url : undefined}>

	<!-- using named slot  -->
	<p class="meta" slot="meta">
		<span class="artists">
			{album.artists.map((artist) => artist.name).join(', ')}
		</span>
		<span class="date">{new Date(album.release_date).getFullYear()}</span>
		<span class="tracks-count"
			>{`${album.total_tracks} Track${album.total_tracks > 1 ? 's' : ''}`}</span
		>
	</p>



	<TrackList tracks={album.tracks.items}/>
	<div class="credits">
		<p class="date">
			{new Date(album.release_date).toLocaleDateString('en', {
				dateStyle: 'medium'
			})}
		</p>
		{#each album.copyrights as copyright}
			<p class="copyright">
				{getCopyrightSymbol(copyright.type)}
				{copyright.text}
			</p>
		{/each}
	</div>
</ItemPage>





<style lang="scss">
		.meta {
		font-size: functions.toRem(13);
		font-weight: 600;
		span {
			margin-right: 5px;
			&.tracks-count {
				font-weight: 400;
				margin: 0 0 0 5px;
				color: var(--light-gray);
			}
		}
	}
	.credits {
		margin-top: 40px;
		p {
			color: var(--light-gray);
			margin: 0;
			font-size: functions.toRem(11);
			&.date {
				font-size: functions.toRem(13);
			}
		}
	}
</style>
