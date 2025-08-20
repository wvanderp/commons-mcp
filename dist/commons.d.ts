export interface CommonsSearchItem {
    title: string;
    description: string;
    imageUrl: string;
    pageUrl: string;
    author?: string;
    license?: string;
}
export interface SearchOptions {
    limit?: number;
}
export declare function searchCommons(query: string, { limit }?: SearchOptions): Promise<CommonsSearchItem[]>;
