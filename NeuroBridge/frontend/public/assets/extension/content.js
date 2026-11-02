
(function() {
  document.body.classList.add('neurobridge-dyslexic');
  let ruler = document.getElementById('neurobridge-ruler');
  if (!ruler) {
    ruler = document.createElement('div');
    ruler.id = 'neurobridge-ruler';
    document.body.appendChild(ruler);
    window.addEventListener('mousemove', (e) => {
      ruler.style.top = (e.clientY - 18) + 'px';
    });
  }
})();
