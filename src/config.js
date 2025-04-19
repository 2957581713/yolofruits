const config = {
    development: {
        backendUrl: 'http://localhost:9002'
    },
    production: {
        backendUrl: 'http://localhost:9002'
    }
};

const getConfig = () => {
    if (import.meta.env.DEV) {
        return config.development;
    }
    return config.production;
};

export default getConfig();