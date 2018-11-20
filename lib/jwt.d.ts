import { PermissionRule } from 'acl-permissions';
export declare const checkPermissionsAndAttributes: (tokenInfo: any, resource: string) => Promise<{
    allowed: boolean;
    attributes?: {
        [key: string]: any;
    } | undefined;
}>;
export declare const getDenialForRequest: (tokenInfo: any, resource: string) => PermissionRule | null;
export declare const getTokenFromRequest: (req: any) => Promise<any>;
