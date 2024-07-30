declare module './api-data_2024-07-30.mjs' {
	export interface Artwork {
		id: number
		title: string
		artist_display: string
		artist_title: string
		date_end: number
		date_display: string
		place_of_origin: string
		medium_display: string
		provenance_text: string
		dimensions: string
		description: string
		biography: string
		artwork_type_title: string
		category_titles: string
		term_titles: string
		style_titles: string
		subject_titles: string
		classification_titles: string
		technique_titles: string
		width: number
		height: number
		color_h: number
		color_s: number
		color_l: number
		colorHsl: string
		image_url: string
		alt_text: string
		favorite: boolean
		weight: number
		tags: string
	}

	const dataArtic: Artwork[]
	export default dataArtic
}
