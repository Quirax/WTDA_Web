<svelte:options runes />

<!-- ref: https://github.com/carstenlebek/svelte-email?tab=readme-ov-file -->
<script lang="ts">
	import fs from 'node:fs';

	import * as paraglide from '$lib/paraglide/runtime';

	import Footer from '../../../stories/components/Footer.svelte';

	const { children = () => {} } = $props();

	// ref: https://stackoverflow.com/a/7734250
	const logoDataURL = `data:image/png;base64,${fs.readFileSync('./static/logo.png', 'base64')}`;

	const css = `<style type="text/css">${fs.readFileSync('./static/mail.css')}</style>`;
</script>

<html lang={paraglide.languageTag()}>
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
		{@html css}
	</head>
	<body>
		<div style="display: contents">
			<header class="bg-background border-b-2">
				<div class="flex h-16 items-center px-4">
					<a href="/" class="relative size-9 rounded-full" aria-label="Logo">
						<div
							class="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white p-1"
							id="bits-312"
							data-avatar-root=""
							data-status="loading">
							<img
								alt="뭐하지공방 로고"
								class="aspect-square h-full w-full"
								id="bits-313"
								data-status="loading"
								data-avatar-image=""
								src={logoDataURL} />
						</div>
					</a>
					<div class="mx-6 hidden items-center space-x-4 font-bold sm:flex lg:space-x-6">
						뭐하지공방
					</div>
				</div>
			</header>
			{@render children()}
			<Footer />
		</div>
	</body>
</html>
