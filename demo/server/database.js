
const pg = require('pg');

const DATABASE_URL = 'postgres://ysixtmqqxwmitu:vIBobC7ToLYTmR9dOo4sK5g7kY@ec2-54-243-249-56.compute-1.amazonaws.com:5432/d88lft38dc62m8'

const db = {};

pg.defaults.ssl = true;
pg.connect(DATABASE_URL, (err, db_) => {
  
  if (err) throw new Error(err);
  console.log('connected to postgres!');

  db_.query(`CREATE TABLE IF NOT EXISTS events
    (
    _id serial primary key,
    string varchar
    )`, (err, result) => {
      if (err) console.log(err);
      else console.log('heyo!');
    })
  
  db.conn = db_;
});

module.exports = db;