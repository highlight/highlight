declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV?: 'development' | 'production' | 'test';
        PUBLIC_URL: string;
    }
}
