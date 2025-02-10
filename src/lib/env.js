const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'REDIS_URL',
    'REDIS_TOKEN'
];

export function validateEnv() {
    const missingVars = requiredEnvVars.filter(
        envVar => !process.env[envVar]
    );

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}`
        );
    }
} 