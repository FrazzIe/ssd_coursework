<template>
	<v-app>
		<v-app-bar fixed app>
			<v-app-bar-nav-icon></v-app-bar-nav-icon>
			<nuxt-link to="/" class="pointer" tag="v-toolbar-title">
				Bug Tracker
			</nuxt-link>
			<v-spacer></v-spacer>
			<v-toolbar-items>
				<template v-if="isAuthenticated">
					<v-btn v-if="canAccess('canCreateTicket')" elevation="0" to="/tickets/new" nuxt exact>
						<v-icon left>mdi-file-document-edit</v-icon>
						OPEN TICKET
					</v-btn>
					<v-menu v-model="accountMenu" :close-on-content-click="false" :nudge-width="200" offset-y bottom rounded="0">
						<template v-slot:activator="{ on, attrs }">
							<v-btn elevation="0" v-bind="attrs" v-on="on">
								<v-icon left>mdi-account</v-icon>
								{{ loggedInUser.name }}
							</v-btn>
						</template>

						<v-card elevation="0" tile>
							<v-list>
								<v-list-item>
									<v-list-item-content>
										<v-list-item-title>{{ loggedInUser.name }}</v-list-item-title>
										<v-list-item-subtitle>{{ capitalise(loggedInUser.scope) }}</v-list-item-subtitle>
									</v-list-item-content>

									<v-list-item-action>
										<v-btn icon color="error" @click="logout">
											<v-icon>mdi-exit-to-app</v-icon>
										</v-btn>
									</v-list-item-action>
								</v-list-item>
							</v-list>

							<v-divider></v-divider>

							<v-list nav dense>
								<v-list-item-group>						
									<v-list-item to="/tickets/view" nuxt>
										<v-list-item-icon>
											<v-icon>mdi-file-document-edit</v-icon>
										</v-list-item-icon>
										<v-list-item-content>
											<v-list-item-title>MY TICKETS</v-list-item-title>
										</v-list-item-content>
									</v-list-item>
								</v-list-item-group>
							</v-list>
						</v-card>
					</v-menu>
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
	.pointer {
		cursor: pointer;
	}
</style>

<script>
import { mapGetters } from "vuex";

export default {
	data: () => ({
		accountMenu: false,
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
		},
		capitalise(str) {
			if (typeof str !== "string")
				return "";
			return str.charAt(0).toUpperCase() + str.slice(1);
		},
		logout() {
			this.$auth.logout().then(() => {				
				
			}).catch((error) => {
				console.log(error.message);
			});
		},
	}
}
</script>