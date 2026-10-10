/* Torn Hub - shared top menu and data access for every page.
 * To add a new section later: add one entry to SECTIONS and create its .html page. */
(function () {
  var SECTIONS = [
    { id: "profile", href: "profile.html", name: "Personal Profile", icon: "👤",
      blurb: "Identity, status, spouse, faction, job, property and social counts.",
      chips: ["Identity", "Status", "Relationships", "Social"] },
    { id: "stats", href: "stats.html", name: "Torn Stats", icon: "📊",
      blurb: "Battle and work stats, growth over time, crimes, awards and education.",
      chips: ["Overview", "Growth", "Crimes", "Awards", "Education"] },
    { id: "wealth", href: "wealth.html", name: "Wealth Portfolio", icon: "💰",
      blurb: "Stocks, net worth, what to buy next, Cayman and property.",
      chips: ["Portfolio", "Net Worth", "What to Buy Next", "Cayman", "Property", "Inventory"] },
    { id: "targets", href: "targets.html", name: "Targets", icon: "🎯",
      blurb: "Your hit list with live status, hospital timers, travel and inactive clean-up.",
      chips: ["Live status", "Hospital timers", "Factions", "Too strong", "Inactive"] }
  ];

  var CSS = [
    ".hubnav{position:sticky;top:0;z-index:900;background:rgba(12,13,22,.84);backdrop-filter:blur(14px);",
    "-webkit-backdrop-filter:blur(14px);border-bottom:1px solid rgba(184,180,214,.14);font-family:'Inter','Segoe UI',system-ui,sans-serif}",
    ".hubnav *{box-sizing:border-box}",
    ".hubnav .hn-in{max-width:1180px;margin:0 auto;padding:0 20px;height:62px;display:flex;align-items:center;gap:16px}",
    ".hubnav .hn-logo{display:flex;align-items:center;gap:10px;color:#e9e7f2;text-decoration:none}",
    ".hubnav .hn-orb{width:28px;height:28px;border-radius:50%;position:relative;overflow:hidden;flex:0 0 auto;",
    "background:radial-gradient(circle at 38% 34%,#f6f2ff,#c9c0ee 55%,#9a8fd0);box-shadow:0 0 16px rgba(160,150,220,.45)}",
    ".hubnav .hn-orb:after{content:'';position:absolute;width:22px;height:22px;border-radius:50%;background:#0e0f18;left:12px;top:-6px}",
    ".hubnav .hn-lt{font:600 17px 'Space Grotesk','Segoe UI',system-ui,sans-serif;letter-spacing:.2px}",
    ".hubnav .hn-lt b{font-weight:600;background:linear-gradient(90deg,#b3a8e0,#8ea3d8);-webkit-background-clip:text;background-clip:text;color:transparent}",
    ".hubnav .hn-links{display:flex;gap:4px;margin-left:8px}",
    ".hubnav .hn-link{color:#9a96b0;font:500 14px 'Inter','Segoe UI',system-ui,sans-serif;padding:8px 14px;border-radius:999px;",
    "text-decoration:none;display:flex;align-items:center;gap:8px;white-space:nowrap;transition:.18s}",
    ".hubnav .hn-link span{font-size:16px;line-height:1}",
    ".hubnav .hn-link:hover{color:#e9e7f2;background:rgba(179,168,224,.08);text-decoration:none}",
    ".hubnav .hn-link.on{color:#e9e7f2;background:rgba(179,168,224,.14);box-shadow:inset 0 0 0 1px rgba(184,180,214,.24)}",
    ".hubnav .hn-sp{flex:1}",
    ".hubnav .hn-lock{color:#6b6880;font-size:12px;text-decoration:none;cursor:pointer;background:none;border:0;padding:6px}",
    ".hubnav .hn-lock:hover{color:#b3a8e0}",
    ".hubnav .hn-burger{display:none;background:none;border:1px solid rgba(184,180,214,.24);border-radius:10px;color:#e9e7f2;",
    "width:42px;height:38px;cursor:pointer;font-size:18px}",
    ".hubnav .hn-drawer{display:none}",
    ".hubnav a:focus-visible,.hubnav button:focus-visible{outline:2px solid #b3a8e0;outline-offset:2px}",
    "@media(max-width:900px){.hubnav .hn-links{display:none}.hubnav .hn-burger{display:block}",
    ".hubnav .hn-drawer.open{display:grid;gap:4px;padding:8px 16px 14px;border-top:1px solid rgba(184,180,214,.14)}",
    ".hubnav .hn-drawer .hn-link{border-radius:12px;padding:12px 14px}}",
    ".hubgate{position:fixed;inset:0;z-index:1000;background:rgba(8,9,15,.86);backdrop-filter:blur(6px);display:grid;place-items:center;padding:16px}",
    ".hubgate form{background:#171a24;border:1px solid rgba(184,180,214,.22);border-radius:18px;padding:26px;width:min(360px,100%);",
    "display:grid;gap:12px;text-align:center;color:#e9e7f2;font-family:'Inter','Segoe UI',system-ui,sans-serif}",
    ".hubgate h2{margin:0;font:600 20px 'Space Grotesk','Segoe UI',system-ui,sans-serif}",
    ".hubgate p{margin:0;color:#9a96b0;font-size:13.5px}",
    ".hubgate input{background:#0e0f14;border:1px solid rgba(184,180,214,.24);border-radius:10px;color:#e9e7f2;padding:11px 12px;font-size:14px}",
    ".hubgate button{background:linear-gradient(180deg,#2a2f44,#1d2130);border:1px solid rgba(184,180,214,.3);border-radius:10px;",
    "color:#e9e7f2;padding:10px;font-size:14px;cursor:pointer}"
  ].join("");

  var CODE_KEY = "tornAssetsCode";   // same key the Wealth page uses, so one code opens everything
  function getCode() { try { return localStorage.getItem(CODE_KEY) || window._code || ""; } catch (e) { return window._code || ""; } }
  function setCode(c) { window._code = c; try { localStorage.setItem(CODE_KEY, c); } catch (e) {} }
  function forgetCode() { try { localStorage.removeItem(CODE_KEY); } catch (e) {} window._code = ""; location.reload(); }

  /** Fetch a view from the data service. Shows the access-code box when needed and retries. */
  function fetchView(view) {
    var base = (window.TORN_ASSETS_CONFIG || {}).dataUrl || "";
    if (!base || base.indexOf("script.google.com") < 0) return Promise.reject(new Error("the data service link is not set up yet"));
    var url = base + (base.indexOf("?") >= 0 ? "&" : "?") + "view=" + encodeURIComponent(view) +
      "&code=" + encodeURIComponent(getCode()) + "&t=" + Date.now();
    return fetch(url, { cache: "no-store", redirect: "follow" }).then(function (r) {
      if (!r.ok) throw new Error("the data service returned " + r.status);
      return r.json();
    }).then(function (d) {
      if (d && d.locked) return askCode().then(function () { return fetchView(view); });
      return d;
    });
  }
  /** Save data to the data service (POST). Shows the access-code box when needed and retries. */
  function postView(view, data) {
    var base = (window.TORN_ASSETS_CONFIG || {}).dataUrl || "";
    if (!base || base.indexOf("script.google.com") < 0) return Promise.reject(new Error("the data service link is not set up yet"));
    return fetch(base, { method: "POST", redirect: "follow", body: JSON.stringify({ code: getCode(), view: view, data: data }) })
      .then(function (r) { if (!r.ok) throw new Error("the data service returned " + r.status); return r.json(); })
      .then(function (d) {
        if (d && d.locked) return askCode().then(function () { return postView(view, data); });
        if (d && d.error) throw new Error(d.error);
        return d;
      });
  }
  function askCode() {
    return new Promise(function (resolve) {
      var o = document.createElement("div"); o.className = "hubgate";
      o.innerHTML = '<form><h2>Torn Hub</h2><p>' + (getCode() ? "That access code did not match. Try again." :
        "Enter your access code to open the dashboard.") + '</p>' +
        '<input type="password" id="hubCodeIn" autocomplete="current-password" placeholder="Access code" required>' +
        '<button type="submit">Open</button></form>';
      document.body.appendChild(o);
      var f = o.querySelector("form"), inp = o.querySelector("#hubCodeIn"); inp.focus();
      f.addEventListener("submit", function (ev) { ev.preventDefault(); setCode(inp.value.trim()); o.remove(); resolve(); });
    });
  }

  function build() {
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    var cur = document.body.getAttribute("data-section") || "home";
    var items = [{ id: "home", href: "index.html", name: "Home", icon: "🏠" }].concat(SECTIONS);
    function link(s) {
      return '<a class="hn-link' + (s.id === cur ? " on" : "") + '" href="' + s.href + '"><span>' + s.icon + "</span>" + s.name + "</a>";
    }
    var nav = document.createElement("nav"); nav.className = "hubnav";
    nav.innerHTML = '<div class="hn-in"><a class="hn-logo" href="index.html" aria-label="Home"><span class="hn-orb"></span>' +
      '<span class="hn-lt">Torn<b>Hub</b></span></a><div class="hn-links">' + items.map(link).join("") +
      '</div><div class="hn-sp"></div><button class="hn-lock" type="button" title="Forget the access code on this browser">Lock</button>' +
      '<button class="hn-burger" type="button" aria-label="Open menu" aria-expanded="false">&#9776;</button></div>' +
      '<div class="hn-drawer">' + items.map(link).join("") + "</div>";
    document.body.insertBefore(nav, document.body.firstChild);
    nav.querySelector(".hn-lock").addEventListener("click", forgetCode);
    var dr = nav.querySelector(".hn-drawer"), bg = nav.querySelector(".hn-burger");
    bg.addEventListener("click", function () { var o = dr.classList.toggle("open"); bg.setAttribute("aria-expanded", o); });
  }

  window.TornHub = { SECTIONS: SECTIONS, fetchView: fetchView, postView: postView, getCode: getCode, setCode: setCode, forgetCode: forgetCode };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
