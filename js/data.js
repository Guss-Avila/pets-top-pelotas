/* Pet's Top · conteúdo do site.
   Tudo que muda no dia a dia fica aqui: main.js só desenha a página.
   Na versão final, PRODUCTS e os horários livres da AGENDA vêm do sistema da loja
   (exportação ou API); até lá, este arquivo é a fonte. */

const CONFIG = {
  nome: "Pet's Top",
  whatsapp: "5553984579710",
  whatsappDisplay: "(53) 98457-9710",
  telefone: "+5553984579710",
  instagram: "https://www.instagram.com/petstop.pelotas/",
  instagramUser: "@petstop.pelotas",
  facebook: "https://www.facebook.com/pet.stop.pelotas/",
  endereco: "Rua Comendador Rafael Mazza, 1180",
  bairro: "Obelisco",
  cidade: "Pelotas/RS",
  cep: "96085-090",
  mapsEmbed: "https://www.google.com/maps?q=Pets+top+-+Pet+Shop+Pelotas,+Rua+Comendador+Rafael+Mazza,+1180,+Obelisco,+Pelotas+-+RS&z=16&output=embed",
  mapsRota: "https://www.google.com/maps/dir/?api=1&destination=Pets+top+-+Pet+Shop+Pelotas&destination_place_id=ChIJ2TIlB4u1EZURMeq-TFatACg",
  googlePerfil: "https://www.google.com/maps/search/?api=1&query=Pets+top+-+Pet+Shop+Pelotas&query_place_id=ChIJ2TIlB4u1EZURMeq-TFatACg",
  googleAvaliar: "https://search.google.com/local/writereview?placeid=ChIJ2TIlB4u1EZURMeq-TFatACg",
  nota: "4,9",
  avaliacoes: 51,
  // 0 = domingo ... 6 = sábado. Cada dia: lista de [abre, fecha] em "HH:MM".
  horarios: {
    0: [],
    1: [["09:00", "12:00"], ["14:00", "19:30"]],
    2: [["09:00", "12:00"], ["14:00", "19:30"]],
    3: [["09:00", "12:00"], ["14:00", "19:30"]],
    4: [["09:00", "12:00"], ["14:00", "19:30"]],
    5: [["09:00", "12:00"], ["14:00", "19:00"]],
    6: [],
  },
  pagamentos: ["Pix", "Cartão de crédito", "Cartão de débito", "Dinheiro"],
};

/* Hero: slides dos pets (fotos reais da Pet's Top, com fundo removido) */
const SLIDES = [
  {
    tema: "azul",
    etiqueta: "Banho e tosa em Pelotas",
    titulo: ["O cuidado que ele", "<em>merece</em>"],
    texto: "Seu pet volta limpinho, perfumado e com o pelo soltinho. Do jeito que os clientes contam no Google.",
    cta: { label: "Agendar banho", href: "#agendar" },
    cta2: { label: "Ver serviços", href: "#servicos" },
    imagem: "img/dog-pitbull.webp",
    alt: "Cachorro de bandana azul depois do banho na Pet's Top",
  },
  {
    tema: "rosa",
    etiqueta: "Busca e leva",
    titulo: ["A gente busca.", "<em>E devolve cheiroso.</em>"],
    texto: "Buscamos o seu pet em casa, com segurança, e levamos de volta de banho tomado. Você nem precisa sair.",
    cta: { label: "Agendar com busca e leva", href: "#agendar", buscaLeva: true },
    cta2: { label: "Falar no WhatsApp", wa: "Olá! Vim pelo site e quero saber da busca e leva." },
    imagem: "img/dog-pastor.webp",
    alt: "Cachorra de laço e bandana depois do banho e tosa",
  },
  {
    tema: "claro",
    etiqueta: "Promoção de novembro",
    titulo: ["Pelagem macia", "<em>e brilhante</em>"],
    texto: "No combo banho + hidratação, a hidratação sai de R$ 25 por R$ 20. Brilho, maciez e menos nós.",
    cta: { label: "Quero o combo", href: "#agendar", servico: "hidratacao" },
    cta2: { label: "Ver no Instagram", href: "https://www.instagram.com/petstop.pelotas/" },
    imagem: "img/dog-golden.webp",
    alt: "Golden retriever de gravatinha com a pelagem hidratada",
  },
  {
    tema: "azul",
    etiqueta: "Rações com preço de vitrine",
    titulo: ["Tutano 20 kg", "<em>por R$ 199</em>"],
    texto: "As rações que você já conhece, com o preço da loja. Monta o pedido aqui e fecha no WhatsApp.",
    cta: { label: "Ver rações", href: "#produtos", categoria: "caes", sub: "racao-caes" },
    cta2: { label: "Ver todas as ofertas", href: "#produtos" },
    imagem: "img/produtos/tutano-frango.webp",
    alt: "Ração Tutano Premium Plus cães adultos sabor frango 20 kg",
    produto: true,
  },
];

/* Banner de serviços (troca a cada 2,3 s). preco: texto livre ou null */
const SERVICOS = [
  { id: "banho", nome: "Banho", texto: "Shampoo certo pro pelo, secagem e perfume que dura.", preco: "a partir de R$ 45", icone: "banho", cor: "azul" },
  { id: "tosa", nome: "Tosa", texto: "Na máquina ou na tesoura, até pra quem é agitado.", preco: null, icone: "tosa", cor: "rosa" },
  { id: "higienica", nome: "Tosa higiênica", texto: "Patinhas, barriga e partes íntimas limpinhas.", preco: null, icone: "tosa", cor: "marinho" },
  { id: "hidratacao", nome: "Hidratação", texto: "R$ 20 no combo com banho em novembro (de R$ 25).", preco: "R$ 20 no combo", icone: "gota", cor: "azul" },
  { id: "ouvidos", nome: "Limpeza de ouvidos", texto: "Evita cheiro ruim, coceira e otite.", preco: null, icone: "orelha", cor: "rosa" },
  { id: "unhas", nome: "Corte de unhas", texto: "Unha no tamanho certo, sem machucar.", preco: null, icone: "unha", cor: "marinho" },
  { id: "buscaleva", nome: "Busca e leva", texto: "A gente busca em casa e devolve de banho tomado.", preco: null, icone: "carro", cor: "azul" },
  { id: "racoes", nome: "Rações e medicamentos", texto: "Rações, petiscos, remédios e acessórios na loja.", preco: null, icone: "pote", cor: "rosa" },
];

/* Categorias da loja: cada uma abre as subcategorias na lateral */
const CATEGORIAS = [
  { id: "caes", nome: "Cachorros", icone: "cao", subs: [
    { id: "racao-caes", nome: "Rações" },
    { id: "petiscos-caes", nome: "Petiscos" },
    { id: "higiene-caes", nome: "Higiene e beleza" },
  ]},
  { id: "gatos", nome: "Gatos", icone: "gato", subs: [
    { id: "racao-gatos", nome: "Rações" },
    { id: "areia", nome: "Areia" },
    { id: "petiscos-gatos", nome: "Petiscos" },
  ]},
  { id: "camas", nome: "Camas e casinhas", icone: "cama", subs: [
    { id: "iglus", nome: "Iglus" },
    { id: "colchonetes", nome: "Colchonetes" },
  ]},
  { id: "saude", nome: "Medicamentos", icone: "cruz", subs: [
    { id: "antipulgas", nome: "Antipulgas e carrapaticidas" },
    { id: "vermifugos", nome: "Vermífugos" },
  ]},
  { id: "acessorios", nome: "Acessórios", icone: "osso", subs: [
    { id: "coleiras", nome: "Coleiras e guias" },
    { id: "brinquedos", nome: "Brinquedos" },
    { id: "comedouros", nome: "Comedouros" },
  ]},
];

/* Produtos. Na versão final esta lista é gerada a partir do sistema de estoque.
   preco/precoDe em reais (número) ou null = "preço no WhatsApp". */
const PRODUCTS = [
  { id: "tutano-frango-20", marca: "Tutano", nome: "Premium Plus Cães Adultos Frango", peso: "20 kg", cat: "caes", sub: "racao-caes", preco: 199.0, precoDe: 219.0, imagem: "img/produtos/tutano-frango.webp", destaque: true },
  { id: "tutano-especial-20", marca: "Tutano", nome: "Especial Premium Plus Carne e Frango", peso: "20 kg", cat: "caes", sub: "racao-caes", preco: 169.9, precoDe: 199.9, imagem: null, pack: { bg: "#2F343C", accent: "#E9A23B", txt: "#FFFFFF" }, destaque: true },
  { id: "golden-formula-15", marca: "Golden", nome: "Formula Cães Adultos Porte Pequeno Frango e Arroz", peso: "15 kg", cat: "caes", sub: "racao-caes", preco: null, imagem: "img/produtos/golden-formula.webp" },
  { id: "dodog-15", marca: "Dodog", nome: "Premium Cães Adultos Tradicional", peso: "15 kg", cat: "caes", sub: "racao-caes", preco: null, imagem: "img/produtos/dodog.webp" },
  { id: "special-cat", marca: "Special Cat", nome: "Gatos Adultos", peso: "10 kg", cat: "gatos", sub: "racao-gatos", preco: null, imagem: null, pack: { bg: "#F08A1C", accent: "#FFFFFF", txt: "#5A2A00" } },
  { id: "monello-caes", marca: "Monello", nome: "Cães Adultos", peso: "15 kg", cat: "caes", sub: "racao-caes", preco: null, imagem: null, pack: { bg: "#1D2A5B", accent: "#F4C21B", txt: "#FFFFFF" } },
  { id: "iglu-estampado", marca: "Pet's Top", nome: "Caminha iglu estampada", peso: "Tamanho M", cat: "camas", sub: "iglus", preco: null, imagem: "img/produtos/caminha-iglu.webp" },
  { id: "colchonete-plush", marca: "Pet's Top", nome: "Colchonete plush raças grandes", peso: "Tamanho G", cat: "camas", sub: "colchonetes", preco: null, imagem: "img/produtos/caminha-rosa.webp" },
];

/* Agenda de banho e tosa */
const AGENDA = {
  servicos: [
    { id: "banho", nome: "Banho" },
    { id: "banho-tosa", nome: "Banho e tosa" },
    { id: "higienica", nome: "Tosa higiênica" },
    { id: "hidratacao", nome: "Hidratação" },
    { id: "unhas", nome: "Corte de unhas" },
    { id: "ouvidos", nome: "Limpeza de ouvidos" },
  ],
  portes: ["Mini", "Pequeno", "Médio", "Grande", "Gigante"],
  horarios: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
  diasNaFrente: 10,
};

/* Avaliações reais do Google (perfil Pets top - Pet Shop Pelotas) */
const AVALIACOES = [
  { nome: "Aline M.", quando: "Google", texto: "Levo meu filho há mais de dois anos e foi o melhor lugar que encontrei em Pelotas. Somente eles conseguem tosar o meu shih tzu, que é mega agitado. E ainda buscam em casa e depois levam!" },
  { nome: "Maria R.", quando: "Google", texto: "Recomendo de olhos fechados. A equipe faz um trabalho maravilhoso! Carinhosos, atenciosos e ágeis. Nossas gurias vão sempre e ficam cheirosas e limpíssimas!" },
  { nome: "Natalia C.", quando: "Google", texto: "Perfume muito bom e duradouro! Pet vem com pelo bem soltinho e brilhante! Gostamos muito do serviço oferecido." },
  { nome: "Pamela S.", quando: "Google", texto: "São profissionais excelentes, rápidos e muito cuidadosos, sem contar a facilidade de ir buscar e entregar em casa. Minha pet fica toda feliz quando vê eles." },
  { nome: "Claudia S.", quando: "Google", texto: "Ótimo atendimento, minha Lady vem bem limpinha e perfumada. Ela adora a Pet's Top. Super recomendo." },
];

/* Grade do Instagram e do Facebook */
const SOCIAL = [
  { imagem: "img/social/post-banho-higienico.webp", alt: "Post: banho higiênico a partir de R$ 45", href: "https://www.instagram.com/petstop.pelotas/", rede: "instagram" },
  { imagem: "img/social/post-hidratacao.webp", alt: "Post: hidratação de R$ 25 por R$ 20", href: "https://www.facebook.com/pet.stop.pelotas/", rede: "facebook" },
  { imagem: "img/social/post-tutano-frango.webp", alt: "Reel: Tutano 20 kg de R$ 219 por R$ 199", href: "https://www.instagram.com/petstop.pelotas/", rede: "instagram" },
  { imagem: "img/social/post-tudo-para-seu-pet.webp", alt: "Post: tudo para o seu pet, busca e leva", href: "https://www.instagram.com/petstop.pelotas/", rede: "instagram" },
  { imagem: "img/social/post-tutano-especial.webp", alt: "Reel: Tutano Especial de R$ 199,90 por R$ 169,90", href: "https://www.instagram.com/petstop.pelotas/", rede: "instagram" },
  { imagem: "img/social/post-horario.webp", alt: "Post: horário de funcionamento", href: "https://www.instagram.com/petstop.pelotas/", rede: "instagram" },
];

/* As perguntas frequentes ficam direto no index.html (seção #duvidas e o JSON-LD FAQPage),
   porque o Google lê melhor o que já vem no HTML. Mudou uma pergunta, muda nos dois. */
