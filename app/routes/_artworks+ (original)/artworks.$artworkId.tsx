// region imports
import { invariantResponse } from '@epic-web/invariant'
import { type Artwork } from '@prisma/client'
import {
	// type LinksFunction,
	type LoaderFunctionArgs,
	json,
	redirect,
	type MetaFunction,
	type ActionFunctionArgs,
} from '@remix-run/node'
import {
	NavLink,
	useFetcher,
	useLoaderData,
	useNavigate,
} from '@remix-run/react'
// import artworkId from 'artworkId.css?url'
import chalk from 'chalk'
import { type FunctionComponent } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.js'
import { getArtwork, updateArtwork } from '../resources+/search-data.server.tsx'

// #endregion imports
/* export const links: LinksFunction = () => [
	{ rel: 'stylesheet', href: artworkId },
] */

export const meta: MetaFunction<typeof loader> = () => {
	return [
		{ title: '* Kunsträuber Artwork Page' },
		{
			name: 'ArtworkId',
			content: `A single artwork`,
		},
	]
}

export const action = async ({ params }: ActionFunctionArgs) => {
	invariantResponse(params.artworkId, 'Missing artworkId param')

	await updateArtwork(parseInt(params.artworkId))

	return redirect(`./`)
}

//§§     ::::::::::::::::::::::::::::::::::::::::::    MARK: Loader

export const loader = async ({ params }: LoaderFunctionArgs) => {
	invariantResponse(params.artworkId, 'Missing artworkId param')
	const artwork = await getArtwork({ id: Number(params.artworkId) })
	if (!artwork) {
		throw new Response(
			"'getArtwork(id)': This Artwork (ID) was not found on the Server",
			{
				status: 404,
			},
		)
	}

	// The underscore _ is a convention used by some developers to indicate that the value at that position in the array is not going to be used. This is a way to "ignore" certain returned values when destructuring an array.

	const filteredArtwork: Artwork = Object.fromEntries(
		Object.entries(artwork).filter(
			([_, value]) => value != null && value !== '' && value !== 'none',
		),
	) as Artwork

	/* const colorHsl = artwork.colorHsl
	const colorHsl50 = `hsla(${artwork.color_h},${artwork.color_s}, ${artwork.color_l}, 0.5)`
	const colorHsla = (alpha: number) =>
		`hsla(${artwork.color_h},${artwork.color_s}, ${artwork.color_l}, ${alpha.toFixed(2)})`
	const colorHsl = artwork ? `${artwork.colorHsl}` : 'hsl(0deg 0% 65%)'*/
	console.group(
		chalk.blue.underline.overline('ArtworkId                           🧑🏻‍🎨'),
	)
	console.log(
		chalk.blue.bgWhite(
			Object.entries(filteredArtwork).map(([k, v]) => `${k}: ${v}\n`),
		),
	)
	console.groupEnd()

	return json({ artwork: filteredArtwork })
}

//§§          :::::::::::::::::::::::          MARK:ArtworkId

export default function ArtworkId() {
	const { artwork } = useLoaderData<typeof loader>()

	const colorHsl = `${artwork.colorHsl}`
	const colorLch = (colorHsl: string) => 'lch(from ' + `${artwork.colorHsl}` + ' l c h )'

	console.log(`colorLch 🔵⭕️🔵: ${colorLch}`)

	const colorHsla = (
		h: number = artwork.color_h ?? 0,
		s: number = artwork.color_s ?? 0,
		l: number = artwork.color_l ?? 0,
		a: number = 1,
	) => `hsl(from ${h}, ${s}, ${l}) / ${a}  ) ( h s l a)`

	const h = artwork.color_h

	console.log(`colorHsla 🔵⭕️🔵: ${colorHsla}`)

	__html: '<span class="font-bold opacity-60"> Artist:  </span> <br>' +
		artwork.artist_display

	const artist = {
		__html:
			'<span class="font-bold opacity-60"> Artist:  </span> <br>' +
			artwork.artist_display,
	}
	const description = {
		__html: artwork.description
			? '<span class="font-bold opacity-60">Description: </span>' +
				artwork.description
			: '',
	}
	// for back-button
	const navigate = useNavigate()

	//toggle details

	const handleClick = (e: { target: any }) => {
		e.target.classList.toggle('open')
	}

	//§§ :::::::::::::::::::::::  MARK: return

	return (
		<div
			className="wrapper relative flex h-dvh w-screen justify-center overflow-y-hidden"
			style={{
				backgroundColor: `${colorHsla(h ? h : 0, 5, 35, 0.25)}`,
				backgroundImage: `linear-gradient(50deg,
                ${colorHsla(h ? h : 0, 25, 50, 0.1)},
                ${colorHsla(h ? h : 0, 25, 15, 1)},
                ${colorHsla(h ? h : 0, 25, 10, 1)},
                ${colorHsla(h ? h : 0, 25, 10, 1)},
                ${colorHsla(h ? h : 0, 25, 15, 1)},
                ${colorHsla(h ? h : 0, 25, 50, 0.1)}
                ),
                linear-gradient(50deg,
                ${colorHsla(h ? h : 0, 30, 50, 0.75)},
                ${colorHsla(h ? h : 0, 25, 0, 0)},
                ${colorHsla(h ? h : 0, 25, 0, 0)},
                ${colorHsla(h ? h : 0, 25, 0, 0)},
                ${colorHsla(h ? h : 0, 25, 0, 0)},
                ${colorHsla(h ? h : 0, 25, 50, 0.4)}
                )`,
				backgroundBlendMode: 'color-burn',
			}}
		>
			<div
				className="wrapper relative flex h-dvh w-screen justify-center overflow-y-hidden"
				style={{
					backgroundImage: `conic-gradient(from 331deg at 10% -5%,
                    ${colorHsla(h ? h : 0, 25, 0, 0)},
                    ${colorHsla(h ? h : 0, 25, 20, 0.1)} 40%,
                    ${colorHsla(h ? h : 0, 25, 50, 0.35)} 47%,
                    ${colorHsla(h ? h : 0, 25, 50, 0.5)} 50%,
                    ${colorHsla(h ? h : 0, 25, 50, 0.25)} 55%,
                    ${colorHsla(h ? h : 0, 10, 5, 0.05)} 70%,
                    ${colorHsla(h ? h : 0, 25, 0, 0)}
                    ),
                    linear-gradient(335deg, #0000, #000 40%, #000 60%, #0001 70%,  #0000
                    )`,
				}}
			>
				{/* //§§ ::::::::::::::::::::::: MARK: main */}
				<main className="item group relative flex min-h-full w-screen max-w-[calc(843px+2rem)] flex-col items-center justify-between overflow-y-auto overscroll-y-contain bg-scroll px-4 pb-4 pt-4">
					<figure className="relative mt-[clamp(2rem,15%,20%)] flex h-full w-full flex-col items-center justify-start lg:w-screen">
						<img
							className="max-h-[70%] max-w-[calc(100%-2rem)] rounded-sm object-contain"
							alt={artwork.alt_text ?? undefined}
							key={artwork.id}
							src={artwork.image_url ?? '../../../four-mona-lisas-sm.jpg'}
						/>

						{/*
                    // #region details // §§  ::::::::::::::::::::::::::::::::::
                    */}

						<figcaption className="mx-auto flex h-full w-full flex-col items-center justify-end">
							<details
								id="artwork-info"
								className="group h-full w-full overflow-y-auto sm:max-w-[843px] lg:absolute lg:-right-20 lg:top-0 lg:overflow-x-visible"
							>
								{/* //§§ ..........  MARK:Summary */}

								<summary
									onClick={(e) => {
										handleClick(e)
									}}
									className="relative flex h-full flex-col items-center justify-between gap-4 pt-12 group-has-[details[open]]:h-min lg:mt-4 lg:max-w-sm lg:items-start lg:justify-start lg:px-4"
								>
									<div className="summary-title mt-[clamp(5%,40%,70%)] grow-0 text-xl group-has-[details[open]]:hidden lg:pl-2">
										{artwork.title}
									</div>
									<div className="summary-artist grow text-center font-medium opacity-50 group-has-[details[open]]:hidden lg:pl-2">
										{artwork.artist_display}
									</div>
									{/* //§§ ..........  MARK:Toolbar */}

									<div className="toolbar flex w-full max-w-[843px] grow-[2] items-end justify-between text-4xl group-has-[details[open]]:static group-has-[details[open]]:translate-y-0 lg:-translate-y-20 lg:justify-start lg:gap-10">
										<Button
											className="btn-back inline-flex h-10 w-10 group-has-[details[open]]:hidden"
											variant="ghost"
											size="ghost"
											style={{ color: colorHsl }}
											onClick={() => {
												navigate(-1)
											}}
										>
											<Icon
												name="cross-1"
												size="xl"
												className="saturate-200"
												style={{ color: colorHsl, filter: 'brightness(1.5)' }}
											/>
										</Button>

										<div
											className="btn-close relative hidden h-10 w-10 hover:bg-slate-900 group-has-[details[open]]:inline-flex"
											style={{ color: colorHsl, filter: 'brightness(1.5)' }}
										>
											<Icon
												name="cross-1"
												size="xl"
												className="saturate-200"
												style={{ color: colorHsl, filter: 'brightness(1.5)' }}
											/>
										</div>

										<NavLink
											className={({ isActive, isPending }) =>
												isActive ? 'active' : isPending ? 'pending' : ''
											}
											to={`../artworks/zoom/${artwork.id}`}
										>
											<Icon
												name="zoom-in"
												className="pt-1.5 text-[2.85rem] saturate-200"
												size="font"
												style={{ color: colorHsl, filter: 'brightness(1.5)' }}
											/>
										</NavLink>

										<div
											className="info inline-flex h-10 w-10 group-has-[details[open]]:hidden"
											style={{ color: colorHsl, filter: 'brightness(1.5)' }}
										>
											<Icon
												name="info-circled"
												size="font"
												className="text-[2rem]"
											/>
										</div>

										<Favorite artwork={artwork} />
									</div>
								</summary>
								{/*https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path#specifications
                            //§§  ............................  !MARK:info data
							*/}

								<div className="expander" id="expander">
									<div className="expander-content min-h-0 grid-cols-1">
										<ul className="flex h-full flex-col gap-1 px-4 py-8 text-[.9rem]">
											<li className="span-title font-bold opacity-60">
												Title:
											</li>
											<li className="detail-content pb-4">{artwork.title}</li>
											<li
												dangerouslySetInnerHTML={artist}
												className="hyphens-auto pb-4"
											></li>

											{Object.entries(artwork)
												.filter(
													([key, value]) =>
														value &&
														value !== '' &&
														key !== 'id' &&
														key !== 'image_url' &&
														key !== 'alt_text' &&
														key !== 'Title' &&
														key !== 'Description' &&
														key !== 'Artist' &&
														key !== 'color_h' &&
														key !== 'color_s' &&
														key !== 'color_l' &&
														key !== 'Category' &&
														key !== 'width' &&
														key !== 'height' &&
														key !== 'image_id' &&
														key !== 'is_boosted' &&
														value !== 'none' &&
														value !== 'null' &&
														(key === 'Date' ||
															key === 'Place' ||
															key === 'Medium'),
												)

												.sort(([keyA], [keyB]) => {
													const order = ['Date', 'Place', 'Medium', ,]
													const indexA = order.indexOf(keyA)
													const indexB = order.indexOf(keyB)
													return indexA - indexB
												})
												.map(([key, value]) => (
													<li key={key}>
														<span className="font-bold opacity-60">{key}:</span>{' '}
														<span className="detail-content">{value}</span>
													</li>
												))}
											<li
												className="max-w-prose pt-4"
												dangerouslySetInnerHTML={description}
											></li>
											{Object.entries({
												Style: artwork.style_titles,
												Subject: artwork.subject_titles,
												Type: artwork.artwork_type_title,
												Technique: artwork.technique_titles,
												Provenance: artwork.provenance_text,
											})
												.filter(
													([_, value]) =>
														value &&
														value !== '' &&
														value !== 'none' &&
														value !== 'null',
												)
												.map(([key, value]) => (
													<li key={key}>
														<span className="font-bold opacity-60">{key}</span>
														{': '}
														<span className="detail-content">{value}</span>
													</li>
												))}
										</ul>
									</div>
								</div>
							</details>
							{/*
                        // #endregion DETAILS
                        */}
						</figcaption>
					</figure>
				</main>
			</div>
		</div>
	)
}

const Favorite: FunctionComponent<{
	artwork: Pick<Artwork, 'favorite'>
}> = ({ artwork }) => {
	const fetcher = useFetcher()
	const favorite = fetcher.formData
		? fetcher.formData.get('favorite') === 'true'
		: artwork.favorite
	console.log(
		chalk.bgGreen.white('🔵 favorite →'),
		favorite,
		chalk.white('🟡 fetcher.formData →', fetcher.formData),
	)
	const {
		artwork: { colorHsl: colorHsl },
	} = useLoaderData<typeof loader>()

	console.log('🔵 fetcher.formData →', fetcher.formData, '🔵')

	return (
		<fetcher.Form method="post" className="group-has-[details[open]]:hidden">
			<Button
				name="favorite"
				variant="ghost"
				size="ghost"
				className="h-10 w-10 group-has-[details[open]]:hidden"
				style={{ color: colorHsl as unknown as string, filter: 'brightness(1.5)' }}
			>
				{favorite ? (
					<Icon name="star-filled" size="xl" className="" />
				) : (
					<Icon name="star" size="xl" className="" />
				)}
			</Button>
		</fetcher.Form>
	)
}
