const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const csvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

const csvFilePath = path.join(__dirname, 'data', 'data.csv');
const requestsFilePath = path.join(__dirname, 'data', 'requests.txt');

if (!fs.existsSync(csvFilePath)) {
  const headers = 'Rating,Position,Name,Skill Moves,Weak Foot,Price\n';
  fs.writeFileSync(csvFilePath, headers, 'utf8');
}

if (!fs.existsSync(requestsFilePath)) {
  fs.writeFileSync(requestsFilePath, '', 'utf8');
}

app.post('/receive-data', (req, res) => {
  const dataChunk = req.body;

  const csvWriterInstance = csvWriter({
    path: csvFilePath,
    header: [
      { id: 'rating', title: 'Rating' },
      { id: 'position', title: 'Position' },
      { id: 'name', title: 'Name' },
      { id: 'skill_moves', title: 'Skill Moves' },
      { id: 'weak_foot', title: 'Weak Foot' },
      { id: 'price', title: 'Price' }
    ],
    append: true
  });

  csvWriterInstance.writeRecords(dataChunk)
    .then(() => {
      res.status(200).send('Dados recebidos e salvos com sucesso.');
    })
    .catch(err => {
      console.error('Erro ao salvar dados no CSV:', err);
      res.status(500).send('Erro ao salvar dados.');
    });
});

app.get('/form', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'form', 'form.html'));
});

app.post('/submit-form', (req, res) => {
  const formData = req.body;

  fs.appendFile(requestsFilePath, JSON.stringify(formData) + '\n', (err) => {
    if (err) {
      console.error('Erro ao salvar dados no TXT:', err);
      res.status(500).send('Erro ao salvar dados.');
    } else {
      res.status(200).send('Dados do formulário recebidos com sucesso.');
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
