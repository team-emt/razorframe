const socket = io();

const chatMsg = document.getElementById('chat-msg');
let node, textNode;

// Initial loading of chat messages from DB
socket.on('dbOnLoad', (data) => {
  data.reverse().forEach(item => {
    node = document.createElement('LI');
    textNode = document.createTextNode(item);
    node.appendChild(textNode);
    chatMsg.appendChild(node);
  });
});

const textForm = document.getElementById('text-input-form');
const textInput = document.getElementById('text-input-field');

// Event emitter for new chat messages
textForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const contents = textInput.value;
    const eventOut = 'msgSent';
    const channel = 'message-channel';
    socket.emit('msgSent', { contents, eventOut, channel });
    textInput.value = '';
});

// Event listener for new chat messages
socket.on('msgSent', (msg) => {
  node = document.createElement('LI');
  textNode = document.createTextNode(msg);
  node.appendChild(textNode);
  chatMsg.insertBefore(node, chatMsg.firstChild);
});

const imageForm = document.getElementById('image-upload-form');
const fileSelect = document.getElementById('file-select');
const uploadButton = document.getElementById('upload-button');
const imgFeed = document.getElementById('image-feed');
let img;

// Event emitter for new image upload
imageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    uploadButton.innerHTML = "Uploading...";
    
    const contents = fileSelect.files[0];
    const eventOut = 'imgSent';
    const channel = 'image-channel';
    socket.emit('imgSent', { contents, eventOut, channel });
    console.log('image sent..');

    uploadButton.innerHTML = "Send"
});

// Event listener for new image upload
socket.on('imgSent', (data) => {
  const arrayBuffer = data;
  const bytes = new Uint8Array(arrayBuffer);
  node = document.createElement('LI');
  img = document.createElement('IMG');
  img.src = 'data:image/png;base64,' + encode(bytes);
  node.appendChild(img);
  imgFeed.appendChild(node);
});

// Helper function for image binary encoding
function encode (input) {
    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    while (i < input.length) {
        chr1 = input[i++];
        chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
        chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        if (isNaN(chr2)) {
            enc3 = enc4 = 64;
        } else if (isNaN(chr3)) {
            enc4 = 64;
        }
        output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                  keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
}
