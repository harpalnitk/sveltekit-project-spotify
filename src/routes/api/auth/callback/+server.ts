import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	console.log(event);
	return new Response();
};
