<svelte:options runes />

<script lang="ts">
	import { SIIcon } from '@willingtonortiz/svelte-simple-icons';
	import { siX, siMastodon, siBluesky } from 'simple-icons';

	import { P } from '$lib/components/typo';

	import './Footer.css';

	const anchorProps = {
		class: 'hover:text-primary font-medium',
	};

	const iconProps = {
		class: 'size-[1em]',
		color: 'currentColor',
	};
</script>

<footer class="bg-muted text-muted-foreground p-10 text-sm leading-none">
	<P class="flex flex-wrap items-center space-x-4 text-base">
		<a href="." {...anchorProps}>공지사항</a>
		<a href="." {...anchorProps}>고객센터</a>
		<a href="." {...anchorProps}>이용약관</a>
		<a href="." {...anchorProps}>개인정보처리방침</a>
		<a href="." {...anchorProps}>
			<SIIcon icon={siX} {...iconProps} title="X(구 트위터) 공식 계정" />
		</a>
		<a href="." {...anchorProps}>
			<SIIcon icon={siMastodon} {...iconProps} title="마스토돈 공식 계정" />
		</a>
		<a href="." {...anchorProps}>
			<SIIcon icon={siBluesky} {...iconProps} title="블루스카이 공식 계정" />
		</a>
	</P>
	<P class="flex flex-wrap items-center space-x-4">
		<span>상호: 뭐하지공방</span>
		<span>대표: 홍길동</span>
		<span>개인정보관리책임자: 홍길동</span>
		<span>
			사업자등록번호: <a href="." {...anchorProps}>123-45-67890</a>
		</span>
		<span>통신판매업신고: 2025-경기남양주-1234</span>
		<span>주소: 경기도 남양주시 호평로68번길 21</span>
		<span>
			이메일: <a href="." {...anchorProps}>support@whattodo.at</a>
		</span>
		<span>전화: 031-1234-5678</span>
	</P>
	<P>
		뭐하지공방은 통신판매중개자이며, 통신판매의 당사자가 아닙니다. 상품, 상품정보, 거래에 관한
		의무와 책임은 계약 당사자 각자에게 있습니다.
	</P>
</footer>
