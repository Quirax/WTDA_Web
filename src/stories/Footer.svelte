<svelte:options runes />

<script lang="ts">
	import { SIIcon } from '@willingtonortiz/svelte-simple-icons';
	import { siX, siMastodon, siBluesky } from 'simple-icons';

	import { P } from '$lib/components/typo';

	import './Footer.css';

	const anchorProps = {
		class: 'hover:text-primary font-medium mb-1',
	};

	const iconProps = {
		class: 'size-[1em]',
		color: 'currentColor',
	};
</script>

<footer class="bg-stone-400 p-10 text-sm text-stone-800 dark:bg-stone-800 dark:text-stone-400">
	<div class="flex flex-wrap items-center space-x-4 text-base leading-7 [&:not(:first-child)]:mt-6">
		<a href="." {...anchorProps}>공지사항</a>
		<a href="." {...anchorProps}>고객센터</a>
		<a href="." {...anchorProps}>이용약관</a>
		<a href="." {...anchorProps}>개인정보처리방침</a>
		<div class="inline-flex flex-nowrap space-x-4">
			<a href="." {...anchorProps}>
				<SIIcon icon={siX} {...iconProps} title="X(구 트위터) 공식 계정" />
			</a>
			<a href="." {...anchorProps}>
				<SIIcon icon={siMastodon} {...iconProps} title="마스토돈 공식 계정" />
			</a>
			<a href="." {...anchorProps}>
				<SIIcon icon={siBluesky} {...iconProps} title="블루스카이 공식 계정" />
			</a>
		</div>
	</div>
	<div class="flex flex-wrap items-center space-y-1 space-x-4 leading-7 [&:not(:first-child)]:mt-6">
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
	</div>
	<div class=" leading-7 [&:not(:first-child)]:mt-6">
		<!-- prettier-ignore -->
		<span><a href="http://www.freepik.com/" target="_blank" {...anchorProps}>Freepik</a>에서</span>
		디자인한 이미지 요소가 사용되었습니다.
	</div>
	<div class=" leading-7 [&:not(:first-child)]:mt-6">
		뭐하지공방은 통신판매중개자이며, 통신판매의 당사자가 아닙니다. 상품, 상품정보, 거래에 관한
		의무와 책임은 계약 당사자 각자에게 있습니다.
	</div>
</footer>
