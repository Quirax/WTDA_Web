<script lang="ts">
	import { browser } from '$app/environment';
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

	const onUploadImage = async (file: File) => {
		const formData = new FormData();
		formData.append('file', file);

		try {
			const resp = await fetch('/api/file/attach', {
				method: 'PUT',
				body: formData,
			}).then((r) => r.json());

			return '/api/file/' + resp.path;
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

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
						upload: onUploadImage,
					},
				},
				placeholder: '내용을 입력하십시오...', // TODO: props
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
			overflow-y: scroll;
			min-height: 300px;
			max-height: 80vh;
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
