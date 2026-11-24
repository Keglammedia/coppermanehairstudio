const $ = id => document.getElementById(id);

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

function hideIfEmpty(sectionId, list) {
  if (!list || !list.length) $(sectionId).hidden = true;
}

function accentLast(node, text, cls) {
  node.textContent = "";
  const w = (text || "").split(" ");
  if (w.length > 2) {
    node.append(w.slice(0, -2).join(" ") + " ");
    node.append(el("span", cls, w.slice(-2).join(" ")));
  } else {
    node.textContent = text || "";
  }
}

function isWeb(link) { return /^https?:/i.test(link || ""); }

fetch("site.json", { cache: "no-store" })
  .then(r => r.json())
  .then(d => {
    // Announcement bar
    if (d.announcement) {
      $("announce").textContent = d.announcement;
      $("announce").hidden = false;
    }

    // Booking links
    const tel = d.phone ? "tel:" + d.phone.replace(/[^0-9+]/g, "") : "";
    const book = d.booking_url || tel || "#locations";
    document.querySelectorAll(".book").forEach(a => {
      a.href = book;
      if (isWeb(book)) { a.target = "_blank"; a.rel = "noopener"; }
    });

    // Hero (the last two words of the headline get the green underline)
    accentLast($("tagline"), d.tagline, "hl");
    $("intro").textContent = d.intro || "";
    if (d.hero_image) {
      $("top").classList.add("has-photo");
      $("top").style.backgroundImage =
        'linear-gradient(rgba(10,20,25,.6), rgba(10,20,25,.6)), url("' + d.hero_image + '")';
    }

    // Services
    const services = d.services || [];
    services.forEach(s => {
      const card = el("div", "card");
      card.append(el("h3", "", s.title));
      if (s.description) card.append(el("p", "", s.description));
      if (s.price) card.append(el("p", "price", s.price));
      $("serviceCards").append(card);
    });
    hideIfEmpty("services", services);

    // About
    $("aboutTitle").textContent = d.about_title || "About the Studio";
    (d.about_text || "").split(/\n\s*\n/).forEach(t => {
      if (t.trim()) $("aboutText").append(el("p", "", t.trim()));
    });
    const points = d.about_points || [];
    points.forEach(p => $("aboutPoints").append(el("li", "", p.text)));
    if (!points.length) $("aboutPoints").hidden = true;

    // Reviews
    const reviews = d.reviews || [];
    reviews.forEach(r => {
      const card = el("div", "card");
      card.append(el("div", "stars", "\u2605\u2605\u2605\u2605\u2605"));
      card.append(el("p", "", r.quote));
      card.append(el("p", "who", r.name));
      $("reviewGrid").append(card);
    });
    hideIfEmpty("reviews", reviews);

    // Team
    const team = d.team || [];
    team.forEach(m => {
      const box = el("div", "member");
      if (m.photo) {
        const img = el("img");
        img.src = m.photo;
        img.alt = m.name || "Team member";
        img.loading = "lazy";
        box.append(img);
      } else {
        box.append(el("div", "initial", (m.name || "?").charAt(0).toUpperCase()));
      }
      box.append(el("h3", "", m.name));
      if (m.role) box.append(el("p", "", m.role));
      $("teamGrid").append(box);
    });
    hideIfEmpty("team", team);

    // Gallery
    const gallery = d.gallery || [];
    gallery.forEach(g => {
      const img = el("img");
      img.src = g.image;
      img.alt = g.caption || "Hair by Copper Mane Hair Studio";
      img.loading = "lazy";
      $("galleryGrid").append(img);
    });
    if (!gallery.length) $("galleryGrid").hidden = true;

    // Social links
    [["Instagram", d.instagram], ["Facebook", d.facebook], ["TikTok", d.tiktok], ["YouTube", d.youtube]]
      .forEach(([name, url]) => {
        if (!url) return;
        const a = el("a", "", name);
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener";
        $("socials").append(a);
      });
    hideIfEmpty("follow", gallery.length || $("socials").children.length ? [1] : []);

    // Locations
    const locations = d.locations || [];
    locations.forEach(l => {
      const card = el("div", "card");
      card.append(el("h3", "", l.name));
      if (l.address) {
        const p = el("p", "pre");
        const a = el("a", "", l.address);
        a.href = "https://www.google.com/maps/search/?api=1&query=" +
          encodeURIComponent(l.address.replace(/\n/g, " "));
        a.target = "_blank";
        a.rel = "noopener";
        p.append(a);
        card.append(p);
      }
      if (l.phone) {
        const p = el("p");
        const a = el("a", "", l.phone);
        a.href = "tel:" + l.phone.replace(/[^0-9+]/g, "");
        p.append(a);
        card.append(p);
      }
      if (l.email) {
        const p = el("p");
        const a = el("a", "", l.email);
        a.href = "mailto:" + l.email;
        p.append(a);
        card.append(p);
      }
      if (l.hours) card.append(el("p", "pre", l.hours));
      $("locationGrid").append(card);
    });
    hideIfEmpty("locations", locations);

    // Footer contact (plain text)
    $("footContact").textContent = [d.phone, d.email].filter(Boolean).join("  |  ");
  });
