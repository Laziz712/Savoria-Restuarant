import { 
  MenuItem, Courier, Waiter, AdminUser, Order, 
  RestaurantSettings, RestaurantTable, ChefProfile, 
  CustomerReview, TableReservation 
} from '../types';
import wagyuImg from '../assets/images/savoria_wagyu_steak_1791475866836.jpg';
import plovImg from '../assets/images/savoria_plov_special_1791475881101.jpg';
import cocktailImg from '../assets/images/savoria_cocktail_drink_1791475891055.jpg';
import burrataImg from '../assets/images/savoria_gourmet_salad_1791475898828.jpg';
import salmonImg from '../assets/images/savoria_salmon_steak_1791907964166.jpg';
import qozonKabobImg from '../assets/images/savoria_qozon_kabob_1791907965394.jpg';
import tomyamImg from '../assets/images/savoria_tomyam_soup_1791907965553.jpg';
import cheesecakeImg from '../assets/images/savoria_cheesecake_1791907966398.jpg';
import turkishCoffeeImg from '../assets/images/savoria_turkish_coffee_1791907981801.jpg';
import burgerImg from '../assets/images/savoria_truffle_burger_1791907981609.jpg';
import executiveChefImg from '../assets/images/savoria_executive_chef_1791908436337.jpg';
import sousChefImg from '../assets/images/savoria_sous_chef_1791908438251.jpg';
import pastryChefImg from '../assets/images/savoria_pastry_chef_1791908439484.jpg';
import restaurantInteriorImg from '../assets/images/savoria_restaurant_interior_1791908438858.jpg';
import gijduvonShashlikImg from '../assets/images/savoria_gijduvon_shashlik_1792768139844.jpg';
import turkishBaklavaImg from '../assets/images/savoria_turkish_baklava_1792768140835.jpg';
import kozaShorvaImg from '../assets/images/savoria_koza_shorva_1792768141238.jpg';
import vipHallImg from '../assets/images/savoria_vip_hall_1792768141891.jpg';

export { restaurantInteriorImg, vipHallImg, gijduvonShashlikImg, turkishBaklavaImg, kozaShorvaImg };

export const INITIAL_SETTINGS: RestaurantSettings = {
  name: 'SAVORIA RESTAURANT',
  slogan: 'Sharqona Mehmondo‘stlik & Yuksak Gastronomik San’at',
  address: 'Toshkent sh., Chilonzor tumani, Bunyodkor shoh ko\'chasi 45-uy',
  phone: '+998 71 200-71-12',
  stir: '309 814 552',
  serviceFeePercent: 12,
  headerMessage: 'Savoria Restoraniga xush kelibsiz!',
  footerReceiptMessage: 'Tashrifingiz uchun minnatdormiz! Yoqimli ishtaha tilaymiz.',
  wifiPassword: 'savoria_vip_guest'
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'm-1',
    name: 'To‘y Oshi (Savoria Maxsus Osh)',
    category: 'milliy',
    price: 68000,
    description: 'Barra qo‘zichoq go‘shti, lazer guruch, shirin sariq sabzi, no‘xat, mayiz, qazi va bedana tuxumlari bilan shohona damlangan milliy osh.',
    image: plovImg,
    prepTimeMinutes: 18,
    isAvailable: true,
    station: 'oshxona',
    calories: 890,
    weightGrams: 450,
    isChefSpecial: true,
    isHit: true,
    rating: 4.9,
    reviewsCount: 142,
    ingredients: ["Qo'zichoq go'shti", "Lazer guruch", "Sariq sabzi", "Zirk", "Qazi"]
  },
  {
    id: 'm-2',
    name: 'Tandir Qozon Kabob',
    category: 'milliy',
    price: 95000,
    description: 'Qozonda tillarang bo‘lib qovurilgan va tandir taftida dimlangan barra qo‘y qovurg‘asi, karsildoq yosh kartoshka va archilgan piyoz sumax bilan.',
    image: qozonKabobImg,
    prepTimeMinutes: 22,
    isAvailable: true,
    station: 'oshxona',
    calories: 920,
    weightGrams: 450,
    isChefSpecial: true,
    isHit: true,
    rating: 4.9,
    reviewsCount: 118,
    ingredients: ["Qo'y qovurg'asi", "Yosh kartoshka", "Yupqa piyoz", "Sumax"]
  },
  {
    id: 'm-3',
    name: 'G‘ijduvoncha Qiyma Shashlik',
    category: 'shashlik',
    price: 32000,
    description: 'Qadimiy G‘ijduvon retsepti bo‘yicha yumshoq va sersuv qilib tayyorlangan, ko‘mir cho‘g‘ida qizartirilgan mashhur qiyma kabob.',
    image: gijduvonShashlikImg,
    prepTimeMinutes: 14,
    isAvailable: true,
    station: 'mangal',
    calories: 380,
    weightGrams: 180,
    isChefSpecial: true,
    isHit: true,
    rating: 4.8,
    reviewsCount: 95,
    ingredients: ["Barra go'sht", "Dumba yog'i", "Kashnich", "Zira", "Piyoz"]
  },
  {
    id: 'm-4',
    name: 'Kuskovoy Qo‘zichoq Shashlik',
    category: 'shashlik',
    price: 38000,
    description: 'Saralangan barra qo‘zichoq go‘shti, nozik dumba bo‘laklari va maxsus sharq ziravorlari bilan cho‘g‘da pishirilgan xushxo‘r kabob.',
    image: gijduvonShashlikImg,
    prepTimeMinutes: 16,
    isAvailable: true,
    station: 'mangal',
    calories: 420,
    weightGrams: 200,
    isChefSpecial: false,
    isHit: true,
    rating: 4.9,
    reviewsCount: 88,
    ingredients: ["Qo'zichoq go'shti", "Dumba", "Maxsus marinad", "Piyoz"]
  },
  {
    id: 'm-5',
    name: 'Ribeye Steak Premium (Black Angus)',
    category: 'steak',
    price: 185000,
    description: 'Marmar sifatli Black Angus bifshteksi, yangi rozmarin shoxi, sarimsoqli sariyog‘ va grilda pishirilgan sabzavotlar bilan.',
    image: wagyuImg,
    prepTimeMinutes: 20,
    isAvailable: true,
    station: 'mangal',
    calories: 780,
    weightGrams: 350,
    isChefSpecial: true,
    isHit: true,
    rating: 5.0,
    reviewsCount: 76,
    ingredients: ["Black Angus go'shti", "Rozmarin", "Sarimsoq yog'i", "Dengiz tuzi"]
  },
  {
    id: 'm-6',
    name: 'Ko‘za Sho‘rva (Tandirda)',
    category: 'shorvalar',
    price: 52000,
    description: 'Maxsus sopol ko‘zada past olovda uzoq vaqt qaynatilgan barra qo‘zichoq go‘shti, no‘xat, mayin sabzavotlar va shifobaxsh tillarang bulyon.',
    image: kozaShorvaImg,
    prepTimeMinutes: 18,
    isAvailable: true,
    station: 'oshxona',
    calories: 460,
    weightGrams: 400,
    isChefSpecial: false,
    rating: 4.9,
    reviewsCount: 64,
    ingredients: ["Barra go'sht", "No'xat", "Kartoshka", "Sabzi", "Shivit"]
  },
  {
    id: 'm-7',
    name: 'Achchiq-Chuchuk (Anorli)',
    category: 'salatlar',
    price: 26000,
    description: 'Yupqa qilib to‘g‘ralgan xushbo‘y pomidor, archilgan piyoz, rayhon va shirin anor donalari bilan bezatilgan milliy tansiq salat.',
    image: burrataImg,
    prepTimeMinutes: 6,
    isAvailable: true,
    station: 'salat',
    calories: 120,
    weightGrams: 250,
    isChefSpecial: false,
    isSpicy: true,
    rating: 4.8,
    reviewsCount: 82,
    ingredients: ["Yupqa pomidor", "Qizil piyoz", "Qalampir", "Anor donalari", "Rayhon"]
  },
  {
    id: 'm-8',
    name: 'Turkcha Pista Paxlava (Gaziantep)',
    category: 'shirinliklar',
    price: 48000,
    description: '40 qavat yupqa yoyilgan qatlama xamir, Gaziantepning saralangan zumrad pistasi va toza sariyog‘ sharbati bilan tayyorlangan asl turk paxlavasi.',
    image: turkishBaklavaImg,
    prepTimeMinutes: 5,
    isAvailable: true,
    station: 'salat',
    calories: 490,
    weightGrams: 160,
    isChefSpecial: true,
    isHit: true,
    rating: 5.0,
    reviewsCount: 110,
    ingredients: ["Qatlama xamir", "Gaziantep pistasi", "Toza sariyog'", "Tabiiy sirop"]
  },
  {
    id: 'm-9',
    name: 'Norin & Qazi Assorti',
    category: 'milliy',
    price: 58000,
    description: 'Pichoqda yupqa kesilgan an’anaviy xamir, barra ot go‘shti qazisi, xushbo‘y zira va qaynoq piyola sho‘rvasi bilan taqdim etiladi.',
    image: plovImg,
    prepTimeMinutes: 10,
    isAvailable: true,
    station: 'oshxona',
    calories: 580,
    weightGrams: 350,
    isChefSpecial: false,
    rating: 4.9,
    reviewsCount: 73,
    ingredients: ["Yupqa xamir", "Ot go'shti qazi", "Qora murch", "Zira"]
  },
  {
    id: 'm-10',
    name: 'T-Bone Steak (Dry-Aged)',
    category: 'steak',
    price: 210000,
    description: '28 kun davomida yetiltirilgan suyakli T-Bone steyki, file va striploin uyg‘unligi, mangalda pishgan pomidor va qalampir bilan.',
    image: wagyuImg,
    prepTimeMinutes: 24,
    isAvailable: true,
    station: 'mangal',
    calories: 860,
    weightGrams: 500,
    isChefSpecial: true,
    rating: 4.9,
    reviewsCount: 42,
    ingredients: ["Dry-Aged T-bone", "Dengiz tuzi", "Gril sabzavotlar", "Rozmarin"]
  },
  {
    id: 'm-11',
    name: 'San Sebastian Cheesecake',
    category: 'shirinliklar',
    price: 42000,
    description: 'Ustki qavati mayin karamellangan nozik pishloqli desert, issiq Belgiya qora shokolad sousi va yangi rezavor mevalar bilan.',
    image: cheesecakeImg,
    prepTimeMinutes: 5,
    isAvailable: true,
    station: 'salat',
    calories: 460,
    weightGrams: 200,
    isChefSpecial: false,
    rating: 4.9,
    reviewsCount: 98,
    ingredients: ["Krem pishloq", "Qaymoq", "Issiq Belgiya shokoladi"]
  },
  {
    id: 'm-12',
    name: 'Yangi Siqilgan Anor Sharbat (Fresh 300ml)',
    category: 'ichimliklar',
    price: 35000,
    description: 'Kuyoshli Surxondaryo anorlaridan yangi siqib tayyorlangan 100% tabiiy, shifobaxsh va tetiklashtiruvchi sharbat.',
    image: cocktailImg,
    prepTimeMinutes: 5,
    isAvailable: true,
    station: 'bar',
    calories: 140,
    weightGrams: 300,
    isChefSpecial: false,
    rating: 5.0,
    reviewsCount: 89,
    ingredients: ["100% tabiiy anor", "Muz bo'laklari"]
  },
  {
    id: 'm-13',
    name: 'Mualliflik Sitrus & Marakuya Limonadi (1L)',
    category: 'ichimliklar',
    price: 42000,
    description: 'Yangi apelsin, laym sharbati, tropik marakuya pyuresi va bog‘ yalpizi bilan tayyorlangan shohona tetiklashtiruvchi mualliflik limonadi.',
    image: cocktailImg,
    prepTimeMinutes: 5,
    isAvailable: true,
    station: 'bar',
    calories: 180,
    weightGrams: 1000,
    isChefSpecial: true,
    isHit: true,
    rating: 4.9,
    reviewsCount: 104,
    ingredients: ["Yangi apelsin", "Laym", "Marakuya pyuresi", "Yalpiz", "Muz"]
  },
  {
    id: 'm-14',
    name: 'Turkcha Qahva (Qumda Damlangan)',
    category: 'ichimliklar',
    price: 24000,
    description: 'Qizigan mayin qumda jezva ichida an’anaviy uslubda sekin damlangan xushbo‘y toza arabika qahvasi. Maxsus pista lokumi va muzli suv bilan beriladi.',
    image: turkishCoffeeImg,
    prepTimeMinutes: 6,
    isAvailable: true,
    station: 'bar',
    calories: 45,
    weightGrams: 80,
    isChefSpecial: false,
    rating: 4.9,
    reviewsCount: 67,
    ingredients: ["100% Arabika qahvasi", "Lokum shirinligi", "Muzli suv"]
  },
  {
    id: 'm-15',
    name: 'Tog‘ Giyohlari & Zafaronli Choy (Choynak)',
    category: 'ichimliklar',
    price: 28000,
    description: 'Chust ko‘k choyi, tog‘ kiyiko‘ti, yovvoyi yalpiz, zafaron gullari va yangi limon bo‘laklari bilan damlangan xushbo‘y shifobaxsh choy.',
    image: cocktailImg,
    prepTimeMinutes: 7,
    isAvailable: true,
    station: 'bar',
    calories: 20,
    weightGrams: 900,
    isChefSpecial: true,
    rating: 5.0,
    reviewsCount: 92,
    ingredients: ["Chust ko'k choyi", "Tog' kiyiko'ti", "Zafaron", "Limon", "Yalpiz"]
  },
  {
    id: 'm-16',
    name: 'Klassik Mojito (Laym & Yalpiz 400ml)',
    category: 'ichimliklar',
    price: 32000,
    description: 'Barra yalpiz barglari, yangi siqilgan laym sharbati, shakar qamishi siropi va sovuq gazlangan soda suvi bilan muzdek kokteyl.',
    image: cocktailImg,
    prepTimeMinutes: 4,
    isAvailable: true,
    station: 'bar',
    calories: 110,
    weightGrams: 400,
    isChefSpecial: false,
    rating: 4.8,
    reviewsCount: 78,
    ingredients: ["Yangi laym", "Bog' yalpizi", "Shakar qamishi siropi", "Muz bo'laklari"]
  },
  {
    id: 'm-17',
    name: 'Mualliflik Sezar Salati (Krevetka Bilan)',
    category: 'salatlar',
    price: 68000,
    description: 'Grilda pishirilgan yo‘lbars krevetkalari, karsildoq aysberg va romen barglari, 24 oylik Parmesan pishlog‘i va mualliflik anjous sousi.',
    image: burrataImg,
    prepTimeMinutes: 8,
    isAvailable: true,
    station: 'salat',
    calories: 320,
    weightGrams: 280,
    isChefSpecial: true,
    isHit: true,
    rating: 4.9,
    reviewsCount: 115,
    ingredients: ["Yo'lbars krevetkalari", "Aysberg", "Parmesan pishlog'i", "Karsildoq suxarik", "Maxsus sezar sous"]
  },
  {
    id: 'm-18',
    name: 'Tom Yum Dengiz Mahsulotlari Sho‘rvasi',
    category: 'shorvalar',
    price: 78000,
    description: 'Yo‘lbars krevetkalari, kalmar, shitake qo‘ziqorinlari, limon o‘ti, galangal va kokos suti bilan tayyorlangan mashhur sharqona nordon-achchiq sho‘rva.',
    image: tomyamImg,
    prepTimeMinutes: 15,
    isAvailable: true,
    station: 'oshxona',
    calories: 380,
    weightGrams: 380,
    isChefSpecial: true,
    rating: 4.9,
    reviewsCount: 84,
    ingredients: ["Krevetka", "Kalmar", "Shitake", "Kokos suti", "Lemongrass", "Chili"]
  },
  {
    id: 'm-19',
    name: 'Atlantika Losos Steyki (Grilda)',
    category: 'steak',
    price: 165000,
    description: 'Gril panjarasida mayin qilib qovurilgan barra losos filesi, limonli kremsous, qovurilgan yosh sparja va dengiz tuzi bilan.',
    image: salmonImg,
    prepTimeMinutes: 18,
    isAvailable: true,
    station: 'mangal',
    calories: 540,
    weightGrams: 300,
    isChefSpecial: true,
    rating: 5.0,
    reviewsCount: 63,
    ingredients: ["Barra losos filesi", "Limon-sariyog' sousi", "Sparja", "Dengiz tuzi"]
  }
];

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: 'adm-1',
    name: 'Bosh Menejer Laziz',
    username: 'laziz712',
    passwordHash: 'laziz712',
    role: 'superadmin',
    createdAt: new Date().toISOString()
  }
];


export const INITIAL_COURIERS: Courier[] = [
  {
    id: 'c-1',
    name: 'Farxod Ismoilov',
    phone: '+998 90 123 45 67',
    vehicle: 'skuter',
    status: 'band',
    activeOrdersCount: 1,
    rating: 4.9
  },
  {
    id: 'c-2',
    name: 'Jasur Temirov',
    phone: '+998 93 987 65 43',
    vehicle: 'avto',
    status: 'bosh',
    activeOrdersCount: 0,
    rating: 5.0
  },
  {
    id: 'c-3',
    name: 'Sherzodbek Aliyev',
    phone: '+998 97 456 78 90',
    vehicle: 'skuter',
    status: 'bosh',
    activeOrdersCount: 0,
    rating: 4.8
  }
];

export const INITIAL_WAITERS: Waiter[] = [
  {
    id: 'w-1',
    name: 'Sardor Aliyev',
    phone: '+998 90 911 22 33',
    assignedZone: 'Zal 1 (Asosiy)',
    status: 'ishda',
    ordersHandledCount: 24,
    password: '1111'
  },
  {
    id: 'w-2',
    name: 'Madina Rahimova',
    phone: '+998 93 333 44 55',
    assignedZone: 'VIP Kabinetlar',
    status: 'ishda',
    ordersHandledCount: 18,
    password: '2222'
  },
  {
    id: 'w-3',
    name: 'Bobur Xolmatov',
    phone: '+998 97 555 66 77',
    assignedZone: 'Panoramik Terrasa',
    status: 'ishda',
    ordersHandledCount: 15,
    password: '3333'
  }
];



export const INITIAL_ORDERS: Order[] = [
  {
    id: 'SAV-1081',
    type: 'zal',
    status: 'oshxonada',
    tableNumber: 'Stol #4 (Zal 1)',
    waiterName: 'Sardor (Ofitsiant)',
    customerName: 'Akmal Zokirov',
    customerPhone: '+998 90 912 34 56',
    items: [
      {
        itemId: 'm-1',
        name: 'Wagyu Ribeye Steyk (Black Angus)',
        price: 360000,
        quantity: 1,
        station: 'mangal',
        notes: 'Medium Well, rozmarin ko\'proq bo\'lsin',
        isReady: false
      },
      {
        itemId: 'm-4',
        name: 'Old Fashioned Savoria Signature Cocktail',
        price: 85000,
        quantity: 2,
        station: 'bar',
        isReady: true
      }
    ],
    totalSubtotal: 530000,
    serviceFeeRate: 0.12,
    serviceFeeAmount: 63600,
    finalTotal: 593600,
    isPaid: false,
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString()
  },
  {
    id: 'SAV-1082',
    type: 'dostavka',
    status: 'yolda',
    customerName: 'Nilufar Rahimova',
    customerPhone: '+998 91 333 44 55',
    deliveryAddress: 'Shayxontohur tumani, Navoiy ko\'chasi 18-uy, 44-xonadon',
    deliveryNotes: 'Domofon 44K, 3-qavat',
    courierId: 'c-1',
    courierName: 'Farxod Ismoilov',
    courierPhone: '+998 90 123 45 67',
    items: [
      {
        itemId: 'm-2',
        name: 'Xos Savoria Qovurma Shohona Osh',
        price: 110000,
        quantity: 2,
        station: 'oshxona',
        isReady: true
      },
      {
        itemId: 'm-3',
        name: 'Savoria Royal Burrata & Pesto',
        price: 95000,
        quantity: 1,
        station: 'salat',
        isReady: true
      },
      {
        itemId: 'm-8',
        name: 'Gidromel & Passion Fruit Limonad (1L)',
        price: 65000,
        quantity: 1,
        station: 'bar',
        isReady: true
      }
    ],
    totalSubtotal: 380000,
    serviceFeeRate: 0.05,
    serviceFeeAmount: 19000,
    finalTotal: 399000,
    isPaid: true,
    paymentMethod: 'payme_click',
    createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString()
  },
  {
    id: 'SAV-1083',
    type: 'zal',
    status: 'yangi',
    tableNumber: 'VIP Terrasa #2',
    waiterName: 'Madina (Ofitsiant)',
    customerName: 'Davronbek Xalilov',
    customerPhone: '+998 99 777 88 99',
    items: [
      {
        itemId: 'm-5',
        name: 'Marmar Go\'shtli Qozon-Kabob',
        price: 165000,
        quantity: 2,
        station: 'oshxona',
        notes: 'Achchiq bo\'lmasin',
        isReady: false
      },
      {
        itemId: 'm-9',
        name: 'Savoria San-Sebastian Cheesecake',
        price: 70000,
        quantity: 2,
        station: 'salat',
        isReady: false
      }
    ],
    totalSubtotal: 470000,
    serviceFeeRate: 0.12,
    serviceFeeAmount: 56400,
    finalTotal: 526400,
    isPaid: false,
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  },
  {
    id: 'SAV-1080',
    type: 'zal',
    status: 'yopildi',
    tableNumber: 'Stol #1 (Zal 1)',
    waiterName: 'Sardor (Ofitsiant)',
    customerName: 'Bobur Mirzayev',
    customerPhone: '+998 90 111 22 33',
    items: [
      {
        itemId: 'm-1',
        name: 'Wagyu Ribeye Steyk (Black Angus)',
        price: 360000,
        quantity: 2,
        station: 'mangal',
        isReady: true
      },
      {
        itemId: 'm-3',
        name: 'Savoria Royal Burrata & Pesto',
        price: 95000,
        quantity: 1,
        station: 'salat',
        isReady: true
      }
    ],
    totalSubtotal: 815000,
    serviceFeeRate: 0.12,
    serviceFeeAmount: 97800,
    finalTotal: 912800,
    isPaid: true,
    paymentMethod: 'uzcard_humo',
    createdAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    fiscalReceiptNumber: 'FISCAL-UZ-988412'
  }
];

export const INITIAL_TABLES: RestaurantTable[] = [
  { id: 'Stol #1 (Zal 1)', name: 'Stol 1', zone: 'Zal 1', capacity: 4, isActive: true, notes: 'Deraza oldi' },
  { id: 'Stol #2 (Zal 1)', name: 'Stol 2', zone: 'Zal 1', capacity: 2, isActive: true, notes: 'Kichik shinam stol' },
  { id: 'Stol #3 (Zal 1)', name: 'Stol 3', zone: 'Zal 1', capacity: 6, isActive: true, notes: 'Katta oilaviy stol' },
  { id: 'Stol #4 (Zal 1)', name: 'Stol 4', zone: 'Zal 1', capacity: 4, isActive: true, notes: 'Markaziy zal' },
  { id: 'Stol #5 (Zal 1)', name: 'Stol 5', zone: 'Zal 1', capacity: 4, isActive: true, notes: 'Markaziy zal' },
  { id: 'VIP Kabinet #1', name: 'VIP 1', zone: 'VIP', capacity: 10, isActive: true, notes: 'Alohida VIP xona va televizor' },
  { id: 'VIP Terrasa #2', name: 'VIP Terrasa', zone: 'Terrasa', capacity: 8, isActive: true, notes: 'Ochiq osmon ostidagi veranda' },
  { id: 'Bar stoli #3', name: 'Bar 3', zone: 'Bar', capacity: 2, isActive: true, notes: 'Barmen qarshisida' },
];

export const INITIAL_CHEFS: ChefProfile[] = [
  {
    id: 'chef-1',
    name: 'Alisher Zokirov',
    role: 'Bosh Oshpaz (Brand Chef)',
    experienceYears: 22,
    experienceBio: 'Toshkent va Istanbulning eng nufuzli restoranlarida 22 yildan ortiq bosh oshpazlik qilgan. An’anaviy tandir, o‘choq taomlari va shohona to‘y oshi tayyorlashning yetuk ustasi.',
    specialty: 'Sharqona & O‘zbek milliy tansiq taomlari, Shohona osh va Qozon kabob ustasi',
    image: executiveChefImg,
    achievements: ['Xalqaro Pazandachilik Oltin Mukofoti', '22 yillik uzluksiz shohona tajriba', 'Mualliflik tandir sirlari']
  },
  {
    id: 'chef-2',
    name: 'Elchinbek Turdiyev',
    role: 'Grill & Steyk Ustasi',
    experienceYears: 16,
    experienceBio: 'Mangal va go‘sht pishirish san’ati bo‘yicha 16 yillik boy amaliyot. Cho‘g‘da pishiriladigan har bir G‘ijduvon shashligi va Black Angus steykining sersuv chiqish kafolatchisi.',
    specialty: 'G‘ijduvon shashliklari, Wagyu & Black Angus steyklari, Ochiq mangal san’ati',
    image: sousChefImg,
    achievements: ['Milliy Mangal Chempionati G‘olibi', '16 yillik olov va go‘sht ustaligi', 'Maxsus sharq marinadlari']
  },
  {
    id: 'chef-3',
    name: 'Madina Karimova',
    role: 'Bosh Qandolatchi',
    experienceYears: 12,
    experienceBio: 'Turkiyaning Gaziantep shahrida haqiqiy sharqona shirinliklar sirlarini o‘rgangan. Nozik 40 qavatli pista baklavasi va nozik San Sebastian piroglari ijodkori.',
    specialty: 'Gaziantep pista baklavasi, San Sebastian va mualliflik sharq shirinliklari',
    image: pastryChefImg,
    achievements: ['Gaziantep Qandolat Ustasi Diplomi', '12 yillik nozik shirinlik san’ati', '100% tabiiy sariyog‘ va zumrad pista']
  }
];

export const INITIAL_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    authorName: 'Otabek Mahkamov',
    authorRole: 'Tadbirkor, Doimiy mehmon',
    rating: 5,
    comment: 'Savoria restoraniga birinchi marta oilam bilan keldim. To‘y oshi va qozon kabob haqiqatan ham Toshkentdagi eng mazalisi ekan! Xizmat ko‘rsatish a’lo darajada, ofitsiantlar juda xushmuomala. Har dam olish kuni oilamiz bilan shu yerga kelishga qaror qildik.',
    date: 'Bugun, 15:40',
    recommendedDish: 'To‘y Oshi (Savoria Maxsus Osh)',
    likesCount: 42
  },
  {
    id: 'rev-2',
    authorName: 'Shahlo Azimova',
    authorRole: 'Food Blogger & Tanqidchi',
    rating: 5,
    comment: 'VIP xonada dugonalarim bilan tug‘ilgan kunimni nishonladik. Interyer nihoyatda hashamatli va qulay, rasmga tushish uchun ajoyib manzara! Gaziantep pista baklavasi va anorli achchiq-chuchuk esa barchamizga juda yoqdi. Rahmat jamoaga!',
    date: 'Kecha, 20:15',
    recommendedDish: 'Turkcha Pista Paxlava (Gaziantep)',
    likesCount: 68
  },
  {
    id: 'rev-3',
    authorName: 'Javohir To‘xtayev',
    authorRole: 'Doimiy VIP mehmon',
    rating: 5,
    comment: 'Jonli musiqa va shashliklar kayfiyatni ko‘taradi. G‘ijduvoncha qiymasi nihoyatda nozik va shirali pishirilgan. Stolni oldindan sayt orqali 1 daqiqada bron qilgandik, yetib kelganimizda hammasi tayyor edi. 10/10 tavsiya qilaman!',
    date: '2 kun oldin',
    recommendedDish: 'G‘ijduvoncha Qiyma Shashlik',
    likesCount: 35
  }
];

export const INITIAL_RESERVATIONS: TableReservation[] = [
  {
    id: 'BRON-101',
    guestName: 'Sanjar Rahimov',
    guestPhone: '+998 90 333 44 55',
    date: 'Bugun',
    time: '19:30',
    guestsCount: 4,
    tableId: 'VIP Terrasa #2',
    zone: 'Terrasa',
    specialRequests: 'Tug\'ilgan kun bayrami, stolga gullar va shamlar',
    status: 'tasdiqlandi',
    createdAt: new Date().toISOString()
  },
  {
    id: 'BRON-102',
    guestName: 'Alisher Usmonov',
    guestPhone: '+998 97 712 34 56',
    date: 'Bugun',
    time: '20:00',
    guestsCount: 6,
    tableId: 'VIP Xona #1',
    zone: 'VIP',
    specialRequests: 'Biznes kechki ovqat, sokin musiqa va maxsus xizmat',
    status: 'kutilmoqda',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'BRON-103',
    guestName: 'Dilnoza Karimova',
    guestPhone: '+998 93 111 22 44',
    date: 'Ertaga',
    time: '18:00',
    guestsCount: 2,
    tableId: 'Stol 4 (Zal 1)',
    zone: 'Zal 1',
    specialRequests: 'Romantik shamlar bilan kechki ovqat',
    status: 'tasdiqlandi',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'BRON-104',
    guestName: 'Malika Qosimova',
    guestPhone: '+998 99 888 77 66',
    date: 'Bugun',
    time: '14:30',
    guestsCount: 3,
    tableId: 'Stol 7 (Terrasa)',
    zone: 'Terrasa',
    specialRequests: 'Ochiq havoda toza stol',
    status: 'bekor_qilindi',
    createdAt: new Date(Date.now() - 14400000).toISOString()
  }
];

