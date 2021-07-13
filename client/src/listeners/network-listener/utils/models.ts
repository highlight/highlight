export interface Headers {
    [key: string]: any;
}

export interface Request {
    url: string;
    verb: string;
    headers: Headers;
    body: any;
}

export interface Response {
    status: number;
    headers: any;
    body: any;
}
