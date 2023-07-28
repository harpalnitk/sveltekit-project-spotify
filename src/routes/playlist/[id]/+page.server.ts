import { SPOTIFY_BASE_URL } from '$env/static/private';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';


// actions run only on server 
export const actions: Actions = {

    // we are not sending any body
    // based on access token spotify will automatically add user id to the followers id
    // of this playlist
	followPlaylist: async ({ cookies, params, fetch }) => {
        //console.log('${params.id}', params.id);
		const res = await fetch(`${SPOTIFY_BASE_URL}/playlists/${params.id}/followers`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${cookies.get('access_token')}`
			}
		});
		if (!res.ok) {
            // validation errors are sent using fail
            // other method is redirect
			// followForm: true  identifier added because on page.svelte
			// we have two forms
			return fail(res.status, { followError: res.statusText, followForm: true });
		}
        // if we don't return anything it will be considered successful action
	},
	unFollowPlaylist: async ({ cookies, params, fetch }) => {
		const res = await fetch(`${SPOTIFY_BASE_URL}/playlists/${params.id}/followers`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${cookies.get('access_token')}`
			}
		});
		if (!res.ok) {
			return fail(res.status, { followError: res.statusText, followForm: true  });
		}
	}
};