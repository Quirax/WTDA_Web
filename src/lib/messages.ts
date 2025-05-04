import * as m from '$lib/paraglide/messages';

export * as m from '$lib/paraglide/messages';

export const CategoryText = {
	TEXT: m.CATEGORY_TEXT,
	DRAWING: m.CATEGORY_DRAWING,
};

export const ArticleTypeText = {
	REQUEST: m.ARTICLE_TYPE_REQUEST,
	COMMISSION: m.ARTICLE_TYPE_COMMISSION,
};

export const SearchRangeText = {
	title: m.SEARCH_RANGE_TITLE,
	content: m.SEARCH_RANGE_CONTENT,
	tag: m.SEARCH_RANGE_TAG,
	username: m.SEARCH_RANGE_USERNAME,
};

export const SearchFlagText = {
	all: m.SEARCH_FLAG_ALL,
	excluded: m.SEARCH_FLAG_EXCLUDED,
	required: m.SEARCH_FLAG_REQUIRED,
};
