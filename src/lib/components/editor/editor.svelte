<script lang="ts">
	import { browser } from '$app/environment';
	import type { QuillOptions } from 'quill';

	import 'quill/dist/quill.snow.css';

	let holder = $state<HTMLElement>();

	const toolbarOptions = [
		[{ header: [1, 2, 3, 4, 5, 6, false] }],
		[{ font: [] }, { size: [] }],
		['bold', 'italic', 'underline', 'strike'], // toggled buttons
		[{ color: [] }, { background: [] }],
		[{ script: 'super' }, { script: 'sub' }],
		['blockquote', 'code-block'],
		[{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
		[{ indent: '-1' }, { indent: '+1' }],
		[{ align: [] }], // text direction
		['link', 'image', 'video', 'formula'],
		['clean'], // remove formatting button
	];

	$effect(() => {
		if (!browser) return;
		if (!holder) return;

		import('quill').then(async ({ default: Quill }) => {
			console.log(holder?.offsetTop);
			const options: QuillOptions = {
				bounds: holder,
				debug: 'warn',
				modules: {
					toolbar: toolbarOptions,
				},
				placeholder: '내용을 입력하세요...', // TODO: props
				readOnly: false, // TODO: props
				theme: 'snow',
			};

			const quill = new Quill(holder!, options);
		});
	});
</script>

<div class="flex size-full flex-col flex-nowrap">
	<div bind:this={holder}></div>
</div>

<style>
	:global(.ql-container) {
		overflow-y: hidden;
	}
</style>
