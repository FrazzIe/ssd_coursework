<template>
	<v-row justify="center" align="center">
		<v-col sm="7" md="6" lg="5" xl="4">
			<v-card class="elevation-12" tile>
				<v-toolbar class="transparent" flat dense>
					<v-toolbar-title>Ticket #{{ ticket.id }}</v-toolbar-title>
					<v-spacer></v-spacer>
					<v-subheader>Status: {{ ticketStatus }}</v-subheader>
				</v-toolbar>

				<v-divider></v-divider>

				<v-card-text>
					<v-row no-gutters>
						<v-col cols="6">
							<p class="text-subtitle-1 font-weight-black">
								<span class="text-subtitle-2">Creator</span>
								<br/>
								{{ ticket.creator }}
								<br/>
								<span class="text-subtitle-2">Discovery Phase</span>
								<br/>
								{{ ticketPhase }}
							</p>
						</v-col>
						<v-col cols="6">
							<p class="text-subtitle-1 font-weight-black">
								<span class="text-subtitle-2">Assigned to</span>
								<br/>
								{{ ticket.assignee }}
								<br/>
								<span class="text-subtitle-2">Priority Level</span>
								<br/>
								{{ ticketPriority }}
							</p>
						</v-col>
					</v-row>
					<v-row no-gutters>
						<v-col cols="12">
							<p class="text-subtitle-1 font-weight-black">
								<span class="text-subtitle-2">Title</span>
								<br/>
								{{ ticket.title }}
							</p>
						</v-col>
					</v-row>
				</v-card-text>

				<v-divider></v-divider>
				<v-card-actions>
					<span class="text-caption">Created {{ formatDate(ticket.created_at) }}</span>
				</v-card-actions>

				<v-divider></v-divider>

				<v-toolbar class="transparent" flat dense>
					<v-toolbar-title>Comments</v-toolbar-title>
				</v-toolbar>

				<v-divider></v-divider>

				<v-list two-line>
					<template v-for="(item, index) in ticket.comments">
						<v-list-item :key="item.id">
							<v-list-item-content>
								<v-list-item-title>{{ item.username }} - <span class="text-caption">{{ capitalise(item.group) }}</span></v-list-item-title>
								<v-list-item-subtitle class="text--primary">{{ item.comment }}</v-list-item-subtitle>
								<v-list-item-subtitle>{{ formatDate(item.created_at) }}</v-list-item-subtitle>
							</v-list-item-content>
						</v-list-item>

						<v-divider v-if="index < ticket.comments.length - 1" :key="index"></v-divider>
					</template>
				</v-list>
			</v-card>
		</v-col>
		<snack-bar :snack-message.sync="snack.message" :snack-color="snack.color"></snack-bar>
		<loader :message="loader.message" :show="loader.show"></loader>
	</v-row>
</template>

<style>
</style>

<script>
import { mapGetters } from "vuex";
import snackBar from "@/components/snackBar";
import loader from "@/components/loader";

export default {
	components: {
		snackBar,
		loader,
	},
	middleware: ["auth", "permissions"],
	auth: true,
	permissions: false,
	data: () => ({
		status: ["Open", "Solved", "Closed"],
		phase: ["Development", "Testing", "Production"],
		priority: ["Low", "Medium", "High"],
		snack: {
			message: "",
			color: "",
		},
		loader: {
			message: "",
			show: false,
		}
	}),
	computed: {
		...mapGetters(["loggedInUser"]),
		ticketStatus() {
			return this.status[this.ticket.status];
		},
		ticketPhase() {
			return this.phase[this.ticket.discover_phase];
		},
		ticketPriority() {
			return this.priority[this.ticket.priority];
		},
	},
	methods: {
		formatDate(unix) {
			return new Date(unix * 1000).toUTCString();
		},
		capitalise(str) {
			if (typeof str !== "string")
				return "";
			return str.charAt(0).toUpperCase() + str.slice(1);
		},
	},
	validate({ params }) {
		return !isNaN(+params.id);
	},
	async asyncData({ params, error, $axios }) {
		const ticket = await $axios.$get(`/api/tickets/view/${+params.id}`).catch(err => {
			if (err.response && err.response.data && err.response.data.error)
				error({ message: err.response.data.error, statusCode: err.response.status })
		});

		return { ticket };
	}
}
</script>