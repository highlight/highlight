export interface Headers {
    [key: string]: any;
}

export interface Request {
    url: string;
    verb: string;
    time: string;
    headers: Headers;
    body: any;
}

export interface Response {
    status: number;
    time: string;
    headers: any;
    body: any;
}
