require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns')
const urlparser = require('url')
const mongoose = require('mongoose');
const { url } = require('inspector');
const { resolve } = require('path');
const { rejects } = require('assert');

//Database comunication 
mongoose.connect(process.env.CONECTION, { useNewUrlParser: true })
 const urlSchema = new mongoose.Schema({
   original_url: {type: String, require: true},
   short_url: {type: String}  
 })
 const urlModel = mongoose.model('urlModel', urlSchema)


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url
  const dnslookup = dns.lookup(urlparser.parse(url).hostname, async (err, address) => {
    if (!address){
      res.json({error: "Invalid URL"})
    } else {
      busqueda(url).then((datos)=>{if(datos == null){
        crearDato(url).then((datos)=>{
          res.json({original_url: datos.original_url,
            short_url: datos.short_url
    })
          console.log(datos)
        })
      }else{res.json({original_url: datos.original_url,
        short_url: datos.short_url
})}
        
      })
    }
  })
});

async function busqueda (string){
 return await urlModel.findOne({original_url: string})
}

async function crearDato(string){
  return await new urlModel({original_url: string , 
                short_url: Math.random()
  }).save()
}

app.get("/api/shorturl/:short_url",(req, res) => {
  const shorturl = req.params.short_url
  busquedaCorta(shorturl).then((datos)=>{
    if(datos == null){
      res.json({messege: 'short url invalid'})
    }
    else{res.redirect(datos.original_url)}
  })


  
 
})

async function busquedaCorta(string){
  return await urlModel.findOne({ short_url: string })
}



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
