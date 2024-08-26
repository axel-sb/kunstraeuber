// region imports
import { invariantResponse } from '@epic-web/invariant'
import { type Artwork } from '@prisma/client'
import {
	type LinksFunction,
	type LoaderFunctionArgs,
	json,
	redirect,
	type MetaFunction,
	type ActionFunctionArgs,
} from '@remix-run/node'
import {
	Link,
	NavLink,
	useFetcher,
	useLoaderData,
	useNavigate,
} from '@remix-run/react'
import artworkId from './artworkId.css?url'
import chalk from 'chalk'
import { type FunctionComponent } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.js'
import { getArtwork, updateArtwork } from '../resources+/search-data.server.tsx'

// #endregion imports

export const links: LinksFunction = () => [
	{ rel: 'stylesheet', href: artworkId },
]

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

//§    ..........................................................................    MARK: Loader

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

const Favorite: FunctionComponent<{
	artwork: Pick<Artwork, 'favorite'>
}> = ({ artwork }) => {
	const fetcher = useFetcher()
	const favorite = fetcher.formData
		? fetcher.formData.get('favorite') === 'true'
		: artwork.favorite

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
				className="inline-flex items-end pt-0.5 group-has-[details[open]]:hidden"
				style={{
					color: colorHsl as unknown as string,
					filter: 'brightness(1.75)',
					strokeDasharray: 50,
				}}
			>
				{favorite ? (
					<Icon name="star-filling" size="xl" className="animated" />
				) : (
					<Icon name="star" size="xl" className="opacity-50" />
				)}
			</Button>
		</fetcher.Form>
	)
}

//§    ...............................................   MARK: export default

export default function ArtworkId() {
	const { artwork } = useLoaderData<typeof loader>()

	const colorHsl = `${artwork.colorHsl}`

	const artist = {
		__html:
			'<span class="font-medium opacity-60">Artist:  </span> <br>' +
			artwork.artist_display,
	}

	const description = {
		__html:
			artwork.description && artwork.description !== 'null'
				? '<span class="font-medium opacity-60">Description: </span>' +
					artwork.description
				: '',
	}
	// for back-button
	const navigate = useNavigate()

	let gradient = {
		backgroundImage: `conic-gradient(
			from 331deg at 10% -5%,
			oklch (from colorHsl)  l c h  / 0),
			oklch (from colorHsl)  l c h  / 0.1) 40%,
			oklch (from colorHsl)  l c h  / 0.4) 44%,
			oklch (from colorHsl)  l c h  / 0.7) 47%,
			oklch (from colorHsl)  l c h  / 1) 50%,
			oklch (from colorHsl)  l c h  / 0.7) 53%,
			oklch (from colorHsl)  l c h  / 0.4) 56%,
			oklch (from colorHsl)  l c h  / 0.1) 60%,
			oklch (from colorHsl)  l c h  / 0))`,
	} as React.CSSProperties

	let gradientDetailsOpen = {
		backgroundImage: `conic-gradient(
			from 331deg at 10% -5%,
			oklch (from colorHsl)  l c h  / 0),
			oklch (from colorHsl)  l c h  / 0.1) 40%,
			oklch (from colorHsl)  l c h  / 0.2) 44%,
			oklch (from colorHsl)  l c h  / 0.3) 47%,
			oklch (from colorHsl)  l c h  / 0.4) 50%,
			oklch (from colorHsl)  l c h  / 0.3) 53%,
			oklch (from colorHsl)  l c h  / 0.2) 56%,
			oklch (from colorHsl)  l c h  / 0.1) 60%,
			oklch (from colorHsl)  l c h  / 0))`,
	} as React.CSSProperties

	const varImageUrl = {
		'--img': 'url(imageUrl : string)',
	} as React.CSSProperties

	const lyr0 = {
		'--lyr0': '',
	} as React.CSSProperties

	const lyr1 = {
		'--lyr1': 'radialGradient(circle, #000, #fff) 0 0/6px 6px space',
		position: 'relative',
		overflow: 'hidden',
		filter: 'contrast(19)',
	} as React.CSSProperties

	console.log(
		chalk.blue.bgWhite('varImageUrl, lyr0, lyr1', varImageUrl, lyr0, lyr1),
	)
	//§ ...............................................................  MARK: return  ‾‾‾ ⮐

	return (
		<>
			<div
				className="wrapper absolute flex h-dvh w-screen flex-col items-center from-black/50 to-black/25 bg-[length:100%_300%] bg-no-repeat has-[details[open]]:hidden"
				style={gradient}
			></div>

			<div
				className="wrapper absolute hidden h-dvh w-screen flex-col items-center from-black/50 to-black/25 bg-[length:100%_300%] bg-no-repeat has-[details[open]]:flex"
				style={gradientDetailsOpen}
			></div>

			{/* //§ ............. ..............................................  MARK: Main ❗️
			 */}
			<main className="group mx-auto flex h-[100dvh] w-screen max-w-[calc(843px+8rem)] flex-col items-center justify-between overscroll-y-contain">
				<figure className="relative flex w-full flex-1 flex-col items-center justify-around py-20">
					{/*
            //§ ...........................................................  MARK: ArtworkWrapper
				 */}
					<div
						className="artwork-wrapper flex h-full w-full max-w-[calc(843px+8rem)] flex-col items-center justify-center px-4 lg:px-16"
						style={{ containerType: 'inline-size' }}
					>
						<img
							className="mx-auto max-h-[80dvh] max-w-[clamp(281px,_843px_+_8rem,_calc(100vw-2rem))] object-contain object-center pb-8 group-has-[details[open]]:max-h-44 group-has-[details[open]]:max-w-[50%] group-has-[details[open]]:px-4"
							alt={artwork.alt_text ?? undefined}
							key={artwork.id}
							src={artwork.image_url ?? '../../../four-mona-lisas-sm.jpg'}
							style={{
								boxShadow: `
                0px 0px 0px 0.5px #fff , 0px 0px 1px 1px #fff ,
                2px 4px 2px 0 oklch(from colorHsl 0.25 c h / 1),
                4px 8px 22px 0 oklch(from colorHsl 0.15 c h / 1)`,
							}}
						/>
						{/*
            //§    ................................................   MARK:  figcaption
						 */}

						<figcaption className="flex h-12 w-full max-w-[calc(843px+8rem)] flex-shrink flex-col items-center justify-start">
							{/*
               // #region details // §  ...............................  MARK: Details
            */}
							<details className="group flex h-full w-full flex-1 overflow-auto sm:max-w-[843px] lg:max-w-[calc(843px+8rem)]">
								{/*
                //§ ..................................................  MARK:Summary
								 */}

								<summary
									/* onClick={(e) => {
										handleClick(e)
									}} */
									className="relative z-10 mx-auto flex w-full flex-grow list-none gap-4 pt-6 group-has-[details[open]]:h-min lg:mt-4"
								>
									<div className="wrapper grid min-w-full grid-cols-[3.5rem_calc(100%-7rem)_3.5rem] grid-rows-[3rem] items-center justify-between justify-items-end gap-8">
										{/*
                    //§ ............................................  MARK: btn-back ⏪
										 */}

										<Button
											className="btn btn-back group-has-[details[open]:hidden z-50 col-[1_/_2] inline-flex h-10 w-10 cursor-pointer justify-self-start rounded-full text-yellow-50/50"
											variant="ghost"
											size="ghost"
											onClick={() => {
												navigate(-1)
											}}
										>
											<Icon
												name="cross-1"
												size="xl"
												className=""
												// style={{ color: colorHsl }}
											/>
										</Button>

										{/*
                    //§ .....................................................  MARK: title 📜
										 */}

										<div className="title col-[2_/_3] text-center text-xl leading-snug">
											{artwork.title}
										</div>

										{/* //§ ..........................................  MARK: info-circled ℹ️
										 */}

										<Button
											className="group-has-[details[open]:hidden inline-flex h-10 w-10 cursor-pointer justify-self-start rounded-full text-yellow-50/50"
											variant="ghost"
											size="ghost"
										>
											<Icon
												name="info-circled"
												size="lg"
												className=""
												style={{ color: colorHsl }}
											/>
										</Button>
									</div>

									<div className="image-caption hidden h-full w-full flex-wrap justify-center gap-4 group-has-[details[open]]:h-12 group-has-[details[open]]:items-center group-has-[details[open]]:justify-between">
										<div className="hidden h-10 w-10 items-center justify-center group-has-[details[open]]:inline-flex">
											<Icon
												name="cross-circled"
												size="font"
												className="text-[1.4rem]"
												style={{ color: colorHsl }}
											/>
										</div>

										{/* //§ .................................................  MARK: zoom 🔎
										 */}

										<NavLink
											className={`$({ isActive, isPending }) => isActive ? 'active' : 'pending' + hidden h-10 w-10 items-center justify-center group-has-[details[open]]:inline-flex group-has-[details[open]]:pt-1`}
											to={`../artworks/zoom/${artwork.id}`}
											style={{ color: colorHsl }}
										>
											<Icon
												name="zoom-in"
												className="hidden stroke-background text-3xl group-has-[details[open]]:inline-flex group-has-[details[open]]:justify-start"
												size="font"
												style={{
													color: colorHsl,
													stroke: 'hsl(20 14.3 4.1)',
													strokeWidth: '.1px',
												}}
											/>
										</NavLink>
									</div>
									{/* //§ .......................................................  MARK:Toolbar ⚙️
									 */}
								</summary>

								{/*https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path#specifications
                 //§  ....................................................  MARK: 🡸Expander🡺
							*/}

								<div
									className="group-has[details[open]]:grid-rows-1 group-has[details[open]]:overflow-y-scroll grid grid-rows-none"
									id="expander"
									style={{
										animation: 'ease-out expand forwards 1.5s alternate',
									}}
								>
									<div
										className="expander-content min-h-0 leading-relaxed"
										/* style={{
											animation: 'ease-out expand forwards 1.5s reverse',
										}} */
									>
										<ul className="flex h-full flex-col gap-2 px-4 leading-relaxed">
											<li key="title">
												<span className="list-item font-medium opacity-75">
													Title
													{': '}
												</span>
												<span className="detail-content inline-block text-lg">
													{artwork.title}
												</span>
											</li>

											<li
												dangerouslySetInnerHTML={artist}
												className="hyphens-auto pb-4 text-lg"
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
													<li key={key} className="pb-6">
														<span className="list-item font-medium opacity-60">
															{key}:
														</span>{' '}
														<span className="detail-content inline-block">
															{value}
														</span>
													</li>
												))}
											<li
												className="max-w-prose pb-4 pt-4 leading-relaxed"
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
														<span className="list-item font-medium opacity-60">
															{key}
															{': '}
														</span>

														<span className="detail-content inline-block pb-4">
															{value}
														</span>
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
						{/* end of div.artwork-wrapper */}
					</div>
				</figure>

				{/* //§ ............................................................  MARK: Header ▀▀▀
				 */}

				<header className="absolute top-0 flex w-full items-center justify-between p-4">
					<Logo />
					<div className="spacer w-[max(100%,843px)]"></div>
					<Favorite artwork={artwork} />
				</header>
			</main>
		</>
	)

	function Logo() {
		return (
			<Link to="/" className="group relative z-10 grid leading-snug">
				<span className="font-light leading-none text-cyan-200 transition group-hover:-translate-x-1">
					kunst
				</span>
				<span className="font-medium leading-none text-yellow-100 transition">
					räuber
				</span>
			</Link>
		)
	}
}
