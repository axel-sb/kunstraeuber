import 'react'

// https://stackoverflow.com/a/70398145/12985826
declare module 'react' {
	interface CSSProperties {
		[key: `--${string}`]: string | number
	}
}

/*
you can now use the CSS variable in your JSX like this:
<div style={{ "--value": percentage }} />
*/