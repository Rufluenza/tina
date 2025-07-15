// pages/api/send-sms.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    res.status(400).json({ error: 'Phone number and message are required' });
    return;
  }

  const pythonProcess = spawn('python3', ['/script_python/sms_func.py', 'send_sms', phoneNumber, message]); // 

  let data = '';
  let error = '';

  pythonProcess.stdout.on('data', (chunk) => {
    data += chunk.toString();
  });

  pythonProcess.stderr.on('data', (chunk) => {
    error += chunk.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Python script exited with code ${code}`);
      console.error(`stderr: ${error}`);
      res.status(500).json({ error: 'Python script error', details: error });
      return;
    }

    try {
      const result = JSON.parse(data);
      if (result.error) {
        res.status(400).json(result);
      } else {
        res.status(200).json(result);
      }
    } catch (err) {
      console.error('Failed to parse JSON:', err);
      res.status(500).json({ error: 'Failed to parse output from Python script' });
    }
  });
}
