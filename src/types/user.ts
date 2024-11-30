export interface User {
    email: string;
    name: string;
    password: string;
    supabaseId: string; // New property added
}