<template>
	<v-row justify="center" align="center">
		<v-col sm="7" md="6" lg="5" xl="4">
			<v-card class="elevation-12" tile>
				<v-toolbar class="transparent" flat dense>
					<v-toolbar-title>Open a ticket</v-toolbar-title>
				</v-toolbar>

				<v-divider></v-divider>
				<v-form ref="form" @submit.prevent="createTicket">
					<v-card-text>
						<v-select label="Discovery Phase" placeholder="What phase was the issue discovered?" :items="phases" item-text="text" item-value="value" return-object v-model="input.phase"
							:rules="[
								() => !!input.phase || 'A discovery phase is required',
							]"
						></v-select>
						<v-text-field label="Title" placeholder="Something doesn't work..." v-model="input.title"
							:rules="[
								() => !!input.title || 'A title is required',
								() => !!input.title && input.title.length >= 4 || 'Title must be at least 4 characters long',
								() => !!input.title && input.title.length <= 125 || 'Title cannot contain more than 125 characters',
							]"
						></v-text-field>
						<v-textarea label="Description" placeholder="Description of the issue and how it can be reproduced..." counter v-model="input.description"
							:rules="[
								() => !!input.description || 'A description of the issue is required',
								() => !!input.description && input.description.length >= 50 || 'Description must be at least 50 characters long',
								() => !!input.description && input.description.length <= 2000 || 'Description cannot contain more than 2000 characters',
							]"
						></v-textarea>
						<v-select label="Priority Level" placeholder="How urgent is the issue?" :items="priority" item-text="text" item-value="value" return-object v-model="input.priority"
							:rules="[
								() => !!input.priority || 'A priority level is required',
							]"
						></v-select>
					</v-card-text>

					<v-divider></v-divider>

					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn type="submit" color="info" text>Create</v-btn>
					</v-card-actions>
				</v-form>
			</v-card> 
		</v-col>
		<snack-bar :snack-message.sync="snack.message" :snack-color="snack.color"></snack-bar>
		<loader :message="loader.message" :show="loader.show"></loader>
	</v-row>
</template>

<style>
</style>

<script>
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
		input: {
			phase: null,
			title: "",
			description: "",
			priority: null,
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
		snack: {
			message: "",
			color: "",
		},
		loader: {
			message: "",
			show: false,
		}
	}),
	methods: {
		createTicket() {

		}
	}
}
</script>
