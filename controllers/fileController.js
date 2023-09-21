const dotenv = require('dotenv');
const fs = require('fs');
const ytdl = require('ytdl-core');
const axios = require('axios');

dotenv.config();

// URL of the file to transcribe
const FILE_URL = "https://upcdn.io/W142iEb/raw/uploads/2023/09/17/4mADvc9q7P-BEN22-Telecommuting.mp3";

// Request parameters
const data = {
    audio_url: FILE_URL // You can also use a URL to an audio or video file on the web
};

// HTTP request headers
const headers = {
    "Authorization": process.env.YOUR_API_TOKEN,
    "Content-Type": "application/json"
};

// Submit for transcription via HTTP request
async function submitTranscription() {
    const response = await axios.post(process.env.transcript_endpoint, data, { headers: headers });

    // Start polling for transcription completion
    const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${response.data.id}`;
    pollTranscription(pollingEndpoint);
}

async function exportSubtitles(api_token, transcriptId, format) {
    const exportUrl = `https://api.assemblyai.com/v2/transcript/${transcriptId}/${format}`;

    const exportResponse = await axios.get(exportUrl, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Authorization': api_token,
        }
    });
    fs.writeFile('script.srt', exportResponse.data, function (err) {
        if (err) throw err;
        console.log('File saved!');
    });

    return true;
}
// Polling for transcription completion
async function pollTranscription(pollingEndpoint) {
    while (true) {
        const pollingResponse = await axios.get(pollingEndpoint, { headers: headers });
        const transcriptionResult = pollingResponse.data;

        if (transcriptionResult.status === 'completed') {
            // Print the results
            const subtitles = await exportSubtitles(process.env.YOUR_API_TOKEN, transcriptionResult.id, 'srt');
            console.log('Subtitles:', subtitles);
            break;
        } else if (transcriptionResult.status === 'error') {
            throw new Error(`Transcription failed: ${transcriptionResult.error}`);
        } else {
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
    }
}

async function uploadFromUrl(params) {
    const baseUrl = "https://api.bytescale.com";
    const path = `/v2/accounts/${params.accountId}/uploads/url`;

    const response = await axios.post(`${baseUrl}${path}`, params.requestBody, {
        headers: {
            "Authorization": `Bearer ${params.apiKey}`,
            "Content-Type": "application/json",
        }
    });
    const result = response.data;
    if (response.status !== 200)
        throw new Error(`Bytescale API Error: ${JSON.stringify(result)}`);

    return result;
}

exports.test = async (req, res) => {
    res.status(400).json({ message: 'backend is working well' });
}

exports.uploadYoutube = async (req, res) => {
    const videoUrl = 'https://www.youtube.com/watch?v=G33j5Qi4rE8';
    const outputFilePath = 'file.mp4';
    ytdl(videoUrl)
        .pipe(fs.createWriteStream(outputFilePath))
        .on('finish', () => {

            uploadFromUrl({
                accountId: process.env.accountId,
                apiKey: process.env.apiKey,
                requestBody: {
                    url: "https://rr4---sn-i3b7knse.googlevideo.com/videoplayback?expire=1694895823&ei=b7oFZbWgNp2h7OsPpMyEsAE&ip=166.88.141.98&id=o-AIzZUmfNqNx78lcbiizs913FODM3d5yM6Nh8sQnhYPa7&itag=299&aitags=133%2C134%2C135%2C136%2C160%2C242%2C243%2C244%2C247%2C278%2C298%2C299%2C302%2C303%2C394%2C395%2C396%2C397%2C398%2C399&source=youtube&requiressl=yes&mh=Fs&mm=31%2C29&mn=sn-i3b7knse%2Csn-i3belnlz&ms=au%2Crdu&mv=m&mvi=4&pl=24&initcwndbps=3338750&spc=UWF9f5E98yUGEuvfcpHzhNUXwa4TR8UmAmp7Y3XRzg&vprv=1&svpuc=1&mime=video%2Fmp4&ns=dwSkR5nEe9kxC5Sm7veXaKAP&gir=yes&clen=10159615&dur=366.400&lmt=1608545998353954&mt=1694873887&fvip=1&keepalive=yes&fexp=24007246&c=WEB&txp=5432432&n=ZDWYBty7T5aieQ&sparams=expire%2Cei%2Cip%2Cid%2Caitags%2Csource%2Crequiressl%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Cns%2Cgir%2Cclen%2Cdur%2Clmt&sig=AOq0QJ8wRgIhAKjAHM6gibHRgwjKkOAlm2qsQHd6wuzAJunFyifB65nkAiEAzKD8S-XJukiA-lAS-U3nHp2fp9R2PhyC28z2RK4D1I4%3D&lsparams=mh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Cinitcwndbps&lsig=AG3C_xAwRQIhAJCj3mWFG8tG6T1E1iXm0HFVUi4vraxwpMYu3ILHKEdPAiAzg4vUez358phNSrBUmslz3OCNlvwEKQm7YmKaAmHuKw%3D%3D"
                }
            })
                .then(response => {
                    console.log(`Success: ${JSON.stringify(response)}`);
                    res.status(400).json({ message: 'success', fileURL: response.fileUrl });
                })
                .catch(error => console.error(error));
            console.log('Video downloaded successfully!');
        })
        .on('error', (error) => {
            resolveSoa.status(403).json({ message: error })
            console.error('Error:', error);
        });
}

exports.generateSRT = async (req, res) => {
    submitTranscription().catch((err) => console.error('Error:', err));
}