const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const multer = require('multer')
const path = require('path')
const mschema = require('./schema/schema')
const session = require('express-session')

const app = express();

const mdb = 'mongodb+srv://chatgpt230:123456sS@ramdatabase1.x85e3.mongodb.net/?retryWrites=true&w=majority&appName=Ramdatabase1'
mongoose.connect(mdb)
    .then(result =>{
        app.listen(3001 ,() =>{
            console.log('server port runnig on 3001')
        })
    })

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
app.set('view engine' , 'ejs')
app.use(morgan('dev'))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
    secret: 'your-secret-key', 
    resave: false,
    saveUninitialized: true
}));

const storage = multer.diskStorage({
    destination:(req,file,cb) =>{
        cb(null,'uploads')
    },
    filename:(req,file,cb) =>{
        cb(null,Date.now() + path.extname(file.originalname))
    }
})

const uploads = multer({storage:storage})

app.get('/',(req,res) => {
    res.redirect('/all-mschema')
})

app.get('/create',(req,res) =>{
    res.render('create')
})

app.get('/all-mschema' , (req,res) => {
    mschema.find()
     .then((result) =>{
        res.render('index',{contacts : result})
     })
     .catch(err =>{
        console.log(err)
     })
})

app.post('/all-mschema' , uploads.single('image'),(req,res) =>{
    const {title , snippet , body } = req.body;
    const imagepath = req.file ? req.file.path : null ;

    const mcontacts = new mschema({
        title,
        snippet,
        body,
        image : imagepath
    })

    mcontacts.save()
    .then(result => {
        console.log(result)
        res.redirect('/all-mschema')
    })
    .catch(err => {
        console.log(err)
    })
})

app.get('/all-mschema/:id', (req, res) => {
    const id = req.params.id;
    mschema.findById(id)
      .then(result => {
        res.render('contact-details', { contact: result });
      })
      
  });
  
app.delete('/all-mschema/:id', (req, res) => {
    const id = req.params.id;

    mschema.findById(id)
        .then(result => {
            console.log('delete item is here:' , result)
            req.session.deletedContact = result
            res.redirect('/backup')
        })

        mschema.findByIdAndDelete(id)
            .then(result => {
                //res.json({ redirect: '/all-mschema' });
                console.log('item succesfully deleted')
                
            })
})

 app.get('/backup', (req, res) => {
     const deletedContact = req.session.deletedContact;
     res.render('backup', { contact: deletedContact});
});

 app.use((req,res)=>{
     res.render('error')
 })