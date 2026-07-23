/* FRIGALIS — chambre-froide-pro.fr */

/* CONFIG — coller ici l'URL du Web App Google Apps Script après déploiement */
var LEAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbxHv-y7WQSPsqpFnRtcS7OygjE1gRAjlRGKE3GqrXhI1pGzTaNVhtzXxZWq4y1cIlcH5Q/exec";
var SITE_ID = "chambre-froide-pro.fr";

/* Menu mobile */
document.addEventListener("DOMContentLoaded", function () {
  var burger = document.querySelector(".burger");
  var menu = document.querySelector("nav.menu");
  if (burger && menu) burger.addEventListener("click", function () { menu.classList.toggle("open"); });
  initDevis();
});

/* Simulateur de devis multi-étapes */
function initDevis() {
  var box = document.getElementById("devis");
  if (!box) return;
  var steps = box.querySelectorAll(".f-step");
  var bar = box.querySelector(".progress > div");
  var data = { site: SITE_ID, page: location.pathname };
  var idx = 0;

  function show(i) {
    idx = i;
    steps.forEach(function (s, n) { s.classList.toggle("on", n === i); });
    if (bar) bar.style.width = ((i + 1) / steps.length) * 100 + "%";
    box.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* Choix cliquables : enregistre la valeur et passe à l'étape suivante */
  box.querySelectorAll(".choice").forEach(function (c) {
    c.addEventListener("click", function () {
      var step = c.closest(".f-step");
      step.querySelectorAll(".choice").forEach(function (o) { o.classList.remove("sel"); });
      c.classList.add("sel");
      data[c.dataset.name] = c.dataset.value;
      setTimeout(function () { if (idx < steps.length - 1) show(idx + 1); }, 250);
    });
  });

  box.querySelectorAll(".next").forEach(function (b) {
    b.addEventListener("click", function () { if (idx < steps.length - 1) show(idx + 1); });
  });
  box.querySelectorAll(".prev").forEach(function (b) {
    b.addEventListener("click", function () { if (idx > 0) show(idx - 1); });
  });

  var form = box.querySelector("form");
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = new FormData(form);
    f.forEach(function (v, k) { data[k] = v; });
    if (!data.nom || !data.telephone) { alert("Merci d'indiquer au minimum votre nom et votre téléphone."); return; }
    var btn = form.querySelector("button[type=submit]");
    if (btn) { btn.disabled = true; btn.textContent = "Envoi en cours…"; }
    var body = new URLSearchParams();
    Object.keys(data).forEach(function (k) { body.append(k, data[k]); });
    fetch(LEAD_ENDPOINT, { method: "POST", body: body, mode: "no-cors" })
      .catch(function () {})
      .finally(function () {
        box.querySelector(".devis-inner").style.display = "none";
        box.querySelector(".merci").style.display = "block";
        if (typeof gtag === "function") gtag("event", "generate_lead", { site: SITE_ID });
      });
  });

  show(0);
}
