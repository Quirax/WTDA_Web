<svelte:options runes />

<script lang="ts">
	import Section from '../components/Section.svelte';
	import Layout from '../Layout.svelte';
	import H2 from '$lib/components/typo/h2.svelte';
	import * as Form from '$lib/components/ui/form';
	import Input from '$lib/components/ui/input/input.svelte';
	import P from '$lib/components/typo/p.svelte';
</script>

<Layout title="이메일 인증" showSearchPanel={false} showUserPanel={false}>
	<Section>
		<H2>거의 다 되었습니다!</H2>
		<P>
			다른 악의적 사용자에 의해 이메일이 도용되었을 경우를 대비하여 최종적으로 이메일 인증을
			진행합니다.
		</P>
		<form method="POST" class="w-2/3" action="?/do">
			<!-- <Form.Field {form} name="confirmCode" class="flex flex-col my-4 space-y-1"> -->
			<div class="my-4 flex flex-col space-y-1">
				<!-- <Form.Control let:attrs> -->
				<!-- <Form.Label>이메일</Form.Label> -->
				<label for="confirmCode">인증 코드</label>
				<!-- <Input {...attrs} bind:value={$formData.confirmCode} {...$constraints.confirmCode} /> -->
				<Input id="confirmCode" placeholder="XXXXX-XXXXX" />
				<p>아래 버튼을 클릭하여 인증 메일을 보낸 뒤, 메일에 기재된 인증 코드를 입력해주세요.</p>
				<!-- <Form.Button formaction="?/send">인증메일 보내기</Form.Button> -->
				<button formaction="?/send">인증 메일 보내기</button>
				<!-- </Form.Control> -->
				<!-- <Form.FieldErrors /> -->
			</div>
			<!-- </Form.Field> -->
			<!-- <Form.Button>인증완료</Form.Button> -->
			<button>인증완료</button>
		</form>
	</Section>
</Layout>
