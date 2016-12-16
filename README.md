# razorframe
[![npm version](https://badge.fury.io/js/razorframe.svg)](https://badge.fury.io/js/razorframe)

####*Empowering scalable, real-time web apps in Node.js*  

____________________________________________________________________  

###Description  
Razorframe is a Javascript library built on Node.js which enables developers to build a real-time client experience while maintaining scalable, async back-end operations.  

Socket.io powers real-time client updates on the front-end, while Node clusters and event emitters in conjunction with a custom messaging queue process highly concurrent and asynchronous operations on the back-end.
  
We use a messaging queue, called razorframe, that intercepts incoming user interactions over a two-way socket channel.  Those interactions are held in the queue only as long as the server needs before dequeuing.  The dequeuing process then triggers an event that both updates the client UI and launches a back-end process such as a database write.  

Our tests have shown this process keeps the client UI updating in sub 100ms "real-time" fashion at scale while maintaining accurate database writes.

###Installation
Using npm:  

```
$ npm i --save razorframe
```

###Example
**server.js:**  
1) Require razorframe.  
2) Specify rzConfig object to set up server processes by declaring:

* rzConfig.port: port where your server is listening.  
* rzConfig.cluster: true or false depending on whether you want to enable Node clusters.  
* (Even though our config automatically accounts for 1 process if not specified, you'll still get better performance if you turn off Node clusters if you know you won't be using more than one CPU.)  

3) Specify dbConfig object to define your back-end callbacks.  
4) Initialize razorframe while passing in the configurations.

```
const rz = require('razorframe');

/**
 * rzConfig properties - passes into rb any user-defined callbacks
 * @property {number}  port    - add server listener PORT
 * @property {boolean} cluster - define 'true' to enable clustering
*/
const rzConfig = {
  port: process.env.PORT || 3000,
  cluster: true
};

/**
 * dbConfig properties - passes into rz any user-defined database callbacks
 * @property {function} write  - a DB write callback (user-defined)
 * @property {function} show   - a DB read callback (user-defined)
 * @property {function} update - a DB update callback (user-defined)
 * @property {function} delete - a DB delete callback (user-defined)
 */
const dbConfig = {
  write: addToDb,
  show: showAll,
  update: null,
  delete: null,
};

/**
 * Instantiate razorframe passing in Node's http object
 * (to connect with your server) as well as the 2 config objects
 * which contain more server info and user-defined back-end callbacks
 */
 
rz.init(http, rzConfig, dbConfig);
```


**client.html:**  
Import 2 libraries: socket.io and razorframe into your HTML. 

```
<script src="/socket.io/socket.io.js"></script>
<script src="/razorframe.js"></script>
```


**client.js:**  
Contains 2 methods:  
1) .publish  - publishes a data payload to a particular event and specifies a back-end callback  
Specify arguments:

* contents: message data
* function name (as a string): a back-end operation you want to perform as defined in dbConfig.
* event name: name the event you can then subscribe to.  

2) .subscribe - listens for an event coming from the server  
Specify arguments:

* event name: the event you want to listen for.
* callback function: any function you want to call on the payload from the event.

```
rz.subscribe('dbOnLoad', (data) => {
  data.reverse().forEach(item => {
    node = document.createElement('LI');
    textNode = document.createTextNode(JSON.parse(item));
    node.appendChild(textNode);
    chatMsg.appendChild(node);
  });
});

textForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const contents = textInput.value;
  rz.publish(contents, 'write', 'chatMsg')
  textInput.value = '';
});
```
###Platform
[Node.js](https://nodejs.org/)  

###Dependencies
[Socket.io](https://www.npmjs.com/package/socket.io)  


###Authors  
[Travis Huff](huff.travis@gmail.com)  
[Eddie Park](ed.sh.park@gmail.com)  
[Michael Sotkin](Michael.sotkin@gmail.com)

###Support  
Tested in Chrome 55 & Node 6/7.  
GitHub Issues: <https://github.com/team-emt/razorframe/issues>

###Contributions
❤️ Contributions welcome!  
Please see out GitHub repo at: <https://github.com/team-emt/razorframe>

###License  
[MIT](https://github.com/travishuff/razorframe/blob/master/LICENSE)   
