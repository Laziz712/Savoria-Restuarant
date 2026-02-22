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

  const TOKEN = "8129270648:AAGkSR08g2oZbNUWdoCqMyiUAdnWtLaQD4k";
  const CHAT_ID = "8584049635";

  const message = `
🔔 YANGI BRON QILISH!
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
👤 Mijoz: ${name}
📧 Email: ${email}
📞 Telefon: ${phone}

📅 Sana: ${date}
⏰ Vaqt: ${time}
👥 Mehmonlar soni: ${guests} kishi
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
✅ Iltimos, mijoz bilan bog'lanib tasdiqlang.
`;

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
    status.innerText = "Xatolik serverda yuz berdi ❌";
    console.error(err);
    status.style.textAlign = "center";
    status.style.marginTop = "20px";
    status.style.fontFamily = "Playfair Display serif";
    status.style.fontSize = "20px"
  });
}
