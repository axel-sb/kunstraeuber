// #region  import export
import {
	// type LinksFunction,
	type LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import { NavLink, useLoaderData, useLocation } from '@remix-run/react'
import chalk from 'chalk'
import { Icon } from '#app/components/ui/icon.js'
import {
	getAny,
	getArtist,
	getStyle,
	getPlace,
	getDate,
	getColor,
} from '../resources+/search-data.server'
//import artworks from './artworks.index.css?url'
/* export const links: LinksFunction = () => [
	{ rel: 'stylesheet', href: artworks },
] */

/* //§ ..................................................  MARK: Loader
   This function is only ever run on the server. On the initial server render, it will provide data to the HTML document. On navigations in the browser, Remix will call the function via fetch from the browser.This means you can talk directly to your database, use server-only API secrets, etc. Any code that isn't used to render the UI will be removed from the browser bundle. */
export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const query = url.searchParams.get('search') ?? undefined
	const searchType = url.searchParams.get('searchType') ?? 'All'

	let data
	switch (searchType) {
		case 'all':
			data = await getAny(query)
			break
		case 'artist':
			data = await getArtist(query)
			break
		case 'style':
			data = await getStyle(query)
			break
		case 'place':
			data = await getPlace(query)
			break
		case 'date':
			data = await getDate(Number(query))
			break
		case 'color':
			data = await getColor((query ?? '').toString())
			break

		default:
			break /* = await getAny('Picasso') */
	}

	console.group(
		chalk.overline.underline(
			'║artworks.index - LOADER                         🚛',
		),
	)
	console.log(
		chalk.black(
			'url:',
			url,
			'searchType:',
			searchType,
			'❓ query:',
			query,
			'______________________',
		),
	)
	console.groupEnd()
	return json({ query, data })
}

// #endregion import export

//+                                            export default
// MARK: Export default
export default function ArtworksPage() {
	const { data, query } = useLoaderData<typeof loader>()
	const location = useLocation()

	console.group(chalk.bold('artworks.index ______________  LOCATION  🗺️'))
	console.log(chalk.red('data:', data))
	console.log(
		chalk.blue(
			'🟡 location →',
			Object.entries(location).map(([k, v]) => `${chalk.red(k)}: ${v}`),
		),
	)
	console.groupEnd()

	const currentQueryKey = location.search
		.split('&')
		.find((part) => part.startsWith('='))
		?.split('=')[1]

	/* //+ ___________________________________________  return  JSX ↓ */
	return (
		<>
			<main className="flex flex-col items-center overscroll-contain">
				<ul className="artworks-fade-in flex max-w-xl touch-pan-y list-none flex-col items-center justify-start gap-y-28 overflow-y-auto pb-28 pt-12">
					{data ? (
						data.map((artwork) => (
							<li
								key={artwork.id}
								className="flex max-h-fit snap-center items-center"
							>
								<NavLink
									className={({ isActive, isPending }) =>
										isActive ? 'active' : isPending ? 'pending' : ''
									}
									to={`./${artwork.id}`}
								>
									{artwork.title ? (
										<>
											<figure className="relative z-40 mx-auto grid max-h-full max-w-[281px] place-items-center gap-12 lg:max-w-[843px] lg:-translate-x-28">
												<img
													style={{
														maxHeight: 'calc(100dvh - 4rem)',
														maxWidth: 'clamp(10%, 281px, 100%)',
													}}
													alt={artwork.alt_text ?? undefined}
													key={artwork.id}
													src={artwork.image_url ?? '../dummy.jpeg'}
												/>
												{/*
                           //§   ..................................................   MARK: Figcaption
                           */}
												<figcaption className="lg:max-w-calc[100vw-1700px] z-50 flex w-full justify-start pt-8 lg:absolute lg:-right-8 lg:top-32 lg:max-w-fit lg:translate-x-full">
													<div className="relative mr-auto w-[calc(100%-2rem)] text-sm">
														<div className="max-w-[calc(100%-3rem)]">
															{artwork.title}
														</div>

														<div className="w-[calc(100%-2rem)] font-semibold opacity-50">
															{artwork.artist_title}
														</div>
														<Icon
															name="eye-open"
															className="icon-eye absolute -right-6 top-0 h-6 w-6 opacity-90 lg:hidden"
														/>
														<Icon
															name="arrow-right"
															className="icon-arrow hidden h-6 w-6 lg:ml-[calc(100%-3rem)] lg:mt-4 lg:block"
														/>
													</div>
												</figcaption>
											</figure>
										</>
									) : (
										<i>No Artworks found for query {query} </i>
									)}
								</NavLink>
							</li>
						))
					) : (
						//§   ..................................................   MARK: ❓❗️not found ❕
						<li className="w-15rem relative flex max-w-sm flex-wrap justify-center whitespace-pre text-lg text-yellow-50">
							<p className="px-4 font-normal opacity-100">
								Nothing found for query: <em> " {query} " </em>
							</p>
							<p className="px-4 font-semibold opacity-50">
								(search type: <em> " {currentQueryKey} " </em>)
							</p>
						</li>
					)}
				</ul>
			</main>
			<div className="relative flex">
				<h2 className="absolute -bottom-20 right-4 pb-4 text-center leading-none">
					<span className="font-semibold opacity-50">
						query{' '}
						<em className="font-normal opacity-100">
							{' '}
							{currentQueryKey}
							{': '}
						</em>{' '}
					</span>
					{query || ' '}{' '}
					{/* same as: {location.search.split('&')[0].split('=')[1]} */}
				</h2>
			</div>
		</>
	)
}
