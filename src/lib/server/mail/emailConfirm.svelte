<svelte:options runes />

<script lang="ts">
	import st, * as s from './style';
	import Template from './template.svelte';

	export interface Props {
		confirmCode: string;
	}

	const pProps = {
		class: 'p',
	};

	const { confirmCode = 'XXXXX-XXXXX' }: Props = $props();
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
			이메일 인증 코드
		</h2>
		<p {...pProps}>아래의 인증 코드를 인증 페이지에 입력하세요.</p>
		<div style={st(s.m(4))}>
			<code
				style={st(
					s.bg(s.t.secondary),
					s.relative,
					s.border(),
					s.px('0.3rem'),
					s.py('0.2rem'),
					s.font_mono,
					s.textSize('2xl'),
					s.fontWeight('semibold'),
				)}>
				{confirmCode}
			</code>
		</div>
		<p {...pProps} style={st(s.textSize('sm'))}>
			만약 뭐하지공방에 이메일 인증을 시도한 적이 없다면, 고객센터를 통해 신고해주세요.
		</p>
	</section>
</Template>
