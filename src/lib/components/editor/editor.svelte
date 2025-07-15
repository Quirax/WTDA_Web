<script lang="ts">
	import { browser } from '$app/environment';
	import { m } from '$lib/messages';
	import { uploadImage } from '$lib/utils';
	import type { Delta, QuillOptions } from 'quill';

	interface Props {
		value: string;
		onchange?: (value: string, delta: Delta) => void;
	}

	let { value = $bindable(), onchange = () => {} }: Props = $props();

	let holder = $state<HTMLElement>();

	const toolbarOptions = [
		[{ header: [1, 2, 3, 4, 5, 6, false] }],
		[{ font: [] }, { size: [] }],
		['bold', 'italic', 'underline', 'strike'], // toggled buttons
		[{ color: [] }, { background: [] }],
		[{ script: 'super' }, { script: 'sub' }],
		['blockquote', 'code-block'],
		[{ list: 'ordered' }, { list: 'bullet' }],
		[{ indent: '-1' }, { indent: '+1' }],
		[{ align: 'justify' }, { align: '' }, { align: 'center' }, { align: 'right' }], // text direction
		['link', 'image', 'video' /*, 'formula'*/],
		['clean'], // remove formatting button
	];

	$effect.pre(() => {
		if (!browser) return;
		if (!holder) return;

		import('quill').then(async ({ default: Quill }) => {
			// @ts-ignore
			Quill.register('modules/imageUploader', (await import('quill-image-uploader')).default);

			const options: QuillOptions = {
				bounds: holder,
				debug: 'warn',
				modules: {
					toolbar: toolbarOptions,
					imageUploader: {
						upload: uploadImage,
					},
				},
				placeholder: m['EDITOR.PLACEHOLDER'](), // TODO: props
				readOnly: false, // TODO: props
				theme: 'snow',
			};

			const quill = new Quill(holder!, options);
			quill.clipboard.dangerouslyPasteHTML(value); // ref: https://developer-lte.tistory.com/entry/Quill-%EA%B2%8C%EC%8B%9C%EA%B8%80-%EC%88%98%EC%A0%95-%EC%BB%B4%ED%8F%AC%EB%84%8C%ED%8A%B8-%EC%9E%AC%ED%99%9C%EC%9A%A9
			onchange(quill.getSemanticHTML(), quill.getContents());

			quill.on('text-change', () => {
				value = quill.getSemanticHTML();

				onchange(quill.getSemanticHTML(), quill.getContents());
			});

			holder!.parentElement!.classList.add('ql-ko');
		});
	});

	const editorTextCSS = `
		--editor-size-default: "${m['EDITOR.SIZE.DEFAULT']()}";
		--editor-size-small: "${m['EDITOR.SIZE.SMALL']()}";
		--editor-size-large: "${m['EDITOR.SIZE.LARGE']()}";
		--editor-size-huge: "${m['EDITOR.SIZE.HUGE']()}";
		--editor-header-default: "${m['EDITOR.HEADER.DEFAULT']()}";
		--editor-header-level-1: "${m['EDITOR.HEADER.LEVEL']({ level: 1 })}";
		--editor-header-level-2: "${m['EDITOR.HEADER.LEVEL']({ level: 2 })}";
		--editor-header-level-3: "${m['EDITOR.HEADER.LEVEL']({ level: 3 })}";
		--editor-header-level-4: "${m['EDITOR.HEADER.LEVEL']({ level: 4 })}";
		--editor-header-level-5: "${m['EDITOR.HEADER.LEVEL']({ level: 5 })}";
		--editor-header-level-6: "${m['EDITOR.HEADER.LEVEL']({ level: 6 })}";
		--editor-tooltip-url: "${m['EDITOR.TOOLTIP.URL']()}";
		--editor-tooltip-link: "${m['EDITOR.TOOLTIP.LINK']()}";
		--editor-tooltip-save: "${m['EDITOR.TOOLTIP.SAVE']()}";
		--editor-tooltip-remove: "${m['EDITOR.TOOLTIP.REMOVE']()}";
	`;
</script>

<div class="flex size-full flex-col flex-nowrap" style={editorTextCSS}>
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
			overflow-y: scroll;
			min-height: 300px;
			max-height: 80vh;
		}

		.ql-ko {
			.ql-size {
				& * {
					@include change-picker(var(--editor-size-default));
				}
				& [data-value='small'] {
					@include change-picker(var(--editor-size-small));
				}
				& [data-value='large'] {
					@include change-picker(var(--editor-size-large));
				}
				& [data-value='huge'] {
					@include change-picker(var(--editor-size-huge));
				}
			}
			.ql-header {
				& * {
					@include change-picker(var(--editor-header-default));
				}

				@for $lv from 1 through 6 {
					& [data-value='#{$lv}'] {
						@include change-picker(var(--editor-header-level-#{$lv}));
					}
				}
			}

			.ql-tooltip {
				&::before {
					@include change-content(var(--editor-tooltip-url));
				}

				&[data-mode='link']::before {
					@include change-content(var(--editor-tooltip-link));
				}

				.ql-action::after {
					@include change-content(var(--editor-tooltip-save));
				}

				.ql-remove::before {
					@include change-content(var(--editor-tooltip-remove));
				}
			}
		}
	</style>
</svelte:head>
