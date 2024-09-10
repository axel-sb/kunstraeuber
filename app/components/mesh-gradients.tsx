import MeshGradient from 'mesh-gradient.js'
import { useEffect, useMemo } from 'react'

/* const COLORS = [ "#eb75b6",
  "#ddf3ff",
  "#6e3deb",
  "#c92f3c" ]

function MeshGradients2() {
  const gradient = useMemo(() => new MeshGradient(), []);

  const canvasId = "my-canvas"

  useEffect(() => {
    // initialize new gradient
    // @Params
    // 1. id of canvas element
    // 2. array of colors in hexcode
    gradient.initGradient("#" + canvasId, COLORS);
    // Mesh Id
    // Any positive numeric value which acts as a seed for mesh pattern
    gradient?.changePosition(780);
  }, [gradient, canvasId]);

  const regenerate = () => {
    const value = Math.floor(Math.random() * 1000)
    // change pattern by changing mesh Id
    gradient?.changePosition(value);
  } */

function MeshGradients() {
	function hslToHex(h: number, s: number, l: number): string {
		l /= 100
		const a = (s * Math.min(l, 1 - l)) / 100
		const f = (n: number): string => {
			const k = (n + h / 30) % 12
			const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
			return Math.round(255 * color)
				.toString(16)
				.padStart(2, '0') // convert to Hex and prefix "0" if needed
		}
		return `#${f(0)}${f(8)}${f(4)}, #${f(0)}${f(8)}${f(4)}80` // #918669, #91866980
	}

	function hslToHexDark(h: number, s: number, l: number): string {
		l /= 100
		const a = (s * Math.min(l, 1 - l)) / 100
		const f = (n: number): string => {
			const k = (n + h / 30) % 12
			const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
			return Math.round(255 * color)
				.toString(16)
				.padStart(2, '0') // convert to Hex and prefix "0" if needed
		}
		return `#${f(0)}${f(8)}${f(4)}, #${f(0)}${f(8)}${f(4)}80` // #918669, #91866980
	}
	// https://www.codemotion.com/magazine/frontend/javascript/the-best-color-manipulation-library-in-javascript/

	// console.log('hslToHex', hslToHex(h ?? 0, s ?? 0, l ?? 0))

	const gradient = useMemo(() => new MeshGradient(), [])

	const canvasId = 'my-canvas'

	useEffect(() => {
		const COLORS = ['#4a4a3d', '#3f3f34', '#1d1d18', '#1f1f1a', '#fffed0']
		// initialize new gradient
		// @Params
		// 1. id of canvas element
		// 2. array of colors in hexcode
		gradient.initGradient('#' + canvasId, COLORS)
		// Mesh Id
		// Any positive numeric value which acts as a seed for mesh pattern
		gradient?.changePosition(780)
	}, [gradient, canvasId])

	const regenerate = () => {
		const value = Math.floor(Math.random() * 1000)
		// change pattern by changing mesh Idfocus terminal

		gradient?.changePosition(value)
	}

	return (
		<div className="absolute">
			<canvas id={canvasId} width="800" height="600" />
			<button onClick={() => regenerate()}> Regenerate </button>
		</div>
	)
}

export default MeshGradients
