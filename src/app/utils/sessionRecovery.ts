type SessionRecoveryActions = {
	isProtectedPage: () => boolean;
	signOut: () => Promise<void>;
	clear: () => void;
	redirect: () => Promise<void>;
};

/** Identify rejected authentication without treating access denial or outages as expiry. */
export function isSessionRejected(error: unknown): boolean {
	if (!error || typeof error !== "object") return false;
	const failure: { statusCode?: unknown; status?: unknown } = error;
	return (failure.statusCode ?? failure.status) === 401;
}

/** Recover once when concurrent protected requests reject the current session. */
export function createSessionRecovery(actions: SessionRecoveryActions): (error: unknown) => Promise<void> {
	let pending: Promise<void> | null = null;
	return async (error: unknown): Promise<void> => {
		if (!isSessionRejected(error) || !actions.isProtectedPage()) return;
		if (pending) return pending;
		pending = (async (): Promise<void> => {
			try {
				await actions.signOut();
			} finally {
				actions.clear();
				await actions.redirect();
			}
		})();
		try { await pending; } finally { pending = null; }
	};
}
