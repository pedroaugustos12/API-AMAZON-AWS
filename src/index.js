require('dotenv').config();
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

const app = express();

// Configuração do cliente S3
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Configuração do multer para armazenar arquivos em memória
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Rota para upload de arquivo
app.post('/file', upload.single('imagem'), async (req, res) => {
    try {
        const fileContent = req.file.buffer;
        const fileExtension = path.extname(req.file.originalname);
        const fileName = uuidv4() + fileExtension;

        const uploadParams = {
            Bucket: 'tutorial-api-amazon',
            Key: fileName,
            Body: fileContent,
            ContentType: req.file.mimetype,
        };

        const upload = new Upload({
            client: s3,
            params: uploadParams,
        });

        await upload.done();
        res.send('Upload realizado com sucesso!');
    } catch (error) {
        console.error("Erro ao fazer upload:", error);
        res.status(500).send('Erro ao fazer upload do arquivo');
    }
});

app.listen(3333, () => {
    console.log('Servidor rodando na porta 3333');
});
