import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `MONGO_URI=mongodb+srv://keshavyadav1022006:Un4kYigWK7l2ttsF@cluster10.nnglkfm.mongodb.net/zippty
JWT_SECRET=your_jwt_secret_key
PORT=7070
RAZORPAY_KEY_ID=rzp_test_iVetw1LEDRlYMN
RAZORPAY_KEY_SECRET=NYafLuarQ3Z7QtGOjyaRePav
CLOUDINARY_CLOUD_NAME=dwd4t4ecw
CLOUDINARY_API_KEY=266877444492654
CLOUDINARY_API_SECRET=1y1xytSNNzjWZSBa1iF7D6f9dM8`;

const envPath = path.join(__dirname, '.env');

try {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('.env file created successfully');
  
  // Test reading the file
  const readContent = fs.readFileSync(envPath, 'utf8');
  console.log('File content:');
  console.log(readContent);
  
  // Test dotenv
  import dotenv from 'dotenv';
  const result = dotenv.config({ path: envPath });
  console.log('dotenv result:', result);
  console.log('MONGO_URI:', process.env.MONGO_URI);
  
} catch (error) {
  console.error('Error:', error);
}
