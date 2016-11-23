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

textForm.addEventListener('submit', (event) => {
  event.preventDefault();
  socket.emit('text entry', textInput.value);
  textInput.value = '';
});

socket.on('text receieved', (msg) => {
  textDisplay.innerHTML = msg;
});


