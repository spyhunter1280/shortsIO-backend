const dotenv = require("dotenv");
const axios = require('axios');
const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
// Tell fluent-ffmpeg where it can find FFmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);
dotenv.config();

exports.generateImpressiveTimeframe = async (input) => {
    try {
        const stressToken = process.env.openAI;

        const client = axios.create({
            baseURL: "https://api.openai.com/v1",
            headers: {
                'Authorization': `Bearer ${stressToken}`,
                'Content-Type': 'application/json'
            }
        });

        const prompt = `I am going to detect the best impressive timeframe about 1 min from captions of video
      generate the about 1 min timeframe and generate suitable emoji about each sentence  
      """
      ${input}
  
      """`;

        const params = {
            prompt: prompt,
            model: "gpt-4-0314",
            max_tokens: 300,
            temperature: 0,
            n: 1
        };

        const response = await client.post("/completions", params);

        if (response.status === 200) {
            const text = response.data.choices[0].text;
            console.log(text);
            return text;
        } else {
            throw new Error("API request failed");
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};

exports.videoTrim = async ({ inputUrl, startTime, endTime, outputFile }) => {
    console.log(inputUrl, startTime, endTime, outputFile)
    return new Promise((resolve, reject) => {
        ffmpeg(inputUrl)
            .setStartTime(startTime)
            .setDuration(endTime - startTime)
            .output(`uploads/${outputFile}`)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run();
    });
}

exports.videoCrop = async ({ inputUrl, width, height, x, y, outputFile }) => {
    console.log(inputUrl, width, height, x, y, outputFile)
    return new Promise((resolve, reject) => {
        ffmpeg(inputUrl)
            .outputOptions(
                '-vf', `crop=${width}:${height}:${x}:${y}`
            )
            .output(`uploads/${outputFile}`)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run();
    });
}