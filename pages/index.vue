<template>
	<v-row>
		<v-col>
			Placeholder
			<div v-if="isAuthenticated">
				Hello {{ loggedInUser.username }}
				<v-btn color="error" @click="logout">Logout</v-btn>
			</div>
		</v-col>
	</v-row>
</template>

<style>
</style>

<script>
import { mapGetters } from "vuex";

export default {
	middleware: "auth",
	data: () => ({

	}),
	computed: {
		...mapGetters(["isAuthenticated", "loggedInUser"]),
	},
	methods: {
		logout() {
			this.$auth.logout().then(() => {				
				
			}).catch((error) => {
				console.log(error.message);
			});
		},
	}
}
</script>
