export declare enum Role {
    COMMUTER = "Commuter",
    OPS = "Ops"
}
export declare class User {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
}
