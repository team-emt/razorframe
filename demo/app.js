const socket = io();

const textForm = document.getElementById('text-input-form');
const textInput = document.getElementById('text-input-field')
const textDisplay = document.getElementById('text-display');
const chatMsg = document.getElementById('chat-msg');
let node, textNode;

socket.on('dbOnLoad', (data) => {
  data.reverse().forEach(item => {
    node = document.createElement('LI');
    textNode = document.createTextNode(item);
    node.appendChild(textNode);
    chatMsg.appendChild(node);
  });
});

textForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const contents = textInput.value;
    const eventOut = 'sent';
    const channel = 'channel-name';

    socket.emit('event', { contents, eventOut, channel });
    textInput.value = '';
});


socket.on('sent', (msg) => {
  node = document.createElement('LI');
  textNode = document.createTextNode(msg);
  node.appendChild(textNode);
  chatMsg.insertBefore(node, chatMsg.firstChild);
});


