function cors_origin() {
    return async (req, res, next) => {
        try {
            res.setHeader("X-XSS-Protection", "1; mode=block");

            // const _whitelist = "http://localhost:3000,http://localhost:4000,http://localhost:5000";
            // const allowedOrigins = _whitelist.split(',');
            // const origin = req.headers.origin ?? req.headers.host;

            // console.log('new call');
            // console.log(allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.indexOf(`https://${origin}`) !== -1 ||
            // allowedOrigins.indexOf(`http://${origin}`) !== -1);

            // if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.indexOf(`https://${origin}`) !== -1 ||
            //     allowedOrigins.indexOf(`http://${origin}`) !== -1) {
            //     res.setHeader('Access-Control-Allow-Origin', '*');
            // } else {
            //     const _errorResponse = {
            //         status: "error",
            //         message: "Not allowed by CORS",
            //         messageCode: "GLOBAL_E001",
            //     }
            //     return res.status(403).send(_errorResponse);
            // }
            res.setHeader('Access-Control-Allow-Origin', '*');
            next();
        } catch (err) {
            next(err);
        }
    };
}

module.exports = cors_origin;