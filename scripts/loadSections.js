const sectionFiles = [
  ["nav", "sections/nav.html"],
  ["hero-slot", "sections/hero.html"],
  ["about-slot", "sections/about.html"],
  ["education-slot", "sections/education.html"],
  ["experience-slot", "sections/experience.html"],
  ["projects-slot", "sections/projects.html"],
  ["skills-slot", "sections/skills.html"],
  ["contact-slot", "sections/contact.html"],
  ["footer-slot", "sections/footer.html"]
];

async function loadSections() {
  await Promise.all(sectionFiles.map(async ([id, path]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const res = await fetch(path);
    el.innerHTML = await res.text();
  }));
  document.dispatchEvent(new Event('sectionsLoaded'));
}

loadSections();
