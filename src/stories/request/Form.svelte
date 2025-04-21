<script lang="ts">
	import H2 from '$lib/components/typo/h2.svelte';
	import Header from '$stories/components/Header.svelte';
	import Section from '$stories/components/Section.svelte';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';

	const title = '의뢰 만들기';
</script>

<Header {title} />

<Section>
	<H2>{title}</H2>
	<!-- <form method="POST" use:enhance class="w-full sm:w-2/3" action="?/do"> -->
	<form method="POST" class="w-full sm:w-2/3">
		<!-- title -->
		<!-- <Form.Field {form} name="password" class="mt-4 flex flex-col space-y-1">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label> -->
		<label>제목</label>
		<!-- </Form.Label> -->
		<Input placeholder="제목" />
		<!-- <Input
							{...props}
							type="password"
							bind:value={$formData.password}
							{...$constraints.password}
							placeholder={(userInfoFor === UserInfoFor.INFO_EDIT && '(기존 비밀번호 유지)') ||
								''} /> -->
		<!-- {/snippet}
				</Form.Control>
				<Form.Description>
					{(userInfoFor === UserInfoFor.INFO_EDIT && '변경하려는 경우에만 입력, ') || ''}최소 8자
					이상
				</Form.Description>
				<Form.FieldErrors />
			</Form.Field> -->

		<!-- category -->

		<!-- budget -->

		<!-- deadline -->

		<!-- purpose -->

		<!-- isForCommercial -->

		<!-- content -->

		<!-- tag -->

		<div class="my-4 border-2">
			<!-- containsAdultContents -->
			<!-- <Form.Field {form} name="agree_eula" class="p-4">
					<div class="flex flex-row items-center space-y-0 space-x-3">
						<Form.Control>
							{#snippet children({ props })} -->
			<Checkbox />
			<!-- <Checkbox {...props} bind:checked={($formData as Infer<FormSchema>).agree_eula} /> -->
			<div class="space-y-1 leading-none">
				<!-- <Form.Label> -->
				이 의뢰에는 성인 콘텐츠가 포함되어 있습니다.
				<!-- </Form.Label> -->
			</div>
			<!--	<input
									name={props.name}
									value={($formData as Infer<FormSchema>).agree_eula}
									hidden />
							{/snippet}
						</Form.Control>
					</div>
					<Form.FieldErrors />
				</Form.Field> -->

			<!-- visibleOnlyToCommissioner -->
		</div>
		<!-- {#if userInfoFor === UserInfoFor.REGISTRATION}
			<Form.Button>가입하기</Form.Button>
		{:else if userInfoFor === UserInfoFor.INFO_VIEW}
			<Button href="/settings/info/auth">변경하기</Button>
		{:else}
			<Form.Button>저장하기</Form.Button>
			<Button variant="destructive" onclick={() => (openBeforeDeactivationAlert = true)}>
				계정 비활성화하기
			</Button>
		{/if} -->
	</form>
</Section>
