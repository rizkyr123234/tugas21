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
  const limit = 2
  const page = req.query.page ||1
  const offset = (page-1)*limit
  
  
  client.query("select count(*) as total from siswa")
  .then(hasil=>hasil.rows[0].total/limit)
  .then(pages=>client.query("select * from siswa LIMIT $1 OFFSET $2", [limit,offset])
  .then(result=> res.render('menu',{hasil:result.rows,moment,pages,page})))
  // client.query("select * from siswa")
  // .then(result=> res.render('menu',{hasil:result.rows,moment,pages}))
  // console.log(pages,'ini pagesnya')
  
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
