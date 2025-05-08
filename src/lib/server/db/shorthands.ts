import { AdultContents, ArticleType } from '@app';
import { db } from '.';
import * as table from './schema';
import { and, desc, eq, ne, SQL, sql } from 'drizzle-orm';
import { unionAll } from 'drizzle-orm/pg-core';

const generateCommonWhere = (t: typeof table.commissionRequest, currentUser?: App.User) => {
	const commonWhere = [];

	if (!currentUser || !currentUser.preferences.display_adult_contents)
		commonWhere.push(eq(t.containsAdultContents, AdultContents.NORMAL));
	else if (!currentUser.preferences.display_grotesque_contents)
		commonWhere.push(ne(t.containsAdultContents, AdultContents.GROTESQUE_RESTRICTED));

	return commonWhere;
};

export const articlesPerType = (
	types: ArticleType[],
	where: {
		request?: SQL;
		commission?: SQL;
	} = {},
	currentUser?: App.User,
) =>
	types.map((type) => {
		switch (type) {
			case ArticleType.REQUEST:
				return db
					.select({
						id: table.commissionRequest.id,
						type: sql<ArticleType>`'REQUEST'`,
						thumbnail: table.commissionRequest.thumbnail,
						title: table.commissionRequest.title,
						author: {
							id: table.user.id,
							username: table.user.username,
							profileImage: table.user.profileImage,
							email: table.user.email,
							preferences: table.user.preferences,
							profile: table.user.profile,
						},
						category: table.commissionRequest.category,
						tags: table.commissionRequest.tags,
						modifyDate: table.commissionRequest.modifyDate,
						containsAdultContents: table.commissionRequest.containsAdultContents,
					})
					.from(table.commissionRequest)
					.where(and(...generateCommonWhere(table.commissionRequest, currentUser), where.request))
					.innerJoin(table.user, eq(table.commissionRequest.author, table.user.id))
					.orderBy(desc(table.commissionRequest.modifyDate));
			case ArticleType.COMMISSION:
				return undefined;
		}
	});

export const allArticles = (
	types: ArticleType[],
	where: {
		request?: SQL;
		commission?: SQL;
	} = {},
	currentUser?: App.User,
) => {
	let subqueries = articlesPerType(types, where, currentUser).filter((v) => v !== undefined);

	if (subqueries.length > 0) {
		let leftQuery = subqueries.splice(0, 1)[0];
		let rightQuery = subqueries.splice(0, 1)[0];

		if (!rightQuery) return leftQuery;
		else if (subqueries.length === 0) return unionAll(leftQuery, rightQuery);
		else return unionAll(leftQuery, rightQuery, ...subqueries);
	}

	return undefined;
};
