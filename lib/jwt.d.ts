import { PermissionRule } from 'acl-permissions';
export declare type CheckPermissionsResult = {
    allowed: boolean;
    resource: string;
    attributes?: {
        [key: string]: any;
    };
};
export declare const checkPermissionsAndAttributes: (tokenInfo: any, resource: string) => Promise<CheckPermissionsResult>;
export declare const getDenialForRequest: (tokenInfo: any, resource: string) => PermissionRule | null;
export declare const getTokenFromRequest: (req: any) => Promise<any>;
