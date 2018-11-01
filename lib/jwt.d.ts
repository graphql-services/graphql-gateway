export declare const checkPermissionsAndAttributes: (req: any, resource: string) => Promise<{
    allowed: boolean;
    attributes?: {
        [key: string]: any;
    } | undefined;
}>;
export declare const getTokenFromRequest: (req: any) => Promise<any>;
