import { type MetaFunction } from '@remix-run/node'
// import { Link } from '@remix-run/react'
import { EpicProgress } from '../../components/progress-bar.tsx'

// import { Button } from '../../components/ui/button.tsx'
// import { Icon } from '../../components/ui/icon.tsx'
import { EpicToaster } from '../../components/ui/sonner.tsx'

import {} from '../../utils/misc.tsx'

// import styleSheetUrl from './index.css?url'

/* export const links: LinksFunction = () => {
	return [{ rel: 'stylesheet', href: styleSheetUrl }]
} */
export const meta: MetaFunction = () => [{ title: '*Kunsträuber' }]

export default function Index() {
	return (
		<>
			<EpicToaster closeButton position="top-center" />
			<EpicProgress />
		</>
	)
}

/* function Logo() {
	return (
		<Link to="/" className="group grid leading-snug">
			<span className="font-light leading-none text-cyan-200 transition group-hover:-translate-x-1">
				kunst
			</span>
			<span className="font-bold leading-none text-yellow-100 transition group-hover:translate-x-1">
				räuber
			</span>
		</Link>
	)
} */
