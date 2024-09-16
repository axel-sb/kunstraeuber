// #region imports, links, meta
import {
	json,
	type LoaderFunctionArgs,
	type HeadersFunction,
	type LinksFunction,
	type MetaFunction,
} from '@remix-run/node'
import {
	Form,
	Link,
	Links,
	Meta,
	Outlet,
	// redirect,
	Scripts,
	ScrollRestoration,
	useLoaderData,
	useLocation,
	// useMatches,
	useSearchParams,
	useSubmit,
} from '@remix-run/react'
import { withSentry } from '@sentry/remix'
import { useId, useRef, useState } from 'react'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import globalStyles from './app.css?url'
import { GeneralErrorBoundary } from './components/error-boundary.tsx'

//import { SearchBar } from './components/search-bar.tsx'
import { useToast } from './components/toaster.tsx'
import { Button } from './components/ui/button.tsx'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from './components/ui/dropdown-menu.tsx'
import { Icon, href as iconsHref } from './components/ui/icon.tsx'
import { Input } from './components/ui/input.tsx'
import { Label } from './components/ui/label.tsx'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from './components/ui/select.tsx'
import { StatusButton } from './components/ui/status-button.tsx'
import {
	getAny,
	getArtist,
	getStyle,
	getPlace,
	getDate,
	getColor,
	getType,
} from './routes/resources+/search-data.server.tsx'
import { ThemeSwitch } from './routes/resources+/theme-switch.tsx'

import tailwindStyleSheetUrl from './styles/tailwind.css?url'
import { getUserId, logout } from './utils/auth.server.ts'
import { ClientHintCheck, getHints } from './utils/client-hints.tsx'
import { prisma } from './utils/db.server.ts'
import { getEnv } from './utils/env.server.ts'
import { honeypot } from './utils/honeypot.server.ts'
import {
	combineHeaders,
	getDomainUrl,
	getUserImgSrc,
	useIsPending,
} from './utils/misc.tsx'
import { useNonce } from './utils/nonce-provider.ts'
import { type Theme, getTheme } from './utils/theme.server.ts'
import { makeTimings, time } from './utils/timing.server.ts'
import { getToast } from './utils/toast.server.ts'
import { useOptionalUser, useUser } from './utils/user.ts'

export const links: LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		{ rel: 'preload', href: iconsHref, as: 'image' },
		{ rel: 'mask-icon', href: '/favicons/mask-icon.svg' },
		{
			rel: 'alternate icon',
			type: 'image/png',
			href: '/favicons/favicon-32x32.png',
		},
		{ rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png' },
		{
			rel: 'manifest',
			href: '/site.webmanifest',
			crossOrigin: 'use-credentials',
		} as const, // necessary to make typescript happy
		{ rel: 'icon', type: 'image/png', href: '/favicons/favicon.png' },
		{ rel: 'stylesheet', href: tailwindStyleSheetUrl },
		{ rel: 'stylesheet', href: globalStyles },
	].filter(Boolean)
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data ? '* Kunsträuber' : 'Error | Kunsträuber' },
		{
			name: 'description',
			content: `Good Artists Borrow, Great Artists Steal`,
		},
	]
}
// #endregion imports, links, meta

//   ...........................   MARK: Loader

export async function loader({ request }: LoaderFunctionArgs) {
	const timings = makeTimings('root loader')
	const userId = await time(() => getUserId(request), {
		timings,
		type: 'getUserId',
		desc: 'getUserId in root',
	})

	const user = userId
		? await time(
				() =>
					prisma.user.findUniqueOrThrow({
						select: {
							id: true,
							name: true,
							username: true,
							image: { select: { id: true } },
							roles: {
								select: {
									name: true,
									permissions: {
										select: { entity: true, action: true, access: true },
									},
								},
							},
						},
						where: { id: userId },
					}),
				{ timings, type: 'find user', desc: 'find user in root' },
			)
		: null
	if (userId && !user) {
		console.info('something weird happened')
		// something weird happened... The user is authenticated but we can't find
		// them in the database. Maybe they were deleted? Let's log them out.
		await logout({ request, redirectTo: '/' })
	}
	const { toast, headers: toastHeaders } = await getToast(request)
	const honeyProps = honeypot.getInputProps()

	const url = new URL(request.url)
	const query = url.searchParams.get('search') ?? undefined
	/* if (!query) {
        url.searchParams.set('search', 'Picasso')
        return redirect(url.pathname + url.search)
    } */
	const searchType = url.searchParams.get('searchType') ?? ''

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
		case 'type':
			data = await getType(query)
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
			data = await getAny('Picasso') // break
		/* data = await getArtist('Picasso') */
	}

	console.log('🟡 searchType →', searchType)

	return json(
		{
			user,
			data,
			searchType,
			requestInfo: {
				hints: getHints(request),
				origin: getDomainUrl(request),
				path: new URL(request.url).pathname,
				userPrefs: {
					theme: getTheme(request),
				},
			},
			ENV: getEnv(),
			toast,
			honeyProps,
		},
		{
			headers: combineHeaders(
				{ 'Server-Timing': timings.toString() },
				toastHeaders,
			),
		},
	)
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	const headers = {
		'Server-Timing': loaderHeaders.get('Server-Timing') ?? '',
	}
	return headers
}

//   ...........................   MARK: Document

function Document({
	children,
	nonce,
	theme = 'dark',
	env = {},
	allowIndexing = true,
}: {
	children: React.ReactNode
	nonce: string
	theme?: Theme
	env?: Record<string, string>
	allowIndexing?: boolean
}) {
	return (
		<html lang="en" className={`${theme} h-full overflow-x-hidden`}>
			<head>
				<ClientHintCheck nonce={nonce} />
				<Meta />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				{allowIndexing ? null : (
					<meta name="robots" content="noindex, nofollow" />
				)}
				<Links />
			</head>
			<body className="group/body min-h-[100dvh] bg-background text-foreground">
				{children}
				<script
					nonce={nonce}
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(env)}`,
					}}
				/>
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
			</body>
		</html>
	)
}

/**
 * React component for the main App. It handles various hooks and state variables, including user data, theme, search parameters, and more.
 *
 * @return {React.ReactNode} The main React component for the entire application.
 */

//   ...........................   MARK: App

function App(): React.ReactNode {
	const data = useLoaderData<typeof loader>()
	const nonce = useNonce()
	const user = useOptionalUser()
	// const matches = useMatches()
	// const isOnSearchPage = matches.find((m) => m.id === 'routes/users+/index')
	// const searchBar = isOnSearchPage ? null : <SearchBar status="idle" />
	const allowIndexing = data.ENV.ALLOW_INDEXING !== 'false'
	useToast(data.toast)
	const id = useId()
	const isPending = useIsPending()
	const location = useLocation()

	const [searchParams, setsearchParams] = useSearchParams()
	const [searchType, setSearchType] = useState<
		'all' | 'artist' | 'style' | 'place' | 'date' | 'color' | 'type' | ''
	>('')

	//   ......................................   MARK: return  ⮐

	return (
		<Document nonce={nonce} allowIndexing={allowIndexing} env={data.ENV}>
			{location.pathname === '/' ? (
				<>
					<div className="grid-container m-auto h-full max-w-[calc(843px+8rem)]">
						<Logo />
						{/*
            //   ...................................   MARK: User 龜
            */}
						<div className="user py1 col-[4_/_5] flex gap-10 place-self-center pr-0">
							{user ? (
								<UserDropdown />
							) : (
								<Button asChild variant="default" size="lg">
									<Link to="/login">Log In</Link>
								</Button>
							)}
						</div>
						{/*
            //   .....................   MARK: SearchBar  🔎
            */}
						<div className="search-bar w-[calc(100vw - 2rem)] col-[2_/_5] row-[3_/_4] m-4 mx-auto w-full rounded-md bg-opacity-90 py-1 ring-0 ring-yellow-100/25 ring-offset-[.5px] ring-offset-yellow-50/25 lg:col-[3_/_4] lg:row-[2_/_3] lg:m-0">
							<Form
								method="GET"
								action="/artworks"
								className="no-wrap flex items-center justify-start gap-0"
								/* onChange={(e) => handleFormChange(e.currentTarget)} */
							>
								{/*
                //  ..............................   MARK: SearchInput
                */}

								<div className="max-h-6 flex-1 rounded-md">
									<Label htmlFor={id} className="sr-only">
										Search
									</Label>
									<Input
										id={id}
										type="search"
										name="search"
										defaultValue={searchParams.get('search') ?? ''}
										placeholder={`Search ${searchType}`}
										className="search-cancel:-scale-150 h-6 w-full border-0 py-1 focus:ring-0"
										onChange={(e) => setsearchParams(e.target.value)}
									/>
								</div>
								{/* //   ...........................   MARK: Status Button  🔄
								 */}

								<StatusButton
									type="submit"
									status={isPending ? 'pending' : 'idle'}
									className="flex h-6 max-w-12 flex-1 items-center justify-start border-0 pb-3 shadow-none"
								>
									<Icon name="magnifying-glass" size="md" />
									<span className="sr-only">Search</span>
								</StatusButton>
								{/* //   ...........................   MARK: Split Button 🔽
								 */}
								<div className="splitbutton flex h-6 w-24 items-center justify-start rounded-md">
									<SelectSearchType
										searchType={searchType}
										setSearchType={setSearchType}
									/>
								</div>
							</Form>
						</div>
						{/*
              //   ......................................   MARK: Figure 🖼️
              */}
						<figure
							className="col-[2_/_-2] row-[4_/_-2] flex !max-h-full flex-col items-center lg:row-[4_/_-1]"
							style={{
								containerType: 'inline-size',
								containerName: 'figure',
							}}
						>
							<img
								className="animate-hue max-h-[calc(100dvh-10rem)] max-w-[calc(100vw_-_2rem)] rounded-sm object-contain sm:max-w-[clamp(283px,calc(100vw-2rem),min(843px,100%))]"
								alt="A work made of acrylic and silkscreen ink on linen."
								src="four-mona-lisas.avif"
								data-rdt-source="/Volumes/Samsung/_Projects-on-Samsung/Remix/artepic/app/routes/_artworks+/artworks.$artworkId.tsx:::247"
							/>
							<figcaption className="relative pt-8 text-lg opacity-85">
								Four Mona Lisas, 1978
							</figcaption>
						</figure>{' '}
						{/*
         //   ........................................   MARK: Footer  ┗━┛
      */}
						<div className="footer col-[2_/_-2] row-[5_/_6] flex h-12 w-full max-w-[843px+4rem] items-center justify-between px-4 pb-6">
							<ThemeSwitch userPreference={data.requestInfo.userPrefs.theme} />
							<Help />
						</div>
					</div>
				</>
			) : null}

			<Outlet />

			{/* <div className="footer container flex items-center justify-between py-3">
				<Logo />
				<ThemeSwitch userPreference={data.requestInfo.userPrefs.theme} />
				<Help />
			</div>

           <EpicProgress />


			{location.pathname === '/' ||
			location.pathname === '/artworks.$artworkId' ? (
				<>
					<ThemeSwitch userPreference={data.requestInfo.userPrefs.theme} />
				</>
			) : null} */}
		</Document>
	)
}

function AppWithProviders() {
	const data = useLoaderData<typeof loader>()
	return (
		<HoneypotProvider {...data.honeyProps}>
			<App />
		</HoneypotProvider>
	)
}

export default withSentry(AppWithProviders)

{
	/*
    //   ..........................................   MARK: User Dropdown
  */
}

function UserDropdown() {
	const user = useUser()
	const submit = useSubmit()
	const formRef = useRef<HTMLFormElement>(null)
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				asChild
				className="border-amber-950 radix-state-open:border-2 py-1 h-8"
			>
				<Button asChild variant="secondary">
					<Link
						to={`/users/${user.username}`}
						// this is for progressive enhancement
						onClick={(e) => e.preventDefault()}
						className="flex items-center gap-2 p-0"
					>
						<img
							className="h-6 w-6 rounded-full object-cover"
							alt={user.name ?? user.username}
							src={getUserImgSrc(user.image?.id)}
						/>
						<span className="text-body-sm">{user.name ?? user.username}</span>
					</Link>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent sideOffset={8} align="start">
					<DropdownMenuItem asChild>
						<Link prefetch="intent" to={`/users/${user.username}`}>
							<Icon className="text-body-md" name="avatar">
								Profile
							</Icon>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild>
						<Link prefetch="intent" to={`/users/${user.username}/notes`}>
							<Icon className="text-body-md" name="pencil-2">
								Notes
							</Icon>
						</Link>
					</DropdownMenuItem>
					<DropdownMenuItem
						asChild
						// this prevents the menu from closing before the form submission is completed
						onSelect={(event) => {
							event.preventDefault()
							submit(formRef.current)
						}}
					>
						<Form action="/logout" method="POST" ref={formRef}>
							<Icon className="text-body-md" name="exit">
								<button type="submit">Logout</button>
							</Icon>
						</Form>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	)
}

//   ...........................   MARK: SelectSearchType

interface SelectSearchTypeProps {
	searchType:
		| ''
		| 'color'
		| 'style'
		| 'date'
		| 'all'
		| 'artist'
		| 'place'
		| 'type'
	setSearchType: React.Dispatch<
		React.SetStateAction<
			'' | 'color' | 'style' | 'date' | 'all' | 'artist' | 'place' | 'type'
		>
	>
}

function SelectSearchType({
	searchType,
	setSearchType,
}: SelectSearchTypeProps) {
	const isPending = useIsPending({ formMethod: 'GET', formAction: '/artworks' })
	return (
		<Select
			name="searchType"
			required={true}
			value={searchType}
			onValueChange={(value) => {
				const searchType = value as
					| 'all'
					| 'artist'
					| 'style'
					| 'place'
					| 'date'
					| 'type'
					| 'color'

				setSearchType(searchType)
				const searchForm =
					document.querySelector<HTMLFormElement>('#search-form')
				const searchInput =
					document.querySelector<HTMLInputElement>('#search-input')
				if (searchForm && searchInput) {
					searchForm.action = `/artworks?searchType=${searchType}&search=${searchInput.value}`
					searchForm.submit()
				}
			}}
		>
			<SelectTrigger className="h-6 w-24 justify-between border-0">
				<SelectValue placeholder={searchType ? `${searchType}` : ''} />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="artist">
					<StatusButton
						type="submit"
						status={isPending ? 'pending' : 'idle'}
						className="flex h-6 w-16 items-center justify-start border-0 pl-4 pr-2 text-left shadow-none"
					>
						Artist
					</StatusButton>
				</SelectItem>
				<SelectItem value="style">
					<StatusButton
						type="submit"
						status={isPending ? 'pending' : 'idle'}
						className="flex h-6 w-16 items-center justify-start border-0 pl-4 pr-2 text-left shadow-none"
					>
						Style
					</StatusButton>
				</SelectItem>
				<SelectItem value="place">
					<StatusButton
						type="submit"
						status={isPending ? 'pending' : 'idle'}
						className="w-16text-left flex h-6 items-center justify-start border-0 pl-4 pr-2 shadow-none"
					>
						Place
					</StatusButton>
				</SelectItem>
				<SelectItem value="date">
					<StatusButton
						type="submit"
						status={isPending ? 'pending' : 'idle'}
						className="w-16text-left flex h-6 items-center justify-start border-0 pl-4 pr-2 shadow-none"
					>
						Date
					</StatusButton>
				</SelectItem>
				<SelectItem value="type">
					<StatusButton
						type="submit"
						status={isPending ? 'pending' : 'idle'}
						className="w-16text-left flex h-6 items-center justify-start border-0 pl-4 pr-2 shadow-none"
					>
						Type
					</StatusButton>
				</SelectItem>
				<SelectItem value="color">
					<StatusButton
						type="submit"
						status={isPending ? 'pending' : 'idle'}
						className="w-16text-left flex h-6 items-center justify-start border-0 pl-4 pr-2 shadow-none"
					>
						Color
					</StatusButton>
				</SelectItem>
				<SelectItem value="all">
					<StatusButton
						type="submit"
						status={isPending ? 'pending' : 'idle'}
						className="w-16text-left flex h-6 items-center justify-start border-0 pl-4 pr-2 shadow-none"
					>
						All
					</StatusButton>
				</SelectItem>
			</SelectContent>
		</Select>
	)
}

//   ...........................   MARK: Logo

function Logo() {
	return (
		<Link
			to="/"
			className="logo group col-[2_/_3] row-[2_/_3] grid place-self-center px-2 text-lg leading-tight sm:px-4"
		>
			<span className="font-bold leading-none text-cyan-200 transition group-hover:-translate-x-1">
				kunst
			</span>
			<span className="pl-1 font-light leading-none text-yellow-100 transition group-hover:translate-x-1">
				räuber
			</span>
		</Link>
	)
}

//   ...........................   MARK: Help

function Help() {
	return (
		<Button variant="ghost" size="ghost" className="ml-auto place-self-center">
			<Icon
				name="question-mark-circled"
				className="border-0"
				size="font"
			></Icon>
		</Button>
	)
}

export function ErrorBoundary() {
	// the nonce doesn't rely on the loader so we can access that
	const nonce = useNonce()

	// NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
	// likely failed to run so we have to do the best we can.
	// We could probably do better than this (it's possible the loader did run).
	// This would require a change in Remix.

	// Just make sure your root route never errors out and you'll always be able
	// to give the user a better UX.

	return (
		<Document nonce={nonce}>
			<GeneralErrorBoundary />
		</Document>
	)
}
