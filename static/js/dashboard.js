// Dashboard's js

function details() {
  let x = document.getElementById('hide-bar');
  x.style.display = "flex"
}

function scrollToBottom() {
  var d = $('.all-notification');
  d.scrollTop(d.prop("scrollHeight"));
}
document.getElementById('hide-bar').addEventListener("click", function() {
  let x = document.getElementById('hide-bar');
  x.style.display = "none"
});
