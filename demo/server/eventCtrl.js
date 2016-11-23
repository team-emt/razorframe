const db = require('./database');

module.exports = {

  addToDb: (text) => {
    console.log('req.body.text : ', text);

    db.conn.query(`
    INSERT INTO events 
    (_id, string )
    VALUES 
    (default, '${text}')
    `, (err, result) => {
        if (err) throw new Error(err);
        console.log('row added.');
      });
  },

  showAll: () => {
    let result = [];
    let query = db.conn.query(`SELECT string FROM events`);
    query
      .on('row', (row) => {
        // row = { string : ~text string~ }
        result.push(row.string);
      })
      .on('end', () => {
        console.log(result);
        console.log('completed query push!');  
        return result;
      });
  }

}