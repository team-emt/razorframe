# razorframe<sup>(beta)</sup>  
####*Empowering real-time databases in Node.js*
____________________________________________________________________  

###Description  
Razorframe is a Javascript library built on Node.js which enables developers to build a real-time client experience while maintaining traditional database implementations such as SQL.  
  
We use a messaging queue, called a razorframe, that intercepts incoming user interactions over a two-way socket channel.  Those interactions are held in the queue only as long as the server needs before dequeuing.  The dequeuing process then triggers an event that both updates the client UI and launches an asynchronous back-end process such as a database write.  

Our tests have shown this process keeps the client UI updating in sub 100ms "real-time" fashion at scale while maintaining accurate database writes.

###Installation
Using npm:  

```
$ npm i --save razorframe
```

###Example
**server.js:**  

```
const rz = require('razorframe');

/**
 * NEURON parameters - passes into rb any user-defined callbacks
 * @param - {Object} http => instantiate an http server
 * @param - {Function} write => a DB write callback (user-defined)
 * @param - {Function} show => a DB pull callback (user-defined)
 */
const NEURON = {
  write: addToDb,
  show: showAll,
};

/**
 * Instantiate razorframe passing in Node's http object
 * (to connect with your server) as well as the Neuron object
 * which contains all the user-defined callbacks
 */
rz(http, NEURON);
```


**client.html:**  

```
<script src="/socket.io/socket.io.js"></script>
```

**client.js:**  

```
const socket = io();

/**
 * MSG parameters
 * @param {string} MSG.contents => the message value 
 * @param {string} MSG.eventOut => the outbound event name
 * @param {string} MSG.channel => the channel name 
 */
textForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const contents = textInput.value;
    const eventOut = 'msgSent';
    const channel = 'message-channel';
    
    socket.emit('msgSent', { contents, eventOut, channel });
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
