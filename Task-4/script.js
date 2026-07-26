document.addEventListener("DOMContentLoaded", () => {
  function escapeHtml(str = "") {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  const toastWrapper = document.getElementById("toast-wrapper");

  function showToast(message, type = "info", duration = 3000) {
    if (!toastWrapper) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("data-type", type);
    toast.textContent = message;
    toastWrapper.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast--leaving");
      toast.addEventListener("animationend", () => toast.remove(), {
        once: true,
      });
    }, duration);
  }

  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const projectGrid = document.getElementById("project-grid");
  if (projectGrid) {
    const projectCards = Array.from(projectGrid.querySelectorAll(".project-card"));
    const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
    const sortSelect = document.getElementById("sort-select");
    const catalogStatus = document.getElementById("catalog-status");
    const catalogEmpty = document.getElementById("catalog-empty");

    let activeFilter = "all";

    function applyFilterAndSort() {
      let visibleCount = 0;
      projectCards.forEach((card) => {
        const tags = card.getAttribute("data-tags").split(" ");
        const matches = activeFilter === "all" || tags.includes(activeFilter);
        card.hidden = !matches;
        if (matches) visibleCount += 1;
      });

      const sortValue = sortSelect.value;
      const sorted = [...projectCards].sort((a, b) => {
        if (sortValue === "alphabetical") {
          return a
            .getAttribute("data-title")
            .localeCompare(b.getAttribute("data-title"));
        }
        return (
          Number(a.getAttribute("data-order")) -
          Number(b.getAttribute("data-order"))
        );
      });

      sorted.forEach((card) => projectGrid.appendChild(card));

      catalogStatus.textContent = `Showing ${visibleCount} of ${projectCards.length} projects`;
      catalogEmpty.hidden = visibleCount !== 0;
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        activeFilter = btn.getAttribute("data-filter");
        applyFilterAndSort();
        showToast(`Filter applied: ${btn.textContent.trim()}`, "info");
      });
    });

    sortSelect.addEventListener("change", () => {
      applyFilterAndSort();
      const label = sortSelect.options[sortSelect.selectedIndex].textContent;
      showToast(`Sorted by ${label.toLowerCase()}`, "info");
    });

    applyFilterAndSort();
  }

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      contactForm.reset();
      showToast("Message sent! I'll get back to you soon.", "success");
    });
  }

  const noteForm = document.getElementById("note-form");
  if (noteForm) {
    const NOTES_KEY = "enhancedNotes";
    const noteTitleInput = document.getElementById("note-title");
    const noteCategorySelect = document.getElementById("note-category");
    const notePrioritySelect = document.getElementById("note-priority");
    const noteContentInput = document.getElementById("note-content");
    const notePinInput = document.getElementById("note-pin");
    const noteClearBtn = document.getElementById("note-clear");
    const notesList = document.getElementById("notes-list");
    const noteCount = document.getElementById("note-count");
    const editingFlag = document.getElementById("editing-flag");
    const searchInput = document.getElementById("note-search");
    const categoryFilter = document.getElementById("note-filter-category");
    const sortSelect = document.getElementById("note-sort");
    const notesStats = document.getElementById("notes-stats");

    let editingNoteId = null;

    function loadNotes() {
      try {
        const raw = localStorage.getItem(NOTES_KEY);
        return raw ? JSON.parse(raw) : [];
      } catch (error) {
        console.error("Could not read notes:", error);
        return [];
      }
    }

    function persistNotes(notes) {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    }

    function formatTimestamp(isoString) {
      const date = new Date(isoString);
      return date.toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    function resetEditor() {
      noteForm.reset();
      editingNoteId = null;
      editingFlag.hidden = true;
      if (notePinInput) notePinInput.checked = false;
    }

    function loadNoteIntoEditor(note) {
      noteTitleInput.value = note.title;
      noteCategorySelect.value = note.category;
      notePrioritySelect.value = note.priority;
      noteContentInput.value = note.content;
      notePinInput.checked = note.pinned;
      editingNoteId = note.id;
      editingFlag.hidden = false;
      renderNotes();
      noteTitleInput.focus();
    }

    function renderNotes() {
      const notes = loadNotes();
      const query = searchInput.value.trim().toLowerCase();
      const selectedCategory = categoryFilter.value;
      const selectedSort = sortSelect.value;

      let filtered = notes.filter((note) => {
        const matchesQuery =
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query);
        const matchesCategory =
          selectedCategory === "all" || note.category === selectedCategory;
        return matchesQuery && matchesCategory;
      });

      filtered.sort((a, b) => {
        if (selectedSort === "oldest") {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (selectedSort === "priority") {
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        if (selectedSort === "title") {
          return a.title.localeCompare(b.title);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      if (noteCount) noteCount.textContent = String(notes.length);
      if (notesStats) {
        const pinnedCount = notes.filter((note) => note.pinned).length;
        const completedCount = notes.filter((note) => note.completed).length;
        notesStats.innerHTML = `
          <span>${notes.length} notes</span>
          <span>${pinnedCount} pinned</span>
          <span>${completedCount} done</span>
        `;
      }

      notesList.innerHTML = "";

      if (filtered.length === 0) {
        const empty = document.createElement("li");
        empty.className = "notes-empty";
        empty.textContent = "No notes match your filters yet.";
        notesList.appendChild(empty);
        return;
      }

      filtered.forEach((note) => {
        const li = document.createElement("li");
        const priorityClass = `priority-${note.priority.toLowerCase()}`;
        li.className = `note-card ${priorityClass}${note.pinned ? " is-pinned" : ""}${note.completed ? " is-complete" : ""}`;
        li.setAttribute("data-id", note.id);
        if (note.id === editingNoteId) li.classList.add("is-selected");

        li.innerHTML = `
          <div class="note-card__top">
            <div>
              <p class="note-card__meta mono">${escapeHtml(note.category)} · ${escapeHtml(note.priority)}</p>
              <h3>${escapeHtml(note.title)}</h3>
            </div>
            <span class="chip chip--tag">${note.pinned ? "Pinned" : "Note"}</span>
          </div>
          <p class="note-card__body">${escapeHtml(note.content)}</p>
          <div class="note-card__footer">
            <span class="note-card__date mono">${formatTimestamp(note.createdAt)}</span>
            <div class="note-card__actions">
              <button type="button" class="btn btn--ghost btn--sm" data-action="toggle-complete">${note.completed ? "Undo" : "Done"}</button>
              <button type="button" class="btn btn--ghost btn--sm" data-action="toggle-pin">${note.pinned ? "Unpin" : "Pin"}</button>
              <button type="button" class="btn btn--ghost btn--sm" data-action="delete">Delete</button>
            </div>
          </div>
        `;

        li.addEventListener("click", (event) => {
          const button = event.target.closest("button");
          if (!button) {
            loadNoteIntoEditor(note);
            return;
          }

          const action = button.getAttribute("data-action");
          if (action === "delete") {
            deleteNote(note.id);
          } else if (action === "toggle-pin") {
            togglePin(note.id);
          } else if (action === "toggle-complete") {
            toggleComplete(note.id);
          }
        });

        notesList.appendChild(li);
      });
    }

    function saveNote(event) {
      event.preventDefault();
      const title = noteTitleInput.value.trim();
      const category = noteCategorySelect.value;
      const priority = notePrioritySelect.value;
      const content = noteContentInput.value.trim();

      if (!title || !content) {
        showToast("Add both a title and some content first", "error");
        return;
      }

      const notes = loadNotes();
      if (editingNoteId) {
        const index = notes.findIndex((note) => note.id === editingNoteId);
        if (index !== -1) {
          notes[index] = {
            ...notes[index],
            title,
            category,
            priority,
            content,
            pinned: notePinInput.checked,
            createdAt: new Date().toISOString(),
          };
          persistNotes(notes);
          showToast("Note updated", "success");
        }
      } else {
        notes.push({
          id: `note_${Date.now()}_${Math.random().toString(16).slice(2)}`,
          title,
          category,
          priority,
          content,
          pinned: notePinInput.checked,
          completed: false,
          createdAt: new Date().toISOString(),
        });
        persistNotes(notes);
        showToast("Note saved", "success");
      }

      resetEditor();
      renderNotes();
    }

    function deleteNote(id) {
      const notes = loadNotes().filter((note) => note.id !== id);
      persistNotes(notes);
      if (editingNoteId === id) resetEditor();
      renderNotes();
      showToast("Note deleted", "info");
    }

    function togglePin(id) {
      const notes = loadNotes();
      const target = notes.find((note) => note.id === id);
      if (target) {
        target.pinned = !target.pinned;
        persistNotes(notes);
        renderNotes();
        showToast(target.pinned ? "Note pinned" : "Note unpinned", "info");
      }
    }

    function toggleComplete(id) {
      const notes = loadNotes();
      const target = notes.find((note) => note.id === id);
      if (target) {
        target.completed = !target.completed;
        persistNotes(notes);
        renderNotes();
        showToast(target.completed ? "Note marked complete" : "Note reopened", "info");
      }
    }

    noteForm.addEventListener("submit", saveNote);
    noteClearBtn.addEventListener("click", () => {
      resetEditor();
      renderNotes();
    });
    if (searchInput) searchInput.addEventListener("input", renderNotes);
    if (categoryFilter) categoryFilter.addEventListener("change", renderNotes);
    if (sortSelect) sortSelect.addEventListener("change", renderNotes);

    renderNotes();
  }

  const productsGrid = document.getElementById("products-grid");
  if (productsGrid) {
    const products = [
      {
        id: 1,
        name: "Aurora Headphones",
        category: "Audio",
        price: 12999,
        rating: 4.8,
        description: "Immersive sound with a lightweight frame.",
        icon: "fa-headphones",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: 2,
        name: "Terra Keyboard",
        category: "Accessories",
        price: 8990,
        rating: 4.6,
        description: "Tactile switches for fast, clean typing.",
        icon: "fa-keyboard",
        image:
          "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: 3,
        name: "Nimbus Shoes",
        category: "Travel",
        price: 7499,
        rating: 4.4,
        description: "Durable carry-all with smart organization.",
        icon: "fa-bag-shopping",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: 4,
        name: "Lumen Monitor",
        category: "Display",
        price: 24999,
        rating: 4.9,
        description: "A bright, color-accurate desktop display.",
        icon: "fa-display",
        image:
          "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: 5,
        name: "Orbit Mouse",
        category: "Accessories",
        price: 3990,
        rating: 4.3,
        description: "Smooth and precise for everyday work.",
        icon: "fa-computer-mouse",
        image:
          "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: 6,
        name: "Cove Speaker",
        category: "Audio",
        price: 15999,
        rating: 4.7,
        description: "Compact sound with deep bass and great clarity.",
        icon: "fa-volume-high",
        image:
          "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: 7,
        name: "Aero Lamp",
        category: "Home",
        price: 8990,
        rating: 4.5,
        description: "Warm ambient lighting for a cozy workspace.",
        icon: "fa-lightbulb",
        image:
          "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: 8,
        name: "Pulse Smartwatch",
        category: "Wearables",
        price: 19999,
        rating: 4.7,
        description: "Fitness and notification tracking in one sleek band.",
        icon: "fa-watch",
        image:
          "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: 9,
        name: "Glide Desk Mat",
        category: "Accessories",
        price: 2990,
        rating: 4.2,
        description: "A smooth surface that keeps your desk setup neat.",
        icon: "fa-ruler",
        image:
          "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: 10,
        name: "Nova Controller",
        category: "Gaming",
        price: 12999,
        rating: 4.8,
        description: "Low-latency controls with a premium ergonomic grip.",
        icon: "fa-gamepad",
        image:
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: 11,
        name: "Luma Earbuds",
        category: "Audio",
        price: 5499,
        rating: 4.6,
        description: "Compact earbuds with rich sound and a secure fit.",
        icon: "fa-earbuds",
        image:
          "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: 12,
        name: "Ridge Tablet Stand",
        category: "Accessories",
        price: 2499,
        rating: 4.3,
        description: "A sturdy stand that keeps your tablet angled perfectly.",
        icon: "fa-tablet-screen-button",
        image:
          "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: 13,
        name: "Cedar Chair",
        category: "Home",
        price: 14999,
        rating: 4.5,
        description: "Ergonomic comfort for focused work and study sessions.",
        icon: "fa-chair",
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      },
      {
        id: 14,
        name: "Solis Bottle",
        category: "Travel",
        price: 1999,
        rating: 4.2,
        description: "Insulated hydration for commutes, gym sessions, and trips.",
        icon: "fa-bottle-water",
        image:
          "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
      },
    ];

    const categoryFilter = document.getElementById("product-category");
    const priceFilter = document.getElementById("product-price");
    const sortSelect = document.getElementById("product-sort");
    const status = document.getElementById("products-status");

    function renderProducts() {
      const selectedCategory = categoryFilter.value;
      const maxPrice = Number(priceFilter.value);
      const sortValue = sortSelect.value;

      let filtered = products.filter((product) => {
        const categoryMatch =
          selectedCategory === "all" || product.category === selectedCategory;
        const priceMatch = product.price <= maxPrice;
        return categoryMatch && priceMatch;
      });

      filtered.sort((a, b) => {
        if (sortValue === "rating") return b.rating - a.rating;
        if (sortValue === "price") return a.price - b.price;
        if (sortValue === "name") return a.name.localeCompare(b.name);
        return a.price - b.price;
      });

      productsGrid.innerHTML = "";
      if (filtered.length === 0) {
        productsGrid.innerHTML = '<div class="products-empty">No products match these filters.</div>';
        status.textContent = "No items to display";
        return;
      }

      filtered.forEach((product) => {
        const card = document.createElement("article");
        card.className = "product-card panel";
        card.innerHTML = `
          <div class="product-card__image">
            <img src="${product.image}" alt="${escapeHtml(product.name)}" />
          </div>
          <div class="product-card__top">
            <span class="chip chip--tag">${escapeHtml(product.category)}</span>
            <span class="product-card__rating">★ ${product.rating.toFixed(1)}</span>
          </div>
          <div class="product-card__body">
            <div class="product-card__icon">
              <i class="fa-solid ${product.icon}"></i>
            </div>
            <h3>${escapeHtml(product.name)}</h3>
            <p>${escapeHtml(product.description)}</p>
          </div>
          <div class="product-card__footer">
            <span class="product-card__price">₹${product.price.toLocaleString("en-IN")}</span>
            <button type="button" class="btn btn--primary btn--sm">Add to cart</button>
          </div>
        `;
        productsGrid.appendChild(card);
      });

      status.textContent = `Showing ${filtered.length} of ${products.length} products`;
    }

    [categoryFilter, priceFilter, sortSelect].forEach((control) => {
      control.addEventListener("change", renderProducts);
    });

    renderProducts();
  }
});
