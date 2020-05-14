const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();

const port = 6789;

app.use(cookieParser());

app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: true }));

app.set('view engine', 'ejs');

app.use(expressLayouts);

app.use(express.static('public'))

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

var tabel = 0;
var sess = 0;

app.use(function(req, res, next){

  res.locals.user = req.session.uname;
  next();

});

app.get('/', (req, res) => {
  sess = req.session.uname;

  if(tabel == 1)
  {
    conn.query("SELECT * FROM produse", function (err, result, fields) {
      if (err) throw err;

      res.render('index', { uname: sess, produse: result });

    });
  } else {
    res.render('index', { uname: sess, produse: "" });
  }

});

'use strict';

const fs = require('fs');

app.get('/chestionar', (req, res) => {

  sess = req.session.uname;

  fs.readFile('intrebari.json', (err, data) => {
    if (err) throw err;
    var listaIntrebari = JSON.parse(data);

    res.render('chestionar', { intrebari: listaIntrebari, uname: sess });

  });
});

var raspCorecte = [];

app.post('/rezultat-chestionar', (req, res) => {

  fs.readFile('intrebari.json', (err, data) => {
    if (err) throw err;
    var listaIntrebari = JSON.parse(data);
    var nrRasp = 0;

    for (let i in req.body) {

      if (req.body[i] == listaIntrebari[parseInt(i.substring(1))].corect) {
        raspCorecte[nrRasp] = parseInt(i.substring(1)) + 1;
        nrRasp++;
      }

    }
    res.render('rezultat-chestionar', { intrebariCorecte: raspCorecte });
  });

});

// Lab 11

app.get('/autentificare', (req, res) => {
  sess = req.session.uname;

  if (sess) {
    res.redirect('/');
  }
  else {
    mesaj = req.cookies.mesajEroare;
    res.render('autentificare', { mesaj: mesaj });
  }

});

app.post('/verificare-autentificare', (req, res) => {

  var flag = 0;

  fs.readFile('utilizatori.json', (err, data) => {
    if (err) throw err;

    var listaUseri = JSON.parse(data);

    for (var i in listaUseri) {
      if (req.body['uname'] == listaUseri[i].utilizator) {
        if (req.body['pss'] == listaUseri[i].parola) {
          res.cookie("utilizator", req.body['uname']);

          sess = req.session;
          sess.cart = [];
          sess.uname = listaUseri[i].nume + " " + listaUseri[i].prenume;

          flag = 1;
        } else {
          flag = 2;
        }
      } else {
        if (flag != 1 && flag != 2) {
          flag = 0;
        }
      }
    }

    if (flag == 1) {

      res.clearCookie("mesajEroare");
      res.redirect('/');
    } else {
      if (flag == 2) {
        res.cookie("mesajEroare", "Credentiale gresite");
        res.redirect('/autentificare');
      } else if (flag == 0) {
        res.cookie("mesajEroare", "Utilizatorul nu a fost gasit");
        res.redirect('/autentificare');
      }
    }

  });

});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('/');
  });

});

// Lab 12

var mysql = require('mysql'); // ce require once avem i nodejs ???

app.get('/creare-bd', (req, res) => {

  let c = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "parolaaaaaa" // parola modificataa
  });

  c.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");

    c.query("CREATE DATABASE cumparaturi", function (err, result) {
      if (err) throw err;
      console.log("Database created");
      var flag = 1;

      var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "parolaaaaaa", // parola modificataa
        database: "cumparaturi"
      });

      con.connect(function (err) {
        if (err) throw err;
        console.log("Connected!");
        var sql = "CREATE TABLE produse (id INT AUTO_INCREMENT PRIMARY KEY, nume VARCHAR(255) NOT NULL, cantitate INT NOT NULL)";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("Table created");
        });
      });

    });
  });

  res.redirect('/');
});

var conn = mysql.createConnection({ // conexiune globala..
  host: "localhost",
  user: "root",
  password: "parolaaaaaa", // parola modificataa
  database: "cumparaturi"
});

if(conn)
{
  tabel = 1;
}

app.get('/inserare-bd', (req, res) => {

  conn.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");

    var sql = "INSERT INTO produse (nume, cantitate) VALUES ?";

    fs.readFile('produse.json', (err, data) => {
      if (err) throw err;
      var values_json = JSON.parse(data);

      var values = [];

      for(var i in values_json)
      {
        values.push([values_json[i]['produs'], values_json[i]['cantitate']]);
      }

      conn.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("Number of records inserted: " + result.affectedRows);
      });
    });
  });

});

var flagSess = 0;

app.get('/adaugare_cos', (req, res) => {

  if (flagSess == 1) {
    // req.session.cart.forEach(item => {
    //   console.log(item);
    //   if(item._id == req.query.id) {
    //     console.log("11");
    //     item.quantity++;
    //   } else {
    //     let newElem = {};
    //     newElem._id = req.query.id;
    //     newElem.quantity = 0;
    //     req.session.cart.push(newElem);
    //     console.log("22");
    //   }
    // });

    var checkIfId = 0;

    for (i in req.session.cart) {
      if (req.session.cart[i]['_id'] == req.query.id)  // verific daca exista id-ul deja in shopping cart
      {
        checkIfId = 1;
      }
    }

    if (checkIfId == 1) {
      for (i in req.session.cart) {
        if (req.session.cart[i]['_id'] == req.query.id) {
          req.session.cart[i]['quantity']++;
        }
      }
    } else {
      let newElem = {};
      newElem._id = req.query.id;
      newElem.quantity = 1;
      req.session.cart.push(newElem);
    }

  } else {
    flagSess = 1;
    req.session.cart._id = 0;
    req.session.cart.quantity = 0;
  }

  res.redirect('/');
});

app.get('/vizualizare-cos', (req, res) => {

  sess = req.session.cart;

  fs.readFile('produse.json', (err, data) => {
    if (err) throw err;
    var values_json = JSON.parse(data);

    res.render('vizualizare-cos', { shoppingCart: sess, produse:values_json });

  });

});

app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`));
