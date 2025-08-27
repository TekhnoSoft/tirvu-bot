const DEVELOPMENT_MODE = false;

const Environment = {
    API_BASE: (DEVELOPMENT_MODE) ? "http://localhost:3001" : "https://others-vbot-tivru-backend.pvuzyy.easypanel.host",
    API_WPP: (DEVELOPMENT_MODE) ? "http://localhost:3002" : "http://localhost:3002",
    HEADERS: { 
        headers: { 
            VBOT_ACCESS_TOKEN : localStorage.getItem("VBOT_ACCESS_TOKEN")
        } 
    },
}

export default Environment;