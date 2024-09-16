import express from 'express';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import AppsError from './utils/AppsError.js';
import 'express-async-errors';
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(routes);
app.use( (error, request, response, next) => {
    if (error instanceof AppsError) {
        return response.status(error.statusCode).json({
            status: "error",
            message: error.message
        });
    }

    console.error(error);

    return response.status(500).json({
        status: "error",
        message: "Internal server error"
    });

} );
app.listen( PORT, () => {
    console.log(`Server on in PORT: ${PORT}`);
});