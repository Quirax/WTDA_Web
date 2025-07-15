<script lang="ts">
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { formatDatetimeString, isDesktop, sanitizeHTML } from '$lib/utils';
	import { FetchStatus } from '@app';
	import { deserialize } from '$app/forms';
	import { superForm, type Infer, type SuperValidated } from 'sveltekit-superforms';
	import { announcementSchema, type AnnouncementSchema } from '$lib/schema/profile';
	import { invalidate } from '$app/navigation';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { ChevronRight, NotepadTextDashed, Pencil, Trash2, TriangleAlert } from 'lucide-svelte';
	import { userStore } from '$lib/context';
	import { MediaQuery } from 'svelte/reactivity';
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { announcementsPerPage } from '$lib/config';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import Editor from '$lib/components/editor/editor.svelte';
	import AlertDialog from '$stories/components/AlertDialog.svelte';
	import { m } from '$lib/messages';

	interface Props extends ReturnType<typeof $props> {
		user: Omit<NonNullable<App.User>, 'status'>;
		announcements?: App.ProfileAnnouncements;
		announcementFormData: SuperValidated<Infer<AnnouncementSchema>>;
	}

	const { user, announcements, announcementFormData }: Props = $props();

	let me = $state<App.User>(null);
	userStore.subscribe((v) => (me = v));

	// Announcements List
	let openErrorOnAnnouncementAlert = $state(false);

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

			console.error(result);
			openErrorOnAnnouncementAlert = true;
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

			console.error(result);
			openErrorOnAnnouncementAlert = true;
		}
	};

	// Delete Announcement Alert
	let deleteAnnouncementAlertState = $state({
		open: false,
		announcementID: '',
	});

	const deleteAnnouncement = async () => {
		if (!deleteAnnouncementAlertState.announcementID) return;

		const formData = new FormData();
		formData.append('id', deleteAnnouncementAlertState.announcementID);

		// ref: https://svelte.dev/docs/kit/$app-forms#applyAction
		const result = await fetch('?/deleteAnnouncement', { method: 'post', body: formData })
			.then((r) => r.text())
			.then((r) => deserialize(r));

		if (result.type === 'success') {
			getAnnouncementsList();
			invalidate('user:info');
		} else {
			console.error(result);
			openErrorOnAnnouncementAlert = true;
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

					console.error(result);
					openErrorOnAnnouncementAlert = true;
				}
			} else {
				invalidate('user:info');
				openAnnouncementEditor = false;
			}
		},
	});

	const {
		form: announcementData,
		enhance: announcementEnhance,
		constraints: announcementConstraints,
	} = announcementForm;
</script>

<section class="bg-accent text-accent-foreground flex border p-2">
	<h3 class="flex-none font-bold">{m['ANNOUNCEMENT.THIS']()}</h3>
	<Separator orientation="vertical" class="mx-2 flex-none" />
	<div class="flex w-full flex-col overflow-hidden">
		{#if announcements}
			<Button
				variant="link"
				class="text-accent-foreground w-full justify-start text-left whitespace-pre-wrap"
				onclick={() => openAnnouncementDialog(announcements.id)}>
				{announcements.title}
			</Button>
			<p class="text-muted-foreground text-right text-sm">
				{formatDatetimeString(announcements.createDate)}
			</p>
		{:else}
			<p
				class="text-muted-foreground w-full overflow-hidden text-ellipsis whitespace-nowrap italic">
				{m['ANNOUNCEMENT.NONE']()}
			</p>
		{/if}
		<Separator orientation="horizontal" class="my-2 flex-none" />
		<div class="flex max-sm:flex-col max-sm:items-end sm:justify-end">
			<Button
				variant="link"
				class="flex-none text-(--primary-color)"
				onclick={onOpenAnnouncementsListDrawer}>
				{m['ANNOUNCEMENT.OPEN_LIST']()}
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
					<Pencil />{m['ANNOUNCEMENT.CREATE']()}
				</Button>
			{/if}
		</div>
	</div>
</section>

<Drawer.Root bind:open={announcementsListDrawerState.open}>
	<Drawer.Content class="transition-none">
		<Drawer.Header>
			<Drawer.Title>{m['ANNOUNCEMENT.LIST_TITLE']()}</Drawer.Title>
			<Drawer.Description>
				{m['ANNOUNCEMENT.LIST_DESCRIPTION']({ username: user.username })}
			</Drawer.Description>
		</Drawer.Header>
		<div
			class="mb-2 max-h-[calc(100vh-210px)] overflow-x-hidden overflow-y-auto p-4 pb-0 transition-none">
			{#if announcementsListDrawerState.status === FetchStatus.COMPLETED}
				{#if announcementsListDrawerState.list.length > 0}
					<Table.Root class="table-fixed">
						<Table.Header>
							<Table.Row>
								<Table.Head>{m['ANNOUNCEMENT.TITLE']()}</Table.Head>
								<Table.Head class="w-[13em]">{m['ANNOUNCEMENT.CREATE_DATE']()}</Table.Head>
								{#if me && me.id === user.id}
									<Table.Head class="w-20 text-center">{m['ANNOUNCEMENT.DELETE']()}</Table.Head>
								{/if}
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each announcementsListDrawerState.list as item}
								<Table.Row>
									<Table.Cell>
										<Button
											variant="link"
											class="text-accent-foreground w-full justify-start overflow-hidden text-ellipsis whitespace-nowrap"
											onclick={() => openAnnouncementDialog(item.id)}
											title={item.title}>
											{item.title}
										</Button>
									</Table.Cell>
									<Table.Cell>{formatDatetimeString(item.createDate)}</Table.Cell>
									{#if me && me.id === user.id}
										<Table.Cell class="text-center">
											<Button
												variant="ghost"
												size="icon"
												onclick={() => {
													deleteAnnouncementAlertState.announcementID = item.id;
													deleteAnnouncementAlertState.open = true;
												}}>
												<Trash2 />
											</Button>
										</Table.Cell>
									{/if}
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				{:else}
					<div class="text-muted-foreground flex flex-col items-center space-y-2">
						<NotepadTextDashed class="size-12" />
						<span>{m['ANNOUNCEMENT.NONE']()}</span>
					</div>
				{/if}
			{:else if announcementsListDrawerState.status === FetchStatus.LOADING}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>{m['ANNOUNCEMENT.TITLE']()}</Table.Head>
							<Table.Head class="w-[13em]">{m['ANNOUNCEMENT.CREATE_DATE']()}</Table.Head>
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
					<span>{m['ANNOUNCEMENT.ERROR_LOADING']()}</span>
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
			<Drawer.Close>{m['ANNOUNCEMENT.CLOSE']()}</Drawer.Close>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>

<Dialog.Root bind:open={announcementDialogState.open}>
	<Dialog.Content
		class="max-h-[100vh] overflow-x-hidden overflow-y-auto transition-none sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title
				style="--height: calc(var(--text-lg--line-height) * var(--text-lg));"
				class="mt-4">
				{#if announcementDialogState.status === FetchStatus.COMPLETED}
					{announcementDialogState.announcement.title}
				{:else}
					<Skeleton class="h-(--height) w-full" />
				{/if}
			</Dialog.Title>
			<Dialog.Description style="--height: calc(var(--text-sm--line-height) * var(--text-sm));">
				{m['ANNOUNCEMENT.CREATE_DATE']()}: {#if announcementDialogState.status === FetchStatus.COMPLETED}
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
					<span>{m['ANNOUNCEMENT.ERROR_LOADING']()}</span>
				</div>
			{:else}
				<Skeleton class="size-full" />
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={openAnnouncementEditor}>
	<Dialog.Content
		class="max-h-[100vh] overflow-x-hidden overflow-y-auto transition-none sm:max-w-[600px]">
		<form method="POST" use:announcementEnhance class="w-full" action="?/saveAnnouncement">
			<Dialog.Header>
				<Dialog.Title style="--height: calc(var(--text-lg--line-height) * var(--text-lg));">
					<Form.Field form={announcementForm} name="title">
						<Form.Control>
							{#snippet children({ props })}
								<Input
									{...props}
									bind:value={$announcementData.title}
									placeholder={m['ANNOUNCEMENT.TITLE_PLACEHOLDER']()}
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
				<Form.Button variant="default">{m['ANNOUNCEMENT.SAVE']()}</Form.Button>
				<Button
					onclick={() => {
						openAnnouncementEditor = false;
					}}
					variant="secondary">
					{m['CANCEL']()}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog
	title={m['ANNOUNCEMENT.DELETE_TITLE']()}
	description={m['ANNOUNCEMENT.DELETE_DESCRIPTION']()}
	cancel={true}
	onAction={deleteAnnouncement}
	bind:open={deleteAnnouncementAlertState.open} />
<AlertDialog
	title={m['ERROR_ALERT.TITLE']({ while: m['ANNOUNCEMENT.WHILE']() })}
	description={m['ERROR_ALERT.DESCRIPTION']()}
	bind:open={openErrorOnAnnouncementAlert} />
