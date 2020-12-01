<template>
	<v-app>
		<v-app-bar fixed app>
			<v-app-bar-nav-icon></v-app-bar-nav-icon>
			<v-toolbar-title>Title</v-toolbar-title>
			<v-spacer></v-spacer>
			<v-toolbar-items>
				<template v-if="isAuthenticated">
					<v-btn v-if="canAccess('canCreateTicket')" elevation="0">OPEN TICKET</v-btn>
				</template>
				<template v-else>
				</template>
			</v-toolbar-items>
		</v-app-bar>
		<v-main>
			<v-container fluid>
				<nuxt />
			</v-container>
		</v-main>
	</v-app>
</template>

<style>
</style>

<script>
import { mapGetters } from "vuex";

export default {
	data: () => ({

	}),
	computed: {
		...mapGetters(["isAuthenticated", "loggedInUser"]),
	},
	methods: {
		canAccess(permission) {
			const [err, result] = this.$permission.check(this.loggedInUser.scope, permission);

			if (err) {
				console.log(err);
				return false;
			}

			return result;
		}
	}
}
</script>