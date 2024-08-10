const express = require('express');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { createObjectCsvWriter } = require('csv-writer');
const sendNotification = require('./helpers/notification');
require('dotenv').config({ path: path.join(__dirname, 'helpers/.env') });

const app = express();
const port = 3000;

// Middleware nativo do Express para JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, 'public')));

const dataDir = path.join(__dirname, 'data');
const csvFilePath = path.join(dataDir, 'dados.csv');
const requestsFilePath = path.join(dataDir, 'requests.txt');
const queueFilePath = path.join(dataDir, 'queue.json'); // Caminho para o arquivo JSON da fila

// Garantir que o diretório 'data' exista
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Criar o arquivo CSV se não existir
if (!fs.existsSync(csvFilePath)) {
  const headers = 'Rating,Position,Name,Skill Moves,Weak Foot,Price\n';
  fs.writeFileSync(csvFilePath, headers, 'utf8');
}

// Criar o arquivo TXT se não existir
if (!fs.existsSync(requestsFilePath)) {
  fs.writeFileSync(requestsFilePath, '', 'utf8');
}

// Inicializar a fila a partir do arquivo JSON
let requestQueue = [];
if (fs.existsSync(queueFilePath)) {
  const queueData = fs.readFileSync(queueFilePath, 'utf8');
  requestQueue = JSON.parse(queueData);
}

// Funções de formatação e parsing de preços
function formatPrice(price) {
  return (parseFloat(price) / 1000).toFixed(1) + 'K';
}

function parsePrice(price) {
  return parseFloat(price.replace('K', '')) * 1000;
}

// Função para filtrar jogadores com base nos critérios
function filterPlayers(criteria, csvFilePath) {
  const { overall, position, skillMoves, weakFoot, price } = criteria;

  const results = [];

  return new Promise((resolve, reject) => {
    fs.readFile(csvFilePath, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }

      const lines = data.trim().split('\n');
      const header = lines[0].split(',');
      const rows = lines.slice(1);

      const index = {
        rating: header.indexOf('Rating'),
        position: header.indexOf('Position'),
        name: header.indexOf('Name'),
        skill_moves: header.indexOf('Skill Moves'),
        weak_foot: header.indexOf('Weak Foot'),
        price: header.indexOf('Price')
      };

      rows.forEach(row => {
        const values = row.split(',');

        if (
          values[index.rating] === overall &&
          values[index.position] === position &&
          values[index.skill_moves] === skillMoves &&
          values[index.weak_foot] === weakFoot &&
          parsePrice(values[index.price]) <= price
        ) {

          results.push({
            Rating: values[index.rating],
            Position: values[index.position],
            Name: values[index.name],
            'Skill Moves': values[index.skill_moves],
            'Weak Foot': values[index.weak_foot],
            Price: values[index.price]
          });
        }
      });

      resolve(results);
    });
  });
}

// Função para salvar a fila no arquivo JSON
function saveQueueToFile(queue) {
  fs.writeFileSync(queueFilePath, JSON.stringify(queue, null, 2), 'utf8');
}

// Endpoint para receber dados e salvar no CSV
app.post('/receive-data', (req, res) => {
  const dataChunks = req.body; // Esperando um array de objetos JSON
  const dataDirectory = path.join(__dirname, 'data'); // Caminho para a pasta 'data'
  
  // Cria a pasta 'data' se não existir
  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory);
  }

  const csvFilePath = path.join(dataDirectory, 'dados.csv'); // Caminho para o arquivo CSV
  const jsonFilePath = path.join(dataDirectory, 'dados.json'); // Caminho para o arquivo JSON

  if (!Array.isArray(dataChunks)) {
    return res.status(400).send('Formato de dados inválido. Esperado um array de objetos.');
  }

  // Leitura e atualização do arquivo JSON
  let existingData = {};
  if (fs.existsSync(jsonFilePath)) {
    const fileData = fs.readFileSync(jsonFilePath);
    existingData = JSON.parse(fileData);
  }

  // Atualiza ou adiciona novos dados para cada jogador
  dataChunks.forEach(playerData => {
    const playerName = playerData.name;
    const playerPrice = playerData.price;
    const receivedAt = new Date().toISOString();

    if (existingData[playerName]) {
      existingData[playerName].prices.push(playerPrice);
      existingData[playerName].receivedAt.push(receivedAt);
    } else {
      existingData[playerName] = {
        prices: [playerPrice],
        receivedAt: [receivedAt]
      };
    }
  });

  // Salva os dados atualizados no arquivo JSON
  fs.writeFile(jsonFilePath, JSON.stringify(existingData, null, 2), err => {
    if (err) {
      console.error('Erro ao salvar dados no JSON:', err);
      return res.status(500).send('Erro ao salvar dados.');
    }
  });

  // Salvamento dos dados no CSV
  const csvWriterInstance = createObjectCsvWriter({
    path: csvFilePath,
    header: [
      { id: 'rating', title: 'Rating' },
      { id: 'position', title: 'Position' },
      { id: 'name', title: 'Name' },
      { id: 'skill_moves', title: 'Skill Moves' },
      { id: 'weak_foot', title: 'Weak Foot' },
      { id: 'price', title: 'Price' }
    ],
    append: false // Para criar um novo arquivo e substituir o antigo
  });

  csvWriterInstance.writeRecords(dataChunks)
    .then(() => {
      res.status(200).send('Dados recebidos e salvos com sucesso.');
    })
    .catch(err => {
      console.error('Erro ao salvar dados no CSV:', err);
      res.status(500).send('Erro ao salvar dados.');
    });
});

// Endpoint para cadastrar o evento
app.post('/notify', (req, res) => {
  const formData = req.body;

  // Salva os dados do formulário no arquivo TXT (opcional, caso queira manter histórico)
  fs.appendFile(requestsFilePath, JSON.stringify(formData) + '\n', (err) => {
    if (err) {
      console.error('Erro ao salvar dados no TXT:', err);
      res.status(500).json({ success: false, message: 'Erro ao salvar dados.' });
    } else {
      // Adicionar a requisição à fila
      requestQueue.push(formData);
      saveQueueToFile(requestQueue); // Persistir a fila no arquivo JSON
      res.status(200).json({ success: true, message: 'Dados do formulário recebidos com sucesso e adicionados à fila.' });
    }
  });
});

// Endpoint para obter a lista de jogadores
app.get('/players', (req, res) => {
  fs.readFile(path.join(dataDir, 'dados.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Erro ao ler dados.');
    }

    const playersData = JSON.parse(data);
    const playerNames = Object.keys(playersData);

    res.json(playerNames);
  });
});

// Endpoint para fornecer dados do gráfico de um jogador específico
app.get('/chart-data/:playerName', (req, res) => {
  const playerName = req.params.playerName;

  fs.readFile(path.join(dataDir, 'dados.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Erro ao ler dados.');
    }

    const playersData = JSON.parse(data);

    if (!playersData[playerName]) {
      return res.status(404).send('Jogador não encontrado.');
    }

    const playerData = playersData[playerName];
    console.log(playerData)
    const chartData = playerData.prices.map((price, index) => ({
      price: parsePrice(price),
      time: playerData.receivedAt[index]
    }));

    res.json(chartData);
  });
});

// Endpoint para exibir o dashboard HTML
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard', 'dashboard.html'));
});

// Tarefa cron para executar a cada 10 minutos (teste)
cron.schedule('*/60 * * * *', () => {
  console.log('Executando tarefa de teste a cada 10 minutos');

  // Exemplo de processamento de fila para testes
  requestQueue.forEach((formData, index) => {
    filterPlayers(formData, csvFilePath)
      .then(filteredResults => {
        sendNotification(formData, filteredResults)
        console.log(`Jogadores filtrados para a requisição de teste ${index + 1}:`, filteredResults);
      })
      .catch(err => {
        console.error(`Erro ao filtrar jogadores para a requisição de teste ${index + 1}:`, err);
      });
  });
});

// Endpoint para o formulário
app.get('/form', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'form', 'form.html'));
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
