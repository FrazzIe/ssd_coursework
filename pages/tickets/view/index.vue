<template>
	<v-row justify="center" align="center">
		<v-col sm="7" md="6" lg="5" xl="5">
			<v-card class="elevation-12" tile>
				<v-toolbar class="transparent" flat dense>
					<v-toolbar-title>Tickets</v-toolbar-title>
				</v-toolbar>

				<v-divider></v-divider>

				<v-expansion-panels tile flat>
					<v-expansion-panel>
						<v-expansion-panel-header>Filters</v-expansion-panel-header>
						<v-expansion-panel-content>
							<v-row no-gutters>
								<v-col cols="9">
									<v-select label="Discovery Phase" placeholder="The phase an issue was discovered" :items="phases" item-text="text" item-value="value" return-object v-model="filters.phase"></v-select>
								</v-col>
								<v-col cols="3">
									<v-checkbox class="float-right" label="Enable" v-model="filters.enabled.phase"></v-checkbox>
								</v-col>
								<v-col cols="9">
									<v-select label="Priority Level" placeholder="Urgency of an issue" :items="priority" item-text="text" item-value="value" return-object v-model="filters.priority"></v-select>
								</v-col>
								<v-col cols="3">
									<v-checkbox class="float-right" label="Enable" v-model="filters.enabled.priority"></v-checkbox>
								</v-col>
								<v-col cols="9">
									<v-select label="Status" placeholder="e.g. Show only closed tickets" :items="status" item-text="text" item-value="value" return-object v-model="filters.status"></v-select>
								</v-col>
								<v-col cols="3">
									<v-checkbox class="float-right" label="Enable" v-model="filters.enabled.status"></v-checkbox>
								</v-col>
								<v-col cols="12">
									<v-select label="Order" :items="order" item-text="text" item-value="value" return-object v-model="filters.order"></v-select>
								</v-col>
								<v-col cols="12">
									<v-checkbox label="Show assigned tickets" v-model="filters.assigned"></v-checkbox>
								</v-col>
							</v-row>
						</v-expansion-panel-content>
					</v-expansion-panel>
				</v-expansion-panels>

				<v-divider></v-divider>

				<v-list three-line>
					<v-list-item-group>
						<template v-for="(item, index) in filteredTickets">
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
	permissions: ["admin", "developer"],
	data: () => ({
		filters: {
			phase: null,
			priority: null,
			status: null,
			order: { text: "Newest", value: true },
			assigned: false,
			enabled: {
				phase: null,
				priority: null,
				status: null,
			}
		},
		phases: [
			{ text: "Development", value: 0 },
			{ text: "Testing", value: 1 },
			{ text: "Production", value: 2 },
		],
		priority: [
			{ text: "Low", value: 0 },
			{ text: "Medium", value: 1 },
			{ text: "High", value: 2 },
		],
		status: [
			{ text: "Open", value: 0 },
			{ text: "Solved", value: 1 },
			{ text: "Closed", value: 2 },
		],
		order: [
			{ text: "Newest", value: true },
			{ text: "Oldest", value: false },
		],
		snack: {
			message: "",
			color: "",
		},
		loader: {
			message: "",
			show: false,
		},
		tickets: [],
	}),
	computed: {
		...mapGetters(["loggedInUser"]),
		filteredTickets() {
			var tickets = this.tickets;

			if (this.filters.enabled.phase && !!this.filters.phase)
				tickets = tickets.filter(ticket => ticket.discover_phase == this.filters.phase.value);

			if (this.filters.enabled.priority && !!this.filters.priority)
				tickets = tickets.filter(ticket => ticket.priority == this.filters.priority.value);

			if (this.filters.enabled.status && !!this.filters.status)
				tickets = tickets.filter(ticket => ticket.status == this.filters.status.value);
			
			if (this.filters.assigned)
				tickets = tickets.filter(ticket => ticket.assigned_id == this.loggedInUser.id);

			if (this.filters.order.value)
				tickets = tickets.sort((x, y) => y.latest_comment_timestamp - x.latest_comment_timestamp)
			else
				tickets = tickets.sort((x, y) => x.latest_comment_timestamp - y.latest_comment_timestamp)
	
			return tickets;
		},
	},
	methods: {
		formatDate(unix) {
			return new Date(unix * 1000).toUTCString();
		},
		ticketStatus(status) {
			return this.status[status].text;
		},
		ticketPhase(phase) {
			return this.phases[phase].text;
		},
		ticketPriority(priority) {
			return this.priority[priority].text;
		},
	},
	async asyncData({ error, $axios }) {
		const tickets = await $axios.$get(`/api/tickets/view`).catch(err => {
			if (err.response && err.response.data && err.response.data.error)
				error({ message: err.response.data.error, statusCode: err.response.status })
		});

		return { tickets };
	},
}
</script>
