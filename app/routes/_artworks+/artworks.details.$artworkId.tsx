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
	// NavLink,
	useFetcher,
	useLoaderData,
	useNavigate,
} from '@remix-run/react'
import chalk from 'chalk'
import { type FunctionComponent } from 'react'
import { Button } from '#app/components/ui/button.tsx'
import { Icon } from '#app/components/ui/icon.js'
// import kunstraeuber from '../../../avatars/kunstraeuber.png'
// import circles from '../../../circles.svg'
import { getArtwork, updateArtwork } from '../resources+/search-data.server.tsx'
import detailsStyles from './artworks.details.artworkId.css?url'

// import { useNonce } from '#app//utils/nonce-provider.ts'
// #endregion imports

export const links: LinksFunction = () => [
	{ rel: 'stylesheet', href: detailsStyles },
]

export const meta: MetaFunction<typeof loader> = () => {
	return [
		{ title: '* Kunsträuber Artwork Page' },
		{
			name: 'Details',
			content: `Details for a single artwork`,
		},
	]
}

export const action = async ({ params }: ActionFunctionArgs) => {
	invariantResponse(params.artworkId, 'Missing artworkId param')

	await updateArtwork(parseInt(params.artworkId))

	return redirect(`./`)
}

//    ................................    MARK: Loader

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
		<fetcher.Form method="post" className="favorite">
			<Button
				name="favorite"
				variant="ghost"
				size="ghost"
				className="inline-flex w-8 px-0 pt-2"
				style={{
					color: colorHsl as unknown as string,
					filter: '',
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

export default function ArtworkDetails() {
	const { artwork } = useLoaderData<typeof loader>()
	const navigate = useNavigate()
	const halftoneUrl = `url(${artwork.image_url}) 50% / cover` || 'none'
	// const colorHsl = artwork.colorHsl
	const colorHslIcon = `hsl(${artwork.color_h}, ${artwork.color_s}%, 50%)`
	const colorHslGradientBg = `hsl(${artwork.color_h}, 100%, 55% / 1.0)`

	const artist = {
		__html:
			'<div class="artist-caption  opacity-80 text-lg">Artist:  </div> ' +
			artwork.artist_display,
	}

	const description = {
		__html:
			artwork.description && artwork.description !== 'null'
				? '<div class="text-base opacity-80 pb-4 backdrop-blur-xl">Description: </div>' +
					artwork.description
				: '',
	}

	{
		/* //   MARK: RETURN .................................	 */
	}

	return (
		<div className="details-container mx-auto max-w-prose">
			<section className="absolute left-0 -z-10 h-[100vw] w-full opacity-30">
				<div className="halftone-anim"></div>
			</section>

			{/* // ........  MARK: ◐ HALFTONE  	.........................	 */}

			<aside className="absolute opacity-30 filter">
				<div
					className="halftone"
					style={
						{
							'--img': halftoneUrl,
							'--colorHsl': colorHslGradientBg,
							backgroundSize: 'cover',
						} as React.CSSProperties
					}
				></div>
			</aside>

			{/* // .MARK: TITLE & ARTIST (details) ..................... */}

			<div
				className="mx-auto flex h-full w-fit max-w-prose flex-col items-center justify-end gap-2 px-4 pb-4 leading-relaxed"
				style={{ color: colorHslIcon }}
			>
				<div className="title-artist-wrapper max-w-fit rounded-3xl text-center">
					<div className="inline text-[1.1rem] text-lg opacity-80">
						Title
						{': '}
					</div>
					<div className="isolate inline-block text-2xl font-bold backdrop-blur-sm">
						{artwork.title}
					</div>
				</div>
			</div>
			<header className="flex w-full items-center justify-between p-4">
				{/* //.MARK: ⃝ btn-back ⏪	...................*/}

				<Button
					className="btn-back relative z-50 flex h-10 w-10 cursor-pointer rounded-full p-0 text-yellow-50/50 active:opacity-50"
					variant="ghost"
					onClick={() => {
						navigate(-1)
					}}
				>
					<Icon name="cross-1" className="h-6 w-6" />
				</Button>

				{/* //.MARK: ⭐️ FAVORITE ⏪	...................*/}

				<Favorite artwork={artwork} />
			</header>

			<div
				dangerouslySetInnerHTML={artist}
				className="artist w-fit hyphens-auto px-4 text-lg"
			></div>

			{/* // .MARK:► UL (details) ..................... */}
			<ul className="mx-auto flex max-w-prose flex-col gap-2 px-4 py-8 leading-relaxed">
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
							(key === 'date_display' ||
								key === 'place_of_origin' ||
								key === 'medium_display'),
					)
					.sort(([keyA], [keyB]) => {
						const order = [
							'date_display',
							'place_of_origin',
							'medium_display',
							,
						]
						const indexA = order.indexOf(keyA)
						const indexB = order.indexOf(keyB)
						return indexA - indexB
					})
					.map(([key, value]) => (
						<li key={key} className="pb-6">
							<span className="list-item opacity-80">{key}:</span>{' '}
							<span className="detail-content inline-block opacity-[0.99]">
								{value}
							</span>
						</li>
					))}
				<li
					className="max-w-prose pb-4 pt-4 leading-relaxed text-foreground opacity-80"
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
							value && value !== '' && value !== 'none' && value !== 'null',
					)
					.map(([key, value]) => (
						<li key={key}>
							<span className="list-item opacity-80">
								{key}
								{': '}
							</span>

							<span className="detail-content inline-block pb-4 opacity-[0.99]">
								{value}
							</span>
						</li>
					))}
			</ul>
			<Logo />
		</div>
	)
}

{
	/* // ........  MARK: LOGO  	.........................	 */
}

function Logo() {
	const { artwork } = useLoaderData<typeof loader>()
	// const colorHslGradientBg = `hsl(${artwork.color_h}, 100%, 55% / 1.0)`
	const colorHslIcon = `hsl(${artwork.color_h}, ${artwork.color_s}%, 50%)`

	return (
		<>
			<Link
				to="/"
				className="logo group relative z-10 w-full leading-snug"
				style={{}}
			>
				<div className="right-12 w-screen overflow-hidden px-4 text-right">
					<section className="absolute left-0 -z-10 h-20 w-full opacity-30">
						<div className="halftone-anim bg-black mix-blend-darken">
							<div className="halftone" style={{ color: colorHslIcon }}></div>
						</div>
					</section>
					<span
						className="mt-4 inline-block text-xl font-medium leading-none backdrop-blur-sm transition group-hover:translate-x-1"
						style={{ color: colorHslIcon }}
					>
						kunst
					</span>
					<div className="px-4 text-xl font-light leading-none text-yellow-100 backdrop-blur-sm transition group-hover:-translate-x-1">
						räuber
					</div>
				</div>
			</Link>
		</>
	)
}
