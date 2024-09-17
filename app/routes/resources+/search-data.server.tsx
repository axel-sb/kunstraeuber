import { type Artwork } from '@prisma/client'
import chalk from 'chalk'
import { prisma } from '../../utils/db.server.ts'

//+  ___________              _____________________________  BY ID
export function getArtwork({ id }: Pick<Artwork, 'id'>) {
	return prisma.artwork.findFirst({
		select: {
			id: true,
			title: true,
			artist_display: true,
			artist_title: true,
			date_end: true,
			date_display: true,
			place_of_origin: true,
			medium_display: true,
			technique_titles: true,
			description: true,
			style_titles: true,
      artwork_type_title: true,
			// width: true,
			// height: true,
			image_url: true,
			subject_titles: true,
			category_titles: true,
			provenance_text: true,
			alt_text: true,
			color_h: true,
			color_s: true,
			color_l: true,
			favorite: true,
			weight: true,
			colorHsl: true,
		},
		where: { id },
	})
}

//+  ___________              ___________________________ URL BY ID

export function getArtworkUrl({ id }: Pick<Artwork, 'id'>) {
	return prisma.artwork.findFirst({
		select: {
			image_url: true,
			colorHsl: true,
		},
		where: { id: Number(id) }, // Ensure id is converted to a number if expected by the database
	})
}

// +  _________________           ____________________   BY WEIGHT
export function getWeight(q?: string | '') {
	return prisma.artwork.findMany({
		select: {
			id: true,
			artist_display: true,
			artist_title: true,
			title: true,
			place_of_origin: true,
			date_display: true,
			date_end: true,
			description: true,
			style_titles: true,
            artwork_type_title: true,
			term_titles: true,
			subject_titles: true,
			classification_titles: true,
			category_titles: true,
			medium_display: true,
			technique_titles: true,
			provenance_text: true,
			favorite: true,

			image_url: true,
			alt_text: true,
			weight: true,
			colorHsl: true,
		},
		where: { weight: { gt: Number(q) } },
		skip: 0,
		take: 20,
	})
}

//+   ________________          __________________     BY FAVORITE
export function getFavorite() {
	return prisma.artwork.findMany({
		select: {
			id: true,
			artist_display: true,
			artist_title: true,
			title: true,
			place_of_origin: true,
			date_display: true,
			date_end: true,
			description: true,
			style_titles: true,
            artwork_type_title: true,
			term_titles: true,
			subject_titles: true,
			classification_titles: true,
			category_titles: true,
			medium_display: true,
			technique_titles: true,
			provenance_text: true,
			favorite: true,

			image_url: true,
			alt_text: true,
			weight: true,
			colorHsl: true,
		},
		where: { favorite: { equals: true } },
		skip: 0,
		take: 500,
	})
}

//+  _____________________________________________________  BY ANY
export function getAny(qAny?: string | '') {
	if (!qAny) {
		qAny = 'Query cannot be null'
	}

	return prisma.artwork.findMany({
		select: {
			id: true,
			title: true,
			artist_display: true,
			artist_title: true,
			date_end: true,
			date_display: true,
			place_of_origin: true,
			medium_display: true,
			provenance_text: true,
			dimensions: true,
			description: true,
			biography: true,
			category_titles: true,
			term_titles: true,
			style_titles: true,
      artwork_type_title: true,
			subject_titles: true,
			classification_titles: true,
			technique_titles: true,
			width: true,
			height: true,
			color_h: true,
			color_s: true,
			color_l: true,
			colorHsl: true,
			image_url: true,
			alt_text: true,
			favorite: true,
			weight: true,
			tags: true,
		},
		where: {
			OR: [
				{ title: { contains: qAny } },
				{ artist_display: { contains: qAny } },
				{ term_titles: { contains: qAny } },
				{ subject_titles: { contains: qAny } },
				{ classification_titles: { contains: qAny } },
				{ category_titles: { contains: qAny } },
				{ style_titles: { contains: qAny } },
				{ technique_titles: { contains: qAny } },
				// { provenance_text: { contains: qAny } },
				{ alt_text: { contains: qAny } },
				{ description: { contains: qAny } },
				{ place_of_origin: { contains: qAny } },
				{ medium_display: { contains: qAny } },
				{ artist_title: { contains: qAny } },
				{ date_end: { equals: parseInt(qAny) } },
				// { date_display:: { contains: qAny } },
			],
			AND: [{ description: { not: null } }],
		},
		orderBy: { weight: 'desc' },
		skip: 0,
		take: 20,
	})
}

//+  __________________________________________________  BY ARTIST
export function getArtist(q?: string | '') {
	if (!q) {
		q = 'Query cannot be null'
	}
	console.log(chalk.magenta('🟡🟡 q →', q))

	return prisma.artwork.findMany({
		select: {
			id: true,
			title: true,
			artist_display: true,
			artist_title: true,
			// date_end: true,
			// date_display: true,
			// place_of_origin: true,
			// medium_display: true,
			// technique_titles: true,
			// description: true,
			//
      width: true,
      height: true,
			image_url: true,
			// term_titles: true,
			// subject_titles: true,
			// category_titles: true,
			// classification_titles: true,
			// provenance_text: true,
			alt_text: true,
			color_h: true,
			color_s: true,
			color_l: true,
			// is_zoomable: true,
			// artwork_type_title: true,
			// favorite: true,
			weight: true,
			colorHsl: true,
		},
		where: {
			OR: [
				{ artist_display: { contains: q } },
				{ artist_title: { contains: q } },
			],
		},
		orderBy: { weight: 'desc' },
		skip: 0,
		take: 20,
	})
}

//+ __________________________________________________  BY SUBJECT
export function getArtworksBysubject_titles(querysubject_titles?: string | '') {
	if (!querysubject_titles) {
		querysubject_titles = 'Query cannot be null'
	}

	return prisma.artwork.findMany({
		select: {
			id: true,
			title: true,
			artist_display: true,
			artist_title: true,
			date_end: true,
			date_display: true,

			image_url: true,
			medium_display: true,
			term_titles: true,
			subject_titles: true,
			category_titles: true,
			style_titles: true,
            artwork_type_title: true,
			classification_titles: true,
			technique_titles: true,
			provenance_text: true,
			alt_text: true,
			description: true,
			place_of_origin: true,
			favorite: true,
			weight: true,
			colorHsl: true,
		},
		where: { subject_titles: { contains: querysubject_titles } },
		orderBy: { weight: 'desc' },
		skip: 0,
		take: 20,
	})
}

//+  ___________________________________________________  BY STYLE
export function getStyle(q?: string | '') {
	if (!q) {
		q = 'Query cannot be null'
	}

	return prisma.artwork.findMany({
		select: {
			id: true,
			title: true,
			artist_display: false,
			artist_title: true,
			date_end: false,
			date_display: false,
			image_url: true,
			medium_display: false,
			term_titles: false,
			subject_titles: false,
			category_titles: false,
			style_titles: true,
			artwork_type_title: false,
			classification_titles: false,
			technique_titles: false,
			provenance_text: false,
			alt_text: true,
			description: false,
			place_of_origin: false,
			favorite: true,
			weight: true,
			colorHsl: true,
		},
		where: { style_titles: { contains: q } },
		orderBy: { weight: 'desc' },
		skip: 0,
		take: 20,
	})
}

//+  ____________________________________________________  BY TYPE
export function getType(q?: string | '') {
	if (!q) {
		q = 'Query cannot be null'
	}

	return prisma.artwork.findMany({
		select: {
			id: true,
			title: true,
			artist_display: false,
			artist_title: true,
			date_end: false,
			date_display: false,
			image_url: true,
			medium_display: false,
			term_titles: false,
			subject_titles: false,
			category_titles: false,
			style_titles: false,
			artwork_type_title: true,
			classification_titles: false,
			technique_titles: false,
			provenance_text: false,
			alt_text: true,
			description: false,
			place_of_origin: false,
			favorite: true,
			weight: true,
			colorHsl: true,
		},
		where: { artwork_type_title: { contains: q } },
		orderBy: { weight: 'desc' },
		skip: 0,
		take: 20,
	})
}

//+  ___________________________________________________  BY PLACE
export function getPlace(qPlace?: string | '') {
	if (!qPlace) {
		qPlace = 'Query cannot be null'
	}

	return prisma.artwork.findMany({
		select: {
			id: true,
			title: true,
			artist_display: true,
			artist_title: true,
			date_end: true,
			date_display: true,

			image_url: true,
			medium_display: true,
			term_titles: true,
			subject_titles: true,
			category_titles: true,
			style_titles: true,
            artwork_type_title: true,
			classification_titles: true,
			technique_titles: true,
			provenance_text: true,
			alt_text: true,
			description: true,
			place_of_origin: true,
			favorite: true,
			weight: true,
			colorHsl: true,
		},
		where: { place_of_origin: { contains: qPlace } },
		orderBy: { weight: 'desc' },
		skip: 0,
		take: 20,
	})
}

//+  _________________________________________________  BY DATEEND

export function getDate(qDate?: number | 0) {
	if (!qDate) {
		qDate = 0
	}

	return prisma.artwork.findMany({
		select: {
			id: true,
			title: true,
			artist_display: true,
			artist_title: true,
			date_end: true,
			date_display: true,
			image_url: true,
			medium_display: true,
			term_titles: true,
			subject_titles: true,
			category_titles: true,
			style_titles: true,
            artwork_type_title: true,
			classification_titles: true,
			technique_titles: true,
			provenance_text: true,
			alt_text: true,
			description: true,
			place_of_origin: true,
			favorite: true,
			weight: true,
			colorHsl: true,
		},
		where: { date_end: { equals: qDate } },
		orderBy: { weight: 'desc' },
		skip: 0,
		take: 20,
	})
}

//+  ___________________________________________________  BY COLOR
export function getColor(q?: string | '') {
	let numQ = Number(q)
	if (isNaN(numQ)) {
		console.log(chalk.red('🟡 numQ is not a number '))
	} else {
		return prisma.artwork.findMany({
			select: {
				id: true,
				title: true,
				artist_display: true,
				artist_title: true,
				// date_end: true,
				date_display: true,
				place_of_origin: true,
				medium_display: true,
				technique_titles: true,
				description: true,
				style_titles: true,
            artwork_type_title: true,
				width: true,
				height: true,
				//
				image_url: true,
				//term_titles: true,
				subject_titles: true,
				// category_titles: true,
				// classification_titles: true,
				provenance_text: true,
				alt_text: true,
				color_h: true,
				color_s: true,
				color_l: true,
				colorHsl: true,
				// is_zoomable: true,
				favorite: true,
				weight: true,
			},
			where: {
				color_h: {
					gt: numQ - 2,
					lt: numQ + 2,
				},
				color_s: { gt: Number(15) },
				color_l: { gt: Number(15), lt: Number(85) },
			},
			orderBy: { weight: 'desc' },
			skip: 0,
			take: 20,
		})
	}
}

//+                                                UPDATE FAVORITE
export async function updateArtwork(id: Artwork['id']) {
	const artwork = await prisma.artwork.findUnique({
		where: { id },
		select: {
			favorite: true,
			colorHsl: true,
		},
	})

	if (!artwork) {
		throw new Error('Artwork not found')
	}

	const updatedFavorite = !artwork.favorite

	const update = prisma.artwork.update({
		where: { id },
		data: { favorite: updatedFavorite },
	})

	return update
}

//+                                                 COUNT BY GROUP

export function groupBy(q?: string | '') {
	if (!q) {
		q = 'Query cannot be null'
	}
	by: ['Artist', 'place_of_origin']
	return prisma.artwork.groupBy({
		where: { artist_display: { contains: q } },
		by: ['artist_display'],
		_count: {
			artist_display: true,
		},
		orderBy: {
			_count: {
				artist_display: 'desc',
			},
		},
	})
}