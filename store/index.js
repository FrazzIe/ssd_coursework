export const actions = {
	canAccess({ state }, permission) {
		const [err, result] = this.$permission.check(state.auth.user.scope, permission);

		if (err) {
			console.log(err);
			return false;
		}

		return result;
	},
}
export const getters = {
	isAuthenticated(state) {
		return state.auth.loggedIn
	},
	loggedInUser(state) {
		return state.auth.user
	},
}