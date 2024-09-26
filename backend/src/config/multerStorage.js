import multer from "multer";
import {v4 as uuidv4} from "uuid";

// Setup storage for memberImage
export const memberImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'memberImage/'); // Upload to the 'memberImage' folder
    },
    filename: function (req, file, cb) {
        const uniqueName = uuidv4() + file.originalname.slice(file.originalname.lastIndexOf('.'));
        cb(null, uniqueName);
    },
    limits: { fileSize: 10 * 1024 * 1024}, // 10mb upload limit
});

export const teamImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'teamImage/'); // Upload to the 'teamImage' folder
    },
    filename: function (req, file, cb) {
        const uniqueName = uuidv4() + file.originalname.slice(file.originalname.lastIndexOf('.'));
        cb(null, uniqueName);
    },
    limits: { fileSize: 10 * 1024 * 1024}, // 10mb upload limit
});
