import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';
import serverless from 'serverless-http';

dotenv.config(); 

const supabaseurl = process.env.DB_URL;
const supabasekey = process.env.DB_APIKEY;
const supabase = createClient(supabaseurl, supabasekey);


const app = express();
app.use(cors());

app.use(express.json());

const storage = multer.memoryStorage();
const FileFilter=(req,res,cb)=>{
  if(req.file.mimetype ==="text/markdown" || req.file.mimetype === "text/md" || req.file.mimetype==="plain/tex"){
    cb(null,true)
  }
  else{
    cb(new Error("Only md files are allowed"),false)
  }
}
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.send('Hello World! This is the backend server for MD Blogs.');
});
app.post('/upload', upload.single('file'), async (req, res) => {
  try{
    if(!req.file){
      return res.status(400).json({message:"No file uploaded"})
    }
    const file=req.file;
    const content=file.buffer.toString("utf-8")
    const {data,error}=await supabase
    .from("Blogs").insert([{name:file.originalname,mimetype:file.mimetype,content:content}]).select()

    if(error) throw error;
    res.json({message:"Md File saved",file:data[0]})}catch(err){
    console.error("Upload error:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
  }
);

app.get('/blogs/all', async(req,res)=>{
  try{
    const {data,error}= await supabase.from("Blogs").select("*")
    if(error) throw error;
    res.json({files:data})
  }catch(err){
    console.log("Error:",err)
    res.status(500).json({error:"Failed to fetch files"
  })}
})
app.get('/blogs/names', async(req,res)=>{
  try{
    const {data,error}=await supabase.from("Blogs").select("id,name")
    if (error) throw error;
    res.json({data:data})
  }catch(err){
    console.log("Error:",err)
    res.status(500).json({error:"failed to fetch names"})
  }
  }
)

app.get('/blogs/:id',async(req,res)=>{
  try{
    const id=req.params.id;
    const {data,error}= await supabase.from("Blogs").select("*").eq("id",id).single()
    if(error) throw error;
    res.json({file:data})
  }catch(err){
    console.log("Error:",err)
    res.status(500).json({error:"Failed to fetch file"})
  }
  })

app.delete('/blogs/:id',async (req,res)=>{
  try{
    const id=req.params.id;
    const {data,error}=await supabase.from("Blogs").delete().eq("id",id).select()
    if(error) throw error;
    res.json({message:"File Deleted",file:data[0]})
  }catch(err){
    console.log({"Error":err})
    res.status(500).json({error:"Failed to delete file"})
  }
})

export const handler = serverless(app);
