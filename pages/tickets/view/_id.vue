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

				<v-list ref="commentList" two-line class="overflow-y-auto scroll-bar" max-height="418">
					<template v-for="(item, index) in ticket.comments">
						<v-list-item :key="item.id + '-1'">
							<v-list-item-content>
								<v-list-item-title>{{ item.username }} - <span class="text-caption">{{ capitalise(item.group) }}</span></v-list-item-title>
								<span class="text--primary comment">{{ item.comment }}</span>
								<v-list-item-subtitle>{{ formatDate(item.created_at) }}</v-list-item-subtitle>
							</v-list-item-content>
						</v-list-item>

						<v-divider v-if="index < ticket.comments.length - 1" :key="item.id + '-2'"></v-divider>
					</template>
				</v-list>

				<v-divider></v-divider>

				<v-form ref="form" @submit.prevent="newComment">
					<v-card-text>
						<v-textarea label="Comment" placeholder="Leave a comment..." counter v-model="input.comment" :disabled="ticket.status == 2"
							:rules="[
								() => !!input.comment || 'A comment is required',
								() => !!input.comment && input.comment.length >= 20 || 'Comment must be at least 20 characters long',
								() => !!input.comment && input.comment.length <= 2000 || 'Comment cannot contain more than 2000 characters',
							]"
						></v-textarea>
					</v-card-text>

					<v-divider></v-divider>

					<v-card-actions>
						<template v-if="canCloseTicket">
							<v-btn text color="error" @click="closeTicket">Close</v-btn>
						</template>
						<template v-if="canSolveTicket">
							<v-btn text color="primary" @click="solveTicket">Solve</v-btn>
						</template>					
						<v-spacer></v-spacer>
						<template v-if="ticket.status !== 2">
							<v-btn type="submit" text color="success">Comment</v-btn>
						</template>
						<template v-else>
							<v-icon color="error">mdi-lock</v-icon>
						</template>
					</v-card-actions>
				</v-form>
			</v-card>
		</v-col>
		<snack-bar :snack-message.sync="snack.message" :snack-color="snack.color"></snack-bar>
		<loader :message="loader.message" :show="loader.show"></loader>
	</v-row>
</template>

<style>
	.scroll-bar::-webkit-scrollbar-track
	{
		-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.1);
		background-color: #F5F5F5;
	}
	.scroll-bar::-webkit-scrollbar
	{
		display: block;
		height: 6px;
		width: 6px;
		background-color: #F5F5F5;
	}
	.scroll-bar::-webkit-scrollbar-thumb
	{
		-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3);
		background-color: #555;
	}
	.comment {
		white-space: pre-wrap;
	}
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
	permissions: ["admin", "developer", "tester", "client"],
	data: () => ({
		input: {
			comment: "",
		},
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
		canCloseTicket() {
			return this.ticket.status !== 2 && (this.$permission.check(this.loggedInUser.scope, 'canCloseTicket') || this.loggedInUser.id == this.ticket.assigned_id);
		},
		canSolveTicket() {
			return (this.ticket.status !== 2 && this.ticket.status !== 1) && (this.$permission.check(this.loggedInUser.scope, 'canCloseTicket') || this.loggedInUser.id == this.ticket.assigned_id);
		}
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
		newComment() {
			if (this.$refs.form.validate()) {
				this.loader.message = "Creating comment..";
				this.loader.show = true;

				this.$axios.$post(`/api/tickets/comment/${this.$route.params.id}`, { data: this.input }).then((resp) => {
					this.loader.show = false;
					if (resp) {
						if (resp.error) {
							this.snack.color = "error";
							this.snack.message = resp.error;
							console.log(resp.error);
							return;
						}

						window.location.reload(true);
					}
				}).catch((error) => {
					this.loader.show = false;
					if (error.response && error.response.data && error.response.data.error) {
						console.log(error.response.data.error);
						this.snack.color = "error";
						this.snack.message = error.response.data.error;
					} else
						console.log(error.message);
				});
			}
		},
		closeTicket() {
			this.$axios.$post(`/api/tickets/close/${this.$route.params.id}`).then((resp) => {
				if (resp) {
					if (resp.error) {
						this.snack.color = "error";
						this.snack.message = resp.error;
						console.log(resp.error);
						return;
					}

					window.location.reload(true);
				}
			}).catch((error) => {
				if (error.response && error.response.data && error.response.data.error) {
					console.log(error.response.data.error);
					this.snack.color = "error";
					this.snack.message = error.response.data.error;
				} else
					console.log(error.message);
			});			
		},
		solveTicket() {
			this.$axios.$post(`/api/tickets/solve/${this.$route.params.id}`).then((resp) => {
				if (resp) {
					if (resp.error) {
						this.snack.color = "error";
						this.snack.message = resp.error;
						console.log(resp.error);
						return;
					}

					window.location.reload(true);
				}
			}).catch((error) => {
				if (error.response && error.response.data && error.response.data.error) {
					console.log(error.response.data.error);
					this.snack.color = "error";
					this.snack.message = error.response.data.error;
				} else
					console.log(error.message);
			});	
		},
		scrollToEnd() {
			this.$refs.commentList.$el.scrollTop = this.$refs.commentList.$el.scrollHeight;
		}
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
	},
	mounted() {
		this.scrollToEnd();
	},
	updated() {
		this.scrollToEnd();
	}
}
</script>