import multer from 'multer';
import path from 'path';
import fs from 'fs';


// Storage to save file to disk temporarily
const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        //Automatically create the uploads directory if it doesn't exist
        const uploadDir = 'uploads';

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }


        cb(null, uploadDir); // Automatically create uploads/ folder at root if not exists

        // cb(null, 'uploads/'); // Create uploads/ folder at root if not exists
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    },
});

const upload = multer({ storage });

export default upload;