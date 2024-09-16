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

//    ......................................    MARK: Loader

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

//    ...........................   MARK: FAVORITE

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

//    ..........................   MARK: export default

export default function ArtworkId() {
	const { artwork } = useLoaderData<typeof loader>()

	const colorHslIcon = `hsl(${artwork.color_h}, ${artwork.color_s}%, 50%)`
	console.log('colorHslIcon', colorHslIcon)
	const colorH = parseInt(`${artwork.color_h}`)
	const colorS = parseInt(`${artwork.color_s}`)
	const colorL = parseInt(`${artwork.color_l}`)

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
			{/* // ........  MARK:HEADER ▀▀▀	....................	 */}
			<header className="px-4">
				<Logo />
				<ul
					id="currGradColors"
					className="absolute left-32 top-4 mx-auto flex h-16 w-3/5"
				></ul>
				<Favorite artwork={artwork} />
			</header>
			{/* // .MARK: FIGURE 🪆	 .....................	 */}
			<figure className="row-[2_/_3] col-[1_/_-1] grid gap-y-6 h-full">
				<div className="image-wrapper row-[1_/_2] max-h-[calc(100dvh-18rem)]">
					<img
						className="mx-auto h-auto max-h-[calc(100dvh-18rem)] max-w-[clamp(calc(100vw-2rem),100%,calc(100vw-2rem))] rounded-md object-contain object-center"
						alt={artwork.alt_text ?? undefined}
						key={artwork.id}
						src={artwork.image_url ?? '../../../four-mona-lisas-sm.jpg'}
					/>
				</div>
				{/*//  .MARK:FIGCAPTION ...................... */}
				<figcaption className="row-[2_/_3] col-[2_/_5] px-4">
					{/* // .MARK: CAPTION-TEXT .............  */}
					<div className="caption-text col-[1_/_-1] row-[1_/_2] text-xl">
						<div className="title col-[1_/_-1] row-[2_/_3] text-balance text-center">
							{artwork.title}
						</div>
						<div className="artist col-[1_/_-1] row-[3_/_4] text-balance text-center">
							{artwork.artist_title}
						</div>
					</div>
				</figcaption>
			</figure>
			<footer className="row-[3_/_4]">
				{/* //  .MARK: 🧭 TOOLBAR ⏪	...................*/}
				<div
					className="toolbar col-[1_/_-1] w-full justify-around"
					style={{ color: colorHslIcon }}
				>
					{/* //  .MARK: ⃝ btn-back ⏪	...................*/}
					<Button
						className="btn-back relative col-[1_/_2] inline-flex h-10 w-10 flex-[2_1_auto] cursor-pointer justify-self-start rounded-full text-yellow-50/50"
						variant="ghost"
						size="ghost"
						onClick={() => {
							navigate(-1)
						}}
					>
						<Icon
							name="cross-1"
							size="font"
							className="p-0.5 text-[2rem] xl:text-xl"
						/>
					</Button>
					{/*// .MARK: ⃝ info-circled ℹ️ .................  */}
					<div className="navlink-info col-[2_/_3] row-[1_/_2] inline-flex h-10 w-10 flex-[6_1_auto] justify-center justify-self-center">
						<NavLink
							className={`$({ isActive, isPending }) => isActive ? 'active' : 'pending' inline-flex h-10 w-10 place-items-center p-1.5`}
							to={`../artworks/details/${artwork.id}`}
						>
							<Icon
								name="info-circled"
								size="font"
								className="mx-auto p-0.5 text-[2.05rem] xl:text-xl"
							/>
						</NavLink>
					</div>
					{/*//. MARK: ⃝ ZOOM 🔎 ........................ */}
					<div className="navlink-zoom col-[3_/_4] inline-flex h-10 w-10 flex-[2_1_auto] cursor-pointer justify-center justify-self-center rounded-full pt-0.5">
						<NavLink
							className={`$({ isActive, isPending }) => isActive ? 'active' : 'pending' z-10 inline-flex h-10 w-10 place-items-center`}
							to={`../artworks/zoom/${artwork.id}`}
						>
							<Icon
								name="zoom-in"
								className="stroke-background text-[2.05rem] xl:text-xl"
								size="font"
								style={{
									stroke: 'hsl(20 14.3 4.1)',
									strokeWidth: '.2px',
								}}
							/>
						</NavLink>
					</div>
				</div>
			</footer>
			<div className="canvas cols-[1_/_-1] absolute -z-10 h-full w-full">
				{MeshGradients(colorH, colorS, colorL)}
			</div>
		</>
	)

	//.MARK: ⃝ LOGO ........................

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
