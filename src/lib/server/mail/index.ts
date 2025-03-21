import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';
import type SMTPPool from 'nodemailer/lib/smtp-pool';
import type Mail from 'nodemailer/lib/mailer';
import type { Component, ComponentProps } from 'svelte';
import type { HTMLSlotAttributes } from 'svelte/elements';
import { render } from 'svelte/server';

if (!env.MAIL_HOST) throw new Error('MAIL_HOST is not set');
if (!env.MAIL_AUTH_USER) throw new Error('MAIL_AUTH_USER is not set');

const auth = {
	user: env.MAIL_AUTH_USER,
};

if (['oauth2', 'OAuth2', 'OAUTH2'].indexOf(env.MAIL_AUTH_TYPE || '') > -1) {
	if (!env.MAIL_AUTH_CLIENT_ID) throw new Error('MAIL_AUTH_CLIENT_ID is not set');
	if (!env.MAIL_AUTH_CLIENT_SECRET) throw new Error('MAIL_AUTH_CLIENT_SECRET is not set');
	if (!env.MAIL_AUTH_REFRESH_TOKEN) throw new Error('MAIL_AUTH_REFRESH_TOKEN is not set');

	Object.assign(auth, {
		type: env.MAIL_AUTH_TYPE, // e.g. 'oauth2'
		clientId: env.MAIL_AUTH_CLIENT_ID,
		clientSecret: env.MAIL_AUTH_CLIENT_SECRET,
		refreshToken: env.MAIL_AUTH_REFRESH_TOKEN,
	});
} else {
	if (!env.MAIL_AUTH_PASS) throw new Error('MAIL_AUTH_PASS is not set');

	Object.assign(auth, {
		pass: env.MAIL_AUTH_PASS,
	});
}

const transporter = nodemailer.createTransport({
	service: env.MAIL_SERVICE, // undefineable, e.g. gmail
	host: env.MAIL_HOST, // e.g. smtp.gmail.com
	port: env.MAIL_PORT || 587,
	secure: !!env.MAIL_SECURE,
	auth,
} as SMTPPool.Options);

export type SendMailProps<AdditionalProps extends Record<string, any> = {}> =
	ComponentProps<Component> & AdditionalProps & Mail.Options;

export type SendMailOptions<AdditionalProps extends Record<string, any> = {}> = (
	props: SendMailProps<AdditionalProps>,
) => Mail.Options;

// ref: https://github.com/carstenlebek/svelte-email/issues/34#issuecomment-2441378702
export const renderMail = async <AdditionalProps extends Record<string, any> = {}>(
	template: Component<AdditionalProps, {}, string>,
	props: SendMailProps<AdditionalProps>,
) => {
	const rendered = await render(template, { props });

	const doctype =
		'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';

	return `${doctype}${rendered.head}${rendered.body}`;
};

const createSendMail =
	<AdditionalProps extends Record<string, any> = {}>(
		template: Component<AdditionalProps, {}, string>,
		options: SendMailOptions<AdditionalProps>,
	) =>
	async (props: ComponentProps<Component> & AdditionalProps & Mail.Options) =>
		await transporter.sendMail({
			...props,
			...options(props),
			html: await renderMail(template, props),
		});

import EmailConfirm from './emailConfirm.svelte';

export const sendEmailConfirm = createSendMail(EmailConfirm, ({}) => ({}));
