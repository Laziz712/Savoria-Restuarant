const menuToggle = document.getElementById('menu-toggle');
const navLinks = document.getElementById('nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('nav-active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('nav-active');
    });
});

const today = new Date().toISOString().split('T')[0];
const dateInput = document.querySelector('input[name="date"]');
    
if (dateInput) {
    dateInput.setAttribute('min', today);
    dateInput.value = today;
}

const langBtn = document.getElementById("lang-main-btn");
const langDropdown = document.querySelector(".language-dropdown");

langBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle("active");
});

document.addEventListener("click", () => {
    langDropdown.classList.remove("active");
});

function changeLanguage(lang) {
    fetch(`./${lang}.json`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('nav-home').innerText = data.nav.home;
            document.getElementById('nav-about').innerText = data.nav.about;
            document.getElementById('nav-menu').innerText = data.nav.menu;
            document.getElementById('nav-res').innerText = data.nav.reservations;
            document.getElementById('nav-contact').innerText = data.nav.contact;
            document.getElementById('lang-main-btn').innerText = data.nav.lang_btn;
        })
        .catch(err => console.error("Xatolik:", err));
}

function sendTelegram() {
  const form = document.getElementById('reservationForm');
  const status = document.getElementById('status');

  const name = form.elements['name'].value;
  const email = form.elements['email'].value;
  const phone = form.elements['phone'].value;
  const date = form.elements['date'].value;
  const time = form.elements['time'].value;
  const guests = form.elements['guests'].value;

  const TOKEN = "8129270648:AAHKAXcyVTOhPEgebXtQqqe28OSDjMtnZv4";
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
      status.innerText = "Xatolik serverda yuz berdi ❌";
      console.error(data);
      status.style.textAlign = "center";
      status.style.marginTop = "20px";
      status.style.fontFamily = "Playfair Display serif";
      status.style.fontSize = "20px"
    }
  })
  
  .catch(err => {
    status.innerText = "Xatolik internetga ulanganinggizga ishonch xosil qiling ❌";
    console.error(err);
    status.style.textAlign = "center";
    status.style.marginTop = "20px";
    status.style.fontFamily = "Playfair Display serif";
    status.style.fontSize = "20px"
  });
}

function changeLanguage(lang) {
    fetch(`./${lang}.json`)
    .then(response => {
        if (!response.ok) throw new Error("Tarjima fayli topilmadi!");
        return response.json();
    })
    .then(data => {
        const setTxt = (id, text) => {
            const el = document.getElementById(id);
            if (el && text !== undefined) {
                el.innerText = text;
            }
        };

        const setHtml = (id, html) => {
            const el = document.getElementById(id);
            if (el && html !== undefined) {
                el.innerHTML = html;
            }
        };

        const langBtn = document.getElementById('lang-main-btn');
        if (langBtn) langBtn.textContent = data.nav.languages;
        
        setTxt('nav-home', data.nav.home);
        setTxt('nav-about', data.nav.about);
        setTxt('nav-menu', data.nav.menu);
        setTxt('nav-res', data.nav.reservations);
        setTxt('nav-contact', data.nav.contact);

        setTxt('sectionh1', data.section.sectionh1);
        setTxt('sectionp', data.section.sectionp);
        setTxt('sectionbtn', data.section.sectionbtn);

        setTxt('text2h1', data.topBarText2.text2h1);
        setTxt('text2p', data.topBarText2.text2p);
        setTxt('p1', data.topBarTextFlexText.p1);
        setTxt('p2', data.topBarTextFlexText.p2);
        setTxt('p3', data.topBarTextFlexText.p3);

        setTxt('cardh41', data.topBarIconFlexCard.cardh41);
        setTxt('cardp1', data.topBarIconFlexCard.cardp1);
        setTxt('cardh42', data.topBarIconFlexCard.cardh42);
        setTxt('cardp2', data.topBarIconFlexCard.cardp2);
        setTxt('cardh43', data.topBarIconFlexCard.cardh43);
        setTxt('cardp3', data.topBarIconFlexCard.cardp3);

        setTxt('text3h1', data.menu.text3h1);
        setTxt('text3p', data.menu.text3p);
        setTxt('menuh4', data.menu.menuh4);
        setTxt('menubtn', data.menu.menubtn);

        setTxt('boxh3', data.menuBoxFlexBox.boxh3);
        setTxt('boxspan', data.menuBoxFlexBox.boxspan);
        setTxt('boxp', data.menuBoxFlexBox.boxp);
        setTxt('boxh5', data.menuBoxFlexBox.boxh5);

        setTxt('boxh32', data.menuBoxFlexBox.boxh32);
        setTxt('boxspan-2', data.menuBoxFlexBox.boxspan2); 
        setTxt('boxp2', data.menuBoxFlexBox.boxp2);
        setTxt('boxh52', data.menuBoxFlexBox.boxh52);

        setTxt('boxh33', data.menuBoxFlexBox.boxh33);
        setTxt('boxspan-3', data.menuBoxFlexBox.boxspan3);
        setTxt('boxp3', data.menuBoxFlexBox.boxp3);
        setTxt('boxh53', data.menuBoxFlexBox.boxh53);

        setTxt('boxh34', data.menuBoxFlexBox.boxh34);
        setTxt('boxspan-4', data.menuBoxFlexBox.boxspan4);
        setTxt('boxp4', data.menuBoxFlexBox.boxp4);
        setTxt('boxh54', data.menuBoxFlexBox.boxh54);

        setTxt('text4h1', data.gallery.text4h1);
        setTxt('text4p', data.gallery.text4p);

        setTxt('make-h1', data.makeSection.h1);
        setTxt('make-p', data.makeSection.p);
        setTxt('label-name', data.makeSection.labelName);
        setTxt('label-email', data.makeSection.labelEmail);
        setTxt('label-phone', data.makeSection.labelPhone);
        setTxt('label-date', data.makeSection.labelDate);
        setTxt('label-time', data.makeSection.labelTime);
        setTxt('label-guests', data.makeSection.labelGuests);
        setTxt('label-guests-2', data.makeSection.labelGuests2);
        setTxt('submit-btn', data.makeSection.submitBtn);
        setTxt('note-text', data.makeSection.noteText);

        setTxt('guests1', data.makeSection.guests1);
        setTxt('guests2', data.makeSection.guests2);
        setTxt('guests3', data.makeSection.guests3);
        setTxt('guests4', data.makeSection.guests4);
        setTxt('guests5', data.makeSection.guests5);
        setTxt('guests6', data.makeSection.guests6);

        setTxt('contact-h1', data.cardContact.text6['contact-h1']);
        setTxt('contact-p', data.cardContact.text6['contact-p']);
        setTxt('loc-h4', data.cardContact.labels['loc-h4']);
        setTxt('phone-h4', data.cardContact.labels['phone-h4']);
        setTxt('email-h4', data.cardContact.labels['email-h4']);
        setTxt('hours-h4', data.cardContact.labels['hours-h4']);

        setHtml('loc-p', data.cardContact.labels['loc-p']);
        setHtml('phone-p', data.cardContact.labels['phone-p']);
        setHtml('email-p', data.cardContact.labels['email-p']);
        setHtml('hours-p', data.cardContact.labels['hours-p']);

        setTxt('map-h4', data.mapSection['map-h4']);
        setTxt('map-p', data.mapSection['map-p']);

        setTxt('footer-p', data.footer['footer-p']);
        setTxt('footer-links-h3', data.footer['footer-links-h3']);
        setTxt('footer-home', data.footer['footer-home']);
        setTxt('footer-about', data.footer['footer-about']);
        setTxt('footer-menu', data.footer['footer-menu']);
        setTxt('footer-res', data.footer['footer-res']);
        setTxt('footer-contact', data.footer['footer-contact']);
        setTxt('footer-social-h3', data.footer['footer-social-h3']);
        setTxt('footer-rights', data.footer['footer-rights']);

    })
    .catch(error => console.error("Tarjima yuklashda xatolik:", error));
}

document.addEventListener('DOMContentLoaded', () => {
    changeLanguage('uz'); 
});
