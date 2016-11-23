let socket = io();

// el.addEventListener(eventName, eventHandler);

// $('form').submit(function () {
//   socket.emit('chat message', $('#m').val());
//   $('#m').val('');
//   return false;
// });
// socket.on('chat message', function (msg) {
//   $('#messages').append($('<li>').text(msg));
// });

let textForm = document.getElementById('text-input-form');
let textInput = document.getElementById('text-input-field')
let textDisplay = document.getElementById('text-display');

textForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const event = 'sent';
    const text = textInput.value;
    const channel = 'channel-name';

    socket.emit('event', { event, text, channel });
    textInput.value = '';
});


socket.on('sent', (msg) => {
    textDisplay.innerHTML = msg;
});


