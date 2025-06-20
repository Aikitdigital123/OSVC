<script>
  document.querySelectorAll('form[action="https://api.web3forms.com/submit"]').forEach(form=>{
    form.addEventListener('submit', function(e){
      var status = form.querySelector("#form-status");
      status.textContent = "Odesílám...";
      setTimeout(()=>{ status.textContent=""; }, 6000);
    });
  });
</script>
