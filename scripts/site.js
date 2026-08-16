/*
 * site.js — mattwren.dev
 *
 * One job: the light/dark switch. The initial theme is applied by a small
 * inline script in each page's <head>, because waiting for this file would
 * let a light page paint before the dark theme lands.
 *
 * Everything else the old site ran here (nav pill indicator, page transition
 * overlays, scroll reveals) went with the redesign — there is no nav pill and
 * nothing left to reveal.
 */
(function () {
  var button = document.getElementById("themer");
  if (!button) return;

  button.addEventListener("click", function () {
    var root = document.documentElement;
    var next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("mw-theme", next);
    } catch (e) {
      /* Private browsing: the theme still switches, it just won't persist. */
    }
  });
})();
