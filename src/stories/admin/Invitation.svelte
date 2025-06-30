<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Trash2, TriangleAlert } from 'lucide-svelte';
	import { formatDatetimeString, isDesktop } from '$lib/utils';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';
	import Pagination from '$lib/components/pagination/pagination.svelte';
	import { FetchStatus } from '@app';
	import type { InvitationCode } from '../../routes/admin/invitation/+page.server';
	import { deserialize } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { invitationCodesPerPage } from '$lib/config';
	import Muted from '$lib/components/typo/muted.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Avatar from '$stories/components/Avatar.svelte';

	let status = $state(FetchStatus.LOADING);
	let list = $state<InvitationCode[]>([]);
	let total = $state(0);
	let page = $state(1);

	const getList = async () => {
		status = FetchStatus.LOADING;
		list = [];

		const formData = new FormData();
		formData.append('page', page.toString());

		// ref: https://svelte.dev/docs/kit/$app-forms#applyAction
		const result = await fetch('?/invitationCodes', { method: 'post', body: formData })
			.then((r) => r.text())
			.then((r) => deserialize(r));

		if (result.type === 'success') {
			list = result.data!.list as InvitationCode[];
			status = FetchStatus.COMPLETED;
			total = result.data!.total as number;
		} else {
			status = FetchStatus.FAILED;
			total = 0;

			console.error(result);
			toast.error('초대코드 목록을 가져오는 도중 오류가 발생하였습니다.', {
				description: '개발 담당자에게 문의하시기 바랍니다.',
			});
		}
	};

	onMount(() => {
		getList();
	});
</script>

<Header title="초대코드 관리" />

<Section>
	<H2>초대코드 관리</H2>

	<div
		class="mb-2 max-h-[calc(100vh-210px)] overflow-x-hidden overflow-y-auto p-4 pb-0 transition-none">
		{#if status === FetchStatus.COMPLETED}
			<Table.Root class="table-fixed">
				<Table.Header>
					<Table.Row>
						<Table.Head>초대코드</Table.Head>
						<Table.Head class="w-[13em]">생성자</Table.Head>
						<Table.Head class="w-[13em]">생성일자</Table.Head>
						<Table.Head class="w-[13em]">연결된 사용자</Table.Head>
						<Table.Head class="w-20 text-center">삭제</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each list as item}
						<Table.Row>
							<Table.Cell>
								{item.code}
							</Table.Cell>
							<Table.Cell>
								<Button variant="link" class="text-inherit" href="/user/{item.createdBy.id}">
									<Avatar
										class="inline-block h-6 w-6 align-middle"
										user={item.createdBy}
										withoutLink />
									{item.createdBy.username}
								</Button>
							</Table.Cell>
							<Table.Cell>{formatDatetimeString(item.createdDate)}</Table.Cell>
							<Table.Cell>
								{#if item.usedBy}
									<Button variant="link" class="text-inherit" href="/user/{item.usedBy.id}">
										<Avatar
											class="inline-block h-6 w-6 align-middle"
											user={item.usedBy}
											withoutLink />
										{item.usedBy.username}
									</Button>
									{item.usedBy?.username}
								{:else}
									<Muted>사용되지 않음</Muted>
								{/if}
							</Table.Cell>
							<Table.Cell class="text-center">
								<!-- <Button
												variant="ghost"
												size="icon"
												onclick={() => {
													deleteAnnouncementAlertState.announcementID = item.id;
													deleteAnnouncementAlertState.open = true;
												}}> -->
								<Trash2 />
								<!-- </Button> -->
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		{:else if status === FetchStatus.LOADING}
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>초대코드</Table.Head>
						<Table.Head class="w-[13em]">생성자</Table.Head>
						<Table.Head class="w-[13em]">생성일자</Table.Head>
						<Table.Head class="w-[13em]">연결된 사용자</Table.Head>
						<Table.Head class="w-20 text-center">삭제</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each Array(invitationCodesPerPage)}
						<Table.Row style="--height: calc(var(--text-sm--line-height) * var(--text-sm));">
							<Table.Cell>
								<Skeleton class="h-(--height) w-full" />
							</Table.Cell>
							<Table.Cell>
								<Skeleton class="h-(--height) w-full" />
							</Table.Cell>
							<Table.Cell>
								<Skeleton class="h-(--height) w-full" />
							</Table.Cell>
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
	{#if total > 0}
		<Pagination
			bind:page
			count={total}
			perPage={invitationCodesPerPage}
			siblingCount={isDesktop() ? 1 : 0} />
	{/if}
</Section>
