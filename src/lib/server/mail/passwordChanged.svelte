<svelte:options runes />

<script lang="ts">
	import st, * as s from './style';
	import Template from './template.svelte';

	const pProps = {
		class: 'p',
	};

	const {} = $props();
</script>

<Template>
	<section>
		<h2
			style={st(
				s.border_b(),
				s.pb(2),
				s.textSize('3xl'),
				s.fontWeight('semibold'),
				s.tracking_tight,
			)}>
			비밀번호 변경됨
		</h2>
		<p {...pProps}>방금 전 이 이메일을 사용하는 계정의 비밀번호가 변경되었습니다.</p>
		<p {...pProps} style={st(s.textSize('sm'))}>
			만약 뭐하지공방에 가입한 적이 없거나, 비밀번호를 변경한 적이 없다면, 고객센터를 통해
			신고해주세요.
		</p>
	</section>
</Template>
