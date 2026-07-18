export type MenuOption = {
  id: string
  name: string
  price: number
  image?: string
}

export type OptionGroup = {
  id: string
  title: string
  min: number
  max: number
  options: MenuOption[]
}

export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  category: string
  image?: string
  badge?: string
  popular?: boolean
  optionGroups?: OptionGroup[]
}

export type StoreHour = {
  day: string
  hours: string
}

export type PaymentMethod = {
  id: string
  name: string
  kind: "online" | "delivery"
  brands?: string[]
}

export type StoreAddress = {
  line: string
  city: string
  state: string
  zip: string
  lat?: number
  lng?: number
}

export type StoreMenu = {
  tenant: string
  name: string
  tagline: string
  categoryLabel: string
  logo?: string
  bannerTitle?: string
  bannerSubtitle?: string
  bannerUrl?: string
  isOpen: boolean
  minOrder: number
  hours: StoreHour[]
  payments: PaymentMethod[]
  address: StoreAddress
  categories: string[]
  items: MenuItem[]
}

const drinkOptions: MenuOption[] = [
  { id: "guarana-269", name: "Guaraná 269ml", price: 0 },
  { id: "sprite-220", name: "Sprite 220ml", price: 0 },
  { id: "coca-269", name: "Coca-Cola 269ml", price: 0 },
]

const upgradeDrinks: MenuOption[] = [
  { id: "coca-350", name: "Coca-Cola 350ml", price: 4.9 },
  { id: "guarana-350", name: "Guaraná 350ml", price: 4.9 },
  { id: "sprite-350", name: "Sprite 350ml", price: 4.9 },
]

const extraMeat: MenuOption[] = [
  { id: "blend-100", name: "Blend artesanal +100g", price: 9.9 },
  { id: "bacon", name: "Bacon crocante", price: 6.9 },
  { id: "cheddar", name: "Cheddar extra", price: 4.9 },
  { id: "onion", name: "Onion rings (3 un)", price: 7.9 },
]

const catalogs: Record<string, StoreMenu> = {
  "cowboy-burger-67": {
    tenant: "cowboy-burger-67",
    name: "Cowboy Burger 67",
    tagline: "Burgers defumados e milkshakes gelados",
    categoryLabel: "Hamburgueria Country",
    bannerTitle: "Frete grátis",
    bannerSubtitle: "Verifique a disponibilidade para sua região",
    bannerUrl: "/images/store-banner.png",
    isOpen: true,
    minOrder: 30,
    hours: [
      { day: "Domingo", hours: "17h às 23h30" },
      { day: "Segunda-feira", hours: "17h às 23h" },
      { day: "Terça-feira", hours: "17h às 23h" },
      { day: "Quarta-feira", hours: "17h às 23h" },
      { day: "Quinta-feira", hours: "17h às 23h" },
      { day: "Sexta-feira", hours: "17h às 23h30" },
      { day: "Sábado", hours: "17h às 23h30" },
    ],
    payments: [
      { id: "pix", name: "Pix", kind: "online" },
      { id: "gpay", name: "Google Pay", kind: "online" },
      { id: "nubank", name: "Nubank", kind: "online" },
      {
        id: "card-online",
        name: "Cartão de crédito",
        kind: "online",
        brands: ["Visa", "Mastercard", "Elo", "Amex"],
      },
      { id: "cash", name: "Dinheiro", kind: "delivery" },
      {
        id: "card-delivery",
        name: "Cartão na entrega",
        kind: "delivery",
        brands: ["Visa", "Mastercard", "Elo", "Hipercard"],
      },
    ],
    address: {
      line: "Avenida Bom Pastor, 1050 - Vila Vilas Boas",
      city: "Campo Grande",
      state: "MS",
      zip: "79051-191",
      lat: -20.4697,
      lng: -54.6201,
    },
    categories: [
      "Destaques",
      "Combos",
      "Burgers",
      "Para compartilhar",
      "Acompanhamentos",
      "Bebidas",
    ],
    items: [
      {
        id: "combo-casal",
        name: "Combo Casal Fogo e Brasa",
        description:
          "2x Smash Burger (pão brioche, blend 100g, cheddar, molho da casa) + 200g de batata + refrigerantes inclusos.",
        price: 74.9,
        compareAtPrice: 83.22,
        category: "Combos",
        badge: "2x",
        popular: true,
        image: "/images/combo-casal.png",
        optionGroups: [
          {
            id: "drinks-included",
            title: "Refrigerantes inclusos no combo",
            min: 2,
            max: 2,
            options: drinkOptions,
          },
          {
            id: "upgrade-drink",
            title: "Upgrade para 350ml",
            min: 0,
            max: 1,
            options: upgradeDrinks,
          },
          {
            id: "extra-meat",
            title: "Deseja adicionar extras",
            min: 0,
            max: 4,
            options: extraMeat,
          },
        ],
      },
      {
        id: "combo-classic",
        name: "Combo Cowboy Classic",
        description:
          "Classic Cowboy + batata rústica + refrigerante 350ml.",
        price: 47.77,
        category: "Combos",
        popular: true,
        image: "/images/combo-classic.png",
        optionGroups: [
          {
            id: "drink",
            title: "Escolha o refrigerante",
            min: 1,
            max: 1,
            options: upgradeDrinks.map((o) => ({ ...o, price: 0 })),
          },
        ],
      },
      {
        id: "combo-onion",
        name: "Combo Onion Bacon",
        description: "Burger com onion e bacon + batata + bebida.",
        price: 54.9,
        category: "Combos",
        image: "/images/combo-onion.png",
      },
      {
        id: "combo-familia",
        name: "Combo Família Cowboy",
        description: "4 burgers + 2 porções de batata + 4 bebidas.",
        price: 104.8,
        category: "Para compartilhar",
        badge: "4x",
        popular: true,
        image: "/images/combo-familia.png",
      },
      {
        id: "texas-classic",
        name: "Hambúrguer — Texas Classic",
        description:
          "Pão brioche dourado com blend artesanal, queijo, alface e molho especial.",
        price: 31.9,
        category: "Burgers",
        popular: true,
        image: "/images/texas-classic.png",
        optionGroups: [
          {
            id: "extras",
            title: "Extras",
            min: 0,
            max: 3,
            options: extraMeat,
          },
        ],
      },
      {
        id: "cowboy-classic",
        name: "Hambúrguer — Cowboy Classic",
        description:
          "Blend 160g, queijo prato, alface, tomate e maionese da casa.",
        price: 33.7,
        category: "Burgers",
        popular: true,
        image: "/images/cowboy-classic.png",
      },
      {
        id: "cowboy-special",
        name: "Hambúrguer — Cowboy Special",
        description: "Blend defumado, cheddar, bacon e barbecue.",
        price: 37,
        category: "Burgers",
        image: "/images/cowboy-special.png",
      },
      {
        id: "american-cowboy",
        name: "Hambúrguer — American Cowboy",
        description: "Blend 180g, cheddar duplo, picles e molho ranch.",
        price: 38,
        category: "Burgers",
        image: "/images/american-cowboy.png",
      },
      {
        id: "fries",
        name: "Batata rústica",
        description: "Porção generosa com páprica e sal de alecrim.",
        price: 16.9,
        category: "Acompanhamentos",
        popular: true,
        image: "/images/batata-rustica.png",
      },
      {
        id: "onion-rings",
        name: "Onion rings",
        description: "Anéis crocantes com molho especial.",
        price: 18.9,
        category: "Acompanhamentos",
        image: "/images/onion-rings.png",
      },
      {
        id: "cola",
        name: "Refrigerante 350ml",
        description: "Coca-Cola, Guaraná ou Sprite.",
        price: 8.9,
        category: "Bebidas",
        image: "/images/refrigerante.png",
        optionGroups: [
          {
            id: "flavor",
            title: "Sabor",
            min: 1,
            max: 1,
            options: [
              { id: "coca", name: "Coca-Cola", price: 0 },
              { id: "guarana", name: "Guaraná", price: 0 },
              { id: "sprite", name: "Sprite", price: 0 },
            ],
          },
        ],
      },
      {
        id: "shake",
        name: "Milkshake",
        description: "Chocolate, morango ou baunilha — 400ml.",
        price: 19.9,
        category: "Bebidas",
        popular: true,
        image: "/images/milkshake.png",
        optionGroups: [
          {
            id: "flavor",
            title: "Sabor",
            min: 1,
            max: 1,
            options: [
              { id: "choco", name: "Chocolate", price: 0 },
              { id: "strawberry", name: "Morango", price: 0 },
              { id: "vanilla", name: "Baunilha", price: 0 },
            ],
          },
        ],
      },
    ],
  },
}

export function getStoreMenu(tenant: string | null): StoreMenu | null {
  if (!tenant) return null
  return catalogs[tenant] ?? null
}

export function getMenuItem(
  tenant: string | null,
  itemId: string
): MenuItem | null {
  const menu = getStoreMenu(tenant)
  if (!menu) return null
  return menu.items.find((item) => item.id === itemId) ?? null
}

export function searchMenuItems(
  menu: StoreMenu,
  query: string
): MenuItem[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return menu.items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
  )
}

export function formatBrl(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function discountPercent(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return null
  return Math.round(((compareAt - price) / compareAt) * 100)
}
