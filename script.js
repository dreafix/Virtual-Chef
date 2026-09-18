console.log("✅ script.js загружен");

/* ================= ОСОБЫЕ ПОЛЬЗОВАТЕЛИ ================= */

const SUPER_USERS = [
    "ivan.dumenov@mail.ru",
    "donaterkir@gmail.com",
    "dumenovandrej7@gmail.com"
];

const ADMIN_EMAILS = [
    "ivan.dumenov@mail.ru",
    "dumenovandrej7@gmail.com"
];

function isSuperUser(email) {
    if (!email) return false;
    return SUPER_USERS.map(e => e.toLowerCase()).includes(email.toLowerCase());
}

function isAdminUser(email) {
    if (!email) return false;
    return ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email.toLowerCase());
}


/* ---------- ЗАПРЕЩЁННЫЕ НИКИ ---------- */
function isForbiddenName(name) {
    const clean = name.toLowerCase().replace(/[^a-zа-яё0-9]/gi, "");

    const forbiddenRoots = [
        "админ",
        "admin",
        "adm",
        "amin",
        "admn",
        "adm1n",
        "4dmin",
        "аdмин",
        "admин",
        "aдмин",
        "аdmin",
        "адmин",
        "admіn",
        "admln",
        "adrnin",
        "αdmin",
        "👑"
    ];

    return forbiddenRoots.some(root => clean.includes(root));
}


const recipes = [
    {
        id: 1,
        name: "Паста болоньезе",
        cat: "Ужины",
        time: "30 мин",
        tag: "Легко",
        desc: "Классика итальянской кухни с ароматным томатным соусом.",
        img: "images/pasta.png",
        ingredients: ["паста", "фарш", "томаты", "лук", "чеснок"]
    },
    {
        id: 2,
        name: "Курица с овощами в духовке",
        cat: "Ужины",
        time: "40 мин",
        tag: "Средне",
        desc: "Сочная курица с запечёнными овощами.",
        img: "images/chicken.png",
        ingredients: ["курица", "картофель", "перец", "морковь"]
    },
    {
        id: 3,
        name: "Панкейки на молоке",
        cat: "Завтраки",
        time: "20 мин",
        tag: "Легко",
        desc: "Нежные и воздушные панкейки для уютного утра.",
        img: "images/pancakes.png",
        ingredients: ["мука", "молоко", "яйца", "сахар"]
    },
    {
        id: 4,
        name: "Томатный суп",
        cat: "Обеды",
        time: "35 мин",
        tag: "Средне",
        desc: "Яркий суп с ароматом томатов и свежей зеленью.",
        img: "images/soup.png",
        ingredients: ["томаты", "лук", "чеснок", "сливки", "зелень"]
    }
];

let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

const grid = document.querySelector("#recipeGrid");
const recipesPageGrid = document.querySelector("#recipesPageGrid");
const fridgeResults = document.querySelector("#fridgeResults");

const modal = document.querySelector("#modal");
const modalContent = document.querySelector("#modalContent");


/* ---------- РЕНДЕР ---------- */

function recipeCardHTML(r) {
    return `
    <article class="recipe" data-id="${r.id}">
      <img src="${r.img}" alt="${r.name}">
      <button class="heart" data-fav="${r.id}" title="Избранное">
        ${favorites.includes(r.id) ? "♥" : "♡"}
      </button>
      <div class="recipe-body">
        <div class="meta">
          ◷ ${r.time}
          <span class="tag">${r.tag}</span>
        </div>
        <h3>${r.name}</h3>
        <p>${r.desc}</p>
        <div class="author">♨ Виртуальный Шеф</div>
      </div>
    </article>`;
}

function renderTo(container, list) {
    if (!container) return;

    if (!list.length) {
        container.innerHTML = `<div class="empty">Ничего не найдено.</div>`;
        return;
    }
    container.innerHTML = list.map(recipeCardHTML).join("");
}

function render(list = recipes) {
    renderTo(grid, list);
    renderTo(recipesPageGrid, list);
}


/* ---------- МОДАЛКА РЕЦЕПТА ---------- */

function openRecipe(id) {
    const r = recipes.find(x => x.id === id);
    if (!r) return;

    modalContent.innerHTML = `
        <h2>${r.name}</h2>
        <p>${r.desc}</p>
        <b>Ингредиенты:</b>
        <ul>${r.ingredients.map(x => `<li>${x}</li>`).join("")}</ul>
        <p><b>Время:</b> ${r.time} · <b>Сложность:</b> ${r.tag}</p>`;

    modal.classList.remove("hidden");

    const user = currentUser();
    if (user) {
        user.stats.opened++;
        saveCurrentUser(user);
        checkAchievements();
    }
}


/* ---------- ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ---------- */

function switchTab(name) {
    document.querySelectorAll(".nav-link").forEach(x =>
        x.classList.toggle("active", x.dataset.target === name)
    );

    document.querySelectorAll(".page").forEach(p =>
        p.classList.remove("active")
    );

    const page = document.querySelector("#page-" + name);
    if (page) page.classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-link").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.target));
});

const brand = document.querySelector(".brand");
if (brand) {
    brand.addEventListener("click", e => {
        e.preventDefault();
        switchTab("home");
    });
}


/* ---------- КЛИКИ ПО РЕЦЕПТАМ ---------- */

document.addEventListener("click", e => {
    const fav = e.target.closest("[data-fav]");
    if (fav) {
        const id = +fav.dataset.fav;
        favorites = favorites.includes(id)
            ? favorites.filter(x => x !== id)
            : [...favorites, id];

        localStorage.setItem("favorites", JSON.stringify(favorites));
        render();
        renderTo(fridgeResults, collectFridgeResults());

        setTimeout(() => {
            checkAchievements();
            if (document.querySelector("#page-profile").classList.contains("active")) {
                renderProfile();
            }
        }, 50);
        return;
    }

    const card = e.target.closest(".recipe");
    if (card) openRecipe(+card.dataset.id);
});


/* ---------- МОДАЛКА ---------- */

document.querySelector("#closeModal").addEventListener("click", () =>
    modal.classList.add("hidden")
);

modal.addEventListener("click", e => {
    if (e.target === modal) modal.classList.add("hidden");
});


/* ---------- КНОПКИ НА ГЛАВНОЙ ---------- */

document.querySelector("#fridgeOpen").addEventListener("click", () =>
    switchTab("fridge")
);

document.querySelector("#allRecipes").addEventListener("click", () =>
    switchTab("recipes")
);


/* ---------- ПОИСК В ШАПКЕ ---------- */

document.querySelector("#focusSearch").addEventListener("click", () => {
    if (!document.querySelector("#page-home").classList.contains("active")) {
        switchTab("home");
    }
    setTimeout(() => document.querySelector("#searchInput").focus(), 150);
});

document.querySelector("#searchForm").addEventListener("submit", e => {
    e.preventDefault();
    const q = document.querySelector("#searchInput").value.trim().toLowerCase();

    render(
        q
            ? recipes.filter(r =>
                (r.name + " " + r.desc + " " + r.cat + " " + r.ingredients.join(" "))
                    .toLowerCase()
                    .includes(q)
            )
            : recipes
    );

    const user = currentUser();
    if (user) {
        user.stats.searches++;
        saveCurrentUser(user);
        checkAchievements();
    }
});


/* ---------- ИЗБРАННОЕ ---------- */

document.querySelector("#openFavorites").addEventListener("click", () => {
    switchTab("recipes");
    renderTo(
        recipesPageGrid,
        recipes.filter(r => favorites.includes(r.id))
    );
});


/* ================= ПРОФИЛЬ + АВТОРИЗАЦИЯ + ДОСТИЖЕНИЯ ================= */

const USERS_KEY = "vc_users";
const CURRENT_KEY = "vc_current_user";

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
}
function saveUsers(u) {
    localStorage.setItem(USERS_KEY, JSON.stringify(u));
}

function currentUser() {
    const email = localStorage.getItem("vc_user_email");
    if (!email) return null;

    return {
        name: localStorage.getItem("vc_user_name") || "Пользователь",
        email: email,
        registered: parseInt(localStorage.getItem("vc_user_registered") || Date.now()),
        stats: JSON.parse(localStorage.getItem("vc_stats_" + email) || '{"opened":0,"fridgeSearches":0,"searches":0,"recipesPageVisits":0}'),
        achievements: JSON.parse(localStorage.getItem("vc_achv_" + email) || '["first_step"]')
    };
}

function saveCurrentUser(user) {
    if (!user) return;
    localStorage.setItem("vc_user_name", user.name);
    localStorage.setItem("vc_user_email", user.email);
    localStorage.setItem("vc_stats_" + user.email, JSON.stringify(user.stats));
    localStorage.setItem("vc_achv_" + user.email, JSON.stringify(user.achievements));
}


/* ---------- ДОСТИЖЕНИЯ ---------- */
const ACHIEVEMENTS = [
    { id: "first_step", icon: "👣", name: "Первый шаг", desc: "Зарегистрировался на сайте" },
    { id: "opened_1", icon: "🍳", name: "Новичок", desc: "Открыл 1 рецепт" },
    { id: "opened_5", icon: "👨‍🍳", name: "Кулинар", desc: "Открыл 5 рецептов" },
    { id: "opened_15", icon: "🔥", name: "Шеф-повар", desc: "Открыл 15 рецептов" },
    { id: "fav_1", icon: "❤️", name: "Первый фаворит", desc: "Добавил рецепт в избранное" },
    { id: "fav_5", icon: "💖", name: "Гурман", desc: "5 рецептов в избранном" },
    { id: "fav_10", icon: "😍", name: "Коллекционер", desc: "10 рецептов в избранном" },
    { id: "fridge_1", icon: "❄️", name: "Ревизор", desc: "Использовал поиск в холодильнике" },
    { id: "fridge_5", icon: "🧊", name: "Хозяин холодильника", desc: "5 поисков в холодильнике" },
    { id: "search_1", icon: "🔎", name: "Искатель", desc: "Воспользовался поиском" },
    { id: "week_1", icon: "📅", name: "Неделя с шефом", desc: "7 дней с нами" },
    { id: "recipes_5", icon: "📖", name: "Книголюб", desc: "Просмотрел раздел всех рецептов" },
];

function daysOnSite(user) {
    return Math.max(1, Math.ceil((Date.now() - user.registered) / 86400000));
}


/* ---------- ВЫДАЧА ДОСТИЖЕНИЙ ---------- */
function unlockAchievement(user, id) {
    if (!user.achievements.includes(id)) {
        user.achievements.push(id);
        saveCurrentUser(user);
        const ach = ACHIEVEMENTS.find(a => a.id === id);
        if (ach) showToast(`🏆 Достижение: ${ach.name}`);
    }
}

function checkAchievements() {
    const user = currentUser();
    if (!user) return;

    if (isSuperUser(user.email)) {
        const allIds = ACHIEVEMENTS.map(a => a.id);
        let changed = false;

        allIds.forEach(id => {
            if (!user.achievements.includes(id)) {
                user.achievements.push(id);
                changed = true;
            }
        });

        if (changed) saveCurrentUser(user);
        return;
    }

    if (user.stats.opened >= 1) unlockAchievement(user, "opened_1");
    if (user.stats.opened >= 5) unlockAchievement(user, "opened_5");
    if (user.stats.opened >= 15) unlockAchievement(user, "opened_15");

    const favCount = favorites.length;
    if (favCount >= 1) unlockAchievement(user, "fav_1");
    if (favCount >= 5) unlockAchievement(user, "fav_5");
    if (favCount >= 10) unlockAchievement(user, "fav_10");

    if (user.stats.fridgeSearches >= 1) unlockAchievement(user, "fridge_1");
    if (user.stats.fridgeSearches >= 5) unlockAchievement(user, "fridge_5");

    if (user.stats.searches >= 1) unlockAchievement(user, "search_1");

    if (user.stats.recipesPageVisits >= 1) unlockAchievement(user, "recipes_5");

    if (daysOnSite(user) >= 7) unlockAchievement(user, "week_1");
}


/* ---------- ВСПЛЫВАШКА ---------- */
function showToast(text) {
    const el = document.createElement("div");
    el.className = "vc-toast";
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add("show"), 30);
    setTimeout(() => {
        el.classList.remove("show");
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

const toastStyle = document.createElement("style");
toastStyle.textContent = `
.vc-toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #df2026;
    color: #fff;
    padding: 14px 24px;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 10px 30px rgba(223, 32, 38, .4);
    opacity: 0;
    transition: .3s;
    z-index: 999;
}
.vc-toast.show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
}`;
document.head.appendChild(toastStyle);


/* ---------- ОТРИСОВКА ПРОФИЛЯ ---------- */
function renderProfile() {
    const user = currentUser();
    const authBlock = document.querySelector("#authBlock");
    const userBlock = document.querySelector("#userBlock");

    if (!user) {
        authBlock.classList.remove("hidden");
        userBlock.classList.add("hidden");
        return;
    }

    authBlock.classList.add("hidden");
    userBlock.classList.remove("hidden");

    checkAchievements();

    const freshUser = currentUser();

    document.querySelector("#profileAvatar").textContent = freshUser.name[0].toUpperCase();

    const isAdmin = isAdminUser(freshUser.email);
    const isSuper = isSuperUser(freshUser.email);

    let displayName = freshUser.name;
    if (isAdmin) displayName = "👑 " + freshUser.name;
    else if (isSuper) displayName = "⭐ " + freshUser.name;

    document.querySelector("#profileName").textContent = displayName;
    document.querySelector("#profileEmail").textContent = freshUser.email;
    document.querySelector("#profileDate").textContent =
        new Date(freshUser.registered).toLocaleDateString("ru-RU");

    document.querySelector("#statOpened").textContent = freshUser.stats.opened;
    document.querySelector("#statFavs").textContent = favorites.length;

    let achvText = `${freshUser.achievements.length}/${ACHIEVEMENTS.length}`;
    if (isSuper) achvText += " ⭐";
    document.querySelector("#statAchv").textContent = achvText;

    document.querySelector("#statDays").textContent = daysOnSite(freshUser);

    const grid = document.querySelector("#achievementsGrid");
    grid.innerHTML = ACHIEVEMENTS.map(a => {
        const unlocked = freshUser.achievements.includes(a.id);
        return `
            <div class="achievement ${unlocked ? "unlocked" : "locked"}">
                <span class="ach-icon">${a.icon}</span>
                <b>${a.name}</b>
                <small>${a.desc}</small>
            </div>`;
    }).join("");

    const favContainer = document.querySelector("#profileFavorites");
    const favRecipes = recipes.filter(r => favorites.includes(r.id));
    if (!favRecipes.length) {
        favContainer.innerHTML = `<div class="empty">Пока нет избранных рецептов. Добавляйте ♡ на карточках.</div>`;
    } else {
        renderTo(favContainer, favRecipes);
    }
}


/* ---------- ФОРМЫ АВТОРИЗАЦИИ ---------- */
const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");

document.querySelectorAll(".auth-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const mode = tab.dataset.auth;
        loginForm.classList.toggle("hidden", mode !== "login");
        registerForm.classList.toggle("hidden", mode !== "register");
    });
});

// РЕГИСТРАЦИЯ
registerForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.querySelector("#regName").value.trim();
    const email = document.querySelector("#regEmail").value.trim().toLowerCase();
    const password = document.querySelector("#regPassword").value;
    const err = document.querySelector("#regError");

    if (name.length < 2) {
        err.textContent = "Имя слишком короткое";
        return;
    }

    if (isForbiddenName(name)) {
        err.textContent = "Это имя занято или запрещено. Придумайте другое.";
        return;
    }

    try {
        err.textContent = "Создаём аккаунт...";

        const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(
            window.firebaseAuth.auth,
            email,
            password
        );

        await window.firebaseAuth.updateProfile(userCredential.user, {
            displayName: name
        });

        localStorage.setItem("vc_user_name", name);
        localStorage.setItem("vc_user_email", email);
        localStorage.setItem("vc_user_registered", Date.now());
        localStorage.setItem("vc_stats_" + email, '{"opened":0,"fridgeSearches":0,"searches":0,"recipesPageVisits":0}');
        localStorage.setItem("vc_achv_" + email, '["first_step"]');

        err.textContent = "";
        registerForm.reset();
        showToast("👋 Добро пожаловать, " + name + "!");
        renderProfile();
    } catch (error) {
        const msgs = {
            "auth/email-already-in-use": "Этот email уже зарегистрирован",
            "auth/invalid-email": "Некорректный email",
            "auth/weak-password": "Пароль слишком простой (минимум 6 символов)",
        };
        err.textContent = msgs[error.code] || "Ошибка: " + error.message;
    }
});

// ВХОД
loginForm?.addEventListener("submit", async e => {
    e.preventDefault();
    const email = document.querySelector("#loginEmail").value.trim().toLowerCase();
    const password = document.querySelector("#loginPassword").value;
    const err = document.querySelector("#loginError");

    try {
        err.textContent = "Входим...";

        await window.firebaseAuth.signInWithEmailAndPassword(
            window.firebaseAuth.auth,
            email,
            password
        );

        localStorage.setItem("vc_user_email", email);
        if (!localStorage.getItem("vc_user_name")) {
            localStorage.setItem("vc_user_name", "Пользователь");
        }

        err.textContent = "";
        loginForm.reset();
        showToast("👋 С возвращением!");
        renderProfile();
    } catch (error) {
        const msgs = {
            "auth/user-not-found": "Пользователь не найден",
            "auth/wrong-password": "Неверный пароль",
            "auth/invalid-credential": "Неверный email или пароль",
            "auth/invalid-email": "Некорректный email",
        };
        err.textContent = msgs[error.code] || "Ошибка входа";
    }
});

// ВЫХОД
document.querySelector("#logoutBtn")?.addEventListener("click", async () => {
    try {
        await window.firebaseAuth.signOut(window.firebaseAuth.auth);
        localStorage.removeItem("vc_user_email");
        showToast("Вы вышли из аккаунта");
        renderProfile();
    } catch (error) {
        console.error("Ошибка выхода:", error);
    }
});

// Кнопка профиля
document.querySelector("#profileBtn").addEventListener("click", () => {
    switchTab("profile");
    renderProfile();
});


/* ---------- СЧЁТЧИКИ ДЛЯ ДОСТИЖЕНИЙ ---------- */

document.querySelector("#fridgeSearchForm")?.addEventListener("submit", () => {
    const user = currentUser();
    if (user && document.querySelector("#fridgeInput").value.trim()) {
        user.stats.fridgeSearches++;
        saveCurrentUser(user);
        checkAchievements();
    }
});

document.querySelectorAll('[data-target="recipes"]').forEach(btn => {
    btn.addEventListener("click", () => {
        const user = currentUser();
        if (user) {
            user.stats.recipesPageVisits++;
            saveCurrentUser(user);
            checkAchievements();
        }
    });
});


/* ---------- ФИЛЬТРЫ-ЧИПСЫ ---------- */

function setupChips(container, targetGrid) {
    if (!container) return;

    container.addEventListener("click", e => {
        const b = e.target.closest(".chip");
        if (!b) return;

        container.querySelectorAll(".chip").forEach(x =>
            x.classList.remove("active")
        );
        b.classList.add("active");

        const filtered =
            b.dataset.cat === "Все"
                ? recipes
                : recipes.filter(r => r.cat === b.dataset.cat);

        renderTo(targetGrid, filtered);
    });
}

setupChips(document.querySelector("#chips"), grid);
setupChips(document.querySelector("#chipsPage"), recipesPageGrid);


/* ---------- ХОЛОДИЛЬНИК ---------- */

const fridgeForm = document.querySelector("#fridgeSearchForm");
const fridgeInput = document.querySelector("#fridgeInput");

function normalize(word) {
    return word
        .toLowerCase()
        .replace(/[^а-яёa-z0-9]/gi, "")
        .replace(/(ами|ями|ов|ев|ей|ой|ый|ий|ая|яя|ое|ее|ые|ие|у|ю|а|я|ы|и|е|о|ь)$/u, "")
        .trim();
}

function findFridgeRecipes(query) {
    const words = query
        .split(/[,\s]+/)
        .map(w => normalize(w))
        .filter(w => w.length >= 3);

    if (!words.length) return [];

    return recipes.filter(r =>
        words.some(w =>
            r.ingredients.some(ing => {
                const normIng = normalize(ing);
                return normIng.includes(w) || w.includes(normIng);
            })
        )
    );
}

function collectFridgeResults() {
    if (!fridgeInput || !fridgeInput.value.trim()) return [];
    return findFridgeRecipes(fridgeInput.value.trim());
}

if (fridgeForm) {
    fridgeForm.addEventListener("submit", e => {
        e.preventDefault();
        const q = fridgeInput.value.trim();

        if (!q) {
            fridgeResults.innerHTML = `<div class="empty">Введите продукты, которые у вас есть.</div>`;
            return;
        }

        const found = findFridgeRecipes(q);

        if (!found.length) {
            fridgeResults.innerHTML = `<div class="empty">Ничего не нашлось. Попробуйте другие продукты.</div>`;
            return;
        }

        renderTo(fridgeResults, found);
    });
}

const allFromFridge = document.querySelector("#allRecipesFromFridge");
if (allFromFridge) {
    allFromFridge.addEventListener("click", () => switchTab("recipes"));
}


/* ---------- СТАРТ ---------- */

render();
renderProfile();


/* ---------- АВТО-ОБНОВЛЕНИЕ ПРОФИЛЯ ---------- */

async function initAuthListener() {
    while (!window.firebaseAuth) {
        await new Promise(r => setTimeout(r, 100));
    }

    window.firebaseAuth.onAuthStateChanged(window.firebaseAuth.auth, async (user) => {
        if (user) {
            localStorage.setItem("vc_user_email", user.email);

            let name = user.displayName || localStorage.getItem("vc_user_name");

            if (!name || name === "Пользователь") {
                name = localStorage.getItem("vc_user_name") || "Пользователь";
            }

            localStorage.setItem("vc_user_name", name);

            const tempUser = currentUser();
            if (tempUser && isSuperUser(tempUser.email)) {
                const allIds = ACHIEVEMENTS.map(a => a.id);
                let changed = false;
                allIds.forEach(id => {
                    if (!tempUser.achievements.includes(id)) {
                        tempUser.achievements.push(id);
                        changed = true;
                    }
                });
                if (changed) saveCurrentUser(tempUser);
            }
        } else {
            localStorage.removeItem("vc_user_email");
        }

        renderProfile();
    });
}

initAuthListener();


/* ================= КАЛЕНДАРЬ НАГРАД ================= */

const MONTHS = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
];

function starsForDay(date) {
    const dow = date.getDay();
    return (dow === 0 || dow === 6) ? 30 : 15;
}

function dateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function getClaimed() {
    return JSON.parse(localStorage.getItem("vc_claimed_days") || "{}");
}
function saveClaimed(obj) {
    localStorage.setItem("vc_claimed_days", JSON.stringify(obj));
}
function getStars() {
    return parseInt(localStorage.getItem("vc_stars") || "0");
}
function setStars(n) {
    localStorage.setItem("vc_stars", String(n));
    updateStarsBalance();
}

function updateStarsBalance() {
    const el = document.querySelector("#starsCount");
    if (el) el.textContent = getStars();
}

function recalcBalance() {
    const claimed = getClaimed();
    let total = 0;
    Object.values(claimed).forEach(n => total += n);
    setStars(total);
}

function countStreak() {
    const claimed = getClaimed();
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = dateKey(d);
        if (claimed[key]) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }
    return streak;
}

function renderRewards() {
    const tbody = document.querySelector("#rewardsBody");
    if (!tbody) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const titleEl = document.querySelector("#rewardsTitle");
    if (titleEl) titleEl.textContent = `${MONTHS[month]} ${year}`;

    tbody.innerHTML = "";

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const claimed = getClaimed();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let monthTotal = 0;

    const allCells = [];
    for (let i = 0; i < startOffset; i++) {
        allCells.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
        allCells.push(new Date(year, month, d));
    }

    const weeks = [];
    for (let i = 0; i < allCells.length; i += 7) {
        weeks.push(allCells.slice(i, i + 7));
    }

    weeks.forEach(week => {
        const tr = document.createElement("tr");

        week.forEach(date => {
            const td = document.createElement("td");

            if (!date) {
                td.className = "empty-cell";
                tr.appendChild(td);
                return;
            }

            const key = dateKey(date);
            const reward = starsForDay(date);

            const dateOnly = new Date(date);
            dateOnly.setHours(0, 0, 0, 0);

            const isToday = dateOnly.getTime() === today.getTime();
            const isPast = dateOnly < today;
            const isFuture = dateOnly > today;

            const num = document.createElement("div");
            num.className = "day-num-cell";
            num.textContent = date.getDate();
            td.appendChild(num);

            const content = document.createElement("div");
            content.className = "day-content";

            const badge = document.createElement("span");
            const rewardEl = document.createElement("div");
            rewardEl.className = "day-reward";

            if (claimed[key]) {
                badge.className = "status-badge claimed";
                badge.textContent = "Забрано";
                rewardEl.innerHTML = `+${reward} <span class="star-icon">⭐</span>`;
                monthTotal += claimed[key];
                td.classList.add("claimed-cell");
                if (isToday) td.classList.add("claimed-today");
            } else if (isToday) {
                badge.className = "status-badge available";
                badge.textContent = "Забрать";
                rewardEl.innerHTML = `+${reward} <span class="star-icon">⭐</span>`;
                td.classList.add("today-cell");
                td.addEventListener("click", () => claimDay(key, reward));
            } else if (isPast) {
                badge.className = "status-badge missed";
                badge.textContent = "Не забрано";
                rewardEl.innerHTML = `+${reward} <span class="star-icon">⭐</span>`;
                td.classList.add("missed-cell");
            } else if (isFuture) {
                badge.className = "status-badge available";
                badge.textContent = "Доступно";
                rewardEl.innerHTML = `+${reward} <span class="star-icon">⭐</span>`;
                td.classList.add("future-cell");
            }

            content.appendChild(badge);
            content.appendChild(rewardEl);
            td.appendChild(content);

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    const balanceEl = document.querySelector("#rewardsBalance");
    const monthEl = document.querySelector("#rewardsMonthTotal");
    const streakEl = document.querySelector("#rewardsStreak");

    if (balanceEl) balanceEl.textContent = getStars();
    if (monthEl) monthEl.textContent = monthTotal;
    if (streakEl) streakEl.textContent = countStreak();
}

function claimDay(key, reward) {
    const claimed = getClaimed();
    if (claimed[key]) return;

    claimed[key] = reward;
    saveClaimed(claimed);

    setStars(getStars() + reward);
    showToast(`⭐ +${reward} звёзд! Баланс: ${getStars()}`);
    renderRewards();
}

document.querySelector("#calendarBtn")?.addEventListener("click", () => {
    switchTab("rewards");
    renderRewards();
});

updateStarsBalance();
recalcBalance();