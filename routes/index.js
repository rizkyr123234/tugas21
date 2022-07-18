var express = require('express');
var router = express.Router();
const moment = require('moment')

const {Client}= require('pg')
const client = new Client({
  user: "postgres",
  password: "12345",
  host: "localhost",
  port: "5432",
  database: "tugas21.db"

})

client.connect()

router.get('/', (req,res)=>{
  const url = req.url == '/' ? '/?page=1' : req.url
  const limit = 2
  const page = req.query.page ||1
  const offset = (page-1)*limit
  const wheres = []
    console.log(req.query.date, 'ini tanggal')
    //pencarian 
    if(req.query.id){
        wheres.push(`id = ${req.query.id}`)
       
    }
    if (req.query.nama) {
        wheres.push(`nama like '${req.query.nama}%' `) 
        
    }

    if (req.query.tinggi) {
        wheres.push(` tinggi = ${req.query.tinggi}`)
      
    }

    if (req.query.berat) {
        wheres.push(` berat =${req.query.berat} `)
       
    }

    if (req.query.status && req.query.status !='pilih') {
        const status = req.query.status == 'nikah'? true : false
        wheres.push(` status=${status}`)
        
    }
    if(req.query.date && req.query.date2 ){
        wheres.push(` lahir BETWEEN ${req.query.date} AND ${req.query.date2}`)
  
    }
     else if(req.query.date){
        wheres.push(` lahir >${req.query.date}`)
        

    } else if(req.query.date2){
        wheres.push(` lahir <${req.query.date2}`)
        
    }
  let sql = "select count(*) as total from siswa "
  if(wheres.length>0){
    sql+= ` WHERE ${wheres.join(' and ')}`
  }
   let sqlc = "select * from siswa"
   if(wheres.length>0){
    sqlc+=` WHERE ${wheres.join(' and ')}`
   }
   sqlc+=' LIMIT $1 OFFSET $2'
   
  client.query(sql)
  .then(hasil=>Math.ceil(hasil.rows[0].total/limit))
  .then(pages=>client.query(sqlc, [limit,offset])
  .then(result=> res.render('menu',{hasil:result.rows,moment,pages,page,url
  ,query:req.query})))
  
  
})

router.get('/tambah',(req,res)=>{
  res.render('tambah')
})
router.post('/tambah',(req,res)=>{
  
  if (req.body.status == 'nikah') {
      req.body.status = true
  } else { req.body.status = false }
  let status = req.body.status
  let berat = parseInt(req.body.berat)
  let tinggi = parseInt(req.body.tinggi)
  let date = req.body.date
  let nama = req.body.nama
  client.query(`INSERT INTO siswa
  (nama, berat, tinggi ,lahir,status) values
  ($1, $2, $3,$4,$5)`, [nama, berat, tinggi, date, status], err => {
          if (err) console.error(err.message)
      })
      res.redirect('/')
})
router.get('/delet/:id', (req, res) => {
  const index = parseInt(req.params.id)
  console.log(index)
  client.query(`DELETE from siswa WHERE id =$1 `, [index], err => {
      if (err) console.error(err.message)
  })
  res.redirect('/')
})
router.get('/edit/:id',(req,res)=>{
  client.query("select * from siswa WHERE id = $1",[req.params.id])
  .then(result=>res.render('edit',{item : result.rows[0],moment}))
})

router.post('/edit/:id',(req,res)=>{
  let id = parseInt(req.body.id)
  let nama = req.body.nama
  let tinggi = parseInt(req.body.tinggi)
  let date = req.body.date
  let status = req.body.status
  let berat = parseInt(req.body.berat)
  if (req.body.status == 'menikah') {
      status = true
  } else { status = false }

  client.query(`UPDATE siswa SET
nama = $1, berat = $2, tinggi=$3, lahir = $4, status =$5
WHERE id =${id}`,
      [nama, berat, tinggi, date, status])
  res.redirect('/')

})

module.exports = router;
