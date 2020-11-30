class Permission {
	#groups = [];	
	#permissions = {};

	constructor() {
		this.#groups = ["admin", "developer", "tester", "client", "user"];
		this.#permissions = {
			canCreateTicket: ["admin", "developer", "tester", "client"],
		};
	}

	check(group, perm) {
		if (!this.#groups.includes(group))
			return ["Invalid group", false];
		if (!this.#permissions[perm])
			return ["Invalid permission", false];
		
		return [false, this.#permissions[perm].includes(group)];
	}
}

module.exports = new Permission();