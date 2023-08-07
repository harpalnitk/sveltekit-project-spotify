<!-- list=list(parameter matcher)
parameter matcher is stored in a file in src/params folder
and our file is list.ts -->

<!--  The URLs for listing page can be
section/new-releases
section/featured-playlists
category/[id]
profile/following
artist/[id]/album
artist/[id]/appears-on
artist/[id]/related-artists -->




<script lang="ts">
	import { Card, Pagination } from '$components';
	import { toasts } from '$stores';
	import type { PageData } from './$types';

	export let data: PageData;
	$: itemsData = data.data;

	let isLoading = false;

	const onLoadMoreItems = async () => {
		if (itemsData && 'next' in itemsData && itemsData.next) {
			isLoading = true;
			const res = await fetch(
				itemsData.next.replace('https://api.spotify.com/v1/', '/api/spotify/')
			);
			if (res.ok) {
				const resJSON = await res.json();
				const newData = resJSON.albums || resJSON.playlists || resJSON.artists || resJSON;
				itemsData = { ...newData, items: [...itemsData.items, ...newData.items] };
			} else {
				toasts.error('Could not load data!');
			}
			isLoading = false;
		}
	};
</script>

<div class="content">
	<h1>{data.title}</h1>
	{#if itemsData?.items}
		<div class="grid-items">
			{#each itemsData.items as item}
				<div class="grid-item">
					<Card {item} />
				</div>
			{/each}
		</div>
		<!-- related-artist response has no pagination so we check if we have next in response 
		and if yes then only we will display pagination component  -->
		{#if 'next' in itemsData}
		 <!-- for artists following response there is cursor pagination in response 
		 and only next and no previous so we need to modify our pagination component  -->
			<Pagination paginatedList={itemsData} on:loadmore={onLoadMoreItems} {isLoading} />
		{/if}
	{/if}
</div>

<style lang="scss">
	.grid-items {
		margin-bottom: 40px;
	}
	.content {
		padding-bottom: 60px;
	}
</style>