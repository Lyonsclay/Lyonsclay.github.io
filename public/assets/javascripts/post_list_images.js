document.addEventListener("DOMContentLoaded", function(event) {
)};

var postLists = document.getElementsByClassName('post-list')[0].children;

function setListImages() {
  for (li in postLists) {
    if (/a pattern/.test(li.innerText) {
      li.style.backgroundImage = "url(/public/assets/images/avocets.jpg)";
    }
    if (/Promises Promises/.test(li.innerText) {
      li.style.backgroundImage = "url(public/assets/images/maximillian.jpg)";
    }
  }
}

function setListStyles() {
  for (li in postLists) {
    li.style.height = '200px';
    li.style.backgroundColor = 'SlateGray';
    li.style.backgroundBlendMode = 'hard-light';
    li.style.backgroundSize = '740px';
  }
}

