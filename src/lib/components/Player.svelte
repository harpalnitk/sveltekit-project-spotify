<script lang="ts" context="module">
    // to play only one song at a time
    // all instances of this component will share this variable vallue
	let current: HTMLAudioElement;
</script>

<script lang="ts">
	import { Pause, Play } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	type Track = SpotifyApi.TrackObjectFull | SpotifyApi.TrackObjectSimplified;
	export let track: Track;

	const dispatch = createEventDispatcher<{
		play: { track: Track };
		pause: { track: Track };
	}>();

	let audio: HTMLAudioElement;
	let paused = true;

	function onPlay() {
        // pause the currently playing track
		if (current && current !== audio) {
			current.currentTime = 0;
			current.pause();
		}
		current = audio;
		dispatch('play', { track });
	}
	function onPause() {
		dispatch('pause', { track });
	}
</script>

<div class="player">
    <!-- preload none because on album we might have lot of tracks 
    and we don't want to pre-load all -->
	<audio
		on:play={onPlay}
		on:pause={onPause}
		bind:this={audio}
		bind:paused
		controls
		src={track.preview_url}
		preload="none"
	/>
    <!-- button just contains an icon so with aria label 
    we need to describe what the button does  -->
	<button
		aria-label={paused ? `Play ${track.name}` : `Pause ${track.name}`}
		on:click={() => {
			if (paused) {
				audio.play();
			} else {
				audio.pause();
			}
		}}
	>
		{#if paused}
			<Play color="var(--text-color)" focusable="false" aria-hidden />
		{:else}
			<Pause color="var(--text-color)" focusable="false" aria-hidden />
		{/if}
	</button>
</div>

<style lang="scss">
	.player {
		audio {
            //hide html audio player
			display: none;
            // when js is disabled in the browser by user
            :global(html.no-js) & {
                display: block;
                width: 100%;
            }
		}
		button {
			width: 12px;
			height: 12px;
			padding: 0;
			background: none;
			border: none;
			cursor: pointer;
			:global(svg) {
				fill: var(--text-color);
				width: 12px;
				height: 12px;
                
			}
            :global(html.no-js) & {
                display: none;
            }
		}
	}
</style>