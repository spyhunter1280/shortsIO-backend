const dotenv = require('dotenv');
const fs = require('fs');
const ytdl = require('ytdl-core');
const axios = require('axios');
const path = require('path');
const FormData = require('form-data');
const Video = require('../models/Video');
const videoAPI = require('../utils');
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
    console.log(exportResponse.data);
    return exportResponse.data
    // fs.writeFile(`upload/${fileName}.srt`, exportResponse.data, function (err) {
    //     if (err) console.log(err)
    //     formDataUpload({
    //         accountId: process.env.accountId,
    //         apiKey: process.env.apiKey,
    //         filePath: `uploads/${fileName}.srt`,
    //         originalFileName: `${fileName}.srt`,
    //     }).then(
    //         response => {
    //             console.log(`Success: ${JSON.stringify(response)}`);
    //             res.status(200).json({ message: 'success', fileURL: response['files'][0]['fileUrl'] });
    //         },
    //         error => console.error(error)
    //     );
    // });
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
    try {
        const youtubeVideoUrl = req.headers.youtubelink;
        console.log('working', youtubeVideoUrl)

        const info = await ytdl.getInfo(youtubeVideoUrl);
        // console.log('info: ', info)
        const videoFormat = ytdl.chooseFormat(info.formats, { quality: 18 });
        const videoTitle = info.videoDetails.title.replace(/[^\w\s]/gi, ''); // Remove special characters from the title
        // console.log('videoFormat: ', videoFormat)
        console.log('videotitle', videoTitle)
        ytdl(youtubeVideoUrl, { format: videoFormat })
            .pipe(fs.createWriteStream(`home/ubuntu/shortsIO-backend/uploads/${videoTitle}.mp4`))
            .on('finish', () => {
                // res.send(`${videoTitle}.mp4`);
                formDataUpload({
                    accountId: process.env.accountId,
                    apiKey: process.env.apiKey,
                    filePath: `home/ubuntu/shortsIO-backend/uploads/${videoTitle}.mp4`,
                    originalFileName: `${videoTitle}.mp4`,
                }).then(
                    response => {
                        console.log(`Success: ${JSON.stringify(response)}`);
                        const fileURL = response['files'][0]['fileUrl'];
                        console.log('url', fileURL)
                        res.status(200).json({ message: 'success', fileURL: fileURL });
                    },
                    error => console.error(error)
                );
                console.log('Video downloaded successfully!');
            })
            .on('error', (error) => {
                res.status(500).send('Error downloading youtube video video:', error);
            });

        // ytdl(videoFormat.url).pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while downloading the YouTube video.');
    }
}

exports.generateSRT = async (req, res) => {
    try {
        const fileURL = req.headers.fileurl;
        const fileName = path.basename(fileURL);
        console.log(fileName)
        const data = { audio_url: fileURL };
        const response = await axios.post(process.env.transcript_endpoint, data, { headers: headers });
        // Start polling for transcription completion
        const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${response.data.id}`;
        console.log(pollingEndpoint)
        const allcaptions = await pollTranscription(pollingEndpoint, fileName);
        //get timeframe and subcaptions(emojis)
        // get start_time, end_time, newCaption
        console.log('here', allcaptions)
        let start_time = 10;
        let end_time = 40;
        await videoAPI.videoTrim({
            inputUrl: fileURL, startTime: start_time, endTime: end_time, outputFile: fileName
        });
        formDataUpload({
            accountId: process.env.accountId,
            apiKey: process.env.apiKey,
            filePath: `home/ubuntu/shortsIO-backend/uploads/${fileName}`,
            originalFileName: `${fileName}`,
        }).then(
            async (response) => {
                console.log(`Success: ${JSON.stringify(response)}`);
                const newfileURL = response['files'][0]['fileUrl'];
                const video = new Video({
                    originURL: fileURL,
                    originCaption: allcaptions,
                    modifiedURL: newfileURL,
                    modifiedCaption: allcaptions,
                    start_time: start_time,
                    end_time: end_time
                    // modifiedURL: newfileURL,
                    // modifiedCaption: newCaption,
                    // start_time: start_time,
                    // end_time: end_time
                });
                await video.save();
                console.log(video);
                res.status(200).json({ message: 'success', data: video });
            },
            error => console.error(error)
        );
    } catch (error) {
        res.status(403).send({ message: 'error' });
        console.log(error);
    }
}

exports.cropVideo = async (req, res) => {
    const { videolink, width, height, x, y } = req.headers;
    await videoAPI.videoCrop({
        inputUrl: videolink,
        width: width,
        height: height,
        x: x,
        y: y,
        outputFile: 'output.mp4'
    });
    formDataUpload({
        accountId: process.env.accountId,
        apiKey: process.env.apiKey,
        filePath: `home/ubuntu/shortsIO-backend/uploads/output.mp4`,
        originalFileName: `output.mp4`,
    }).then(
        async (response) => {
            let video = await Video.findOne({ modifiedURL: videolink });
            console.log(`Success: ${JSON.stringify(response)}`);
            const fileURL = response['files'][0]['fileUrl'];
            video.modifiedURL = fileURL;
            video.width = width;
            video.height = height;
            video.x = x;
            video.y = y;
            console.log(video)
            await video.save();
            res.status(200).json({ message: 'success', data: video });
        },
        error => console.error(error)
    );
}
