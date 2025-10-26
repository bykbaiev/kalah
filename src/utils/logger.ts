class Logger {
    private context: string;

    constructor(context: string = 'App') {
        this.context = context;
    }

    debug(...args: any[]): void {
        console.log(`[${this.context}]`, ...args);
    }

    info(...args: any[]): void {
        console.log(`[${this.context}]`, ...args);
    }

    warn(...args: any[]): void {
        console.warn(`[${this.context}]`, ...args);
    }

    error(...args: any[]): void {
        console.error(`[${this.context}]`, ...args);
    }

    withContext(context: string): Logger {
        return new Logger(`${this.context}:${context}`);
    }
}

export const createLogger = (context?: string): Logger => new Logger(context);
export const logger = createLogger();
