<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import { EllipsisVertical, Paperclip, SendHorizontal, SmilePlus, X } from 'lucide-svelte';
	import Message, { Direction } from './Message.svelte';
	import { userStore } from '$lib/context';
	import { ArticleCategory, ArticleType } from '@app';
	import EmojiList, { type EmojiEventHandler } from '$stories/components/EmojiList.svelte';
	import { goto, onNavigate } from '$app/navigation';
	import type { Emoji } from 'emoji-type';
	import { cn, formatDatetimeString, sanitizeHTML, twemoji, uploadImage } from '$lib/utils';
	import Muted from '$lib/components/typo/muted.svelte';
	import UserAvatar from '$stories/components/Avatar.svelte';
	import MediaListCarousel from '$stories/components/MediaListCarousel.svelte';
	import * as Card from '$lib/components/ui/card';
	import { onMount, tick } from 'svelte';
	import { deserialize } from '$app/forms';
	import Dropzone from 'svelte-file-dropzone';
	import { imageFormat } from '$lib/config';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import AlertDialog from '$stories/components/AlertDialog.svelte';
	import { toast } from 'svelte-sonner';
	import { source } from 'sveltekit-sse';
	import { page } from '$app/state';

	interface Props extends ReturnType<typeof $props> {
		info?: App.DMChannel;
	}

	const { info }: Props = $props();

	let user = $state<App.User>(null);
	userStore.subscribe((v) => (user = v));

	let enableScrollEvent = $state(false);
	let dms = $state<App.DM[]>([]);

	const getDM = async (before = new Date()) => {
		const body = new FormData();
		body.append('before', before.getTime().toString());

		const result = await fetch('?/get', { method: 'post', body })
			.then((r) => r.text())
			.then((r) => deserialize(r));

		if (result.type === 'success') {
			const new_dms = result.data?.dms as App.DM[] | undefined;

			if (new_dms && new_dms.length > 0) {
				dms = Object.values(
					[...new_dms, ...dms].reduce<Record<string, App.DM>>(
						(acc, dm) => (acc[dm.id] = dm) && acc,
						{},
					),
				);
				enableScrollEvent = true;
				await tick();
				scrollToDM(new_dms[new_dms.length - 1].id);
			} else {
				enableScrollEvent = false;
			}
			// } else {
			// 	openErrorOnBeginDM = true;
		}
	};

	onMount(() => {
		getDM().then(scrollToBottom);
	});

	let container = $state<HTMLElement>();

	const scrollToBottom = () => {
		if (!container) return;

		const element = container.lastElementChild as HTMLElement;

		if (!element) return;

		container.scroll({ top: element.offsetTop });
	};

	const onScrollContainer = () => {
		if (!container) return;

		if (enableScrollEvent && container.scrollTop < 100) {
			enableScrollEvent = false;
			getDM(dms[0].sentAt);
		}
	};

	onNavigate((nav) => {
		if (nav.to?.route.id === '/dm/[id]') {
			dms = [];
			enableScrollEvent = false;
			getDM().then(scrollToBottom);
		}
	});
	$effect(scrollToBottom);

	const scrollToDM = (id: string) => {
		if (!container) return;

		const targetId = `dm-${id}`;
		const element = document.getElementById(targetId);

		if (!element) return;

		container.scroll({ top: element.offsetTop });
	};

	// TODO: 스크롤 위치가 일정 범위 내일 때 마지막 DM 날짜 이전의 DM 불러오기. 만약에 없는 경우 이벤트 연결 끊기

	let openEmojiList = $state(false);
	let emojiListProps = $state({
		x: 0,
		y: 0,
		xMargin: 0,
		yMargin: 0,
		onEmoji: (_: Emoji | undefined) => {},
		autoClose: false,
		value: undefined as Emoji | undefined,
	});

	const onOpenEmojiList = (
		event: MouseEvent & {
			currentTarget: EventTarget & HTMLElement;
		},
		onEmoji: EmojiEventHandler,
		option?: { autoClose?: boolean; value?: Emoji },
	) => {
		event.stopPropagation(); // window.onclick 이벤트에 bubbling 되지 않도록 전파 방지 조치

		const clientRects = event.currentTarget.getClientRects()[0];

		emojiListProps = {
			x: clientRects.x + window.scrollX,
			y: clientRects.y + window.scrollY,
			xMargin: clientRects.width,
			yMargin: clientRects.height,
			onEmoji,
			autoClose: !!option?.autoClose,
			value: option?.value,
		};
		openEmojiList = true;
	};

	const defaultDraft: App.GeneralDM = {
		message: '',
	};

	let dmDraft = $state(defaultDraft);

	const onSend = async () => {
		if (JSON.stringify(dmDraft) === JSON.stringify(defaultDraft)) return;

		const result = await fetch('?/send', {
			method: 'post',
			body: JSON.stringify(dmDraft),
		})
			.then((r) => r.text())
			.then((r) => deserialize(r));

		if (result.type === 'success') {
			// const new_dms = result.data?.dms as App.DM[] | undefined;

			// if (new_dms && new_dms.length > 0) dms = [...dms, ...new_dms];

			dmDraft = defaultDraft;
			scrollToBottom();
		} else {
			console.log(result);

			if (result.status === 406)
				toast.error(
					'이 대화방에서 메시지를 수신할 대상이 없습니다. 대화가 종료되었거나 상대방이 차단했을 수 있습니다.',
				);
			else
				toast.error('메시지를 보내는 도중 오류가 발생하였습니다. 고객센터에 문의하시기 바랍니다.');
		}
	};

	source('/dm/sse')
		.select('message')
		.subscribe((message) => {
			if (!message) return;
			const parsed = JSON.parse(message);

			if (parsed.channelId !== page.params.id) return;

			const new_dms = parsed.dms.map((dm: App.DM) => ({ ...dm, sentAt: new Date(dm.sentAt) })) as
				| App.DM[]
				| undefined;

			console.log(new_dms);

			if (new_dms && new_dms.length > 0) dms = [...dms, ...new_dms];

			if (container) {
				if (container.scrollTop >= container.scrollHeight - container.clientHeight - 100)
					tick().then(() => scrollToBottom());
			}
		});

	const onKeyUp = (event: KeyboardEvent) => {
		if (event.key === 'Enter') return onSend();
	};

	const onEmoji: EmojiEventHandler = (emoji) => {
		dmDraft.message += emoji || '';
	};

	const onReact = (messageId: string, emoji?: Emoji) => {
		const target = dms.findIndex((dm) => dm.id === messageId);
		const reactions = (dms[target] as App.GeneralDM).reactions || {};
		let myReaction = (dms[target] as App.GeneralDM).myReaction;

		if (myReaction) {
			reactions[myReaction]! -= 1;
			if (reactions[myReaction] === 0) delete reactions[myReaction];
		}

		if (emoji) {
			if (!reactions[emoji]) reactions[emoji] = 1;
			else reactions[emoji] += 1;
		}
		myReaction = emoji || undefined;

		dms[target] = {
			...dms[target],
			reactions,
			myReaction,
		} as App.DM & App.GeneralDM;
	};

	const onReply = (message: App.DM) => {
		dmDraft.relatedMessage = undefined;
		tick().then(() => (dmDraft.relatedMessage = message));
	};

	const onDropMedia = async ({ detail }: any) => {
		const { acceptedFiles } = detail;

		let imageFile = acceptedFiles[0];

		if (!imageFile) return;

		try {
			const path = await uploadImage(imageFile);

			dmDraft.attachments = [...(dmDraft.attachments || []), path];
		} catch (err) {
			console.error(err);
		}
	};

	const participants = $derived(info?.participants.filter((v) => v.id !== user!.id) || []);

	const title = $derived(
		participants.length > 0
			? `${info?.participants.filter((v) => v.id !== user!.id).map((v) => v.username)} 님과의 대화`
			: '종료된 대화',
	);

	let openBeforeLeaveAlert = $state(false);
	const onLeave = async () => {
		const result = await fetch('?/leave', { method: 'post', body: new FormData() })
			.then((r) => r.text())
			.then((r) => deserialize(r));

		if (result.type === 'success') {
			goto('/dm');
		}
	};

	const sameSender = (dest: App.DM, dm: App.DM) =>
		!['join', 'leave'].includes(dest?.type || '') && dest?.sender?.id === dm.sender?.id;
</script>

<Header {title} />

<Section class="flex size-full flex-col">
	<H2 class="flex flex-none justify-between">
		<span>{title}</span>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class="m-0 p-0">
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="icon"><EllipsisVertical /></Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-56" align="end">
				<DropdownMenu.Group>
					<DropdownMenu.Item onclick={() => (openBeforeLeaveAlert = true)}>
						나가기
					</DropdownMenu.Item>
					<!-- TODO 구현 완료 시 재활성화
					<DropdownMenu.Item onclick={() => {}}>신고하고 나가기</DropdownMenu.Item>
					-->
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</H2>
	<section
		bind:this={container}
		onscroll={onScrollContainer}
		class="bg-background relative mt-4 size-full space-y-2 overflow-y-auto border p-2">
		{#each dms as dm, i}
			<Message
				dir={dm.sender!.id === user!.id ? Direction.SEND : Direction.RECEIVE}
				{dm}
				sameSenderAsPrev={sameSender(dms[i - 1], dm)}
				sameSenderAsNext={sameSender(dms[i + 1], dm)}
				sentAtOfNext={dms[i + 1]?.sentAt}
				id="dm-{dm.id}"
				onScrollToDM={scrollToDM}
				{onOpenEmojiList}
				{onReply}
				{onReact}
				tabindex={i + 1} />
		{/each}
	</section>
	{#if dmDraft.relatedMessage}
		<section class="bg-background flex w-full items-center space-x-2 border border-t-0 p-2">
			<a
				class="bg-secondary relative block w-full cursor-pointer space-y-2 border p-2 text-left"
				href="#dm-{dmDraft.relatedMessage.id}"
				onclick={(event) => {
					event.preventDefault(); // 화면 전체 스크롤을 차단
					scrollToDM(dmDraft.relatedMessage!.id);
				}}
				use:twemoji>
				<div class="flex items-center space-x-2 bg-inherit">
					<UserAvatar class="size-[2em] flex-none" user={dmDraft.relatedMessage.sender} />
					<strong>{dmDraft.relatedMessage.sender?.username}</strong>
					<Muted class="">{formatDatetimeString(dmDraft.relatedMessage.sentAt)}</Muted>
				</div>
				<div class="bg-inherit">
					{@html sanitizeHTML(
						(
							(dmDraft.relatedMessage.type === 'general' && dmDraft.relatedMessage.message) ||
							'<i>내용 없음</i>'
						).replace(/\n/g, '<br>'),
					)}
				</div>

				<Button
					size="icon"
					variant="outline"
					class="absolute top-2 right-2 cursor-pointer"
					onclick={(event) => {
						event.preventDefault();
						event.stopPropagation();
						delete dmDraft.relatedMessage;
					}}>
					<X />
				</Button>
			</a>
		</section>
	{/if}
	{#if dmDraft.attachments && dmDraft.attachments.length > 0}
		<section
			class="bg-background flex w-full items-center justify-center space-x-2 border border-t-0 p-2">
			<MediaListCarousel
				media={dmDraft.attachments.map((v, idx) => ({ src: v, alt: `첨부 이미지 ${idx + 1}` }))}
				opts={{ loop: false }}
				listClass="w-44 sm:w-88 md:max-[840px]:w-44 lg:w-132 xl:w-176 2xl:w-220"
				itemClass="h-40 sm:basis-1/2 md:max-[840px]:basis-full lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5">
				{#snippet child(medium)}
					<Card.Root class="size-full">
						<img class="size-full" src={medium.src} alt={medium.alt} />
						<X
							class="bg-destructive text-destructive-foreground absolute top-2 right-2 size-5"
							onclick={() => {
								dmDraft.attachments = dmDraft.attachments!.filter((v) => v !== medium.src);
							}} />
					</Card.Root>
				{/snippet}
			</MediaListCarousel>
		</section>
	{/if}
	<section class="bg-background flex w-full items-center space-x-2 border border-t-0 p-2">
		<Dropzone
			accept={imageFormat}
			on:drop={onDropMedia}
			multiple={false}
			class={cn(
				buttonVariants({
					variant: 'secondary',
					size: 'icon',
				}),
			)}>
			<!-- <Button size="icon" variant="secondary"> -->
			<!-- 파일 첨부 -->
			<Paperclip />
			<!-- </Button> -->
		</Dropzone>
		<Input
			name="chat"
			placeholder={info?.isAbleToSend ? '메시지를 입력하세요...' : '대화할 수 없는 대화방입니다.'}
			bind:value={dmDraft.message}
			onkeyup={onKeyUp}
			disabled={!info?.isAbleToSend} />
		<Button size="icon" variant="secondary" onclick={(event) => onOpenEmojiList(event, onEmoji)}>
			<!-- 이모티콘 추가 -->
			<SmilePlus />
		</Button>
		<Button size="icon" onclick={onSend}>
			<!-- 전송 -->
			<SendHorizontal />
		</Button>
	</section>
</Section>

<EmojiList bind:open={openEmojiList} {...emojiListProps} />

<AlertDialog
	title="정말로 나가시겠습니까?"
	description="나간 이후에도 새로운 대화방에서 대화를 진행할 수 있습니다. 이를 원하지 않는 경우 상대방을 차단하시기 바랍니다."
	cancel={true}
	onAction={onLeave}
	bind:open={openBeforeLeaveAlert} />
