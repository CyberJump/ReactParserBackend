import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const supabase = createClient(process.env.DB_URL, process.env.DB_APIKEY);

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });


app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const file = req.file;
    const content = file.buffer.toString("utf-8");

    const { data, error } = await supabase
      .from("Blogs")
      .insert([{ name: file.originalname, mimetype: file.mimetype, content }])
      .select();

    if (error) throw error;
    res.json({ message: "Md File saved", file: data[0] });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// ✅ Other routes
app.get('/blogs/all', async (req, res) => {
  try {
    const { data, error } = await supabase.from("Blogs").select("*");
    if (error) throw error;
    res.json({ files: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

app.get('/blogs/names', async (req, res) => {
  try {
    const { data, error } = await supabase.from("Blogs").select("id,name");
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch names" });
  }
});

app.get('/blogs/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from("Blogs").select("*").eq("id", req.params.id).single();
    if (error) throw error;
    res.json({ file: data });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch file" });
  }
});

app.delete('/blogs/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from("Blogs").delete().eq("id", req.params.id).select();
    if (error) throw error;
    res.json({ message: "File Deleted", file: data[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete file" });
  }
});


export default app;

