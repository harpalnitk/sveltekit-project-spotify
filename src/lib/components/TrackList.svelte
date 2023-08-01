<script lang="ts">
	import { msToTime } from '$helpers';
	import { Clock8, ListPlus, ListX, Router  } from 'lucide-svelte';
	import {Player, Button} from '$components';
	import playingGif from '$assets/playing.gif';
	import { tippy } from '$actions';
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import {toasts} from '$stores';
	import { hideAll } from 'tippy.js';
	import { invalidate } from '$app/navigation';

	let currentlyPlaying: string | null = null;
	let isPaused: boolean = false;

	// to disable add track button while adding track
	//however we can add one track after the other  we need 
	// an array of bolean states
	let isAddingToPlaylist: string[] = [];
	let isRemovingFromPlaylist: string[] = [];


	export let tracks: SpotifyApi.TrackObjectFull[] | SpotifyApi.TrackObjectSimplified[];
    // if user is owner of playlist then remove track button will appear
	//else add track button will appear
	// not for albums therefore making it optional by giving a deafult value of false
	export let isOwner: boolean = false;
	export let userPlaylists: SpotifyApi.PlaylistObjectSimplified[] | undefined;

</script>

<div class="tracks">
	<div class="row header">
		<div class="number-column">
			<span class="number">#</span>
		</div>
		<div class="info-column">
			<span class="track-title">Title</span>
		</div>
		<div class="duration-column">
			<Clock8 aria-hidden focusable="false" color="var(--light-gray)"/>
		</div>
		<div class="actions-column" class:is-owner={isOwner}/>
	</div>
	{#each tracks as track, index}
		<div class="row" class:is-current={currentlyPlaying === track.id}>
			<div class="number-column">
				{#if currentlyPlaying === track.id && !isPaused}
				<img class="playing-gif" src={playingGif} alt="" />
			{:else}
				<span class="number">{index + 1}</span>
			{/if}
				<div class="player">
					<!-- track is input and on:play and on:pause are outputs  
					to player componnet -->
					<Player track={track} on:play={(e) => {
						currentlyPlaying = e.detail.track.id;
						isPaused = false;
					}}
					on:pause={(e) => {
						// onPause will also run to pause the track that
						//was previously playing
						// so we need to check that the track which we pause
						// is the currently playing track and then only
						// we set ispaused variable to true
						isPaused = e.detail.track.id === currentlyPlaying;
					}}/>
				</div>
			</div>
			<div class="info-column">
				<div class="track-title">
					<h4>{track.name}</h4>
					{#if track.explicit}
						<span class="explicit">Explicit</span>
					{/if}
				</div>
				<p class="artists">
					{#each track.artists as artist, artistIndex}
						<a href="/artist/{artist.id}">{artist.name}</a>
                        <!-- add a comma only if we are not at the last artist  -->
                        {#if artistIndex < track.artists.length - 1}{', '}{/if}
					{/each}
				</p>
			</div>
			<div class="duration-column">
				<span class="duration">{msToTime(track.duration_ms)}</span>
			</div>
			<div class="actions-column" class:is-owner={isOwner}>
				{#if isOwner}

				<!-- only if user isowner of playlist he can remove tracks from the playlist  -->
				<!-- here the action can be placed in playlist/[id] Route because 
				playlistId is not dynamic (selected by user) as was in the case of add  -->
				<form method="POST" action="/playlist/{$page.params.id}?/removeItem"
				use:enhance={({ cancel }) => {
					if (isRemovingFromPlaylist.includes(track.id)) {
						cancel();
					}
					isRemovingFromPlaylist = [...isRemovingFromPlaylist, track.id];
					return ({ result }) => {
						if (result.type === 'error') {
							toasts.error(result.error.message);
						}
						if (result.type === 'redirect') {
							const url = new URL(`${$page.url.origin}${result.location}`);
							const error = url.searchParams.get('error');
							const success = url.searchParams.get('success');
							if (error) {
								toasts.error(error);
							}
							if (success) {
								toasts.success(success);
								// ivalidate the url of load function of playlist page
								// to load the playlist page again
								invalidate(`/api/spotify/playlists/${$page.params.id}`);
							}
						}
						isRemovingFromPlaylist = isRemovingFromPlaylist.filter((t) => t !== track.id);
					};
				}}>
					<input hidden name="track" value={track.id} />
					<button
						type="submit"
						title="Remove {track.name} from playlist"
						aria-label="Remove {track.name} from playlist"
						class="remove-pl-button"
						disabled={isRemovingFromPlaylist.includes(track.id)}
					>
						<ListX aria-hidden focusable="false" />
					</button>
				</form>
				{:else}
					<button
						title="Add {track.name} to a playlist"
						aria-label="Add {track.name} to a playlist"
						class="add-pl-button"
						disabled={!userPlaylists}
						use:tippy={{
							content: document.getElementById(`${track.id}-playlists-menu`) || undefined,
							allowHTML: true,
							trigger: 'click',
							interactive: true,
							theme: 'menu',// our own theme
							placement: 'bottom-end',
							onMount: () => {
								const template = document.getElementById(`${track.id}-playlists-menu`);
								if (template) {
									template.style.display = 'block';
								}
							}
						}}
					>
						<ListPlus aria-hidden focusable="false" />
					</button>
					{#if userPlaylists}
					<div class="playlists-menu" id="{track.id}-playlists-menu" style="display: none;">
						<div class="playlists-menu-content">

<!--if we put our action in playlist/[id]/page.Server.ts then problem is
	that our action is dynamic based on the playlist selected by the user
	from the dropdown. If js is disabled then that action will not
	work. therefore we will put our action directly inside playlist only
	
	action ="/playlist/{playlistId}?/addItem" 

redirect={$page.url.pathname} added because path playlist has not .svelte 
page to render so we need to pass the path of the page 
which needs to be rendered when action is complete
-->

	<form method="POST" action="/playlist?/addItem&redirect={$page.url.pathname}"
	use:enhance={({ cancel }) => {
		if (isAddingToPlaylist.includes(track.id)) {
			cancel();
		}
		// maintain a list of tracks being added so that
		//user cannot click the add button once the earlier request
		//for same track is in progress
		isAddingToPlaylist = [...isAddingToPlaylist, track.id];
		return ({ result }) => {
			if (result.type === 'error') {
				toasts.error(result.error.message);
			}
			if (result.type === 'redirect') {

				//$page.url.origin is localhost:5173
				//${result.location is the redirect url with error or success message
				
				// THIS APPROACH is so that when js is disabled we can present messages
				// otherwise in page.server.ts file we can send message in fail()

				// when js is disabled messages are handled in root layout file
				const url = new URL(`${$page.url.origin}${result.location}`);
				const error = url.searchParams.get('error');
				const success = url.searchParams.get('success');
				if (error) {
					toasts.error(error);
				}
				if (success) {
					toasts.success(success);
					hideAll();
				}
			}
			//after adding remove track if from the array
			isAddingToPlaylist = isAddingToPlaylist.filter((t) => t !== track.id);
		};
	}}>
								<input hidden value={track.id} name="track" />
								<div class="field">
									<select aria-label="Playlist" name="playlist">
										{#each userPlaylists as playlist}
											<option value={playlist.id}>{playlist.name}</option>
										{/each}
									</select>
								</div>
								<div class="submit-button">
									<Button 
									element="button" 
									type="submit"
									disabled={isAddingToPlaylist.includes(track.id)}>
										Add <span class="visually-hidden"> {track.name} to selected playlist.</span>
									</Button>
								</div>
							</form>
						</div>
					</div>
					{/if}
				{/if}
			
			</div>
		</div>
	{/each}
</div>

<style lang="scss">
	.tracks {
		.row {
			display: flex;
			align-items: center;
			padding: 7px 5px;
			border-radius: 4px;
			// for mobile small screens when js is disabled
			@include breakpoint.down('md'){
				:global(html.no-js) & {
                    flex-direction: column;
					background-color: rgba(255,255,255,0.03);
					padding: 20px;
					margin-bottom: 20px;
				}
			}
			&.is-current {
				.info-column .track-title h4,
				.number-column span.number {
					color: var(--accent-color);
				}
			}
			&.header {
				border-bottom: 1px solid var(--border);
				border-radius: 0px;
				padding: 5px;
				margin-bottom: 15px;
				//header not shown for small screens when js is disabled
				@include breakpoint.down('md'){
				:global(html.no-js) & {
					display: none;
				}}
				.track-title {
					color: var(--light-gray);
					font-size: functions.toRem(12);
					text-transform: uppercase;
				}
				.duration-column :global(svg) {
					width: 16px;
					height: 16px;
				}
			}
			&:not(.header) {
				&:hover {
					background-color: rgba(255, 255, 255, 0.05);
					// on hover show player and hide number and gif
					.number-column {
						.player {
							display: block;
						}
						span.number{
							display: none;
							:global(html.no-js) &{
								display: block;
							}
						}
						.playing-gif {
							display: none;
						}
					}
				}
			}
			.number-column {
				width: 30px;
				display: flex;
				justify-content: flex-end;
				margin-right: 15px;
				span.number {
					color: var(--light-gray);
					font-size: functions.toRem(14);
				}
				.playing-gif {
					width: 12px;
				}
				.player {
					display: none;
				}
				:global(html.no-js) & {
					width: 200px;
					display: flex;
					align-items: center;

					@include breakpoint.down('md'){
						width: 100%;
						margin-right: 0;
						margin-bottom: 15px;
					}
					.player {
					display: block;
					width: 100%;
					margin-left: 10px;
				}
				}
			}
			.info-column {
				flex: 1;
				@include breakpoint.down('md'){
				:global(html.no-js) & {
					width: 100%;
				}}
				.track-title {
					display: flex;
					align-items: center;
					h4 {
						margin: 0;
						font-size: functions.toRem(15);
						font-weight: 400;
						line-height: 1;
					}
					span.explicit {
						text-transform: uppercase;
						font-size: functions.toRem(8);
						margin-left: 10px;
						border: 1px solid;
						padding: 2px 3px;
						border-radius: 2px;
						line-height: functions.toRem(10);
						color: var(--light-gray);
					}
				}
				.artists {
					color: var(--light-gray);
					font-size: functions.toRem(13);
					margin: 7px 0 0;
					line-height: 1;
					a {
						color: inherit;
						text-decoration: none;
					}
				}
			}
			.duration-column {
				@include breakpoint.down('md'){
				:global(html.no-js) & {
					width: 100%;
					margin: 10px 0;
				}}
				span.duration {
					color: var(--light-gray);
					font-size: functions.toRem(14);
				}
			}
			.actions-column {
				width: 30px;
				margin-left: 15px;
				// if user is owner instead of form there will be remove track button
				// however if user is not owner add track form will be there
				// and it will require more width than 30px
				&:not(.is-owner){
					:global(html.no-js) & {
						width: 200px;
						// in mobile select dropdown should
						// cover the entire width
						@include breakpoint.down('md'){
							margin-left: 0;
							width: 100%;
						}
					}
				}
				// if js is disabled add track button will not be shown
				// but the tippy generated form will be shown directly
				.add-pl-button{
					:global(html.no-js) & {
						display: none;
					}
				}
				.playlists-menu{
					:global(html.no-js) & {
						display: block !important;
					}
				}
				.add-pl-button,.remove-pl-button {
					background: none;
					border: none;
					padding: 5px;
					cursor: pointer;
					:global(svg) {
						stroke: var(--text-color);
						vertical-align: middle;
						width: 22px;
						height: 22px;
					}
					&:disabled {
						opacity: 0.8;
						cursor: not-allowed;
					}
				}
				.playlists-menu-content {
					// padding around tippy pop up 
					padding: 15px;
					:global(html.no-js) & {
						// tippy pop up is not there we have direct 
						// drop down and add button 
						padding: 0;
					}
					form{
						:global(html.no-js) & {
							// put select playlist dropdown and add 
							//button next to each other 
                          display: flex;
						  align-items: center;
					}
					}
					.field {
						:global(html.no-js) & {
							flex: 1;
						}
						select {
							width: 100%;
							height: 35px;
							border-radius: 4px;
						}
					}
					.submit-button {
						margin-top: 10px;
						text-align: right;
						:global(html.no-js) & {
							margin-top: 0;
							margin-left: 10px;
						}
					}
				}
			}
		}
	}
</style>