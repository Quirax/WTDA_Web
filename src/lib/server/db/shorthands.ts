import { AdultContents, ArticleType, UserRelationship, UserStatus } from '@app';
import { db } from '.';
import * as table from './schema';
import {
	and,
	desc,
	eq,
	exists,
	ne,
	notExists,
	or,
	SQL,
	sql,
	type AnyColumn,
	type GetColumnData,
} from 'drizzle-orm';
import { unionAll } from 'drizzle-orm/pg-core';
import { isAdult } from '$lib/utils';

const generateCommonWhere = (
	t: typeof table.commissionRequest | typeof table.portfolio,
	currentUser?: App.User,
) => {
	const commonWhere = [];

	if (currentUser) {
		const isBlocked = db
			.select({})
			.from(table.userRelationship)
			.where(
				and(
					or(
						and(
							eq(table.userRelationship.from, t.author),
							eq(table.userRelationship.to, currentUser.id),
						),
						and(
							eq(table.userRelationship.to, t.author),
							eq(table.userRelationship.from, currentUser.id),
						),
					),
					eq(table.userRelationship.relationship, UserRelationship.BLOCKED),
				),
			);

		commonWhere.push(notExists(isBlocked));
	}

	if (!currentUser || !isAdult(currentUser) || !currentUser.preferences.display_adult_contents)
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
		portfolio?: SQL;
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
							birthday: table.user.birthday,
							authExpiresAt: table.user.authExpiresAt,
							role: table.user.role,
						},
						category: table.commissionRequest.category,
						tags: table.commissionRequest.tags,
						modifyDate: table.commissionRequest.modifyDate,
						containsAdultContents: table.commissionRequest.containsAdultContents,
					})
					.from(table.commissionRequest)
					.where(and(...generateCommonWhere(table.commissionRequest, currentUser), where.request))
					.innerJoin(table.user, eq(table.commissionRequest.author, table.user.id));
			case ArticleType.COMMISSION:
				return undefined;
			case ArticleType.PORTFOLIO:
				return db
					.select({
						id: table.portfolio.id,
						type: sql<ArticleType>`'PORTFOLIO'`,
						thumbnail: table.portfolio.thumbnail,
						title: table.portfolio.title,
						author: {
							id: table.user.id,
							username: table.user.username,
							profileImage: table.user.profileImage,
							email: table.user.email,
							preferences: table.user.preferences,
							profile: table.user.profile,
							birthday: table.user.birthday,
							authExpiresAt: table.user.authExpiresAt,
							role: table.user.role,
						},
						category: table.portfolio.category,
						tags: table.portfolio.tags,
						modifyDate: table.portfolio.modifyDate,
						containsAdultContents: table.portfolio.containsAdultContents,
					})
					.from(table.portfolio)
					.where(and(...generateCommonWhere(table.portfolio, currentUser), where.portfolio))
					.innerJoin(table.user, eq(table.portfolio.author, table.user.id));
		}
	});

export const allArticles = (
	types: ArticleType[],
	where: {
		request?: SQL;
		commission?: SQL;
		portfolio?: SQL;
	} = {},
	currentUser?: App.User,
) => {
	let subqueries = articlesPerType(types, where, currentUser).filter((v) => v !== undefined);

	if (subqueries.length > 0) {
		let leftQuery = subqueries.splice(0, 1)[0];
		let rightQuery = subqueries.splice(0, 1)[0];

		if (!rightQuery) return leftQuery.orderBy(desc(leftQuery._.selectedFields.modifyDate));
		else {
			let combined = leftQuery.unionAll(rightQuery);

			subqueries.forEach((q) => (combined = combined.unionAll(q)));
			return combined.orderBy(desc(combined._.selectedFields.modifyDate));
		}
	}

	return undefined;
};

export const aliasedColumn = <T extends AnyColumn>(
	column: T,
	alias: string,
): SQL.Aliased<GetColumnData<T>> => {
	return column.getSQL().mapWith(column.mapFromDriverValue).as(alias);
};
