<script lang="ts">
	import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
	import IconButton from '@smui/icon-button';
	import Tooltip, { Wrapper } from '@smui/tooltip';

	import './header.css';

	interface Props {
		user?: { name: string };
		onLogin?: () => void;
		onLogout?: () => void;
		onCreateAccount?: () => void;
	}

	const { user, onLogin, onLogout, onCreateAccount }: Props = $props();
</script>

<header>
	<TopAppBar variant="static" color="primary">
		<Row>
			<Section>
				<Title>What-To-Do Atelier</Title>
			</Section>
			<Section align="end" toolbar>
				{#if user}
					<Wrapper>
						<IconButton class="material-icons" aria-label="Notifications">notifications</IconButton>
						<Tooltip>No notification is received</Tooltip>
					</Wrapper>
					<Wrapper>
						<IconButton class="material-icons" aria-label="Direct Messages">forum</IconButton>
						<Tooltip>No direct message is received</Tooltip>
					</Wrapper>
					<Wrapper>
						<IconButton class="material-icons" aria-label="User Menu">account_circle</IconButton>
						<Tooltip>{user.name}</Tooltip>
					</Wrapper>
				{:else}
					<Wrapper>
						<IconButton class="material-icons" aria-label="Login">login</IconButton>
						<Tooltip>Login</Tooltip>
					</Wrapper>
				{/if}
			</Section>
		</Row>
	</TopAppBar>
</header>
