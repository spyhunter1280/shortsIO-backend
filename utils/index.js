const dotenv = require("dotenv");
const axios = require('axios');
const ffmpeg = require('ffmpeg');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

dotenv.config();

exports.generateImpressiveTimeframe = async (input) => {
    try {
        return input;
        //     const stressToken = process.env.openAI;

        //     const client = axios.create({
        //         baseURL: "https://api.openai.com/v1",
        //         headers: {
        //             'Authorization': `Bearer ${stressToken}`,
        //             'Content-Type': 'application/json'
        //         }
        //     });

        //     const prompt = `I am going to detect the best impressive timeframe about 1 min from captions of video
        //   generate the about 1 min timeframe and generate suitable emoji about each sentence  
        //   """
        //   ${input}

        //   """`;

        //     const params = {
        //         prompt: prompt,
        //         model: "gpt-4-0314",
        //         max_tokens: 300,
        //         temperature: 0,
        //         n: 1
        //     };

        //     const response = await client.post("/completions", params);

        //     if (response.status === 200) {
        //         const text = response.data.choices[0].text;
        //         console.log(text);
        //         return text;
        //     } else {
        //         throw new Error("API request failed");
        //     }
    } catch (error) {
        console.error(error);
        return null;
    }
};

exports.videoTrim = async ({ inputUrl, startTime, endTime, outputFile }) => {
    try {
        console.log(inputUrl, startTime, endTime, outputFile)
        let { stdout, stderr } = await exec(`ffmpeg -i "${inputUrl}" -ss 00:00:10 -t 00:01:00 -c:v copy -c:a copy /home/ubuntu/shortsIO-backend/uploads/${outputFile}`);
        // Log results or handle them accordingly 
        console.log('stdout:', stdout);
        console.error('stderr:', stderr);
    } catch (error) {
        console.error('Error executing FFMPEG:', error);
    }


    // console.log(inputUrl, startTime, endTime, outputFile)
    // inputUrl = "/home/ubuntu/shortsIO-backend/home/ubuntu/shortsIO-backend/uploads/COMO VOC PODE DOMINAR DE VEZ O MARKETING DIGITAL Ruyter Poubel.mp4"
    // return new Promise((resolve, reject) => {
    //     ffmpeg(inputUrl)
    //         .setStartTime(startTime)
    //         .setDuration(endTime - startTime)
    //         .output(`/home/ubuntu/shortsIO-backend/home/ubuntu/shortsIO-backend/uploads/${outputFile}`)
    //         .on('end', () => resolve())
    //         .on('error', (err) => reject(err))
    //         .run();
    // });
}

exports.videoCrop = async ({ inputUrl, width, height, x, y, outputFile }) => {
    console.log(inputUrl, width, height, x, y, outputFile)
    try {
        let { stdout, stderr } = await exec(`ffmpeg -i "${inputUrl}" -vf "crop=${width}:${height}:${x}:${y}" /home/ubuntu/shortsIO-backend/uploads/${outputFile}`);

        // Log results or handle them accordingly 
        console.log('stdout:', stdout);
        console.error('stderr:', stderr);
    } catch (error) {
        console.error('Error executing FFMPEG:', error);
    }
    // return new Promise((resolve, reject) => {
    //     ffmpeg(inputUrl)
    //         .outputOptions(
    //             '-vf', `crop=${width}:${height}:${x}:${y}`
    //         )
    //         .output(`/home/ubuntu/shortsIO-backend/home/ubuntu/shortsIO-backend/uploads/${outputFile}`)
    //         .on('end', () => resolve())
    //         .on('error', (err) => reject(err))
    //         .run();
    // });
}