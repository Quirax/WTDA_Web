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
	import { invalidate, invalidateAll } from '$app/navigation';
	import Tooltip from '$lib/components/tooltip/Tooltip.svelte';

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
	let openErrorOnProfileUpdateAlert = $state(false);

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
					openErrorOnProfileUpdateAlert = true;
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
				openErrorOnProfileUpdateAlert = true;
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
				openErrorOnProfileUpdateAlert = true;
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
	let openLinkCopyAlert = $state(false);

	const onCopyProfileLink = () => {
		navigator.clipboard.writeText(location.href).then(() => {
			openLinkCopyAlert = true;
		});
	};

	// Block
	let openBlockAlert = $state(false);
	let openErrorOnBlock = $state(false);
	let openErrorOnUnblock = $state(false);

	let userArticlesKey = $state(Date.now());

	const onBlock = async () => {
		// ref: https://svelte.dev/docs/kit/$app-forms#applyAction
		const result = await fetch('?/block', { method: 'post', body: new FormData() })
			.then((r) => r.text())
			.then((r) => deserialize(r));

		if (result.type === 'success') {
			toast.success('사용자를 차단하였습니다.', {
				action: {
					label: '차단 해제',
					onClick: onUnblock,
				},
			});
			invalidateAll();
			userArticlesKey = Date.now(); // 사용자 게시물 목록 갱신
		} else {
			openErrorOnBlock = true;
		}
	};

	const onUnblock = async () => {
		const result = await fetch('?/unblock', { method: 'post', body: new FormData() })
			.then((r) => r.text())
			.then((r) => deserialize(r));

		if (result.type === 'success') {
			toast.success('사용자 차단을 해제하였습니다.');
			invalidateAll();
			userArticlesKey = Date.now(); // 사용자 게시물 목록 갱신
		} else {
			openErrorOnBlock = true;
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
						<div class="relative">
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
							{#if relationshipToUser === UserRelationship.BLOCKED}
								<div
									class="bg-destructive text-destructive-foreground absolute right-1 bottom-1 size-7 rounded-full border p-1"
									title="차단된 사용자">
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
				<Tooltip
					class="w-full"
					text="차단했거나 차단된 경우 메시지를 보낼 수 없습니다"
					disabled={relationshipFromUser !== UserRelationship.BLOCKED &&
						relationshipToUser !== UserRelationship.BLOCKED}>
					<Button
						class="w-full flex-1 bg-(--primary-color) hover:bg-(--primary-color)/90"
						disabled={relationshipFromUser === UserRelationship.BLOCKED ||
							relationshipToUser === UserRelationship.BLOCKED}>
						<MessageSquare />
						메시지하기
					</Button>
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
								차단 해제하기
							</DropdownMenu.Item>
						{:else}
							<DropdownMenu.Item
								onclick={() => {
									openBlockAlert = true;
								}}
								disabled={!!me && user.id === me.id}>
								차단하기
							</DropdownMenu.Item>
						{/if}
						<!-- TODO 구현 완료 시 재활성화
						<DropdownMenu.Item onclick={() => {}}>신고하기</DropdownMenu.Item>
						-->
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
				<!-- TODO 2차 알파테스트 때 추가
				<Alert.Description>평균 응답 시간: {durationString(avgRespTime)}</Alert.Description>
				-->
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

		<!-- TODO 베타테스트 전에 추가
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
		-->

		<section class="space-y-2">
			<H3 class="text-center text-xl">소개</H3>
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
		<Announcements {user} {announcements} {announcementFormData} />
		<UserArticles {user} key={userArticlesKey.toString()} />
	</section>
</main>

<Dialog.Root bind:open={openStatDialog}>
	<Dialog.Content
		class="max-h-[100vh] overflow-x-hidden overflow-y-auto transition-none sm:max-w-[425px]">
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

<AlertDialog
	title="프로필 업데이트 처리 도중 오류가 발생했습니다."
	description="고객센터에 문의해주시기 바랍니다."
	bind:open={openErrorOnProfileUpdateAlert} />
<AlertDialog
	title="프로필 링크가 복사되었습니다."
	description="원하는 곳에 붙여넣어 사용하시기 바랍니다."
	bind:open={openLinkCopyAlert} />

{#snippet blockDescription()}
	<Ul>
		<li>
			메인 페이지나 검색 결과 등에서 이 사용자의 게시물이 표시되지 않습니다. (다만, URL을 통해
			접속하는 경우 게시물을 볼 수는 있습니다.)
		</li>
		<li>
			이 사용자도 메인 페이지나 검색 결과 등에서 귀하의 게시물을 볼 수 없습니다. (다만, URL을 통해
			접속하는 경우 게시물을 볼 수는 있습니다.)
		</li>
		<li>이 사용자와 메시지를 주고받을 수 없습니다.</li>
		<li>이 사용자로부터 커미션 의뢰 또는 커미션 제안을 받을 수 없습니다.</li>
		<li>이 사용자에게 커미션 의뢰 또는 커미션 제안을 할 수 없습니다.</li>
		<li>차단 조치는 귀하가 원하는 시점에 해제할 수 있습니다.</li>
	</Ul>
{/snippet}

<AlertDialog
	title="정말로 이 사용자를 차단하시겠습니까?"
	description={blockDescription}
	cancel={true}
	onAction={onBlock}
	bind:open={openBlockAlert} />
<AlertDialog
	title="사용자 차단 처리 도중 오류가 발생했습니다."
	description="고객센터에 문의해주시기 바랍니다."
	bind:open={openErrorOnBlock} />
<AlertDialog
	title="사용자 차단 해제 처리 도중 오류가 발생했습니다."
	description="고객센터에 문의해주시기 바랍니다."
	bind:open={openErrorOnUnblock} />

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
