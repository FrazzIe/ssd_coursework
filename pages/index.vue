<template>
	<v-row justify="center" align="center">
		<v-col sm="7" md="6" lg="5" xl="5">
			<template v-if="isAuthenticated">
				<h3 class="text-center">Hello {{ loggedInUser.name }}, Welcome to Safari Security Testing Services (SSTS)</h3>
				<p v-if="this.$permission.check(this.loggedInUser.scope, 'canCreateTicket')" class="text-center text-body-2">
					<span class="font-weight-bold font-weight-black">Warning:</span> Only <code>Clients</code> have access to this application.
				</p>
			</template>
			<template v-else>
				<h3 class="text-center">Welcome to Safari Security Testing Services (SSTS)</h3>
				<p class="text-center text-body-2">
					<span class="font-weight-bold font-weight-black">Warning:</span> Only <code>Clients</code> have access to this application.
				</p>
			</template>

			<p class="text-body-1">
				Here at STSS we make sure your application is bug free, by means of rigourous testing. Got an issue with your application? don't want to fix it yourself? Become a client of Safari Security Testing Services today! t&c's apply &mdash; &copy; 2020 Fraser Watt
			</p>
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
