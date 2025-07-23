import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const pythonProcess = spawn('python3', ['/script_python/sms_func.py', 'fetch_sms']);

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
