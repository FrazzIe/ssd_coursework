<template>
	<v-row>
		<v-col>
			Placeholder
			<div v-if="isAuthenticated">
				Hello {{ loggedInUser.username }}
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
	}
}
</script>
