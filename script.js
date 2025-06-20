// Efektní načítání sekcí při scrollu
document.querySelectorAll('.section').forEach(sec => {
  sec.style.opacity = 0;
  sec.style.transform = 'translateY(60px)';
});
function revealSections() {
  document.querySelectorAll('.section').forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      sec.style.animationPlayState = 'running';
    }
  });
}
window.addEventListener('scroll', revealSections);
window.addEventListener('DOMContentLoaded', revealSections);

// Odeslání formuláře – jednoduchý feedback (pouze pro Web3Forms)
document.querySelectorAll('form[action="https://api.web3forms.com/submit"]').forEach(form=>{
  form.addEventListener('submit', function(e){
    var status = form.querySelector("#form-status");
    if(status) {
      status.textContent = "Odesílám...";
      setTimeout(()=>{ status.textContent=""; }, 6000);
    }
  });
});
