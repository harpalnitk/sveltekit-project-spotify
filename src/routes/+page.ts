import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, parent }) => {
        //get data from root layout using parent
    //in root layout user is returned
	//data from layout is also available in pages and layouts
    //data from all parent layouts (including nested)
    //here we destructure the root layout returned data
    // to extract user
    const {user} = await parent();
    // our own endpoint

    // we want to await all requests simultaneously
	const newReleases =  fetch('/api/spotify/browse/new-releases?limit=6');
	const featuredPlaylists =  fetch('/api/spotify/browse/featured-playlists?limit=6');
	const userPlaylists =  fetch(`/api/spotify/users/${user?.id}/playlists?limit=6`);

    //fetching all categories in spotify
	const catsRes = await fetch(`api/spotify/browse/categories`);
	const catsResJSON: SpotifyApi.MultipleCategoriesResponse | undefined = catsRes.ok
		? await catsRes.json()
		: undefined;


        // selecting 3 random categories from all categories
        // sort(() => 0.5 - Math.random())   shuffles items in an array
	const randomCats = catsResJSON
		? catsResJSON.categories.items.sort(() => 0.5 - Math.random()).slice(0, 3)
		: [];

	const randomCatsPromises = randomCats.map((cat) =>
		fetch(`/api/spotify/browse/categories/${cat.id}/playlists?limit=6`)
	);

    const [
        newReleasesRes,
         featuredPlaylistsRes,
          userPlaylistsRes,
           ...randomCatsRes] =
    await Promise.all([
        newReleases,
         featuredPlaylists,
          userPlaylists,
           ...randomCatsPromises]);

           //since we are not awaiting newReleasesRes.json()
           // we need to typecast into a Promise 
           // typecasting will enable auto completion
return {
    newReleases: newReleasesRes.ok
        ? (newReleasesRes.json() as Promise<SpotifyApi.ListOfNewReleasesResponse>)
        : undefined,
    featuredPlaylists: featuredPlaylistsRes.ok
        ? (featuredPlaylistsRes.json() as Promise<SpotifyApi.ListOfFeaturedPlaylistsResponse>)
        : undefined,
    userPlaylists: userPlaylistsRes.ok
        ? (userPlaylistsRes.json() as Promise<SpotifyApi.ListOfUsersPlaylistsResponse>)
        : undefined,
    homeCategories: randomCats,
    categoriesPlaylists: Promise.all(
        randomCatsRes.map((res) =>
            res.ok ? (res.json() as Promise<SpotifyApi.CategoryPlaylistsResponse>) : undefined
        )
    )
};

};