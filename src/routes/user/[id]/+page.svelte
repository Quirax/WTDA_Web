<script lang="ts">
	import Profile from '$stories/user/Profile.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<Profile
	user={data.user}
	profileFormData={data.profileForm}
	announcementFormData={data.announcementForm}
	announcements={data.profileAnnouncements}
	relationship={data.relationship} />
