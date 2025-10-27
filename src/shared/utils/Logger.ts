type LogLevel = "info" | "warn" | "error" | "verbose";

type Logger = {
	info: (message: string, data?: Record<string, unknown>) => void;
	warn: (message: string, data?: Record<string, unknown>) => void;
	verbose: (message: string, data?: Record<string, unknown>) => void;
	error: (
		message: string,
		data?: Record<string, unknown>,
		error?: Error,
	) => void;
};

type LogEntryType = {
	timestamp: number;
	level: LogLevel;
	name: string;
	message: string;
	data?: Record<string, unknown>;
	error?: {
		message: string;
		stack?: string;
	};
};

interface LoggerOptions {
	showTimestamp?: boolean;
}

const defaultOptions: LoggerOptions = {
	showTimestamp: false,
};

class LoggerClass implements Logger {
	public options: LoggerOptions;
	private name: string;

	constructor(name: string, options?: LoggerOptions) {
		this.name = name;
		this.options = { ...defaultOptions, ...(options || {}) };
	}

	verbose(message: string, data?: Record<string, unknown>) {
		// this._log("verbose", message, data);
	}
	info(message: string, data?: Record<string, unknown>) {
		this._log("info", message, data);
	}
	warn(message: string, data?: Record<string, unknown>) {
		this._log("warn", message, data);
	}
	error(
		message: string,
		data?: Record<string, unknown>,
		error?: Error | unknown,
	) {
		this._log("error", message, data, error);
	}

	private _log(
		level: LogLevel,
		message: string,
		data?: Record<string, unknown>,
		error?: Error | unknown,
	) {
		const timestamp: number = Date.now();
		const logEntry: LogEntryType = {
			timestamp,
			level,
			name: this.name,
			message,
		};
		if (data !== undefined) {
			// Recursively unwrap Vue proxies in the data object
			function deepUnwrap(obj: unknown): unknown {
				if (typeof obj !== "object" || obj === null) {
					return obj;
				}
				// Try to use toRaw if available
				const globalObj =
					typeof globalThis !== "undefined" ? globalThis : undefined;
				const toRaw =
					globalObj &&
					typeof (globalObj as Record<string, unknown>)["toRaw"] === "function"
						? ((globalObj as Record<string, unknown>)["toRaw"] as (
								obj: unknown,
							) => unknown)
						: undefined;
				let raw = obj;
				if (toRaw) {
					try {
						raw = toRaw(obj) as object;
					} catch {}
				} else if ("__v_raw" in obj) {
					raw = (obj as Record<string, unknown>)["__v_raw"] as object;
				}
				if (Array.isArray(raw)) {
					return raw.map(deepUnwrap);
				} else if (typeof raw === "object" && raw !== null) {
					const result: Record<string, unknown> = {};
					for (const [k, v] of Object.entries(raw)) {
						result[k] = deepUnwrap(v);
					}
					return result;
				}
				return raw;
			}
			logEntry.data = deepUnwrap(data) as Record<string, unknown>;
		}
		if (error) {
			logEntry.error = (error as Error).message
				? {
						message: (error as Error).message,
						stack: (error as Error).stack,
					}
				: { message: error as string, stack: undefined };
		}
		if (process.env.NODE_ENV === "production") {
			// eslint-disable-next-line no-console
			console.log(JSON.stringify(logEntry));
		} else {
			// ANSI color codes for level
			let levelColor: string;
			switch (level) {
				case "info":
					levelColor = "\x1b[32m"; // green
					break;
				case "warn":
					levelColor = "\x1b[33m"; // yellow/orange
					break;
				case "error":
					levelColor = "\x1b[31m"; // red
					break;
				default:
					levelColor = "";
			}
			const resetColor = "\x1b[0m";
			const timestampString: string = this.options.showTimestamp
				? `${new Date(timestamp).toTimeString()} `
				: "";
			// const dataString = logEntry.data ? JSON.stringify(logEntry.data) : "";
			// const errorString = logEntry.error
			// 	? ` ::${JSON.stringify(logEntry.error)}`
			// 	: "";

			let info: Record<string, unknown> | undefined = { ...logEntry.data };
			if (logEntry.error) {
				info.error = logEntry.error;
			}
			if (!info || Object.keys(info).length === 0) {
				info = undefined;
			}

			// eslint-disable-next-line no-console
			const text: string = `${timestampString}${levelColor}[${level.toUpperCase()}]${resetColor} [${this.name}] ${message}`;
			if (info) {
				console.log(text, info);
			} else {
				console.log(text);
			}
		}
	}
}

export function useLogger(name: string, options?: LoggerOptions): LoggerClass {
	return new LoggerClass(name, options);
}

// Example usage:
// const logger = useLogger('MyClass')
// logger.info('A message', { foo: 'bar' }, new Error('Oops'))
// logger.error('A message', { foo: 'bar' }, new Error('Oops'))
