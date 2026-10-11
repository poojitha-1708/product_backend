module.exports = (err, req, res, next) => {
    if(err.name === "ValidationError") {
        return res.status(400).json({
            error: err.message
        });
    }
    if(err.name === "CastError") {
        return res.status(400).json({
            error: "Invalid ID"
        });
    }
    console.error(err.stack);
    res.status(500).json({
        error: "Server Error"
    }); 
}