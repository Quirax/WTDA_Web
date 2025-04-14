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
		ChevronRight,
		TriangleAlert,
		NotepadTextDashed,
	} from 'lucide-svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Alert from '$lib/components/ui/alert/index.js';
	import H2 from '$lib/components/typo/h2.svelte';
	import H3 from '$lib/components/typo/h3.svelte';
	import { durationString, formatDatetimeString, isDesktop, sanitizeHTML } from '$lib/utils';
	import * as Table from '$lib/components/ui/table/index.js';
	import { userStore } from '$lib/context';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Card from '$lib/components/ui/card';
	import DocsImage from '../assets/docs.png';
	import * as Dialog from '$lib/components/ui/dialog';
	import Chart from '$lib/components/chart/chart.svelte';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import { deserialize } from '$app/forms';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { announcementsPerPage, imageFormat } from '$lib/config';
	import { FetchStatus } from '@app';
	import Input from '$lib/components/ui/input/input.svelte';
	import Editor from '$lib/components/editor/editor.svelte';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import Dropzone from 'svelte-file-dropzone';
	import * as Select from '$lib/components/ui/select/index.js';
	import { MediaQuery } from 'svelte/reactivity';
	import X from '@lucide/svelte/icons/x';
	import ColorPicker from 'svelte-awesome-color-picker';
	import {
		announcementSchema,
		profileSchema,
		type AnnouncementSchema,
		type ProfileSchema,
	} from '$lib/schema/profile';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Form from '$lib/components/ui/form';
	import { invalidate, invalidateAll } from '$app/navigation';
	import tinycolor from 'tinycolor2';
	import Cropper from '$lib/components/cropper/cropper.svelte';

	interface Props extends ReturnType<typeof $props> {
		user: Omit<NonNullable<App.User>, 'status'>;
		announcements?: App.ProfileAnnouncements;
		profileFormData: SuperValidated<Infer<ProfileSchema>>;
		announcementFormData: SuperValidated<Infer<AnnouncementSchema>>;
	}

	const { user, announcements, profileFormData, announcementFormData }: Props = $props();

	let me = $state<App.User>(null);
	userStore.subscribe((v) => (me = v));

	const patternTinycolor = $derived(tinycolor(user.profile.accentColor || 'hsl(29.52 83% 25%)'));
	const patternColor = $derived(
		patternTinycolor.getBrightness() > 127
			? patternTinycolor.darken(7.7).toHexString()
			: patternTinycolor.brighten(7.7).toHexString(),
	);

	// Profile form
	const profileForm = superForm(profileFormData, {
		validators: zodClient(profileSchema),
		dataType: 'json',
		resetForm: false, // ref: https://superforms.rocks/faq#how-can-i-prevent-the-form-from-being-reset-after-its-submitted
		onResult({ result, cancel }) {
			if (result.type !== 'success' || [200, 204, 302].indexOf(result.status || 0) === -1) {
				console.error(result);
				if (result.status !== 400) {
					cancel();
					// openErrorAlert = true;
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

		profileImageCropper.cropper.getImage().then((destImage) => {
			if (!destImage) return;

			profileData.update(($profileData: Infer<ProfileSchema>) => {
				$profileData.profileImage = destImage;
				return $profileData;
			});

			profileImageCropper.open = false;
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

		headerImageCropper.cropper.getImage().then((destImage) => {
			if (!destImage) return;

			profileData.update(($profileData: Infer<ProfileSchema>) => {
				$profileData.headerImage = destImage;
				return $profileData;
			});

			headerImageCropper.open = false;
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

	// Announcements List
	let announcementsListDrawerState = $state({
		open: false,
		list: Array<{ id: string; title: string; createDate: Date }>(),
		status: FetchStatus.LOADING,
		total: 0,
		page: 1,
	});

	const getAnnouncementsList = async () => {
		announcementsListDrawerState.status = FetchStatus.LOADING;
		announcementsListDrawerState.list = [];

		const formData = new FormData();
		formData.append('page', announcementsListDrawerState.page.toString());

		// ref: https://svelte.dev/docs/kit/$app-forms#applyAction
		const result = await fetch('?/announcementsList', { method: 'post', body: formData })
			.then((r) => r.text())
			.then((r) => deserialize(r));

		if (result.type === 'success') {
			announcementsListDrawerState.list = result.data!.list as Array<{
				title: string;
				createDate: Date;
				id: string;
			}>;
			announcementsListDrawerState.status = FetchStatus.COMPLETED;
			announcementsListDrawerState.total = result.data!.total as number;
		} else {
			announcementsListDrawerState.status = FetchStatus.FAILED;
			announcementsListDrawerState.total = 0;
		}
	};

	const onOpenAnnouncementsListDrawer = async () => {
		announcementsListDrawerState.open = true;
		announcementsListDrawerState.page = 1;
		announcementsListDrawerState.total = 0;
	};

	$effect(() => {
		if (announcementsListDrawerState.open && announcementsListDrawerState.page)
			getAnnouncementsList();
	});

	// Announcement Dialog
	let announcementDialogState = $state({
		open: false,
		announcement: { title: '', content: '', createDate: new Date() },
		status: FetchStatus.LOADING,
	});

	const openAnnouncementDialog = async (id: string) => {
		announcementDialogState.open = true;
		announcementDialogState.status = FetchStatus.LOADING;

		const formData = new FormData();
		formData.append('id', id);

		// ref: https://svelte.dev/docs/kit/$app-forms#applyAction
		const result = await fetch('?/announcement', { method: 'post', body: formData })
			.then((r) => r.text())
			.then((r) => deserialize(r));

		if (result.type === 'success' && result.data!.announcement) {
			announcementDialogState.announcement = result.data!.announcement as {
				title: string;
				content: string;
				createDate: Date;
			};
			announcementDialogState.status = FetchStatus.COMPLETED;
		} else {
			announcementDialogState.status = FetchStatus.FAILED;
		}
	};

	// Announcement Editor
	let openAnnouncementEditor = $state(false);

	const announcementForm = superForm(announcementFormData, {
		validators: zodClient(announcementSchema),
		dataType: 'json',
		resetForm: false, // ref: https://superforms.rocks/faq#how-can-i-prevent-the-form-from-being-reset-after-its-submitted
		onResult({ result, cancel }) {
			if (result.type !== 'success' || [200, 204, 302].indexOf(result.status || 0) === -1) {
				console.error(result);
				if (result.status !== 400) {
					cancel();
					// openErrorAlert = true;
				}
			} else {
				invalidateAll();
				openAnnouncementEditor = false;
			}
		},
	});

	const {
		form: announcementData,
		enhance: announcementEnhance,
		constraints: announcementConstraints,
	} = announcementForm;

	// Profile Edit Mode
	let profileEditMode = $state(false);

	// TODO: get values from server
	const maxSlot = 4,
		maxOpenSlot = maxSlot,
		openedSlot = 3;
	const avgRespTime = 15 * 60 * 1000;
	const numOfCommission = 10,
		avgWorkTime = 7 * 24 * 60 * 60 * 1000,
		completionRatio = 10 / 10;
	const statChartData: echarts.SeriesOption = {
		name: '커미션 수',
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
</script>

<Header title={user.username} />

<section
	class="relative aspect-4/1 w-full"
	style="--primary-color: {user.profile.accentColor || 'hsl(var(--primary));'}">
	{#if $profileData.headerImage}
		<img src={$profileData.headerImage} alt="{user.username} 님의 헤더 이미지" class="size-full" />
		{#if profileEditMode}
			<Button
				onclick={removeHeaderImage}
				variant="link"
				class="absolute top-0 left-0 flex size-full items-center bg-zinc-950/60 text-center text-white opacity-0 hover:no-underline hover:opacity-100 active:opacity-100">
				<span>이미지 제거</span>
			</Button>
		{/if}
	{:else if profileEditMode}
		<Dropzone
			accept={imageFormat}
			on:drop={onDropHeaderImage}
			multiple={false}
			class="dropzone size-full justify-center">
			<p>여기로 헤더 이미지를 드래그하거나, 클릭하여 헤더 이미지를 선택하세요.</p>
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
						<div class="relative aspect-square w-30 overflow-hidden rounded-full border">
							{#if $profileData.profileImage}
								<img
									src={$profileData.profileImage}
									alt="{user.username} 님의 프로필 이미지"
									class="size-full" />
								{#if profileEditMode}
									<Button
										onclick={removeProfileImage}
										variant="link"
										class="absolute top-0 left-0 flex size-full items-center bg-zinc-950/60 text-center text-white opacity-0 hover:no-underline hover:opacity-100">
										<span>이미지 제거</span>
									</Button>
									<input name={props.name} value={$profileData.profileImage} hidden />
								{/if}
							{:else}
								<User class="size-full" />
							{/if}
						</div>
						{#if profileEditMode && !$profileData.profileImage}
							<input name={props.name} value={$profileData.profileImage} hidden />
							<Dropzone
								id={props.id}
								accept={imageFormat}
								on:drop={onDropProfileImage}
								multiple={false}>
								<p>여기로 프로필 이미지를 드래그하거나, 클릭하여 프로필 이미지를 선택하세요.</p>
							</Dropzone>
							<input name={props.name} value="" hidden />
						{/if}
					{/snippet}
				</Form.Control>
				{#if profileEditMode}
					<Form.Description>변경된 프로필 이미지는 저장 후에 반영됩니다.</Form.Description>
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
								placeholder="닉네임"
								bind:value={$profileData.username}
								{...$profileConstraints.username} />
						{/snippet}
					</Form.Control>
					{#if profileEditMode}
						<Form.Description>최대 20자</Form.Description>
						<Form.FieldErrors />
					{/if}
				</Form.Field>
			{:else}
				<H2 class="border-none text-center text-2xl">{user.username}</H2>
			{/if}
		</section>

		{#if !profileEditMode}
			<section class="flex">
				<Button class="w-full flex-1 bg-(--primary-color) hover:bg-(--primary-color)/90">
					<MessageSquare />
					메시지하기
				</Button>
				<Button size="icon" variant="outline"><Share2 /></Button>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class="m-0 p-0">
						{#snippet child({ props })}
							<Button {...props} variant="outline" size="icon"><EllipsisVertical /></Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content class="w-56" align="end">
						<DropdownMenu.Item onclick={() => {}}>차단하기</DropdownMenu.Item>
						<DropdownMenu.Item onclick={() => {}}>신고하기</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</section>
		{/if}

		{#if profileEditMode}
			<Form.Field form={profileForm} name="contactAvailable">
				<Form.Control>
					{#snippet children({ props })}
						<H3 class="text-xl">문의 가능 시간</H3>
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
								<Label for="contact-available-undefined">미설정</Label>
							</div>
							<div class="flex items-center space-x-2">
								<RadioGroup.Item
									value="always"
									id="contact-available-always"
									onclick={() => ($profileData.contactAvailable = true)} />
								<Label for="contact-available-always">상시</Label>
							</div>
							<div class="flex items-start space-x-2 max-lg:items-center">
								<RadioGroup.Item
									value="certain-time"
									id="contact-available-certain-time"
									onclick={() => ($profileData.contactAvailable = { from: 0, to: 23 })} />
								<Label for="contact-available-certain-time" class="items-center max-lg:flex">
									<div>특정 시간:&nbsp;</div>
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
										<span>시 ~</span>
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
										<span>시</span>
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
					문의 가능 시간:
					{#if !user.profile.contactAvailable}
						미설정
					{:else if typeof user.profile.contactAvailable === 'boolean'}
						상시
					{:else}
						{user.profile.contactAvailable.from}시 ~ {user.profile.contactAvailable.to}시
					{/if}
				</Alert.Title>
				<Alert.Description>평균 응답 시간: {durationString(avgRespTime)}</Alert.Description>
			</Alert.Root>
		{/if}

		{#if profileEditMode}
			<H3 class="text-xl">최대 슬롯 갯수</H3>
			<div class="mt-2 flex items-center">
				<Select.Root type="single">
					<Select.Trigger class="w-[5em]">{maxOpenSlot}</Select.Trigger>
					<Select.Content>
						{#each Array(maxSlot + 1) as _, slot}
							<Select.Item value={slot.toString()}>{slot}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<span>개</span>
			</div>
		{:else}
			<section class="space-y-2">
				<div class="flex items-center space-x-2">
					<H3 class="inline-block text-xl">남은 슬롯 갯수</H3>
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

		{#if !profileEditMode}
			<section class="relative border p-4">
				<H3 class="hidden">통계</H3>
				<Table.Root>
					<Table.Body>
						<Table.Row>
							<Table.Head>총 커미션 수</Table.Head>
							<Table.Cell>{numOfCommission}건</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Head>평균 작업 시간</Table.Head>
							<Table.Cell>{durationString(avgWorkTime)}</Table.Cell>
						</Table.Row>
						<Table.Row>
							<Table.Head>완료율</Table.Head>
							<Table.Cell class="font-bold">{(completionRatio * 100).toFixed(2)}%</Table.Cell>
						</Table.Row>
					</Table.Body>
				</Table.Root>
				<div class="text-right">
					<Button
						variant="link"
						onclick={() => (openStatDialog = true)}
						class="text-(--primary-color)">
						자세히 보기
						<ChevronRight class="size-4" />
					</Button>
				</div>
			</section>
		{/if}

		<section class="space-y-2">
			<H3 class="text-center text-xl">소개</H3>
			{#if profileEditMode}
				<Form.Field form={profileForm} name="introduction">
					<Form.Control>
						{#snippet children({ props })}
							<Editor bind:value={$profileData.introduction} />
						{/snippet}
					</Form.Control>
					<!-- <Form.Description>변경된 프로필 이미지는 저장 후에 반영됩니다.</Form.Description> -->
					<Form.FieldErrors />
				</Form.Field>
			{:else}
				<article class="html border p-4">
					{#if user.profile.introduction}
						{@html sanitizeHTML(user.profile.introduction)}
					{:else}
						<span class="italic">자기소개가 없습니다.</span>
					{/if}
				</article>
			{/if}
		</section>

		{#if profileEditMode}
			<Form.Field form={profileForm} name="links" class="space-y-2 border p-4">
				<Form.Control>
					{#snippet children({ props })}
						<H3 class="text-xl">링크</H3>
						{#each $profileData.links || [] as _, idx (idx)}
							<div class="flex items-center space-x-2">
								<Input placeholder="표시 명칭" bind:value={$profileData.links![idx].text} />
								<Input placeholder="URL" bind:value={$profileData.links![idx].href} />
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
							링크 추가
						</Button>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
		{:else if (user.profile.links || []).length > 0}
			<section class="grid grid-cols-2 gap-2 border p-4">
				<H3 class="hidden">링크</H3>
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
				<H3 class="text-xl">프로필에서 사용할 강조색</H3>
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
										withoutColor: '설정하지 않음',
									},
								}} />
						{/snippet}
					</Form.Control>
					<!-- <Form.Description>변경된 프로필 이미지는 저장 후에 반영됩니다.</Form.Description> -->
					<Form.FieldErrors />
				</Form.Field>
			</section>
		{/if}

		{#if me && me.id === user.id}
			{#if profileEditMode}
				<div class="text-right">
					<Form.Button variant="default" class="bg-(--primary-color) hover:bg-(--primary-color)/90">
						저장
					</Form.Button>
					<Button variant="secondary" onclick={() => (profileEditMode = false)}>취소</Button>
				</div>
			{:else}
				<Button
					size="icon"
					variant="outline"
					class="absolute top-6 right-6 rounded-full"
					aria-label="프로필 수정"
					onclick={() => (profileEditMode = true)}>
					<Pencil />
				</Button>
			{/if}
		{/if}
	</form>
	<section class="w-full space-y-8 p-4">
		<section class="bg-accent text-accent-foreground flex border p-2">
			<h3 class="flex-none font-bold">공지사항</h3>
			<Separator orientation="vertical" class="mx-2 flex-none" />
			<div class="flex w-full flex-col">
				{#if announcements}
					<p class="w-full overflow-hidden text-ellipsis whitespace-nowrap">
						<Button
							variant="link"
							class="text-accent-foreground"
							onclick={() => openAnnouncementDialog(announcements.id)}>
							{announcements.title}
						</Button>
						<span class="text-muted-foreground text-sm">
							{formatDatetimeString(announcements.createDate)}
						</span>
					</p>
				{:else}
					<p
						class="text-muted-foreground w-full overflow-hidden text-ellipsis whitespace-nowrap italic">
						등록된 공지사항이 없습니다
					</p>
				{/if}
				<Separator orientation="horizontal" class="my-2 flex-none" />
				<div class="flex max-sm:flex-col max-sm:items-end sm:justify-end">
					<Button
						variant="link"
						class="flex-none text-(--primary-color)"
						onclick={onOpenAnnouncementsListDrawer}>
						과거 공지사항 보기
						<ChevronRight class="size-4" />
					</Button>
					{#if me && me.id === user.id}
						{#if new MediaQuery('width >= 40rem').current}
							<Separator orientation="vertical" class="mx-2 flex-none" />
						{/if}
						<Button
							variant="link"
							class="flex-none text-(--primary-color) max-sm:mt-2"
							onclick={() => (openAnnouncementEditor = true)}>
							<Pencil />새 공지사항 쓰기
						</Button>
					{/if}
				</div>
			</div>
		</section>
		<section class="space-y-4">
			<H3>커미션 타입</H3>
			<section class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
				{#each Array(10)
					.fill(undefined)
					.map( (_, i) => ({ thumbnail: DocsImage, title: `커미션 ${i + 1}`, category: '그림', tags: ['이런 태그', '저런 태그', '요런 태그', '이건 잘림'] }), ) as article}
					<Card.Root>
						<img
							src={article?.thumbnail}
							alt={article?.title}
							class="aspect-video w-full object-cover" />
						<Card.Header>
							<Card.Title>{article?.title}</Card.Title>
						</Card.Header>
						<Card.Content>
							<Badge class="m-1 bg-(--primary-color) hover:bg-(--primary-color)/90">
								#{article?.category}
							</Badge>
							{#each article?.tags?.slice(0, 3) || [] as tag}
								<Badge class="m-1" variant="secondary">#{tag}</Badge>
							{/each}
						</Card.Content>
					</Card.Root>
				{/each}
			</section>
			<div class="text-right">
				<Button variant="link" class="text-(--primary-color)">
					더 보기
					<ChevronRight class="size-4" />
				</Button>
			</div>
		</section>
		<section class="space-y-4">
			<H3>대기중인 의뢰</H3>
			<section class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
				{#each Array(10)
					.fill(undefined)
					.map( (_, i) => ({ thumbnail: DocsImage, title: `의뢰 ${i + 1}`, category: '그림', tags: ['이런 태그', '저런 태그', '요런 태그', '이건 잘림'] }), ) as article}
					<Card.Root>
						<img
							src={article?.thumbnail}
							alt={article?.title}
							class="aspect-video w-full object-cover" />
						<Card.Header>
							<Card.Title>{article?.title}</Card.Title>
						</Card.Header>
						<Card.Content>
							<Badge class="m-1 bg-(--primary-color) hover:bg-(--primary-color)/90">
								#{article?.category}
							</Badge>
							{#each article?.tags?.slice(0, 3) || [] as tag}
								<Badge class="m-1" variant="secondary">#{tag}</Badge>
							{/each}
						</Card.Content>
					</Card.Root>
				{/each}
			</section>
			<div class="text-right">
				<Button variant="link" class="text-(--primary-color)">
					더 보기
					<ChevronRight class="size-4" />
				</Button>
			</div>
		</section>
		<section class="space-y-4">
			<H3>포트폴리오</H3>
			<section class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
				{#each Array(10)
					.fill(undefined)
					.map( (_, i) => ({ thumbnail: DocsImage, title: `포트폴리오 ${i + 1}`, category: '그림', tags: ['이런 태그', '저런 태그', '요런 태그', '이건 잘림'] }), ) as article}
					<Card.Root>
						<img
							src={article?.thumbnail}
							alt={article?.title}
							class="aspect-video w-full object-cover" />
						<Card.Header>
							<Card.Title>{article?.title}</Card.Title>
						</Card.Header>
						<Card.Content>
							<Badge class="m-1 bg-(--primary-color) hover:bg-(--primary-color)/90">
								#{article?.category}
							</Badge>
							{#each article?.tags?.slice(0, 3) || [] as tag}
								<Badge class="m-1" variant="secondary">#{tag}</Badge>
							{/each}
						</Card.Content>
					</Card.Root>
				{/each}
			</section>
			<div class="text-right">
				<Button variant="link" class="text-(--primary-color)">
					더 보기
					<ChevronRight class="size-4" />
				</Button>
			</div>
		</section>
	</section>
</main>

<Dialog.Root bind:open={openStatDialog}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>상세 통계</Dialog.Title>
			<Dialog.Description>
				{user.username} 님의 커미션 활동 통계입니다.
			</Dialog.Description>
		</Dialog.Header>
		<Table.Root>
			<Table.Body>
				<Table.Row>
					<Table.Head>총 커미션 수</Table.Head>
					<Table.Cell>{numOfCommission}건</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Head>타입별 커미션 수</Table.Head>
					<Table.Cell>
						<Chart class="size-50" option={statChartOption} series={[statChartData]} />
					</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Head>평균 응답 시간</Table.Head>
					<Table.Cell>{durationString(avgRespTime)}</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Head>평균 작업 시간</Table.Head>
					<Table.Cell>{durationString(avgWorkTime)}</Table.Cell>
				</Table.Row>
				<Table.Row>
					<Table.Head>완료율</Table.Head>
					<Table.Cell class="font-bold">{(completionRatio * 100).toFixed(2)}%</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	</Dialog.Content>
</Dialog.Root>

<Drawer.Root bind:open={announcementsListDrawerState.open}>
	<Drawer.Content>
		<Drawer.Header>
			<Drawer.Title>공지사항 변경 이력</Drawer.Title>
			<Drawer.Description>
				{user.username} 님이 현재까지 작성한 공지사항 내역입니다.
			</Drawer.Description>
		</Drawer.Header>
		<div class="mb-2 p-4 pb-0">
			{#if announcementsListDrawerState.status === FetchStatus.COMPLETED}
				{#if announcementsListDrawerState.list.length > 0}
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>제목</Table.Head>
								<Table.Head class="w-[13em]">작성일자</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each announcementsListDrawerState.list as item}
								<Table.Row>
									<Table.Cell>
										<Button
											variant="link"
											class="text-accent-foreground"
											onclick={() => openAnnouncementDialog(item.id)}>
											{item.title}
										</Button>
									</Table.Cell>
									<Table.Cell>{formatDatetimeString(item.createDate)}</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				{:else}
					<div class="text-muted-foreground flex flex-col items-center space-y-2">
						<NotepadTextDashed class="size-12" />
						<span>등록된 공지사항이 없습니다</span>
					</div>
				{/if}
			{:else if announcementsListDrawerState.status === FetchStatus.LOADING}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>제목</Table.Head>
							<Table.Head class="w-[13em]">작성일자</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each Array(announcementsPerPage)}
							<Table.Row style="--height: calc(var(--text-sm--line-height) * var(--text-sm));">
								<Table.Cell>
									<Skeleton class="h-(--height) w-full" />
								</Table.Cell>
								<Table.Cell>
									<Skeleton class="h-(--height) w-full" />
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			{:else}
				<div class="text-muted-foreground flex flex-col items-center space-y-2">
					<TriangleAlert class="size-12" />
					<span>불러오는 도중 오류가 발생했습니다.</span>
				</div>
			{/if}
		</div>
		{#if announcementsListDrawerState.total > 0}
			<Pagination
				bind:page={announcementsListDrawerState.page}
				count={announcementsListDrawerState.total}
				perPage={announcementsPerPage}
				siblingCount={isDesktop() ? 1 : 0} />
		{/if}
		<Drawer.Footer>
			<Drawer.Close>닫기</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>

<Dialog.Root bind:open={announcementDialogState.open}>
	<Dialog.Content class="sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title style="--height: calc(var(--text-lg--line-height) * var(--text-lg));">
				{#if announcementDialogState.status === FetchStatus.COMPLETED}
					{announcementDialogState.announcement.title}
				{:else}
					<Skeleton class="h-(--height) w-full" />
				{/if}
			</Dialog.Title>
			<Dialog.Description style="--height: calc(var(--text-sm--line-height) * var(--text-sm));">
				작성일시: {#if announcementDialogState.status === FetchStatus.COMPLETED}
					{formatDatetimeString(announcementDialogState.announcement.createDate)}
				{:else}
					<Skeleton class="inline-block h-(--height) w-[11em]" />
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<div class="html h-100 overflow-y-scroll p-4 pb-0">
			{#if announcementDialogState.status === FetchStatus.COMPLETED}
				{@html sanitizeHTML(announcementDialogState.announcement.content)}
			{:else if announcementDialogState.status === FetchStatus.FAILED}
				<div
					class="text-muted-foreground flex size-full flex-col items-center justify-center space-y-2">
					<TriangleAlert class="size-12" />
					<span>불러오는 도중 오류가 발생했습니다.</span>
				</div>
			{:else}
				<Skeleton class="size-full" />
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={openAnnouncementEditor}>
	<Dialog.Content class="sm:max-w-[600px]">
		<form method="POST" use:announcementEnhance class="w-full" action="?/saveAnnouncement">
			<Dialog.Header>
				<Dialog.Title style="--height: calc(var(--text-lg--line-height) * var(--text-lg));">
					<Form.Field form={announcementForm} name="title">
						<Form.Control>
							{#snippet children({ props })}
								<Input
									{...props}
									bind:value={$announcementData.title}
									placeholder="공지 제목을 입력하십시오."
									class="mt-4"
									{...$announcementConstraints.title} />
							{/snippet}
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</Dialog.Title>
			</Dialog.Header>
			<Form.Field form={announcementForm} name="content" class="h-100 pb-2">
				<Form.Control>
					{#snippet children({ props })}
						<Editor bind:value={$announcementData.content} />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Dialog.Footer>
				<Form.Button variant="default">저장</Form.Button>
				<Button
					onclick={() => {
						openAnnouncementEditor = false;
					}}
					variant="secondary">
					취소
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={profileImageCropper.open}>
	<Dialog.Content
		class="max-h-[100vh] overflow-x-hidden overflow-y-auto transition-none sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>프로필 이미지 자르기</Dialog.Title>
			<Dialog.Description>
				프로필 이미지로 사용할 영역을 선택한 뒤 '완료' 버튼을 누르면 지정됩니다. 변경된 프로필
				이미지는 저장 후에 반영됩니다.
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
			<Button onclick={onSetProfileImage}>확인</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={headerImageCropper.open}>
	<Dialog.Content
		class="max-h-[100vh] overflow-x-hidden overflow-y-auto transition-none sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>헤더 이미지 자르기</Dialog.Title>
			<Dialog.Description>
				헤더 이미지로 사용할 영역을 선택한 뒤 '완료' 버튼을 누르면 지정됩니다. 변경된 헤더 이미지는
				저장 후에 반영됩니다.
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
			<Button onclick={onSetHeaderImage}>확인</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

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
