import type { ParamMatcher } from '@sveltejs/kit';

// The URLs for listing page can be
//section/new-releases
//section/featured-playlists
//category/[id]
//profile/following
//artist/[id]/album
//artist/[id]/appears-on
//artist/[id]/related-artists




export const match: ParamMatcher = (param) => {
	return ['section', 'category', 'artist', 'profile'].includes(param);
};