// #region imports
import {
	type LinksFunction,
	type LoaderFunctionArgs,
	json,
} from '@remix-run/node'
import {
	Form,
	Link,
	NavLink,
	useLoaderData,
	useLocation,
	useNavigation,
	useSubmit,
} from '@remix-run/react'

import Hue from '@uiw/react-color-hue'
import { useEffect, useState } from 'react'
import { Icon } from '#app/components/ui/icon.js'
import { Input } from '#app/components/ui/input'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { useDebounce, useIsPending } from '#app/utils/misc'
import { getColor } from '../resources+/search-data.server'
import colorSearch from './artworks.colorSearch.css?url'
import artworks from './artworks.index.css?url'
// #endregion imports

export const links: LinksFunction = () => [
	{ rel: 'stylesheet', href: artworks },
	{ rel: 'stylesheet', href: colorSearch },
]

// #region Loader  // //§§  __________________________ Loader ⇅ ⬆︎⬇︎

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const q = url.searchParams.get('q') ?? '200'
	let data = await getColor((q ?? '200').toString())
	return json({ q, data })
}
// #endregion

// //§ ______________________ MARK: exp.default 🌈
// https://uiwjs.github.io/react-color/#/hue

export default function ColorSearch({
	status,
	autoSubmit = true,
}: {
	status: 'idle' | 'pending' | 'success' | 'error'
	autoFocus?: boolean
	autoSubmit?: boolean
}) {
	const { q, data } = useLoaderData<typeof loader>()
	const navigation = useNavigation()

	const [color, setcolor] = useState('')

	function HueSlider() {
		const [hsva, setHsva] = useState({ h: 0, s: 0, v: 68, a: 1 })
		return (
			<Hue
				hue={hsva.h}
				onChange={(newHue) => {
					setHsva({ ...hsva, ...newHue })
					setcolor(JSON.stringify(newHue.h))
				}}
			/>
		)
	}

	useEffect(() => {
		const searchField = document.getElementById('q')
		if (searchField instanceof HTMLInputElement) {
			searchField.value = q || ''
		}
	}, [q])

	// We've seen useNavigate already, we'll use its cousin, useSubmit (https://remix.run/docs/en/main/hooks/use-submit), for this.
	const submit = useSubmit()
	const isSubmitting = useIsPending({
		formMethod: 'GET',
		formAction: '/',
	})

	// Spinner
	const searching =
		navigation.location &&
		new URLSearchParams(navigation.location.search).has('q')

	const handleFormChange = useDebounce((form: HTMLFormElement) => {
		submit(form)
	}, 400)

	const location = useLocation()

	/* const colorHsl = data?.length > 0 ? data[0]?.colorHsl : 'hsl(0, 0%, 0%)' ?? 'hsl(0, 0%, 0%)'; */

	const currentQueryKey = location.search
		.split('&')
		.find((part) => part.startsWith('='))
		?.split('=')[1]

	//§  __________________________________ MARK: return
	//§   Color Picker 🌈

	return (
		<>
			<header className="hidden py-6">
				<nav className="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap md:gap-8"></nav>
			</header>

			<HueSlider />

			<Form
				id="search-form"
				className="flex flex-wrap items-center justify-center gap-2"
				onChange={(e) => autoSubmit && handleFormChange(e.currentTarget)}
				role="search"
			>
				<div className="flex w-full">
					<label
						htmlFor="picker"
						className="inline-block h-16 w-full"
						style={{
							background: `linear-gradient(to right, hsl(${color}, 100%, 35%) 40%, hsl(${color}, 100%, 50%) 60%, hsl(${color}, 100%, 85%)`,
							color: `hsl(${color}, 100%, 50%)`,
						}}
					></label>
					<Input
						autoFocus
						aria-label="Search by color"
						id="q"
						name="q"
						value={color}
						onChange={(e) => setcolor(e.target.value)}
						placeholder="Search"
						type="hidden"
					/>
				</div>
				<div>
					<StatusButton
						type="submit"
						status={isSubmitting ? 'pending' : status}
						className="-top-14} relative flex h-8 w-full items-center justify-center border-0 hover:bg-secondary/10"
					>
						<Icon
							name="magnifying-glass"
							size="xl"
							style={{
								color: color ? `hsl(${color}, 100%, 50%)` : undefined,
								filter: 'invert(1)',
							}}
						/>
						<span className="sr-only">Search</span>
					</StatusButton>
				</div>
				<div aria-hidden hidden={!searching} id="search-spinner" />
			</Form>

			{/* //§§  ______________________________________  MARK: main
			 */}

			<main className="flex flex-col items-center overscroll-contain px-4">
				<ul className="artworks-fade-in grid grid-cols-2 gap-2 md:grid-cols-4">
					{/* className="artworks-fade-in flex w-full touch-pan-y snap-y list-none flex-col items-center justify-start gap-y-28 overflow-y-auto overflow-x-visible overscroll-contain pb-28 pt-12" */}

					{data ? (
						location.search === '' ? (
							<li className="w-15rem relative flex max-w-sm flex-wrap justify-center whitespace-pre text-lg text-yellow-50">
								<p className="px-4 font-normal opacity-100">
									No search query provided
								</p>
								<p className="px-4 font-semibold opacity-50">
									(search type: <em> " {currentQueryKey} " </em>)
								</p>
							</li>
						) : (
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
											<figure className="relative z-40 mx-auto grid max-h-full max-w-[281px] place-items-center gap-4 pt-4 lg:static lg:max-w-full lg:-translate-x-28 lg:grid-cols-2">
												{/* // todo https://pagedone.io/docs/image  */}
												<img
													alt={artwork.alt_text ?? undefined}
													key={artwork.id}
													src={artwork.image_url ?? '../dummy.jpeg'}
												/>

												{/*
                                            //§§   .  .  .  .  .  .  .  .  .  .    MARK: Figcaption
                                            */}
												<figcaption className="z-50 flex w-full justify-between pt-2 lg:absolute lg:-right-8 lg:top-32 lg:max-w-fit lg:translate-x-full">
													<div className="relative flex w-full flex-wrap text-sm">
														<div className="max-w-full">{artwork.title}</div>

														<div className="w-[calc(100%-1rem)] font-semibold opacity-50">
															{artwork.artist_title}
														</div>
														<Icon
															name="eye-open"
															className="icon-eye absolute -right-6 top-0 hidden h-6 w-6 opacity-90 lg:hidden"
															style={{
																color: artwork.colorHsl as string,
															}}
														/>
														<Icon
															name="arrow-right"
															className="icon-arrow h-4 w-4 justify-self-end lg:ml-[calc(100%-3rem)] lg:mt-4 lg:block"
															style={{
																color: artwork.colorHsl as string,
															}}
														/>
													</div>
												</figcaption>
											</figure>
										) : (
											<i>No Artworks found for query {q} </i>
										)}
									</NavLink>
								</li>
							))
						)
					) : (
						<li className="w-15rem relative flex max-w-sm flex-wrap justify-center whitespace-pre text-lg text-yellow-50">
							<p className="px-4 font-normal opacity-100">
								Nothing found for query: <em> " {q} " </em>
							</p>
							<p className="px-4 font-semibold opacity-50">
								(search type: <em> " {currentQueryKey} " </em>)
							</p>
						</li>
					)}
				</ul>
			</main>
			<div className="footer container flex items-center justify-between pb-0 pt-16">
				<Logo />
				<div className="relative flex">
					<h2 className="pb-4 text-center leading-none">
						<span className="font-semibold opacity-50">
							query{' '}
							<em className="font-normal opacity-100">
								{' '}
								{currentQueryKey}
								{': '}
							</em>{' '}
						</span>
						{q || ' '}{' '}
						{/* same as: {location.search.split('&')[0].split('=')[1]} */}
					</h2>
				</div>
			</div>
		</>
	)
}

function Logo() {
	return (
		<Link to="/" className="pb-4">
			<span className="font-light leading-none text-cyan-200 transition group-hover:-translate-x-1">
				kunst
			</span>
			<span className="font-bold leading-none text-yellow-100 transition group-hover:translate-x-1">
				räuber
			</span>
		</Link>
	)
}
