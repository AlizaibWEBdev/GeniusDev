import express from "express";
import path from "path";

import router from "./router.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname, 'public')));

const port = 3000;
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(router);



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
export default router;
