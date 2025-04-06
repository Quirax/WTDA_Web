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
		[{ align: 'justify' }, { align: '' }, { align: 'center' }, { align: 'right' }], // text direction
		['link', 'image', 'video' /*, 'formula'*/],
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

			holder!.parentElement!.classList.add('ql-ko');
		});
	});
</script>

<div class="flex size-full flex-col flex-nowrap">
	<div bind:this={holder}></div>
</div>

<svelte:head>
	<style lang="scss" type="text/css">
		/**
         * ref: https://github.com/slab/quill/issues/4331#issuecomment-2265621510
         */
		@mixin change-content($content) {
			content: $content !important;
		}

		@mixin change-picker($content) {
			&.ql-picker-label::before,
			&.ql-picker-item::before {
				@include change-content($content);
			}
		}

		.ql-container {
			overflow-y: hidden;
		}

		.ql-ko {
			.ql-size {
				& * {
					@include change-picker('기본');
				}
				& [data-value='small'] {
					@include change-picker('작게');
				}
				& [data-value='large'] {
					@include change-picker('크게');
				}
				& [data-value='huge'] {
					@include change-picker('더 크게');
				}
			}
			.ql-header {
				& * {
					@include change-picker('기본');
				}

				@for $lv from 1 through 6 {
					& [data-value='#{$lv}'] {
						@include change-picker('제목 #{$lv}');
					}
				}
			}

			.ql-tooltip {
				&::before {
					@include change-content('URL에 방문:');
				}

				&[data-mode='link']::before {
					@include change-content('링크 입력:');
				}

				.ql-action::after {
					@include change-content('저장');
				}

				.ql-remove::before {
					@include change-content('제거');
				}
			}
		}
	</style>
</svelte:head>
