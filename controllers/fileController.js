const dotenv = require('dotenv');
const fs = require('fs');
const ytdl = require('ytdl-core');
const axios = require('axios');
const path = require('path');

dotenv.config();
// HTTP request headers
const headers = {
    "Authorization": process.env.YOUR_API_TOKEN,
    "Content-Type": "application/json"
};

async function exportSubtitles(api_token, transcriptId, format, fileName) {
    const exportUrl = `https://api.assemblyai.com/v2/transcript/${transcriptId}/${format}`;

    const exportResponse = await axios.get(exportUrl, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Authorization': api_token,
        }
    });
    fs.writeFile(`upload/${fileName}.srt`, exportResponse.data, function (err) {
        if (err) throw err;
        formDataUpload({
            accountId: process.env.accountId,
            apiKey: process.env.apiKey,
            filePath: `/home/ubuntu/shortsIO-backend/upload/${fileName}.srt`,
            originalFileName: `${fileName}.srt`,
        }).then(
            response => {
                console.log(`Success: ${JSON.stringify(response)}`);
                res.status(400).json({ message: 'success', fileURL: response.fileUrl });
            },
            error => console.error(error)
        );
    });
}
// Polling for transcription completion
async function pollTranscription(pollingEndpoint, fileName) {
    while (true) {
        const pollingResponse = await axios.get(pollingEndpoint, { headers: headers });
        const transcriptionResult = pollingResponse.data;

        if (transcriptionResult.status === 'completed') {
            // Print the results
            const subtitles = await exportSubtitles(process.env.YOUR_API_TOKEN, transcriptionResult.id, 'srt', fileName);
            console.log('Subtitles:', subtitles);
            return subtitles
            break;
        } else if (transcriptionResult.status === 'error') {
            throw new Error(`Transcription failed: ${transcriptionResult.error}`);
        } else {
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }
}

async function formDataUpload(params) {
    const baseUrl = 'https://api.bytescale.com';
    const path = `/v2/accounts/${params.accountId}/uploads/form_data`;
    const entries = obj =>
        Object.entries(obj).filter(([, val]) => val !== null && val !== undefined);
    const query = entries(params.querystring ?? {})
        .flatMap(([k, v]) => (Array.isArray(v) ? v.map(v2 => [k, v2]) : [[k, v]]))
        .map(kv => kv.join('='))
        .join('&');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(params.filePath), params.originalFileName);
    const response = await axios.post(`${baseUrl}${path}${query.length > 0 ? '?' : ''}${query}`, formData, {
        headers: {
            Authorization: `Bearer ${params.apiKey}`,
            'X-Upload-Metadata': JSON.stringify(params.metadata),
            ...formData.getHeaders(),
        },
    });
    const result = response.data;
    if (Math.floor(response.status / 100) !== 2)
        throw new Error(`Bytescale API Error: ${JSON.stringify(result)}`);
    return result;
}

exports.uploadYoutube = async (req, res) => {
    const videoUrl = 'https://www.youtube.com/watch?v=G33j5Qi4rE8';
    const videoId = url.parse(youtubeUrl, true).query.v;
    ytdl(videoUrl)
        .pipe(fs.createWriteStream(`upload/${videoId}.mp4`))
        .on('finish', () => {
            formDataUpload({
                accountId: process.env.accountId,
                apiKey: process.env.apiKey,
                filePath: `/home/ubuntu/shortsIO-backend/${videoId}.mp4`,
                originalFileName: `${videoId}.mp4`,
            }).then(
                response => {
                    console.log(`Success: ${JSON.stringify(response)}`);
                    res.status(400).json({ message: 'success', fileURL: response.fileUrl });
                },
                error => console.error(error)
            );
        })
        .on('error', (error) => {
            resolveSoa.status(403).json({ message: error })
            console.error('Error:', error);
        });
}

exports.generateSRT = async (req, res) => {
    try {
        const fileURL = req.fileURL;
        const fileName = path.basename(fileURL);
        const data = { audio_url: fileURL };
        const response = await axios.post(process.env.transcript_endpoint, data, { headers: headers });
        // Start polling for transcription completion
        const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${response.data.id}`;
        const result = pollTranscription(pollingEndpoint, fileName);
        res.status(400).send({ message: result });
    } catch (error) {
        res.status(403).send({ message: 'error' });
        console.log(error);
    }
}