const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const ls = {
  g: (k, d) => {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? d;
    } catch {
      return d;
    }
  },
  s: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
const money = (n) => "$" + n.toFixed(2),
  fd = (f) => Object.fromEntries(new FormData(f));
let cart = ls.g("cart", []);
const me = () => ls.g("me", null),
  users = () => ls.g("users", []);
const cnt = () => cart.reduce((a, b) => a + b.q, 0),
  total = () => cart.reduce((a, b) => a + b.p * b.q, 0);
function save() {
  ls.s("cart", cart);
  const c = $("#cc");
  if (c) c.textContent = cnt();
}
function toast(m) {
  let t = $("#toast");
  if (!t) {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div class="toast-container position-fixed bottom-0 end-0 p-3"><div id="toast" class="toast border-0"><div class="toast-body" id="tm"></div></div></div>',
    );
    t = $("#toast");
  }
  $("#tm").textContent = m;
  bootstrap.Toast.getOrCreateInstance(t, { delay: 1800 }).show();
}
function layout() {
  const p = location.pathname.split("/").pop() || "index.html",
    u = me(),
    L = (h, t) =>
      `<li class="nav-item"><a class="nav-link ${p === h ? "active" : ""}" href="${h}">${t}</a></li>`;
  $("#nav").innerHTML =
    `<nav class="navbar navbar-expand-lg sticky-top"><div class="container"><a class="navbar-brand" href="index.html">Food<b>Point</b></a>
 <button class="navbar-toggler border-secondary" data-bs-toggle="collapse" data-bs-target="#nv"><i class="fa fa-bars text-white"></i></button>
 <div class="collapse navbar-collapse" id="nv"><ul class="navbar-nav ms-auto align-items-lg-center gap-lg-2">${L("index.html", "Home")}${L("listing.html", "Restaurants")}${L("detail.html", "Menu")}${L("deals.html", "Deals")}
 <li class="nav-item"><a class="nav-link" href="order.html"><i class="fa fa-cart-shopping"></i> <span id="cc" class="badge bg-warning text-dark">0</span></a></li>
 <li class="nav-item">${u ? `<div class="dropdown"><a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#">${u.name.split(" ")[0]}</a><ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end"><li><a class="dropdown-item" href="profile.html">My Profile</a></li><li><a class="dropdown-item" href="order.html">My Order</a></li><li><a class="dropdown-item" href="#" id="lo">Logout</a></li></ul></div>` : '<a class="btn btn-acc btn-sm px-3" href="login.html">Login</a>'}</li></ul></div></div></nav>`;
  $("#foot").innerHTML =
    `<footer><div class="container"><div class="row g-4"><div class="col-md-4"><h6>FoodPoint</h6>Fresh food from your favourite restaurants.</div><div class="col-md-4"><h6>Contact</h6>University Road, Peshawar<br>+92 111 222 333<br>support@foodpoint.com</div><div class="col-md-4"><h6>Opening Hours</h6>Everyday, 10:00 AM – 10:00 PM</div></div></div></footer>`;
  const lo = $("#lo");
  if (lo)
    lo.onclick = (e) => {
      e.preventDefault();
      ls.s("me", null);
      location.href = "login.html";
    };
  save();
}
document.addEventListener("DOMContentLoaded", () => {
  layout();
  // add to cart
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]");
    if (!b) return;
    const d = b.dataset,
      f = cart.find((x) => x.id === d.add);
    f ? f.q++ : cart.push({ id: d.add, n: d.n, p: +d.p, i: d.i, q: 1 });
    save();
    toast(d.n + " added to cart");
  });
  // filters + search
  const fl = (a, sel) =>
    $$(a).forEach(
      (b) =>
        (b.onclick = () => {
          $$(a).forEach((x) => x.classList.toggle("on", x === b));
          $$(sel).forEach(
            (i) =>
              (i.style.display =
                b.dataset.f === "all" || i.dataset.c === b.dataset.f
                  ? ""
                  : "none"),
          );
        }),
    );
  fl("[data-f]", ".item");
  const q = $("#q");
  if (q)
    q.oninput = () =>
      $$(".item").forEach(
        (i) =>
          (i.style.display = i.textContent
            .toLowerCase()
            .includes(q.value.toLowerCase())
            ? ""
            : "none"),
      );
  // order
  if ($("#cart-body")) drawCart();
  const F = (id, fn) => {
      const f = $(id);
      if (f)
        f.onsubmit = (e) => {
          e.preventDefault();
          $("#err") && ($("#err").textContent = "");
          fn(fd(f));
        };
    },
    err = (m) => ($("#err").textContent = m);
  F("#of", (d) => {
    const o = ls.g("orders", []);
    o.push({ id: Date.now(), to: d.n, addr: d.a, total: total(), items: cart });
    ls.s("orders", o);
    cart = [];
    save();
    $("#main").innerHTML =
      '<div class="container text-center py-5 my-5"><i class="fa fa-circle-check fa-3x text-warning mb-3"></i><h3>Order confirmed</h3><p class="text-secondary">Thank you, ' +
      d.n +
      '. Your food is on its way.</p><a class="btn btn-acc" href="index.html">Back to home</a></div>';
  });
  F("#rf", (d) => {
    const u = users();
    if (u.some((x) => x.email === d.e.toLowerCase()))
      return err("This email is already registered.");
    const n = { name: d.n, email: d.e.toLowerCase(), pass: d.p };
    u.push(n);
    ls.s("users", u);
    ls.s("me", n);
    location.href = "index.html";
  });
  F("#lf", (d) => {
    const u = users().find(
      (x) => x.email === d.e.toLowerCase() && x.pass === d.p,
    );
    if (!u) return err("Email or password is incorrect.");
    ls.s("me", u);
    location.href = "index.html";
  });
  F("#cf", (d) => {
    const u = users(),
      x = u.find((a) => a.email === d.e.toLowerCase());
    if (!x) return err("No account found with this email.");
    x.pass = d.p;
    ls.s("users", u);
    location.href = "login.html";
  });
  const pf = $("#pf");
  if (pf) {
    const u = me();
    if (!u) location.href = "login.html";
    else {
      pf.n.value = u.name;
      pf.e.value = u.email;
    }
    F("#pf", (d) => {
      const all = users(),
        x = all.find((a) => a.email === u.email);
      x.name = d.n;
      x.email = d.e.toLowerCase();
      if (d.p) x.pass = d.p;
      ls.s("users", all);
      ls.s("me", x);
      layout();
      toast("Profile updated");
    });
  }
  const of = $("#of");
  if (of && me()) {
    of.n.value = me().name;
    of.e.value = me().email;
  }
});
function drawCart() {
  const b = $("#cart-body");
  if (!cart.length) {
    $("#cart-wrap").innerHTML =
      '<div class="text-center py-5"><i class="fa fa-basket-shopping fa-3x text-secondary mb-3"></i><h5>Your cart is empty</h5><a class="btn btn-acc mt-2" href="detail.html">Browse menu</a></div>';
    $("#of-wrap").style.display = "none";
    return;
  }
  b.innerHTML = cart
    .map(
      (c, k) =>
        `<tr><td><img class="thumb me-2" src="images/${c.i}" onerror="this.style.visibility='hidden'">${c.n}</td><td>${money(c.p)}</td><td><button class="qb" onclick="qty(${k},-1)">−</button> ${c.q} <button class="qb" onclick="qty(${k},1)">+</button></td><td>${money(c.p * c.q)}</td><td><a href="#" class="text-danger" onclick="qty(${k},-99);return false"><i class="fa fa-trash"></i></a></td></tr>`,
    )
    .join("");
  $("#total").textContent = money(total());
}
function qty(k, d) {
  cart[k].q += d;
  if (cart[k].q < 1) cart.splice(k, 1);
  save();
  drawCart();
}
