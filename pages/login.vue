<template>
  <v-row justify="center" align="center">
    <v-col sm="7" md="5" lg="4" xl="2">
			<v-card class="elevation-12" tile>
				<v-toolbar class="transparent" flat dense>
					<v-toolbar-title>Bug Tracker</v-toolbar-title>
				</v-toolbar>

				<v-divider></v-divider>
				<v-form ref="form" @submit.prevent="login">
					<v-card-text>						
						<v-text-field prepend-icon="mdi-account" label="Username" v-model="input.username" 
							:rules="[
								() => !!input.username || 'A username is required',
								() => !!input.username && input.username.length <= 30 || 'Username must be less than 30 characters',
								usernameCheck,
							]" counter="30"></v-text-field>
						<v-text-field prepend-icon="mdi-lock" label="Password" v-model="input.password"
							:rules="[
								() => !!input.password || 'A password is required',
								() => !!input.password && input.password.length >= 8 || 'Password must be at least 8 characters long',
								passwordCheck,
							]"
						></v-text-field>						
					</v-card-text>
					
					<v-divider></v-divider>

					<v-card-actions>
						<v-btn color="primary" text @click="register">Register</v-btn>
						<v-spacer></v-spacer>
						<v-btn type="submit" color="success" text>Login</v-btn>
					</v-card-actions>
				</v-form>
			</v-card> 
    </v-col>
  </v-row>
</template>

<style>
</style>
<script>
export default {
  layout: "auth",
	data: () => ({
		input: {
			username: "",
			password: "",
		},
	}),
	methods: {
		async login() {
			if (this.$refs.form.validate()) {
				try {
					const response = await this.$auth.loginWith("local", { data: this.input	});
					console.log(response);
				} catch(error) {
					if (error.response && error.response.data) {
						console.log(error.response.data.error);
					}
				}
			}
		},
		async register() {
			if (this.$refs.form.validate()) {
				try {
					const response = await this.$axios.post("/api/auth/register", { data: this.input });
					if (response && response.data && response.data.error) {
						console.log(response.data.error);
					}
				} catch(error) {
					if (error.response && error.response.data) {
						console.log(error.response.data.error);
					}
				}
			}
		},
		usernameCheck() {
			const pattern = /^(?=.{1,30}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/;
			return pattern.test(this.input.username) || "Invalid username";
		},
		passwordCheck() {
			const uppercase = /(?=.*?[A-Z])/;
			const lowercase = /(?=.*?[a-z])/;
			const number = /(?=.*?[0-9])/;
			const special = /(?=.*?[#?!@$%^&*-])/;

			if (!uppercase.test(this.input.password))
				return "Password must contain at least one uppercase letter";
			if (!lowercase.test(this.input.password))
				return "Password must contain at least one lowercase letter";
			if (!number.test(this.input.password))
				return "Password must contain at least one number";
			if (!special.test(this.input.password))
				return "Password must contain at least one special character";

			return true;
		}
	}
}
</script>
