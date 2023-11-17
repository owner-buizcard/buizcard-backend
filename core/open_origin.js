function open_origin() {
    return async (req, res, next) => {
        try {
            res.setHeader('Access-Control-Allow-Origin', '*');
            next();
        } catch (err) {
            next(err);
        }
    };
}

module.exports = open_origin;