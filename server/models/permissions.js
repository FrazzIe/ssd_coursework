class Permission {
	#groups = [];	
	#permissions = {};

	constructor() {
		this.#groups = ["admin", "developer", "tester", "client", "user"];
		this.#permissions = {
			canCreateTicket: ["admin", "developer", "tester", "client"],
			useDevelopmentPhase: ["admin", "developer"],
			useTestingPhase: ["admin", "developer", "tester"],
		};
	}

	check(group, perm) {
		if (!this.#groups.includes(group))
			return false
		if (!this.#permissions[perm])
			return false
		
		return this.#permissions[perm].includes(group);
	}
}

module.exports = new Permission();