import { SPOTIFY_BASE_URL } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
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
	},
	removeItem: async ({ request, cookies, params }) => {
		const data = await request.formData();
		const track = data.get('track');
		const playlist = params.id;
// no need for redirect because we are redirecting to the same playlist
// from where we are removing the track
		const res = await fetch(`${SPOTIFY_BASE_URL}/playlists/${playlist}/tracks`, {
			method: 'DELETE',
			body: JSON.stringify({
				uris: [`spotify:track:${track}`]
			}),
			headers: {
				Authorization: `Bearer ${cookies.get('access_token')}`
			}
		});

		if (!res.ok) {
			throw redirect(303, `/playlist/${playlist}?error=${res.statusText}`);
		}

		throw redirect(303, `/playlist/${playlist}?success=Track removed successfully!`);
	}
};