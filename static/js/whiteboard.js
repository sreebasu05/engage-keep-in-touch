'use strict';

(function() {

  var socket = io();
  var canvas = document.getElementsByClassName('whiteboard')[0];
  var colors = document.getElementsByClassName('color');
  var context = canvas.getContext('2d');
  socket.emit('enter', MeetId);

  var all = []; //This stores every stroke made by all users and hence when new
  // users enter this help share the past data without storing in a database

  socket.on('enter', function() {
    for (let x = 0; x < all.length; x++) {
      socket.emit('drawing', {
        x0: all[x][0],
        y0: all[x][1],
        x1: all[x][2],
        y1: all[x][3],
        color: all[x][4]
      });
    }
  })
  var current = {
    color: 'black'
  };
  var drawing = false;

  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);

  //Touch support for mobile devices
  canvas.addEventListener('touchstart', onMouseDown, false);
  canvas.addEventListener('touchend', onMouseUp, false);
  canvas.addEventListener('touchcancel', onMouseUp, false);
  canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

  for (var i = 0; i < colors.length; i++) {
    colors[i].addEventListener('click', onColorUpdate, false);
  }

  socket.on('drawing', onDrawingEvent);

  socket.on('refresh', c);

  function c() {
    console.log('dcf')
    var w = canvas.width;
    var h = canvas.height;
    for (let x = 0; x < all.length; x++) {
      drawLine(all[x][0] * w, all[x][1] * h, all[x][2] * w, all[x][3] * h, 'white');
    }
    all = [];
  }
  window.addEventListener('resize', onResize, false);
  onResize();


  function drawLine(x0, y0, x1, y1, color, emit) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    if(color=='white'){
      context.lineWidth = 10;
    }
    else {
    context.lineWidth = 2;}
    context.stroke();
    context.closePath();

    if (!emit) {
      return;
    }
    var w = canvas.width;
    var h = canvas.height;
    // all.append({x0,y0,x1,y1,color});
    console.log(color)
    if (color == "white") {
      socket.emit('refresh')
    } else {
      socket.emit('drawing', {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color: color
      });
    }
  }

  function onMouseDown(e) {
    drawing = true;
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
  }

  function onMouseUp(e) {
    if (!drawing) {
      return;
    }
    drawing = false;
    drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
  }

  function onMouseMove(e) {
    if (!drawing) {
      return;
    }
    drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, true);
    current.x = e.clientX || e.touches[0].clientX;
    current.y = e.clientY || e.touches[0].clientY;
  }

  function onColorUpdate(e) {
    current.color = e.target.className.split(' ')[1];
    if(current.color=='white'){
      socket.emit('refresh')
    }
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data) {
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    let y = (data.x0) + " " + (data.y0) + " " + (data.x1) + " " + (data.y1) + " " + data.color;
    var res = y.split(" ")

    all.push(res)
  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

})();
