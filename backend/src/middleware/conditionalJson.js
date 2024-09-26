import express from "express";

/**
 * Middleware to conditionally apply express.json() based on the content-type of the request.
 *
 * This middleware checks the Content-Type header of the incoming request. If the Content-Type
 * is 'application/json', it applies the express.json() middleware to parse the incoming JSON payload.
 *
 * If the request Content-Type is not 'application/json', the middleware simply passes the request
 * to the next middleware or route handler without altering the request body.
 *
 * This approach allows you to use express.json() selectively, preventing it from interfering with
 * other request types such as 'multipart/form-data' (used for file uploads), which multer handles.
 *
 * @param {Object} req - The Express request object
 * @param {Object} res - The Express response object
 * @param {Function} next - The next middleware or route handler
 */
export function conditionalJson(req, res, next){
    if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
        express.json()(req, res, next); // Apply express.json() only for JSON requests
    } else {
        next();
    }
}