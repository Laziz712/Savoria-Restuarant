import { MenuItem, Courier, Waiter, AdminUser, Order, RestaurantSettings } from '../types';
import wagyuImg from '../assets/images/savoria_wagyu_steak_1791475866836.jpg';
import plovImg from '../assets/images/savoria_plov_special_1791475881101.jpg';
import cocktailImg from '../assets/images/savoria_cocktail_drink_1791475891055.jpg';
import burrataImg from '../assets/images/savoria_gourmet_salad_1791475898828.jpg';

export const INITIAL_SETTINGS: RestaurantSettings = {
  name: 'SAVORIA RESTAURANT & LOUNGE',
  slogan: 'Premium Gastronomiya va Sharqona mehmondo\'stlik',
  address: 'Toshkent sh., Mirzo Ulug\'bek tumani, Mustaqillik shoh ko\'chasi 77',
  phone: '+998 71 200 88 99',
  stir: '309 814 552',
  serviceFeePercent: 12,
  headerMessage: 'Savoria premium restoraniga xush kelibsiz!',
  footerReceiptMessage: 'Tashrifingiz uchun minnatdormiz! Yoqimli ishtaha tilaymiz.',
  wifiPassword: 'savoria_lounge_vip'
};

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'm-1',
    name: 'Wagyu Ribeye Steyk (Black Angus)',
    category: 'asosiy',
    price: 360000,
    description: 'Qovurilgan sarimsoq, yangi rozmarin shoxi va xushbo\'y sariyog\' bilan pishirilgan oliy navli Wagyu bifshteksi.',
    image: wagyuImg,
    prepTimeMinutes: 20,
    isAvailable: true,
    station: 'mangal',
    calories: 780,
    weightGrams: 350,
    isChefSpecial: true
  },
  {
    id: 'm-2',
    name: 'Xos Savoria Qovurma Shohona Osh',
    category: 'milliy',
    price: 110000,
    description: 'Lagan markazida pishirilgan barra qo\'zichoq boldiri, bedana tuxumlari, zarchava guruch va kishmishli qizil zirk bilan.',
    image: plovImg,
    prepTimeMinutes: 15,
    isAvailable: true,
    station: 'oshxona',
    calories: 890,
    weightGrams: 500,
    isChefSpecial: true
  },
  {
    id: 'm-3',
    name: 'Savoria Royal Burrata & Pesto',
    category: 'salatlar',
    price: 95000,
    description: 'Yangi Italiya burrata pishlog\'i, rang-barang pomidorlar, kedr yong\'oqlari, yovvoyi rayhonli pesto va quyuq balzamiko sousi.',
    image: burrataImg,
    prepTimeMinutes: 10,
    isAvailable: true,
    station: 'salat',
    calories: 420,
    weightGrams: 300,
    isChefSpecial: false
  },
  {
    id: 'm-4',
    name: 'Old Fashioned Savoria Signature Cocktail',
    category: 'ichimliklar',
    price: 85000,
    description: 'Kristal stakanda muz shari, quritilgan apelsin va xushbo\'y dolchin tutatqisi bilan tayyorlangan mualliflik kokteyli (alkogolsiz/maxsus).',
    image: cocktailImg,
    prepTimeMinutes: 5,
    isAvailable: true,
    station: 'bar',
    calories: 190,
    weightGrams: 220,
    isChefSpecial: true
  },
  {
    id: 'm-5',
    name: 'Marmar Go\'shtli Qozon-Kabob',
    category: 'milliy',
    price: 165000,
    description: 'Qozonda tillarang qilib pishirilgan barra qo\'y go\'shti va qovurilgan yosh kartoshkalar, yupqa archilgan piyoz va sumax bilan.',
    image: wagyuImg,
    prepTimeMinutes: 22,
    isAvailable: true,
    station: 'oshxona',
    calories: 920,
    weightGrams: 450,
    isChefSpecial: false
  },
  {
    id: 'm-6',
    name: 'Norvegiya Losos Steyki (Sous-Vide)',
    category: 'asosiy',
    price: 240000,
    description: 'Grilda pishirilgan yangi losos balig\'i, qushqo\'nmas (asparagus), limonli golland sousi va microgreen ko\'katlari.',
    image: wagyuImg,
    prepTimeMinutes: 18,
    isAvailable: true,
    station: 'mangal',
    calories: 540,
    weightGrams: 280,
    isChefSpecial: true
  },
  {
    id: 'm-7',
    name: 'Klassik Tom Yam dengiz taomi',
    category: 'shorvalar',
    price: 135000,
    description: 'Qirol krevetkalari, kalmar, shiitake qo\'ziqorini, kokos suti, laym barglari va xushbo\'y lemongrass bilan.',
    image: burrataImg,
    prepTimeMinutes: 14,
    isAvailable: true,
    station: 'oshxona',
    calories: 380,
    weightGrams: 400,
    isChefSpecial: false
  },
  {
    id: 'm-8',
    name: 'Gidromel & Passion Fruit Limonad (1L)',
    category: 'ichimliklar',
    price: 65000,
    description: 'Tabiiy marakuya mevasi, tog\' yalpizi, gazlangan tog\' suvi va xushbo\'y sitrus mevalar sharbati.',
    image: cocktailImg,
    prepTimeMinutes: 5,
    isAvailable: true,
    station: 'bar',
    calories: 140,
    weightGrams: 1000,
    isChefSpecial: false
  },
  {
    id: 'm-9',
    name: 'Savoria San-Sebastian Cheesecake',
    category: 'desertlar',
    price: 70000,
    description: 'Ustki qavati karamellangan nozik ispan pishlog\'i pirogi, issiq Belgiya qora shokolad sousi bilan taqdim etiladi.',
    image: burrataImg,
    prepTimeMinutes: 6,
    isAvailable: true,
    station: 'salat',
    calories: 460,
    weightGrams: 210,
    isChefSpecial: true
  },
  {
    id: 'm-10',
    name: 'Elit Arabica Flat White & Qahva',
    category: 'qahva_choy',
    price: 38000,
    description: 'Yangi yanchilgan ikki hissa espresso va mikrokopikli nozik sut kremi.',
    image: cocktailImg,
    prepTimeMinutes: 4,
    isAvailable: true,
    station: 'bar',
    calories: 120,
    weightGrams: 200,
    isChefSpecial: false
  },
  {
    id: 'm-11',
    name: 'Savoria Berry Mojito (Alkogolsiz)',
    category: 'ichimliklar',
    price: 55000,
    description: 'Yangi malina, qora smorodina, yalpiz barglari, laym sharbati va muzli gazlangan buloq suvi.',
    image: cocktailImg,
    prepTimeMinutes: 5,
    isAvailable: true,
    station: 'bar',
    calories: 110,
    weightGrams: 450,
    isChefSpecial: true
  },
  {
    id: 'm-12',
    name: 'Anor & Sitrus Fresh Sharbat (400ml)',
    category: 'ichimliklar',
    price: 48000,
    description: 'Yangi siqilgan shirin Toshkent anori va quyoshli apelsin sharbati, tabiiy vitaminlar kokteyli.',
    image: cocktailImg,
    prepTimeMinutes: 4,
    isAvailable: true,
    station: 'bar',
    calories: 130,
    weightGrams: 400,
    isChefSpecial: false
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
