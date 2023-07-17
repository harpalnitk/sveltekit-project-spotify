import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ cookies, request }) => {
	cookies.delete('refresh_token', { path: '/' });
	cookies.delete('access_token', { path: '/' });

    // if request is through JS enabled
	if (request.headers.get('accept') === 'application/json') {
		return json({ success: true });
	}
    // if request is through js disabled
	throw redirect(303, '/login');
};