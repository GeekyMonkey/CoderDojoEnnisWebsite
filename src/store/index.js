export const state = () => ({
	supabase: {
		auth: {
			user: null,
		},
	},
});

export const mutations = {
	setUser(state, user) {
		state.supabase.auth.user = user;
	},
};

export const actions = {
	async nuxtServerInit({ commit }, { req }) {
		const user = await this.$supabase.auth.user();
		commit("setUser", user);
	},
};
