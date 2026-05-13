import './style.css'


const container = document.querySelector("#app")
const searchInput = document.querySelector("#search")
const rarityFilter = document.querySelector("#rarityFilter")
const sortSelect = document.querySelector("#sort")
const showFavsBtn = document.querySelector("#showFavs")
const showAllBtn = document.querySelector("#showAll")

const modal = document.querySelector("#modal")
const closeModal = document.querySelector("#closeModal")
const modalImg = document.querySelector("#modalImg")
const modalName = document.querySelector("#modalName")
const modalRarity = document.querySelector("#modalRarity")
const modalClass = document.querySelector("#modalClass")

const themeToggle = document.querySelector("#themeToggle")

// THEME
const savedTheme = localStorage.getItem("theme") || "dark"
document.body.classList.add(savedTheme)
if (savedTheme === "light") themeToggle.checked = true

themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    document.body.classList.replace("dark", "light")
    localStorage.setItem("theme", "light")
  } else {
    document.body.classList.replace("light", "dark")
    localStorage.setItem("theme", "dark")
  }
})

// DATA
let allBrawlers = []
let favorites = JSON.parse(localStorage.getItem("favorites")) || []
let currentMode = "all"

// FAVORITES
const saveFavorites = () => {
  localStorage.setItem("favorites", JSON.stringify(favorites))
}

const isFavorite = (brawler) => {
  return favorites.some(f => f.id === brawler.id)
}

const toggleFavorite = (brawler) => {
  const exists = favorites.find(f => f.id === brawler.id)

  if (exists) {
    favorites = favorites.filter(f => f.id !== brawler.id)
  } else {
    favorites.push(brawler)
  }

  saveFavorites()
  applyFilters()
}

// MODAL
const openModal = (brawler) => {
  modalImg.src = brawler.imageUrl
  modalName.textContent = brawler.name
  modalRarity.textContent = "Rarity: " + brawler.rarity.name
  modalClass.textContent = "Class: " + brawler.class.name
  modal.style.display = "flex"
}

closeModal.onclick = () => modal.style.display = "none"
modal.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none"
}

// LOAD
const loadBrawlers = async () => {
  const res = await fetch("https://api.brawlapi.com/v1/brawlers")
  const data = await res.json()

  allBrawlers = data.list
  applyFilters()
}

// RENDER
const renderBrawlers = (brawlers) => {
  let html = ""

  brawlers.forEach(brawler => {
    html += `
      <div class="card" data-id="${brawler.id}">
        <img src="${brawler.imageUrl}" />
        <h2>${brawler.name}</h2>
        <p>Rarity: ${brawler.rarity.name}</p>
        <p>Class: ${brawler.class.name}</p>

        <button class="fav-btn" data-id="${brawler.id}">
          ${isFavorite(brawler) ? "❤️" : "🤍"}
        </button>
      </div>
    `
  })

  container.innerHTML = html

  document.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation()
      const brawler = allBrawlers.find(b => b.id == btn.dataset.id)
      toggleFavorite(brawler)
    })
  })

  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      const brawler = allBrawlers.find(b => b.id == card.dataset.id)
      openModal(brawler)
    })
  })
}

// FILTERS
const applyFilters = () => {
  let base = currentMode === "favorites" ? favorites : allBrawlers
  let filtered = [...base]

  const searchValue = searchInput.value.toLowerCase()
  filtered = filtered.filter(b =>
    b.name.toLowerCase().includes(searchValue)
  )

  const rarityValue = rarityFilter.value
  if (rarityValue !== "all") {
    filtered = filtered.filter(b =>
      b.rarity.name === rarityValue
    )
  }

  const sortValue = sortSelect.value
  if (sortValue === "az") {
    filtered.sort((a, b) => a.name.localeCompare(b.name))
  }
  if (sortValue === "za") {
    filtered.sort((a, b) => b.name.localeCompare(a.name))
  }

  renderBrawlers(filtered)
}

// EVENTS
searchInput.addEventListener("input", applyFilters)
rarityFilter.addEventListener("change", applyFilters)
sortSelect.addEventListener("change", applyFilters)

showFavsBtn.addEventListener("click", () => {
  currentMode = "favorites"
  applyFilters()
})

showAllBtn.addEventListener("click", () => {
  currentMode = "all"
  applyFilters()
})

loadBrawlers()