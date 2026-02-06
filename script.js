const menuToggleEl = document.getElementById("menu-toggle");
const navLinksEl = document.getElementById("nav-links");

menuToggleEl.addEventListener("click", () => {
  navLinksEl.classList.toggle("active");
});

function sendTelegram() {
  const form = document.getElementById('reservationForm');
  const status = document.getElementById('status');

  const name = form.elements['name'].value;
  const email = form.elements['email'].value;
  const phone = form.elements['phone'].value;
  const date = form.elements['date'].value;
  const time = form.elements['time'].value;
  const guests = form.elements['guests'].value;

  const TOKEN = "8129270648:AAHFKCMRO8F1SamS1l9-eXIZ_y2qgwS74-s";
  const CHAT_ID = "8584049635";

  const message = `Yangi registratsiya:\nIsm: ${name}\nEmail: ${email}\nPhone: ${phone}\nDate: ${date}\nTime: ${time}\nGuests: ${guests}`;

  fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message
    })
  })
  
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      status.innerText = "Xabar yuborildi ✅";
      form.reset();
      status.style.textAlign = "center";
      status.style.marginTop = "20px";
      status.style.fontFamily = "Playfair Display serif";
      status.style.fontSize = "20px"
    } else {
      status.innerText = "Xatolik yuz berdi ❌";
      console.error(data);
      status.style.textAlign = "center";
      status.style.marginTop = "20px";
      status.style.fontFamily = "Playfair Display serif";
      status.style.fontSize = "20px"
    }
  })
  
  .catch(err => {
    status.innerText = "Xatolik yuz berdi ❌";
    console.error(err);
    status.style.textAlign = "center";
    status.style.marginTop = "20px";
    status.style.fontFamily = "Playfair Display serif";
    status.style.fontSize = "20px"
  });
}

// 8129270648:AAHFKCMRO8F1SamS1l9-eXIZ_y2qgwS74-s

const TelegramBot = require('node-telegram-bot-api');

const TOKEN = "8129270648:AAHFKCMRO8F1SamS1l9-eXIZ_y2qgwS74-s";
const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Xush kelibsiz! Kerakli bo'limni tanlang 👇", {
    reply_markup: {
      keyboard: [
        ["🛒 Joy buyurtma qilish"],
        ["🌐 Saytga o‘tish", "📷 Instagram"],
        ["📍 Location yuborish"]
      ],
      resize_keyboard: true,
      one_time_keyboard: false
    }
  });
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "🛒 Joy buyurtma qilish") {
    bot.sendMessage(chatId, "📞 Buyurtma berish uchun raqam qoldiring");
  }

  if (text === "🌐 Saytga o'tish") {
    bot.sendMessage(chatId, "👉 Saytimiz: https://laziz712.github.io/Savoria-Restuarant/");
  }

  if (text === "📷 Instagram") {
    bot.sendMessage(chatId, "👉 Instagram: https://www.instagram.com/savoria_restaurant/");
  }

  if (text === "📍 Location yuborish") {
    bot.sendMessage(chatId, "📍 Iltimos location yuboring", {
      reply_markup: {
        keyboard: [[{ text: "📍 Location yuborish", request_location: true }]],
        resize_keyboard: true
      }
    });
  }
});