export interface AppConfig {
    env: 'development' | 'test' | 'production';
    port: number;
    frontendUrl: string;
    corsOrigins: string[];
}
export interface DatabaseConfig {
    url?: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    ssl: boolean;
    ca?: string;
}
export interface RedisConfig {
    url?: string;
    host: string;
    port: number;
}
export interface JwtConfig {
    accessSecret: string;
    refreshSecret: string;
    accessTtl: string;
    refreshTtl: string;
}
export interface MailConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
}
export interface OAuthConfig {
    google: {
        clientId: string;
        clientSecret: string;
    };
    facebook: {
        clientId: string;
        clientSecret: string;
    };
}
export interface Configuration {
    app: AppConfig;
    database: DatabaseConfig;
    redis: RedisConfig;
    jwt: JwtConfig;
    mail: MailConfig;
    oauth: OAuthConfig;
}
export declare function parseOrigins(raw: string | undefined): string[];
export declare const configuration: () => Configuration;
