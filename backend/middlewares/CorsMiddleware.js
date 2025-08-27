require('dotenv').config()

const validateOrigin = (req, res, next) => {
    try{
        let permitedOrigins = [process.env.PERMITED_ORIGIN, process.env.PERMITED_ORIGIN_DEVELOPMENT];
        const origin = req.header('Origin');
        if(!permitedOrigins.includes(origin)){
            return res.status(404).json({error: 'CORS origin error'})
        }
        return next();
    }catch(err){
        return res.json({success: false, code: 500, message: "Acesso não autorizado [CORS].", data: err});
    }
}

module.exports = {validateOrigin}