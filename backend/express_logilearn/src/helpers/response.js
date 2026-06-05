const response = (statusCode, data, message, res, pagination) => {
    res.status(statusCode).json({
        payload: {
            statusCode: statusCode,
            datas: data,
            message: message
        },
        pagination: pagination || {
            prev: "",
            next: "",
            max: "",
        }
    })
}

module.exports = response