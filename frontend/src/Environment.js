const DEVELOPMENT_MODE = true;

const Environment = {
    API_BASE: (DEVELOPMENT_MODE) ? "http://localhost:3001" : "https://vcar-clube-vbot-backend.pvuzyy.easypanel.host",
    API_WPP: (DEVELOPMENT_MODE) ? "http://localhost:3002" : "http://localhost:3002",
    HEADERS: { 
        headers: { 
            VBOT_ACCESS_TOKEN : localStorage.getItem("VBOT_ACCESS_TOKEN")
        } 
    },
}

export default Environment;