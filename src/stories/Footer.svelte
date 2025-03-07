<svelte:options runes />

<script lang="ts">
	import { P } from '$lib/components/typo';

	import './Footer.css';
	import logo from './assets/logo.png';
</script>

<footer class="bg-muted text-muted-foreground p-10 text-sm">
	<P class="text-base"
		>공지사항 고객센터 이용약관 개인정보처리방침 사업자정보확인 트위터 마스토돈 블루스카이</P
	>
	<P
		>상호: 뭐하지공방 | 대표: 홍길동 | 개인정보관리책임자: 홍길동 | 사업자등록번호: 123-45-67890 |
		통신판매업신고: 2025-경기남양주-1234<br />주소: 경기도 남양주시 호평로68번길 21 | 이메일:
		support@whattodo.at | 전화: 031-1234-5678</P
	>
	<P
		>뭐하지공방은 통신판매중개자이며, 통신판매의 당사자가 아닙니다. 상품, 상품정보, 거래에 관한
		의무와 책임은 계약 당사자 각자에게 있습니다.</P
	>
</footer>
