#razorframe  
**Version**  
[![npm version](https://badge.fury.io/js/razorframe.svg)](https://badge.fury.io/js/razorframe) 
![Build Status](https://travis-ci.org/team-emt/razorframe.svg?branch=master) 
  
###*Empowering scalable, real-time web apps in Node.js*  

###Visit us at: [http://www.razorfra.me](http://www.razorfra.me)  
<p align="center">
  <img src="https://raw.githubusercontent.com/travishuff/razorframe/master/rz-logo.png" />
</p> 

##Table of Contents:  
1. [Description](#description)  
2. [Installation](#installation)  
3. Usage: [Server-Side Module](#server)  
4. Usage:	[Client-Side module](#client)  
5. [Demo App](#demo)  
6. [Platform Support](#platform)  
7. [Dependencies](#dependencies)  
8. [Authors](#authors)  
9. [Feedback](#feedback)  
10. [Support](#support)  
11. [Contributions](#contributions)  
12. [License](#license)  

##<a name="description"></a>Description  
Razorframe is a Javascript library built on Node.js which enables developers to build a real-time client experience while maintaining scalable, async back-end operations.  

Socket.io powers real-time client updates on the front-end, while Node clusters and event emitters in conjunction with a custom messaging queue process highly concurrent and asynchronous operations on the back-end.
  
We use a messaging queue, called razorframe, that intercepts incoming user interactions over a two-way socket channel.  Those interactions are held in the queue only as long as the server needs before dequeuing.  The dequeuing process then triggers an event that both updates the client UI and launches a back-end process such as a database write.  

Our tests have shown this process keeps the client UI updating in sub 100ms "real-time" fashion at scale while maintaining accurate database writes.

##<a name="installation"></a>Installation
**Using npm:**  

```javascript
$ npm i --save razorframe
```

##How to Use

###Hosted Redis server:  
We have removed the hosted Redis server originally provided during initial rollout.  In order to leverage concurrency with razorframe and ensure server -> client communication, be sure to instantiate a local or hosted Redis server for your application.  

You can store your Redis reference in an environment variable, or fall back to a locally hosted instance (see below):

```javascript
const REDIS_URL = process.env.REDIS_URL || { host: 'localhost', port: 6379 }
```


###<a name="server"></a>Server-side module:  

**(1) Require razorframe**  
**(2) Specify ```rzConfig``` object to set up server processes by declaring:**

* `rzConfig.port`: port where your server is listening.  
* `rzConfig.cluster`: true or false depending on whether you want to enable Node clusters.  
(Even though our config automatically accounts for 1 process if not specified, you'll still get better performance if you turn off Node clusters if you know you won't be using more than one CPU.)  

**(3) Specify ```dbConfig``` object to define your back-end callbacks** 

* `dbConfig.write`: 'create' function for database. 
* `dbConfig.show`: 'read' function for database.  
* `dbConfig.update`: 'update' function for database.  
* `dbConfig.delete`: 'delete' function for databse.   
 
**(4) Initialize razorframe while passing in http (for your server) and the configurations**

```javascript
const rz = require('razorframe');

const rzConfig = {
  port: process.env.PORT || 3000,
  cluster: true
};

const dbConfig = {
  write: addToDb,
  show: showAll,
  update: null,
  delete: null,
};
 
rz.init(http, rzConfig, dbConfig);
```


###<a name="client"></a>Client-side module: 
**HTML**   
Import 2 libraries: socket.io and razorframe into your HTML.  
Grab the client-side import file from our website [razorfra.me](http://www.razorfra.me) or use the hosted link below:

```html
<script src="/socket.io/socket.io.js"></script>
<script src="http://parkedwards.github.io/parkedwards.github.io/razorframe.js"></script>
```

**Javascript**  
Contains 2 methods:  
1) `rz.publish`  - publishes a data payload to a particular event and specifies a back-end callback  
Specify arguments:

* **contents:** message data
* **function name (as a string):** a back-end operation you want to perform as defined in dbConfig.
* **event name:** name the event you can then subscribe to. 
 
```javascript
textForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const contents = textInput.value;
  rz.publish(contents, 'write', 'chatMsg')
  textInput.value = '';
});
```

2) `rz.subscribe` - listens for an event coming from the server  
Specify arguments:

* **event name:** the event you want to listen for.
* **callback function:** any function you want to call on the payload from the event.

```javascript
rz.subscribe('dbOnLoad', (data) => {
  data.reverse().forEach(item => {
    node = document.createElement('LI');
    textNode = document.createTextNode(JSON.parse(item));
    node.appendChild(textNode);
    chatMsg.appendChild(node);
  });
});
```
**Error Handling:**  
Razorframe enables error handling on the back-end if your database fails to query.  
Within the error callback on your database controller, use the method:  

```javascript
if (err) rz.onError(MSG, 2);
```  
where 'MSG' is the task being sent to the database and the second argument, in this case '2', specifies the number of attempts to do the query.  Razorframe will re-enqueue the task 'n' number of times with a default of 2 total attempts.  If the event fails to query after all attempts, a message is sent to the user that enqueued the event that the event has failed to write and will be dropped.

##<a name="demo"></a>Demo App
Check out our demo app for more usage examples at: [RZ-Demo](https://github.com/team-emt/rz_demo)

##<a name="platform"></a>Platform
[Node.js](https://nodejs.org/)  

##<a name="dependencies"></a>Dependencies
[Socket.io](https://www.npmjs.com/package/socket.io)  

##<a name="authors"></a>Authors  
[Travis Huff](https://github.com/travishuff)  
[Eddie Park](https://github.com/parkedwards)  
[Michael Sotkin](https://github.com/msotkin)

##<a name="feedback"></a>Feedback
[Click this Link](https://docs.google.com/forms/d/e/1FAIpQLSdxOOe3qaxfK8kmPEZUaPQNM9cL_5jFxzUpHI_K2WNJvnpEuA/viewform) to leave feeback.  We want to hear from you! ⚡️

##<a name="support"></a>Support  
Tested in Chrome 55 & Node 6/7.  
GitHub Issues: <https://github.com/team-emt/razorframe/issues>

##<a name="contributions"></a>Contributions
❤️ Contributions welcome!  
Please see out GitHub repo at: <https://github.com/team-emt/razorframe>

##<a name="license"></a>License  
[MIT](https://github.com/team-emt/razorframe/blob/master/LICENSE)   
