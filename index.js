import express from "express";
import path from "path";
import { csv2json, json2csv } from 'json-2-csv';
import fs from 'fs';
import { Readable } from 'stream';
import { IncomingForm } from 'formidable';
import extractKeywords from "./myjsfunctions/extractKeyword.function.js";
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




app.get('/javascript-minifier', (req, res) => {
  res.render('javascript-minifier');
});
app.get('/html-minifier', (req, res) => {
  res.render('html-minifier');
});
app.get('/css-minifier', (req, res) => {
  res.render('css-minifier');
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/json-to-csv-converter', (req, res) => {
  res.render('json-to-csv');
});
app.get('/csv-to-json-converter', (req, res) => {
  res.render('csv-to-json');
});
app.post('/csv-to-json', (req, res) => {
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Error processing file' });
    }

    const file = files.csvFile[0];
    const csvStream = fs.createReadStream(file.filepath, 'utf8');

    try {
      const jsonData = await new Promise((resolve, reject) => {
        const chunks = [];
        csvStream.on('data', chunk => chunks.push(chunk));
        csvStream.on('end', async () => {
          try {
            const csvData = chunks.join('');
            const jsonResult = await csv2json(csvData);
            resolve(jsonResult);
          } catch (err) {
            reject(err);
          }
        });
        csvStream.on('error', reject);
      });

      const jsonStream = Readable.from(JSON.stringify(jsonData, null, 2));
      res.setHeader('Content-Disposition', 'attachment; filename=result.json');
      res.setHeader('Content-Type', 'routerlication/json');
      jsonStream.pipe(res);

    } catch (err) {
      res.status(400).json({ error: 'Error parsing CSV data' });
    }
  });
});

app.post('/json-to-csv', (req, res) => {
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Error processing file' });
    }

    const file = files.jsonFile[0];
    const jsonStream = fs.createReadStream(file.filepath, 'utf8');

    try {
      const csvResult = await new Promise((resolve, reject) => {
        const chunks = [];
        jsonStream.on('data', chunk => chunks.push(chunk));
        jsonStream.on('end', async () => {
          try {
            const jsonData = JSON.parse(chunks.join(''));
            const csvData = await json2csv(jsonData);
            resolve(csvData);
          } catch (err) {
            reject(err);
          }
        });
        jsonStream.on('error', reject);
      });

      const csvStream = Readable.from(csvResult);
      res.setHeader('Content-Disposition', 'attachment; filename=result.csv');
      res.setHeader('Content-Type', 'text/csv');
      csvStream.pipe(res);

    } catch (err) {
      res.status(400).json({ error: 'Error parsing JSON data' });
    }
  });
});
app.get('/base64-encoder-decoder', (req, res) => {
  res.render('base64');
});
app.get('/contact', (req, res) => {
  res.render('contact');
});

app.get('/free-online-api-request-tester', (req, res) => {
  res.render('api');
});
app.get('/color-scheme-&-palette-generator', (req, res) => {
  res.render('colour');
});
app.get('/free-css-animated-background', (req, res) => {
  res.render('cssbg');
});
app.get('/keyword-extracts-tool', (req, res) => {
  res.render('keyword');
});
app.get('/free-css-animated-loaders', (req, res) => {
  res.render('loading-animation-html-css');
});
app.get('/tools', (req, res) => {
  res.render('tools');
});
app.get('/about', (req, res) => {
  res.render('about');
});
app.get('/free-roadmaps', (req, res) => {
  res.render('roadmaps');
});

app.post('/extract', async (req, res) => {
  const { url } = req.body;

  // Basic URL validation
  const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*))\\.)+[a-z]{2,}' + // domain name
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$','i');

  if (!url || !urlPattern.test(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const keywords = await extractKeywords(url);
    res.json(keywords);
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: 'Failed to extract keywords' });
  }
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

