import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import { config } from '../config/config.js';

export async function downloadVideo(url, format = 'mp4') {
  try {
    const videoInfo = await ytdl.getInfo(url);
    const videoTitle = videoInfo.videoDetails.title.replace(/[^\w\s]/gi, '');
    const fileName = `${videoTitle}.${format}`;
    const filePath = path.join(config.downloadPath, fileName);

    // Create downloads directory if it doesn't exist
    if (!fs.existsSync(config.downloadPath)) {
      fs.mkdirSync(config.downloadPath, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      ytdl(url, {
        format: format === 'mp3' ? 'audioonly' : 'mp4'
      })
        .pipe(fs.createWriteStream(filePath))
        .on('finish', () => resolve(filePath))
        .on('error', reject);
    });
  } catch (error) {
    throw new Error(`Failed to download video: ${error.message}`);
  }
}

export function isValidYoutubeUrl(url) {
  return ytdl.validateURL(url);
}