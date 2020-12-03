<template>
	<v-row justify="center" align="center">
		<v-col sm="7" md="6" lg="5" xl="5">
			<v-card class="elevation-12" tile>
				<v-toolbar class="transparent" flat dense>
					<v-toolbar-title>My Tickets</v-toolbar-title>
				</v-toolbar>

				<v-divider></v-divider>

				<v-list three-line>
					<v-list-item-group>
						<template v-if="tickets.length == 0">
							<p class="text-center text-caption">
								You don't have any tickets to display!
								<br/>
								Do you want to <nuxt-link to="/tickets/new" class="pointer" tag="u">open</nuxt-link> a ticket?
							</p>
						</template>
						<template v-else v-for="(item, index) in tickets">
							<v-list-item :key="item.id + '-1'" :to="'/tickets/view/' + item.id" nuxt>
								<v-list-item-content>
									<v-list-item-title>{{ item.title }}</v-list-item-title>
									<v-list-item-subtitle class="text--primary">{{ item.latest_comment_author }} &mdash; {{ item.latest_comment }}</v-list-item-subtitle>
									<v-list-item-subtitle>Priority: {{ ticketPriority(item.priority) }}, Discovery Phase: {{ ticketPhase(item.discover_phase) }}</v-list-item-subtitle>
								</v-list-item-content>

								<v-list-item-action>
									{{ ticketStatus(item.status) }}
								</v-list-item-action>
							</v-list-item>

							<v-divider v-if="index < tickets.length - 1" :key="item.id + '-2'"></v-divider>
						</template>
					</v-list-item-group>
				</v-list>
			</v-card>
		</v-col>
	</v-row>
</template>

<style>
</style>

<script>
import { mapGetters } from "vuex";

export default {
	components: {
		snackBar,
		loader,
	},
	middleware: ["auth", "permissions"],
	auth: true,
	permissions: ["admin", "developer", "tester", "client"],
	data: () => ({
		status: ["Open", "Solved", "Closed"],
		phases: ["Development", "Testing", "Production"],
		priority: ["Low", "Medium", "High"],
	}),
	computed: {
		...mapGetters(["loggedInUser"]),
	},
	methods: {
		ticketStatus(status) {
			return this.status[status];
		},
		ticketPhase(phase) {
			return this.phases[phase];
		},
		ticketPriority(priority) {
			return this.priority[priority];
		},
	},
	async asyncData({ error, $axios }) {
		const tickets = await $axios.$get(`/api/tickets/me`).catch(err => {
			if (err.response && err.response.data && err.response.data.error)
				error({ message: err.response.data.error, statusCode: err.response.status })
		});

		return { tickets };
	},
}
</script>