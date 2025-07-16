<svelte:options runes />

<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Header from '$stories/components/Header.svelte';
	import {
		Share2,
		User,
		EllipsisVertical,
		Pencil,
		CircleCheck,
		MessageSquare,
		Clock,
		Link,
		CircleDashed,
		UserX,
	} from 'lucide-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import H2 from '$lib/components/typo/h2.svelte';
	import H3 from '$lib/components/typo/h3.svelte';
	import { dataURLToFile, durationString, sanitizeHTML, uploadImage } from '$lib/utils';
	import * as Table from '$lib/components/ui/table/index.js';
	import { userStore } from '$lib/context';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import Chart from '$lib/components/chart/chart.svelte';
	import { imageFormat } from '$lib/config';
	import Input from '$lib/components/ui/input/input.svelte';
	import Editor from '$lib/components/editor/editor.svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Dropzone from 'svelte-file-dropzone';
	import * as Select from '$lib/components/ui/select/index.js';
	import X from '@lucide/svelte/icons/x';
	import ColorPicker from 'svelte-awesome-color-picker';
	import { profileSchema, type AnnouncementSchema, type ProfileSchema } from '$lib/schema/profile';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form';
	import tinycolor from 'tinycolor2';
	import Cropper from '$lib/components/cropper/cropper.svelte';
	import AlertDialog from '$stories/components/AlertDialog.svelte';
	import UserArticles from './UserArticles.svelte';
	import Announcements from './Announcements.svelte';
	import P from '$lib/components/typo/p.svelte';
	import Ul from '$lib/components/typo/ul.svelte';
	import { deserialize } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { UserRelationship } from '@app';
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import Tooltip from '$lib/components/tooltip/Tooltip.svelte';
	import { m } from '$lib/messages';

	interface Props extends ReturnType<typeof $props> {
		user: Omit<NonNullable<App.User>, 'status'>;
		announcements?: App.ProfileAnnouncements;
		profileFormData: SuperValidated<Infer<ProfileSchema>>;
		announcementFormData: SuperValidated<Infer<AnnouncementSchema>>;
		relationshipFromUser: UserRelationship;
		relationshipToUser: UserRelationship;
	}

	const {
		user,
		announcements,
		profileFormData,
		announcementFormData,
		relationshipFromUser,
		relationshipToUser,
	}: Props = $props();

	let me = $state<App.User>(null);
	userStore.subscribe((v) => (me = v));

	const patternTinycolor = $derived(tinycolor(user.profile.accentColor || 'hsl(29.52 83% 25%)'));
	const patternColor = $derived(
		patternTinycolor.getBrightness() > 127
			? patternTinycolor.darken(7.7).toHexString()
			: patternTinycolor.brighten(7.7).toHexString(),
	);

	// Profile form
	// let openErrorOnProfileUpdateAlert = $state(false);
	const onErrorOnProfileUpdate = () => {
		toast.error(m['ERROR_ALERT.TITLE']({ while: m['PROFILE.WHILE.UPDATING']() }), {
			description: m['ERROR_ALERT.DESCRIPTION'](),
		});
	};

	const profileForm = superForm(profileFormData, {
		validators: zodClient(profileSchema),
		dataType: 'json',
		resetForm: false, // ref: https://superforms.rocks/faq#how-can-i-prevent-the-form-from-being-reset-after-its-submitted
		onResult({ result, cancel }) {
			if (result.type !== 'success' || [200, 204, 302].indexOf(result.status || 0) === -1) {
				console.error(result);
				if (result.status !== 400) {
					cancel();

					console.error(result);
					onErrorOnProfileUpdate();
				}
			} else {
				// Distribute updated user info
				userStore.update(() => result.data?.user);
				profileEditMode = false;
			}
		},
	});

	const {
		form: profileData,
		enhance: profileEnhance,
		constraints: profileConstraints,
	} = profileForm;

	// Profile Image Cropper
	// ref: https://svelte.dev/playground/11303854cb6247ae99514acad96190b6?version=5.25.3
	// ref: https://stackoverflow.com/a/11058858
	let profileImageCropper = $state<{
		open: boolean;
		source: string;
		cropper?: ReturnType<typeof Cropper>;
	}>({
		open: false,
		source: '',
		cropper: undefined,
	});

	const onDropProfileImage = ({ detail }: any) => {
		const { acceptedFiles } = detail;

		let imageFile = acceptedFiles[0];

		if (!imageFile) return;

		let reader = new FileReader();
		reader.onload = (e) => {
			if (!e.target?.result) profileImageCropper.source = '';
			else if (typeof e.target.result === 'string') profileImageCropper.source = e.target.result;
			else profileImageCropper.source = String.fromCharCode(...new Uint16Array(e.target.result));

			profileImageCropper.open = true;
		};
		reader.readAsDataURL(imageFile);
	};

	// ref: https://superforms.rocks/concepts/tainted
	const onSetProfileImage = () => {
		if (!profileImageCropper.cropper) return;

		profileImageCropper.cropper.getImage().then(async (destImage) => {
			if (!destImage) return;

			try {
				const path = await dataURLToFile(destImage).then((file) => uploadImage(file));

				profileData.update(($profileData: Infer<ProfileSchema>) => {
					$profileData.profileImage = path;
					return $profileData;
				});

				profileImageCropper.open = false;
			} catch (err) {
				console.error(err);
				onErrorOnProfileUpdate();
				return;
			}
		});
	};

	const removeProfileImage = () => {
		profileData.update(($profileData: Infer<ProfileSchema>) => {
			$profileData.profileImage = '';
			return $profileData;
		});
	};

	// Header Image Cropper
	// ref: https://svelte.dev/playground/11303854cb6247ae99514acad96190b6?version=5.25.3
	// ref: https://stackoverflow.com/a/11058858
	let headerImageCropper = $state<{
		open: boolean;
		source: string;
		cropper?: ReturnType<typeof Cropper>;
	}>({
		open: false,
		source: '',
		cropper: undefined,
	});

	const onDropHeaderImage = ({ detail }: any) => {
		const { acceptedFiles } = detail;

		let imageFile = acceptedFiles[0];

		if (!imageFile) return;

		let reader = new FileReader();
		reader.onload = (e) => {
			if (!e.target?.result) headerImageCropper.source = '';
			else if (typeof e.target.result === 'string') headerImageCropper.source = e.target.result;
			else headerImageCropper.source = String.fromCharCode(...new Uint16Array(e.target.result));

			headerImageCropper.open = true;
		};
		reader.readAsDataURL(imageFile);
	};

	// ref: https://superforms.rocks/concepts/tainted
	const onSetHeaderImage = () => {
		if (!headerImageCropper.cropper) return;

		headerImageCropper.cropper.getImage().then(async (destImage) => {
			if (!destImage) return;

			try {
				const path = await dataURLToFile(destImage).then((file) => uploadImage(file));

				profileData.update(($profileData: Infer<ProfileSchema>) => {
					$profileData.headerImage = path;
					return $profileData;
				});

				headerImageCropper.open = false;
			} catch (err) {
				console.error(err);
				onErrorOnProfileUpdate();
			}
		});
	};

	const removeHeaderImage = () => {
		profileData.update(($profileData: Infer<ProfileSchema>) => {
			$profileData.headerImage = '';
			return $profileData;
		});
	};

	// Stat Dialog
	let openStatDialog = $state(false);

	const statChartOption: echarts.EChartsOption = {
		tooltip: {
			trigger: 'item',
		},
	};

	// Profile Edit Mode
	let profileEditMode = $state(false);

	// Profile link copy
	const onCopyProfileLink = () => {
		navigator.clipboard.writeText(location.href).then(() => {
			toast.success(m['LINK_COPIED.TITLE']({ item: m['PROFILE.THIS']() }), {
				description: m['LINK_COPIED.DESCRIPTION'](),
			});
		});
	};

	// Block
	let openBlockAlert = $state(false);
	// let openErrorOnBlock = $state(false);
	// let openErrorOnUnblock = $state(false);

	let userArticlesKey = $state(Date.now());

	const onBlock = async () => {
		// ref: https://svelte.dev/docs/kit/$app-forms#applyAction
		const result = await fetch('?/block', { method: 'post', body: new FormData() })
			.then((r) => r.text())
			.then((r) => deserialize(r));

		if (result.type === 'success') {
			toast.success(m['BLOCKED.TITLE'](), {
				action: {
					label: m['BLOCKED.UNBLOCK_BUTTON'](),
					onClick: onUnblock,
				},
			});
			invalidate('user:info');
			userArticlesKey = Date.now(); // 사용자 게시물 목록 갱신
		} else {
			toast.error(m['ERROR_ALERT.TITLE']({ while: m['PROFILE.WHILE.BLOCKING']() }), {
				description: m['ERROR_ALERT.DESCRIPTION'](),
			});
		}
	};

	const onUnblock = async () => {
		const result = await fetch('?/unblock', { method: 'post', body: new FormData() })
			.then((r) => r.text())
			.then((r) => deserialize(r));

		if (result.type === 'success') {
			toast.success(m['UNBLOCKED']());
			invalidate('user:info');
			userArticlesKey = Date.now(); // 사용자 게시물 목록 갱신
		} else {
			toast.error(m['ERROR_ALERT.TITLE']({ while: m['PROFILE.WHILE.UNBLOCKING']() }), {
				description: m['ERROR_ALERT.DESCRIPTION'](),
			});
		}
	};

	// TODO: get values from server
	const maxSlot = 4,
		maxOpenSlot = maxSlot,
		openedSlot = 3;
	const avgRespTime = 15 * 60 * 1000;
	const numOfCommission = 10,
		avgWorkTime = 7 * 24 * 60 * 60 * 1000,
		completionRatio = 10 / 10;
	const statChartData: echarts.SeriesOption = {
		name: m['PROFILE.CHART'](),
		type: 'pie',
		radius: ['40%', '70%'],
		avoidLabelOverlap: false,
		label: {
			show: false,
			position: 'center',
		},
		labelLine: {
			show: false,
		},
		data: [
			{ value: 1048, name: '커미션 1' },
			{ value: 735, name: '커미션 2' },
			{ value: 580, name: '커미션 3' },
		],
	};

	const onBeginDM = async () => {
		const result = await fetch('?/beginDM', { method: 'post', body: new FormData() })
			.then((r) => r.text())
			.then((r) => deserialize(r));

		if (result.type === 'success') {
			const channelId = result.data?.channelId;

			if (channelId) goto(`/dm/${channelId}`);
		} else {
			toast.error(m['ERROR_ALERT.TITLE']({ while: m['DM.WHILE_BEGIN_DM']() }), {
				description: m['ERROR_ALERT.DESCRIPTION'](),
			});
		}
	};
</script>

<Header title={user.username} />

<section
	class="relative aspect-4/1 w-full"
	style="--primary-color: {user.profile.accentColor || 'hsl(var(--primary));'}">
	{#if $profileData.headerImage}
		<img
			src={$profileData.headerImage}
			alt={m['PROFILE.HEADER_IMAGE_ALT']({ username: user.username })}
			class="size-full" />
		{#if profileEditMode}
			<Button
				onclick={removeHeaderImage}
				variant="link"
				class="absolute top-0 left-0 flex size-full items-center bg-zinc-950/60 text-center text-white opacity-0 hover:no-underline hover:opacity-100 active:opacity-100">
				<span>{m['PROFILE.REMOVE_IMAGE']()}</span>
			</Button>
		{/if}
	{:else if profileEditMode}
		<Dropzone
			accept={imageFormat}
			on:drop={onDropHeaderImage}
			multiple={false}
			class="dropzone size-full justify-center">
			<p>{m['FORM.DROPZONE']({ media: m['PROFILE.HEADER_IMAGE']() })}</p>
		</Dropzone>
	{:else}
		<div
			class="banner-pattern size-full bg-(--primary-color)"
			style={`--pattern-color: ${patternColor};`}>
		</div>
	{/if}
</section>

<main
	class="flex flex-col lg:flex-row"
	style="--primary-color: {user.profile.accentColor || 'hsl(var(--primary));'}">
	<form
		class="bg-background relative box-border w-full flex-none space-y-4 p-6 lg:w-80"
		method="POST"
		use:profileEnhance
		action="?/update">
		<section class="flex w-full flex-col items-center space-y-2">
			<Form.Field
				form={profileForm}
				name="profileImage"
				class="flex w-full flex-col items-center space-y-2">
				<Form.Control>
					{#snippet children({ props })}
						<div class="relative">
							<div class="relative aspect-square w-30 overflow-hidden rounded-full border">
								{#if $profileData.profileImage}
									<img
										src={$profileData.profileImage}
										alt={m['PROFILE.PROFILE_IMAGE_ALT']({ username: user.username })}
										class="size-full" />
									{#if profileEditMode}
										<Button
											onclick={removeProfileImage}
											variant="link"
											class="absolute top-0 left-0 flex size-full items-center bg-zinc-950/60 text-center text-white opacity-0 hover:no-underline hover:opacity-100">
											<span>{m['PROFILE.REMOVE_IMAGE']()}</span>
										</Button>
										<input name={props.name} value={$profileData.profileImage} hidden />
									{/if}
								{:else}
									<User class="size-full" />
								{/if}
							</div>
							{#if relationshipToUser === UserRelationship.BLOCKED}
								<div
									class="bg-destructive text-destructive-foreground absolute right-1 bottom-1 size-7 rounded-full border p-1"
									title={m['PROFILE.BLOCKED']()}>
									<UserX class="size-full" />
								</div>
							{/if}
						</div>
						{#if profileEditMode && !$profileData.profileImage}
							<input name={props.name} value={$profileData.profileImage} hidden />
							<Dropzone
								id={props.id}
								accept={imageFormat}
								on:drop={onDropProfileImage}
								multiple={false}>
								<p>{m['FORM.DROPZONE']({ media: m['PROFILE.HEADER_IMAGE']() })}</p>
							</Dropzone>
							<input name={props.name} value="" hidden />
						{/if}
					{/snippet}
				</Form.Control>
				{#if profileEditMode}
					<Form.Description>{m['PROFILE.PROFILE_IMAGE_DESCRIPTION']()}</Form.Description>
					<Form.FieldErrors />
				{/if}
			</Form.Field>

			{#if profileEditMode}
				<Form.Field form={profileForm} name="username">
					<Form.Control>
						{#snippet children({ props })}
							<Input
								{...props}
								class="text-center text-2xl font-bold md:text-2xl"
								placeholder={m['USER_INFO.USERNAME']()}
								bind:value={$profileData.username}
								{...$profileConstraints.username} />
						{/snippet}
					</Form.Control>
					{#if profileEditMode}
						<Form.Description>{m['USER_INFO.USERNAME_MAX_LENGTH']()}</Form.Description>
						<Form.FieldErrors />
					{/if}
				</Form.Field>
			{:else}
				<H2 class="border-none text-center text-2xl">{user.username}</H2>
			{/if}
		</section>

		{#if !profileEditMode}
			<section class="flex">
				<Tooltip
					class="w-full"
					text={m['DM.UNABLE_TO_DM_WHEN_BLOCKED']()}
					disabled={relationshipFromUser !== UserRelationship.BLOCKED &&
						relationshipToUser !== UserRelationship.BLOCKED}>
					{#snippet child({ props })}
						<div {...props} class="w-full">
							<Button
								onclick={onBeginDM}
								class="w-full flex-1 bg-(--primary-color) hover:bg-(--primary-color)/90"
								disabled={relationshipFromUser === UserRelationship.BLOCKED ||
									relationshipToUser === UserRelationship.BLOCKED ||
									user.id === me?.id}>
								<MessageSquare />
								{m['DM.BEGIN_DM']()}
							</Button>
						</div>
					{/snippet}
				</Tooltip>
				<Button size="icon" variant="outline" onclick={onCopyProfileLink}><Share2 /></Button>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class="m-0 p-0">
						{#snippet child({ props })}
							<Button {...props} variant="outline" size="icon"><EllipsisVertical /></Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56" align="end">
						{#if relationshipToUser === UserRelationship.BLOCKED}
							<DropdownMenu.Item onclick={onUnblock} disabled={!!me && user.id === me.id}>
								{m['PROFILE.UNBLOCK']()}
							</DropdownMenu.Item>
						{:else}
							<DropdownMenu.Item
								onclick={() => {
									openBlockAlert = true;
								}}
								disabled={!!me && user.id === me.id}>
								{m['PROFILE.BLOCK']()}
							</DropdownMenu.Item>
						{/if}
						<!-- TODO 구현 완료 시 재활성화
						<DropdownMenu.Item onclick={() => {}}>{m['REPORT']()}</DropdownMenu.Item>
						-->
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</section>
		{/if}

		{#if profileEditMode}
			<Form.Field form={profileForm} name="contactAvailable">
				<Form.Control>
					{#snippet children({ props })}
						<H3 class="text-xl">{m['PROFILE.CONTACT_AVAILABLE.TITLE']()}</H3>
						<RadioGroup.Root
							name={props.name}
							value={!user.profile.contactAvailable
								? 'undefined'
								: typeof user.profile.contactAvailable === 'boolean'
									? 'always'
									: 'certain-time'}>
							<div class="flex items-center space-x-2">
								<RadioGroup.Item
									value="undefined"
									id="contact-available-undefined"
									onclick={() => ($profileData.contactAvailable = false)} />
								<Label for="contact-available-undefined">
									{m['PROFILE.CONTACT_AVAILABLE.UNDEFINED']()}
								</Label>
							</div>
							<div class="flex items-center space-x-2">
								<RadioGroup.Item
									value="always"
									id="contact-available-always"
									onclick={() => ($profileData.contactAvailable = true)} />
								<Label for="contact-available-always">
									{m['PROFILE.CONTACT_AVAILABLE.ALWAYS']()}
								</Label>
							</div>
							<div class="flex items-start space-x-2 max-lg:items-center">
								<RadioGroup.Item
									value="certain-time"
									id="contact-available-certain-time"
									onclick={() => ($profileData.contactAvailable = { from: 0, to: 23 })} />
								<Label for="contact-available-certain-time" class="items-center max-lg:flex">
									<div>{m['PROFILE.CONTACT_AVAILABLE.CERTAIN_TIME.THIS']()}:&nbsp;</div>
									<div class="mt-2 flex items-center">
										<Select.Root
											type="single"
											disabled={typeof $profileData.contactAvailable === 'boolean'}>
											<Select.Trigger class="w-[5em]">
												{typeof $profileData.contactAvailable === 'boolean'
													? 0
													: ($profileData.contactAvailable?.from ?? 0)}
											</Select.Trigger>
											<Select.Content>
												{#each Array(24) as _, hour}
													<Select.Item
														value={hour.toString()}
														onclick={() =>
															((
																$profileData.contactAvailable as App.Range<NumberEnumerate<24>>
															).from = hour as NumberEnumerate<24>)}>
														{hour}
													</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
										<span>{m['PROFILE.CONTACT_AVAILABLE.CERTAIN_TIME.FROM']()}</span>
										<Select.Root
											type="single"
											disabled={typeof $profileData.contactAvailable === 'boolean'}>
											<Select.Trigger class="w-[5em]">
												{typeof $profileData.contactAvailable === 'boolean'
													? 23
													: ($profileData.contactAvailable?.to ?? 23)}
											</Select.Trigger>
											<Select.Content>
												{#each Array(24) as _, hour}
													<Select.Item
														value={hour.toString()}
														onclick={() =>
															((
																$profileData.contactAvailable as App.Range<NumberEnumerate<24>>
															).to = hour as NumberEnumerate<24>)}>
														{hour}
													</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
										<span>{m['PROFILE.CONTACT_AVAILABLE.CERTAIN_TIME.TO']()}</span>
									</div>
								</Label>
							</div>
						</RadioGroup.Root>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{:else}
			<Alert.Root>
				<Clock class="size-4" />
				<Alert.Title>
					{m['PROFILE.CONTACT_AVAILABLE.TITLE']()}:
					{#if !user.profile.contactAvailable}
						{m['PROFILE.CONTACT_AVAILABLE.UNDEFINED']()}
					{:else if typeof user.profile.contactAvailable === 'boolean'}
						{m['PROFILE.CONTACT_AVAILABLE.ALWAYS']()}
					{:else}
						{user.profile.contactAvailable.from}{m['PROFILE.CONTACT_AVAILABLE.CERTAIN_TIME.FROM']()}
						{user.profile.contactAvailable.to}{m['PROFILE.CONTACT_AVAILABLE.CERTAIN_TIME.TO']()}
					{/if}
				</Alert.Title>
				<!-- TODO 2차 알파테스트 때 추가
				<Alert.Description>{m['PROFILE.AVERAGE_RESPONSE_TIME']()}: {durationString(avgRespTime)}</Alert.Description>
				-->
			</Alert.Root>
		{/if}

		<!-- TODO 2차 알파테스트 전에 추가
		{#if profileEditMode}
			<H3 class="text-xl">{m['PROFILE.MAXIMUM_SLOTS']()}</H3>
			<div class="mt-2 flex items-center">
				<Select.Root type="single">
					<Select.Trigger class="w-[5em]">{maxOpenSlot}</Select.Trigger>
					<Select.Content>
						{#each Array(maxSlot + 1) as _, slot}
							<Select.Item value={slot.toString()}>{slot}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<span>{m['PROFILE.SLOTS_UNIT']()}</span>
			</div>
		{:else}
			<section class="space-y-2">
				<div class="flex items-center space-x-2">
					<H3 class="inline-block text-xl">{m['PROFILE.OPENED_SLOTS']()}</H3>
					<Badge class="bg-(--primary-color) hover:bg-(--primary-color)/90">
						{openedSlot}/{maxOpenSlot}
					</Badge>
				</div>
				<div class="space-y-2 space-x-2">
					{#each Array(openedSlot)}
						<CircleDashed class="inline size-10 align-top text-green-700" />
					{/each}{#each Array(maxOpenSlot - openedSlot)}
						<CircleCheck class="inline size-10 align-top text-stone-700" />
					{/each}
				</div>
			</section>
		{/if}
		-->

		<!-- TODO 베타테스트 전에 추가
		{#if !profileEditMode}
			<section class="relative border p-4">
				<H3 class="hidden">{m['PROFILE.STAT.TITLE']()}</H3>
				<Table.Root>
					<Table.Body>
						<Table.Row>
							<Table.Head>{m['PROFILE.STAT.NUM_OF_COMMISSION']()}</Table.Head>
							<Table.Cell>{numOfCommission}{m['PROFILE.STAT.NUM_OF_COMMISSION_UNIT']()}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Head>{m['PROFILE.STAT.AVERAGE_WORK_TIME']()}</Table.Head>
							<Table.Cell>{durationString(avgWorkTime)}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Head>{m['PROFILE.STAT.COMPLETION_RATIO']()}</Table.Head>
							<Table.Cell class="font-bold">{(completionRatio * 100).toFixed(2)}%</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>
				<div class="text-right">
					<Button
						variant="link"
						onclick={() => (openStatDialog = true)}
						class="text-(--primary-color)">
						{m['PROFILE.STAT.OPEN_DIALOG']()}
						<ChevronRight class="size-4" />
					</Button>
				</div>
			</section>
		{/if}
		-->

		<section class="space-y-2">
			<H3 class="text-center text-xl">{m['PROFILE.INTRODUCTION']()}</H3>
			{#if profileEditMode}
				<Form.Field form={profileForm} name="introduction">
					<Form.Control>
						{#snippet children({ props })}
							<Editor
								bind:value={
									() => $profileData.introduction || '', (v) => ($profileData.introduction = v)
								} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			{:else}
				<article class="html border p-4">
					{#if user.profile.introduction}
						{@html sanitizeHTML(user.profile.introduction)}
					{:else}
						<span class="italic">{m['PROFILE.NO_INTRODUCTION']()}</span>
					{/if}
				</article>
			{/if}
		</section>

		{#if profileEditMode}
			<Form.Field form={profileForm} name="links" class="space-y-2 border p-4">
				<Form.Control>
					{#snippet children({ props })}
						<H3 class="text-xl">{m['PROFILE.LINK.THIS']()}</H3>
						{#each $profileData.links || [] as _, idx (idx)}
							<div class="flex items-center space-x-2">
								<Input
									placeholder={m['PROFILE.LINK.LABEL']()}
									bind:value={$profileData.links![idx].text} />
								<Input
									placeholder={m['PROFILE.LINK.URL']()}
									bind:value={$profileData.links![idx].href} />
								<Button
									variant="outline"
									size="icon"
									onclick={() =>
										($profileData.links = $profileData.links!.filter((_, i) => i !== idx))}
									class="flex-none">
									<X />
								</Button>
							</div>
						{/each}
						<Button
							variant="outline"
							class="w-full"
							onclick={() => {
								if (!$profileData.links) $profileData.links = [];
								$profileData.links = [...$profileData.links, { href: '', text: '' }];
							}}>
							{m['FORM.ADD_ITEM']({ item: m['PROFILE.LINK.THIS']() })}
						</Button>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{:else if (user.profile.links || []).length > 0}
			<section class="grid grid-cols-2 gap-2 border p-4">
				<H3 class="hidden">{m['PROFILE.LINK.THIS']()}</H3>
				{#each user.profile.links || [] as link}
					<div>
						<Link class="inline-block size-5 rounded-full bg-(--primary-color) p-0.5 text-white" />
						<Button
							variant="link"
							href={link.href}
							target="_blank"
							class="text-md text-foreground align-middle">
							{link.text}
						</Button>
					</div>
				{/each}
			</section>
		{/if}

		{#if profileEditMode}
			<section class="space-y-2 border p-4">
				<H3 class="text-xl">{m['PROFILE.ACCENT_COLOR']()}</H3>
				<Form.Field form={profileForm} name="accentColor">
					<Form.Control>
						{#snippet children({ props })}
							<ColorPicker
								isDialog={false}
								isAlpha={false}
								sliderDirection="horizontal"
								hex={user.profile.accentColor || null}
								onInput={({ hex }) => ($profileData.accentColor = hex === null ? undefined : hex)}
								nullable={true}
								texts={{
									label: {
										withoutColor: m['PROFILE.ACCENT_COLOR_UNSET'](),
									},
								}} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</section>
		{/if}

		{#if me && me.id === user.id}
			{#if profileEditMode}
				<div class="text-right">
					<Form.Button variant="default" class="bg-(--primary-color) hover:bg-(--primary-color)/90">
						{m['PROFILE.SAVE']()}
					</Form.Button>
					<Button variant="secondary" onclick={() => (profileEditMode = false)}>
						{m['CANCEL']()}
					</Button>
				</div>
			{:else}
				<Button
					size="icon"
					variant="outline"
					class="absolute top-6 right-6 rounded-full"
					aria-label={m['PROFILE.EDIT_PROFILE']()}
					onclick={() => (profileEditMode = true)}>
					<Pencil />
				</Button>
			{/if}
		{/if}
	</form>
	<section class="w-full space-y-8 p-4">
		<Announcements {user} {announcements} {announcementFormData} />
		<UserArticles {user} key={userArticlesKey.toString()} />
	</section>
</main>

<Dialog.Root bind:open={openStatDialog}>
	<Dialog.Content
		class="max-h-[100vh] overflow-x-hidden overflow-y-auto transition-none sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{m['PROFILE.STAT.DETAIL_TITLE']()}</Dialog.Title>
			<Dialog.Description>
				{m['PROFILE.STAT.DETAIL_DESCRIPTION']({ username: user.username })}
			</Dialog.Description>
		</Dialog.Header>
		<Table.Root>
			<Table.Body>
				<Table.Row>
					<Table.Head>{m['PROFILE.STAT.NUM_OF_COMMISSION']()}</Table.Head>
					<Table.Cell>{numOfCommission}{m['PROFILE.STAT.NUM_OF_COMMISSION_UNIT']()}</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Head>{m['PROFILE.STAT.COMMISSIONS_PER_TYPE']()}</Table.Head>
					<Table.Cell>
						<Chart class="size-50" option={statChartOption} series={[statChartData]} />
					</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Head>{m['PROFILE.AVERAGE_RESPONSE_TIME']()}</Table.Head>
					<Table.Cell>{durationString(avgRespTime)}</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Head>{m['PROFILE.STAT.AVERAGE_WORK_TIME']()}</Table.Head>
					<Table.Cell>{durationString(avgWorkTime)}</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Head>{m['PROFILE.STAT.COMPLETION_RATIO']()}</Table.Head>
					<Table.Cell class="font-bold">{(completionRatio * 100).toFixed(2)}%</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={profileImageCropper.open}>
	<Dialog.Content
		class="max-h-[100vh] overflow-x-hidden overflow-y-auto transition-none sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>
				{m['PROFILE.CROP_TITLE']({ image: m['PROFILE.PROFILE_IMAGE']() })}
			</Dialog.Title>
			<Dialog.Description>
				{m['PROFILE.CROP_DESCRIPTION']({ image: m['PROFILE.PROFILE_IMAGE']() })}
			</Dialog.Description>
		</Dialog.Header>
		<Cropper
			image={profileImageCropper.source || ''}
			maxZoom={10}
			aspect={1}
			shape="round"
			crop_window_margin={30}
			overlay_options={{ show_third_lines: true }}
			bind:this={profileImageCropper.cropper} />
		<Dialog.Footer>
			<Button onclick={onSetProfileImage}>{m['CONFIRM']()}</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={headerImageCropper.open}>
	<Dialog.Content
		class="max-h-[100vh] overflow-x-hidden overflow-y-auto transition-none sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{m['PROFILE.CROP_TITLE']({ image: m['PROFILE.HEADER_IMAGE']() })}</Dialog.Title>
			<Dialog.Description>
				{m['PROFILE.CROP_DESCRIPTION']({ image: m['PROFILE.HEADER_IMAGE']() })}
			</Dialog.Description>
		</Dialog.Header>
		<Cropper
			image={headerImageCropper.source || ''}
			maxZoom={10}
			aspect={4}
			shape="rect"
			crop_window_margin={30}
			overlay_options={{ show_third_lines: true }}
			bind:this={headerImageCropper.cropper} />
		<Dialog.Footer>
			<Button onclick={onSetHeaderImage}>{m['CONFIRM']()}</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

{#snippet blockDescription()}
	<Ul>
		<li>{m['PROFILE.BLOCKING.DESCRIPTION_INVISIBLE']()}</li>
		<li>{m['PROFILE.BLOCKING.DESCRIPTION_HIDDEN']()}</li>
		<li>{m['PROFILE.BLOCKING.DESCRIPTION_DM']()}</li>
		<li>{m['PROFILE.BLOCKING.DESCRIPTION_RECEIVE']()}</li>
		<li>{m['PROFILE.BLOCKING.DESCRIPTION_GIVE']()}</li>
		<li>{m['PROFILE.BLOCKING.DESCRIPTION_UNBLOCK']()}</li>
	</Ul>
{/snippet}

<AlertDialog
	title={m['PROFILE.BLOCKING.TITLE']()}
	description={blockDescription}
	cancel={true}
	onAction={onBlock}
	bind:open={openBlockAlert} />

<style lang="scss">
	:global([aria-label='color picker']) {
		margin: 0 !important;
		border: none !important;
		padding: 0 !important;
		width: 100% !important;
		--picker-width: 100%;
		--picker-height: 100%;

		:global(.h) {
			width: 100%;
			margin-left: 0 !important;
		}

		:global(.picker) {
			height: unset !important;
			aspect-ratio: 1;
		}
	}
</style>
