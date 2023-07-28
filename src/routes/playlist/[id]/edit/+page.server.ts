import { SPOTIFY_BASE_URL } from '$env/static/private';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ fetch, request, cookies, url, params }) => {
		const data = await request.formData();

		// in edit no need of userID
		const name = data.get('name');
		const description = data.get('description');


				// editForm:true added as identifier because on page we 
		// have thwo different forms 
		if (!name) {
			return fail(400, {
				name,
				description,
				nameError: 'Playlist name is required!',
				apiError: false,
				editForm:true
			});
		}

		const res = await fetch(`${SPOTIFY_BASE_URL}/playlists/${params.id}`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${cookies.get('access_token')}`
			},
			// bug in spotify API ; while editing if description is empty
			// it gives description is required error
			// so we send undefined instead of an empty string
			body: JSON.stringify({ name, description: description || undefined })
		});

		// editForm:true added as identifier because on page we 
		// have thwo different forms 
		if (!res.ok) {
			const errorJSON = await res.json();
			return fail(res.status, {
				name,
				description,
				apiError: errorJSON?.error?.message ?? 'An error has occurred',
				nameError: false,
				editForm:true
			});
		} else {
			// if url has redirect searchParam then only we will
			//redirect else we will send success( when we don't redirect actions
			// return success status ) 
			if (url.searchParams.has('redirect')) {
				throw redirect(303, `/playlist/${params.id}`);
			}
		}
	}
};
