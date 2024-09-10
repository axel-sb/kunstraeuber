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
import chalk from 'chalk'
import { type FunctionComponent } from 'react'
import MeshGradients from '#app/components/mesh-gradients.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.js'
import { getArtwork, updateArtwork } from '../resources+/search-data.server.tsx'
import artworkId from './artworks.artworkId.css?url'

// import { useNonce } from '#app//utils/nonce-provider.ts'
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

//    .................................................    MARK: Loader

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

//    ...............................................   MARK: Favorite

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
		<fetcher.Form method="post" className="favorite pl-4 pr-2">
			<Button
				name="favorite"
				variant="ghost"
				size="ghost"
				className="inline-flex w-8 px-0"
				style={{
					color: colorHsl as unknown as string,
					filter: 'brightness(1.75)',
					strokeDasharray: 50,
				}}
			>
				{favorite ? (
					<Icon name="star-filling" size="xl" className="animated px-0" />
				) : (
					<Icon name="star" size="xl" className="px-0 opacity-50" />
				)}
			</Button>
		</fetcher.Form>
	)
}

//    ...........................................   MARK: export default

export default function ArtworkId() {
	const { artwork } = useLoaderData<typeof loader>()

	const colorHsl = `${artwork.colorHsl}`
	// console.log(colorHsl)

	/* const artist = {
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
	} */

	// for back-button
	const navigate = useNavigate()

	return (
		<>
			{/* // ........  MARK: Header ▀▀▀	.............................	 */}
			<header>
				<Logo />
				<Favorite artwork={artwork} />
			</header>
			{/* // ......  MARK: Figure🪆	 .............................	 */}
			<figure className="">
				<div className="image-wrapper">
					<img
						className="mx-auto max-h-[80dvh] w-[calc(100vw-2rem)] max-w-[843px] rounded-md object-contain object-center"
						alt={artwork.alt_text ?? undefined}
						key={artwork.id}
						src={artwork.image_url ?? '../../../four-mona-lisas-sm.jpg'}
						style={{
							boxShadow: `
                0px 0px 0px 0.5px #fffa, 0px 0px 1px 0 #fff5, 0px 0px 1.5px 1px #0008, 0px 0px 2px 1.5px #3338, 2px 4px 2px 0 #5554, 4px 8px 6px 0 #0008,  8px 16px 12px 0 #0004`,
						}}
					/>
				</div>
				{/*//    ...............   MARK:  Figcaption ............... */}
				<figcaption className="">
					<div className="toolbar col-[1_/_-1] row-[1_/_2] justify-between">
						{/* // ............  MARK: btn-back ⏪		...............	*/}
						<Button
							className="btn-back relative col-[1_/_2] inline-flex h-10 w-10 cursor-pointer justify-self-start rounded-full text-yellow-50/50"
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
								style={{ color: colorHsl }}
							/>
						</Button>
						{/*// ........  MARK: info-circled ℹ️ ..................  */}
						<div className="navlink-info col-[2_/_3] row-[1_/_2] inline-flex h-10 w-10 justify-center justify-self-center">
							<NavLink
								className={`$({ isActive, isPending }) => isActive ? 'active' : 'pending' inline-flex h-10 w-10 place-items-center`}
								to={`../artworks/details/${artwork.id}`}
								style={{ color: colorHsl }}
							>
								<Icon
									name="info-circled"
									size="font"
									className="mx-auto text-2xl"
									style={{ color: colorHsl }}
								/>
							</NavLink>
						</div>
						{/*//  ..................  MARK: zoom 🔎 	..................   */}
						<div className="navlink-zoom col-[3_/_4] inline-flex h-10 w-10 cursor-pointer justify-self-end rounded-full pt-0.5">
							<NavLink
								className={`$({ isActive, isPending }) => isActive ? 'active' : 'pending' inline-flex h-10 w-10 place-items-center`}
								to={`../artworks/zoom/${artwork.id}`}
								style={{ color: colorHsl }}
							>
								<Icon
									name="zoom-in"
									className="stroke-background text-[2rem]"
									size="font"
									style={{
										color: 'colorHsl',
										stroke: 'hsl(20 14.3 4.1)',
										strokeWidth: '.3px',
										fontSize: '2.1rem',
									}}
								/>
							</NavLink>
						</div>
					</div>
					{/* // ......................................  MARK: Title */}
					<div className="caption-text col-[1_/_-1] row-[2_/_3] self-end">
						<div className="title col-[1_/_-1] row-[2_/_3] place-self-center text-balance pt-8 text-center text-lg">
							{artwork.title}
						</div>
						<div className="artist col-[1_/_-1] row-[3_/_4] place-self-center text-balance text-center text-lg">
							{artwork.artist_title}
						</div>
					</div>
					{/*
          // #region details //   .............................  MARK: Details
          */}
					{/* <details className="group flex h-full w-full flex-1 overflow-auto sm:max-w-[843px] lg:max-w-[calc(843px+8rem)]"> */}
					{/*
          // ..................................................  MARK:Summary
					*/}
					{/* <summary
								className="relative z-10 mx-auto flex w-full flex-grow list-none gap-4 pt-6 group-has-[details[open]]:h-min lg:mt-4"
							>
								<div className="image-caption hidden h-full w-full flex-wrap justify-center gap-4 group-has-[details[open]]:h-12 group-has-[details[open]]:items-center group-has-[details[open]]:justify-between">
									<div className="hidden h-10 w-10 items-center justify-center group-has-[details[open]]:inline-flex">
										<Icon
											name="cross-circled"
											size="font"
											className="text-[1.4rem]"
											style={{ color: colorHsl }}
										/>
									</div>
								</div>
							</summary> */}
					{/*
                 // ....................................................  MARK: 🡸Expander🡺
							*/}
					{/* <div
								className="group-has[details[open]]:grid-rows-1 group-has[details[open]]:overflow-y-scroll grid grid-rows-none"
								id="expander"
								style={{
									animation: 'ease-out expand forwards 1.5s alternate',
								}}
							>
								<div
									className="expander-content min-h-0 leading-relaxed"
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
						</details> */}
					{/*
               // #endregion DETAILS
            */}
				</figcaption>
			</figure>
			{/* <footer className=""></footer> */}
			<div className="canvas cols-[1_/_-1] absolute -z-10 hidden h-full w-full">
				<MeshGradients />
			</div>
		</>
	)

	// ....................................................  MARK: Logo

	function Logo() {
		return (
			<Link to="/" className="logo group relative z-10 leading-snug">
				<span
					className="text-xl font-medium leading-none transition group-hover:-translate-x-1"
					style={{ color: 'var(--gray-8)' }}
				>
					kunst
				</span>
				<span className="text-xl font-light leading-none text-yellow-100 transition">
					räuber
				</span>
			</Link>
		)
	}
}
