// Naju Poultry - Supabase Configuration
// Replace with your actual Supabase project credentials
const SUPABASE_URL = 'https://nqjzhseyykzrrbeqfpwb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xanpoc2V5eWt6cnJiZXFmcHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzOTM3MTksImV4cCI6MjA5NTk2OTcxOX0.bf_i4SqfI8W0QIVOsuln-EuLeC0Vx-6fQ_jqzcevTOw';

let supabaseClient = null;

function initSupabase() {
    if (supabaseClient) return supabaseClient;
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return supabaseClient;
    } catch (error) {
        console.error('Naju Poultry: Supabase initialization failed:', error);
        return null;
    }
}

// Helper: convert camelCase form field names to snake_case DB columns
function toSnakeCase(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        result[snakeKey] = value;
    }
    return result;
}
