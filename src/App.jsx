import { useState, useMemo } from "react" ;

const PROGRAMS = {
  atomos: {
    label: "Átomos (C6 Bank)",
    default: 3.0,
    desc: "Transferível 1:1 para a Livelo — usamos valor parecido, ~R$ 30/milheiro (com base nas melhores ofertas de transferência bonificada de 2026).",
  },
  livelo: {
    label: "Livelo (Bradesco, BB, BTG)",
    default: 3.0,
    desc: "Valor-alvo 2026 com base nas melhores ofertas de compra/transferência bonificada: ~R$ 30/milheiro (o valor de tabela do site, R$ 70, é bem menos realista).",
  },
  esfera: {
    label: "Esfera (Santander)",
    default: 3.5,
    desc: "Faixa de mercado para resgate em passagens: R$ 35-40/milheiro. Usamos o piso da faixa por segurança.",
  },
  iupp: {
    label: "Iupp (Itaú)",
    default: 1.5,
    desc: "Transfere 1:1 para Azul Fidelidade, cujo valor-alvo 2026 é ~R$ 13/milheiro — por isso vale bem menos que Livelo ou Esfera.",
  },
  loop: {
    label: "Inter Loop",
    default: 2.5,
    desc: "Conversão direta do próprio banco: 200 pontos = R$ 5 de desconto na fatura, ou seja R$ 25/milheiro — sem precisar de estratégia de transferência.",
  },
};

const CARDS = [
  {
    id: "c6black",
    name: "C6 Black",
    banco: "C6 Bank",
    anuidade: 600,
    gastoElegibilidade: null,
    gastoIsencao: 3500,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 20000,
    investIsencao: 20000,
    tipo: "pontos",
    programa: "atomos",
    pontosPorDolar: 2.5,
    acessosVIP: 2,
    redeTier: "mastercard_black",
    seguro: 220,
    outros: 100,
    seguroOutrosDesc: "Seguro viagem internacional (assistência médica, bagagem extraviada) e proteção de compras / garantia estendida, no padrão dos cartões Visa Infinite / Mastercard Black. Inclui também assistente pessoal 24h e cartão adicional gratuito.",
    obs: "Isenção da anuidade alcançada só com o gasto mensal informado. Pontos Átomos: 2,5/US$ no crédito (base, sem exigências extras).",
  },
  {
    id: "c6carbon",
    name: "C6 Carbon",
    banco: "C6 Bank",
    anuidade: 1176,
    gastoElegibilidade: null,
    gastoIsencao: 8000,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 50000,
    investIsencao: 50000,
    tipo: "pontos",
    programa: "atomos",
    pontosPorDolar: 2.5,
    acessosVIP: 4,
    redeTier: "mastercard_black",
    seguro: 220,
    outros: 100,
    seguroOutrosDesc: "Seguro viagem internacional (assistência médica, bagagem extraviada) e proteção de compras / garantia estendida, no padrão dos cartões Visa Infinite / Mastercard Black. Inclui também assistente pessoal 24h e cartão adicional gratuito.",
    obs: "Meta de gasto (R$ 8 mil/mês) fica acima do perfil — isenção via investimento em CDB próprio. Pontos Átomos sobem a 2,7-3,5/US$ só com R$ 250 mil a R$ 1 milhão investidos (fora do orçamento de R$ 200 mil).",
  },
  {
    id: "btgblack",
    name: "BTG Black",
    banco: "BTG Pactual",
    anuidade: 480,
    gastoElegibilidade: null,
    gastoIsencao: 4000,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 40000,
    investIsencao: 40000,
    tipo: "pontos",
    programa: "livelo",
    pontosPorDolar: 2.2,
    acessosVIP: 4,
    redeTier: "mastercard_black",
    seguro: 220,
    outros: 100,
    seguroOutrosDesc: "Seguro viagem internacional (assistência médica, bagagem extraviada) e proteção de compras / garantia estendida, no padrão dos cartões Visa Infinite / Mastercard Black. Inclui também assistente pessoal 24h e cartão adicional gratuito.",
    obs: "Anuidade proporcional: cada R$1.000 gasto ou R$10.000 investido desconta R$10/mês. Alternativa: 1% de cashback direto em vez de pontos. Programa exato do BTG varia por fonte — tratamos como equivalente à Livelo.",
  },
  {
    id: "santanderunique",
    name: "Santander Unique",
    banco: "Santander",
    anuidade: 1155,
    gastoElegibilidade: null,
    gastoIsencao: 8000,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 50000,
    investIsencao: 50000,
    tipo: "pontos",
    programa: "esfera",
    pontosPorDolar: 2.2,
    acessosVIP: 4,
    redeTier: "visa_infinite",
    seguro: 220,
    outros: 100,
    seguroOutrosDesc: "Seguro viagem internacional (assistência médica, bagagem extraviada) e proteção de compras / garantia estendida, no padrão dos cartões Visa Infinite / Mastercard Black. Inclui também assistente pessoal 24h e cartão adicional gratuito.",
    obs: "Isenção exige cumprir 2 de 3 critérios: ser correntista com pacote de serviços ativo, gastar R$ 8 mil/fatura ou ter R$ 50 mil investidos (aqui simplificamos assumindo que o correntista já cumpre o primeiro). Pontuação Esfera varia bastante por segmento (2 a 2,6/US$ nacional); usamos uma média conservadora.",
  },
  {
    id: "santanderunlimited",
    name: "Santander Unlimited",
    banco: "Santander",
    anuidade: 2200,
    gastoElegibilidade: null,
    gastoIsencao: 30000,
    rendaElegibilidade: 30000,
    rendaIsencao: null,
    investElegibilidade: 5000000,
    investIsencao: 5000000,
    tipo: "pontos",
    programa: "esfera",
    pontosPorDolar: 2.6,
    acessosVIP: 10,
    redeTier: "ultra",
    seguro: 370,
    outros: 160,
    seguroOutrosDesc: "Seguro viagem internacional com cobertura ampliada, própria de cartões ultra-premium ligados a relacionamento private banking, além de proteção de compras / garantia estendida. Inclui concierge dedicado 24h e cartão adicional gratuito.",
    obs: "Elegibilidade: R$ 5 milhões investidos ou R$ 30 mil de renda mensal. Isenção da anuidade: R$ 5 milhões investidos ou R$ 30 mil por fatura em gastos. Pontuação Esfera sobe para clientes Select/Agro/Especial (até 3,6/US$ internacional). Salas VIP ilimitadas (Priority Pass + LoungeKey); modelamos como 10x/ano.",
  },
  {
    id: "bradesco",
    name: "Bradesco Visa Infinite",
    banco: "Bradesco",
    anuidade: 1200,
    gastoElegibilidade: null,
    gastoIsencao: 5000,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 50000,
    investIsencao: 50000,
    tipo: "pontos",
    programa: "livelo",
    pontosPorDolar: 1.8,
    acessosVIP: 4,
    redeTier: "visa_infinite",
    seguro: 220,
    outros: 100,
    seguroOutrosDesc: "Seguro viagem internacional (assistência médica, bagagem extraviada) e proteção de compras / garantia estendida, no padrão dos cartões Visa Infinite / Mastercard Black. Inclui também assistente pessoal 24h e cartão adicional gratuito.",
    obs: "Isenção por investimento (R$ 50 mil) costuma valer só no 1º ano de campanhas promocionais; a partir do 2º ano o banco cobra gasto mensal recorrente (fontes variam entre R$ 3 mil e R$ 5 mil). Pontuação Livelo: 1,8/US$ em compras nacionais, 2,5/US$ em internacionais — aqui usamos a taxa nacional.",
  },
  {
    id: "bradesconanquim",
    name: "Bradesco Elo Nanquim",
    banco: "Bradesco",
    anuidade: 1600,
    gastoElegibilidade: null,
    gastoIsencao: 5000,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 50000,
    investIsencao: 50000,
    tipo: "pontos",
    programa: "livelo",
    pontosPorDolar: 1.8,
    acessosVIP: 2,
    redeTier: "mastercard_black",
    seguro: 220,
    outros: 100,
    seguroOutrosDesc: "Seguro viagem internacional (assistência médica, bagagem extraviada) e proteção de compras / garantia estendida, no padrão dos cartões Visa Infinite / Mastercard Black. Inclui também assistente pessoal 24h e cartão adicional gratuito.",
    obs: "Fontes divergem: há quem diga que não existe isenção total permanente por gasto/investimento fora de campanhas promocionais para novas contas — vale confirmar direto com o gerente antes de contar com isso todo ano.",
  },
  {
    id: "bradescoaeternum",
    name: "Bradesco Aeternum Visa Infinite",
    banco: "Bradesco",
    anuidade: 3000,
    gastoElegibilidade: null,
    gastoIsencao: null,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 5000000,
    investIsencao: 5000000,
    tipo: "pontos",
    programa: "livelo",
    pontosPorDolar: 4.0,
    acessosVIP: 12,
    redeTier: "ultra",
    seguro: 370,
    outros: 160,
    seguroOutrosDesc: "Seguro viagem internacional com cobertura ampliada, própria de cartões ultra-premium ligados a relacionamento private banking, além de proteção de compras / garantia estendida. Inclui concierge dedicado 24h e cartão adicional gratuito.",
    investimentoObrigatorio: true,
    obs: "Cartão ultra-premium ligado ao relacionamento Private Banking — não é um produto de livre solicitação, então não existe a opção de simplesmente pagar a anuidade sem o investimento. Os R$ 5 milhões são requisito de acesso, não só de isenção. Anuidade exata não é divulgada publicamente (estimativa). Salas VIP próprias (Bradesco Lounge) têm acesso e Dragonpass; modelamos como 12x/ano por não haver limite claro. Use a opção de ignorar custo de oportunidade só se você já se qualifica por outro caminho (ex.: já é cliente Private).",
  },
  {
    id: "itaupersonnalite",
    name: "Itaú Personnalité (Black/Visa Infinite)",
    banco: "Itaú",
    anuidade: 1200,
    gastoElegibilidade: null,
    gastoIsencao: 5000,
    rendaElegibilidade: 15000,
    rendaIsencao: null,
    investElegibilidade: 250000,
    investIsencao: 50000,
    tipo: "pontos",
    programa: "iupp",
    pontosPorDolar: 2.5,
    acessosVIP: 4,
    redeTier: "mastercard_black",
    seguro: 220,
    outros: 100,
    seguroOutrosDesc: "Seguro viagem internacional (assistência médica, bagagem extraviada) e proteção de compras / garantia estendida, no padrão dos cartões Visa Infinite / Mastercard Black. Inclui também assistente pessoal 24h e cartão adicional gratuito.",
    obs: "Ser cliente Personnalité (pré-requisito pra esse cartão) pede renda de R$ 15 mil/mês ou R$ 250 mil investidos. Uma vez cliente, a isenção específica da anuidade do cartão cai pra R$ 50 mil investidos ou R$ 5 mil/mês em gastos. Existe também uma versão sem programa de pontos/cashback com anuidade zero permanente, não modelada aqui. Taxa de pontos (Iupp) estimada — confirme no app.",
  },
  {
    id: "itauprivate",
    name: "Itaú Private Visa Infinite",
    banco: "Itaú",
    anuidade: 0,
    gastoElegibilidade: null,
    gastoIsencao: null,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 5000000,
    investIsencao: 5000000,
    tipo: "pontos",
    programa: "iupp",
    pontosPorDolar: 3.0,
    acessosVIP: 10,
    redeTier: "ultra",
    seguro: 370,
    outros: 160,
    seguroOutrosDesc: "Seguro viagem internacional com cobertura ampliada, própria de cartões ultra-premium ligados a relacionamento private banking, além de proteção de compras / garantia estendida. Inclui concierge dedicado 24h e cartão adicional gratuito.",
    investimentoObrigatorio: true,
    obs: "Exclusivo pra quem já é cliente Itaú Private (R$ 5 milhões investidos no banco) — sem essa via, não tem como pedir o cartão. Anuidade já é zero para quem se qualifica, sem precisar de gasto ou investimento adicional além disso. Só 10 acessos VIP por ano, um número baixo pra esse patamar de exigência (alvo de crítica recorrente entre especialistas em milhas).",
  },
  {
    id: "xpinfinite50",
    name: "XP Visa Infinite (R$ 50 mil investidos)",
    banco: "XP Investimentos",
    anuidade: 0,
    gastoElegibilidade: null,
    gastoIsencao: null,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 50000,
    investIsencao: 50000,
    tipo: "cashback",
    cashbackPercent: 0.01,
    acessosVIP: 4,
    redeTier: "visa_infinite",
    seguro: 220,
    outros: 100,
    seguroOutrosDesc: "Seguro viagem internacional (assistência médica, bagagem extraviada) e proteção de compras / garantia estendida, no padrão dos cartões Visa Infinite / Mastercard Black. Inclui também assistente pessoal 24h e cartão adicional gratuito.",
    investimentoObrigatorio: true,
    obs: "Anuidade é zero mesmo sem investir — os R$ 50 mil aqui destravam 4 acessos VIP/ano (2 acessos exigem só R$ 5 mil). Como não há anuidade pra 'pagar em vez de investir', o investimento é obrigatório pra ter esse nível de benefício. Existe alternativa de pontos (até 2,2/dólar, só em compras internacionais), não modelada aqui.",
  },
  {
    id: "xpone",
    name: "XP One Visa Infinite (R$ 5 mil investidos)",
    banco: "XP Investimentos",
    anuidade: 0,
    gastoElegibilidade: null,
    gastoIsencao: null,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 5000,
    investIsencao: 5000,
    tipo: "cashback",
    cashbackPercent: 0.008,
    acessosVIP: 2,
    redeTier: "visa_infinite",
    seguro: 220,
    outros: 100,
    seguroOutrosDesc: "Seguro viagem internacional (assistência médica, bagagem extraviada) e proteção de compras / garantia estendida, no padrão dos cartões Visa Infinite / Mastercard Black. Inclui também assistente pessoal 24h e cartão adicional gratuito.",
    investimentoObrigatorio: true,
    obs: "Versão de entrada: anuidade zero, investimento mínimo bem menor — mas, assim como no XP Visa Infinite, esse investimento é obrigatório pra ter o benefício, não uma alternativa à anuidade. Também dá pra escolher pontos Livelo em vez de cashback.",
  },
  {
    id: "nubankultravioleta",
    name: "Nubank Ultravioleta",
    banco: "Nubank",
    anuidade: 0,
    gastoElegibilidade: null,
    gastoIsencao: null,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 0,
    investIsencao: 0,
    tipo: "cashback",
    cashbackPercent: 0.0125,
    acessosVIP: 4,
    redeTier: "mastercard_black",
    seguro: 220,
    outros: 100,
    seguroOutrosDesc: "Seguro viagem internacional (assistência médica, bagagem extraviada) e proteção de compras / garantia estendida, no padrão dos cartões Visa Infinite / Mastercard Black. Inclui também assistente pessoal 24h e cartão adicional gratuito.",
    obs: "Anuidade zero permanente, sem exigência de gasto ou investimento — é liberado por convite/relacionamento (bom score e histórico), não por valor investido. Alternativa: 2,2 pontos por dólar em vez de 1,25% de cashback.",
  },
  {
    id: "interprime",
    name: "Inter Prime",
    banco: "Banco Inter",
    anuidade: 0,
    gastoElegibilidade: 7000,
    gastoIsencao: 7000,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 150000,
    investIsencao: 150000,
    tipo: "pontos",
    programa: "loop",
    baseCalculo: "real",
    pontosPorDolar: 0.4,
    acessosVIP: 6,
    redeTier: "mastercard_black",
    ajusteExtraDefault: 40,
    extraDesc: "Assinatura Duo Gourmet (compre um prato, leve dois, em restaurantes parceiros) — não faz parte do pacote padrão Mastercard Black, é um plus específico do Inter.",
    investimentoObrigatorio: true,
    obs: "Anuidade zero permanente, mas só é liberado com R$ 150 mil investidos no Inter OU R$ 7 mil/mês em gastos sustentados nas últimas 4 faturas (ex-'Inter Black', renomeado em 2026) — sem essas duas vias não dá pra ter o cartão, por isso o investimento entra como obrigatório mesmo havendo a alternativa por gasto. Pontuação Inter Loop: 1 ponto a cada R$ 2,50 gastos (0,4 ponto/R$, direto — não depende do dólar). 6 acessos Priority Pass/ano + acesso ilimitado às salas próprias do Inter em Guarulhos, Curitiba e Confins (não contabilizado à parte).",
  },
  {
    id: "interwin",
    name: "Inter Win",
    banco: "Banco Inter",
    anuidade: 0,
    gastoElegibilidade: null,
    gastoIsencao: null,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 1000000,
    investIsencao: 1000000,
    tipo: "pontos",
    programa: "loop",
    baseCalculo: "real",
    pontosPorDolar: 0.5,
    acessosVIP: 12,
    redeTier: "mastercard_black",
    ajusteExtraDefault: 40,
    extraDesc: "Assinatura Duo Gourmet (compre um prato, leve dois, em restaurantes parceiros) — pacote de assessoria exclusivo desse tier, sem equivalente no Inter Prime nem no pacote padrão Mastercard Black.",
    investimentoObrigatorio: true,
    obs: "Tier mais alto do Inter — anuidade zero permanente, mas o único critério de elegibilidade é enquadramento no segmento Inter One: R$ 1 milhão em ativos sob custódia no banco. Não existe via alternativa por gasto (diferente do Prime). Pontuação Inter Loop: 1 ponto a cada R$ 2,00 gastos (0,5 ponto/R$, direto — não depende do dólar). LoungeKey ilimitado (mais de 1.100 salas em 500 aeroportos) — modelado como 12x/ano por não haver teto real. O seguro viagem e a proteção de compras são os mesmos do padrão Mastercard Black, sem diferença em relação ao Prime.",
  },
  {
    id: "bbourocardinfinite",
    name: "BB Ourocard Visa Infinite",
    banco: "Banco do Brasil",
    anuidade: 996,
    gastoElegibilidade: null,
    gastoIsencao: 15000,
    rendaElegibilidade: 10000,
    rendaIsencao: null,
    investElegibilidade: 250000,
    investIsencao: 250000,
    tipo: "pontos",
    programa: "livelo",
    pontosPorDolar: 2.0,
    acessosVIP: 4,
    redeTier: "visa_infinite",
    seguro: 220,
    outros: 100,
    seguroOutrosDesc: "Seguro viagem internacional (assistência médica, bagagem extraviada) e proteção de compras / garantia estendida, no padrão dos cartões Visa Infinite / Mastercard Black. Inclui também assistente pessoal 24h e cartão adicional gratuito.",
    obs: "Corrigido após nova checagem: gasto mínimo real é R$ 15 mil/mês (R$ 10 mil para clientes do segmento Estilo) — bem mais alto do que o estimado antes. Isenção por investimento é R$ 250 mil, independente do gasto. Elegibilidade básica (aprovação do cartão) pede renda de R$ 10 mil + limite de R$ 10 mil em outro cartão — renda sozinha não isenta a anuidade, só permite ter o cartão. Pontuação Livelo: 3 pts/US$ em compras internacionais (usamos uma taxa nacional mais conservadora de 2 pts/US$, não confirmada). Ter esse cartão ativo ainda dá 90% de desconto na anuidade do Elo Nanquim e 80% no Mastercard Black — não modelado aqui.",
  },
  {
    id: "itauplatinum",
    name: "Itaú Platinum",
    banco: "Itaú",
    anuidade: 0,
    gastoElegibilidade: null,
    gastoIsencao: null,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 0,
    investIsencao: 0,
    tipo: "pontos",
    programa: "iupp",
    pontosPorDolar: 1.5,
    acessosVIP: 0,
    redeTier: "basico",
    seguro: 30,
    outros: 0,
    seguroOutrosDesc: "Proteção de compras / garantia estendida padrão da bandeira. Sem seguro viagem incluído — é um cartão de entrada, sem esse tipo de cobertura.",
    obs: "Sem anuidade e sem renda mínima — substituiu o antigo Itaú Click+. Pontuação de até 1,5 ponto/dólar só é liberada com planos pagos do Iupp (mensalidade não modelada aqui); sem sala VIP. Cartão de entrada, não premium — serve de comparação com o custo zero.",
  },
  {
    id: "nubankplatinum",
    name: "Nubank Platinum (padrão)",
    banco: "Nubank",
    anuidade: 0,
    gastoElegibilidade: null,
    gastoIsencao: null,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 0,
    investIsencao: 0,
    tipo: "cashback",
    cashbackPercent: 0,
    acessosVIP: 0,
    redeTier: "basico",
    seguro: 30,
    outros: 0,
    seguroOutrosDesc: "Proteção de compras / garantia estendida padrão da bandeira. Sem seguro viagem incluído — é um cartão de entrada, sem esse tipo de cobertura.",
    obs: "O cartão mais usado do Brasil em número de clientes. Sem anuidade, mas também sem pontos ou cashback nativos — existe o programa opcional Nubank Rewards, com mensalidade própria, não modelado aqui.",
  },
  {
    id: "neonmastercard",
    name: "Neon Mastercard",
    banco: "Neon",
    anuidade: 0,
    gastoElegibilidade: null,
    gastoIsencao: null,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 0,
    investIsencao: 0,
    tipo: "cashback",
    cashbackPercent: 0.005,
    acessosVIP: 0,
    redeTier: "basico",
    seguro: 30,
    outros: 0,
    seguroOutrosDesc: "Proteção de compras / garantia estendida padrão da bandeira. Sem seguro viagem incluído — é um cartão de entrada, sem esse tipo de cobertura.",
    obs: "Sem anuidade, aprovação flexível (até para quem tem score baixo). Cashback de até 0,5% em compras, sem sala VIP ou seguro robusto — cartão de entrada, não premium.",
  },
  {
    id: "pagbank",
    name: "PagBank (limite garantido)",
    banco: "PagBank",
    anuidade: 0,
    gastoElegibilidade: null,
    gastoIsencao: null,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 0,
    investIsencao: 0,
    tipo: "cashback",
    cashbackPercent: 0.0075,
    acessosVIP: 0,
    redeTier: "basico",
    seguro: 30,
    outros: 0,
    seguroOutrosDesc: "Proteção de compras / garantia estendida padrão da bandeira. Sem seguro viagem incluído — é um cartão de entrada, sem esse tipo de cobertura.",
    obs: "Sem anuidade e sem análise de crédito tradicional — o limite é garantido por um CDB próprio do PagBank (que rende separadamente, não contabilizado aqui). Cashback de 0,5% a 1% dependendo do valor da fatura.",
  },
  {
    id: "btgultrablue",
    name: "BTG Ultrablue",
    banco: "BTG Pactual",
    anuidade: 4800,
    gastoElegibilidade: null,
    gastoIsencao: null,
    rendaElegibilidade: null,
    rendaIsencao: null,
    investElegibilidade: 1000000,
    investIsencao: 1000000,
    tipo: "pontos",
    programa: "livelo",
    pontosPorDolar: 3.5,
    acessosVIP: 12,
    redeTier: "ultra",
    seguro: 370,
    outros: 160,
    seguroOutrosDesc: "Seguro viagem internacional com cobertura ampliada, própria de cartões ultra-premium ligados a relacionamento private banking, além de proteção de compras / garantia estendida. Inclui concierge dedicado 24h e cartão adicional gratuito.",
    investimentoObrigatorio: true,
    obs: "Cartão de metal do BTG oferecido a clientes de alto relacionamento — não é um produto de livre solicitação, então o investimento é requisito de acesso, não só de isenção; não existe alternativa de 'só pagar a anuidade'. Anuidade de R$ 4.800/ano (R$ 400/mês). O valor de R$ 1 milhão é uma estimativa conservadora (pode chegar a R$ 3-5 milhões na versão mais nova, World Legend). Alternativa: 1,7% de cashback em vez de pontos. Salas VIP ilimitadas com até 12 convidados/ano.",
  },
];

const fmtBRL = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const fmtNum = (v) => Math.round(v).toLocaleString("pt-BR");

const initOverrides = () =>
  Object.fromEntries(
    CARDS.map((c) => [
      c.id,
      {
        rendimentoProprio: 100,
        acessosVIP: c.acessosVIP,
        taxaRecompensa: c.tipo === "pontos" ? c.pontosPorDolar : c.cashbackPercent,
        ignorarOportunidade: false,
        ajusteExtra: c.ajusteExtraDefault ?? 0,
      },
    ])
  );

const initValoresPontos = () =>
  Object.fromEntries(Object.entries(PROGRAMS).map(([k, p]) => [k, p.default]));

function Campo({ label, valor, children, desc, min, max, step, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="font-mono text-amber-700">{valor}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={children}
        onChange={(e) => onChange(Number(e.target.value))} className="accent-amber-600" />
      {desc && <span className="text-xs text-stone-500">{desc}</span>}
    </label>
  );
}

function CampoManual({ label, value, onChange, desc }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="font-mono text-amber-700">
          {value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
        </span>
      </span>
      <div className="flex items-center gap-1.5 border border-stone-300 rounded px-2 py-1.5 bg-stone-50 focus-within:border-amber-500 focus-within:bg-white transition-colors">
        <span className="text-stone-400 font-mono text-sm">R$</span>
        <input
          type="text"
          inputMode="numeric"
          value={value.toLocaleString("pt-BR")}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            onChange(digits ? Number(digits) : 0);
          }}
          className="w-full font-mono text-sm text-stone-900 bg-transparent outline-none"
        />
      </div>
      {desc && <span className="text-xs text-stone-500">{desc}</span>}
    </label>
  );
}

export default function RankingCartoes() {
  const [gastoMensal, setGastoMensal] = useState(4000);
  const [renda, setRenda] = useState(8000);
  const [cdi, setCdi] = useState(14.15);
  const [cotacaoDolar, setCotacaoDolar] = useState(5.08);
  const [acessosUsadosAno, setAcessosUsadosAno] = useState(4);
  const [valorAcessoVIP, setValorAcessoVIP] = useState(150);

  const [taxaOportunidade, setTaxaOportunidade] = useState(100);
  const [valoresTier, setValoresTier] = useState({
    basico: 30,
    mastercard_black: 320,
    visa_infinite: 320,
    ultra: 530,
  });
  const [valoresPontos, setValoresPontos] = useState(initValoresPontos);
  const [investimentoMaximo, setInvestimentoMaximo] = useState(10000);

  const [overrides, setOverrides] = useState(initOverrides);
  const [expanded, setExpanded] = useState(null);
  const [mostrarAvancado, setMostrarAvancado] = useState(false);
  const [sortCol, setSortCol] = useState("ganhoTotal");
  const [sortDir, setSortDir] = useState("desc");

  const setOv = (id, field, val) =>
    setOverrides((o) => ({ ...o, [id]: { ...o[id], [field]: val } }));
  const setPrograma = (key, val) =>
    setValoresPontos((v) => ({ ...v, [key]: val }));

  const results = useMemo(() => {
    const cdiFrac = cdi / 100;
    const oportunidadeFrac = (taxaOportunidade / 100) * cdiFrac;
    const gastoAnual = gastoMensal * 12;

    const rows = CARDS.map((c) => {
      const ov = overrides[c.id];
      const proprioFrac = (ov.rendimentoProprio / 100) * cdiFrac;

      // Elegibilidade = consigo TER o cartão. Isenção = consigo ZERAR a anuidade.
      // Cada critério (gasto, renda, investimento) pode não existir pra um cartão —
      // nesse caso o campo é null e essa via nunca conta como cumprida.
      const eligivelPorGasto = c.gastoElegibilidade !== null && gastoMensal >= c.gastoElegibilidade;
      const isentoPorGasto = c.gastoIsencao !== null && gastoMensal >= c.gastoIsencao;
      const eligivelPorRenda = c.rendaElegibilidade !== null && renda >= c.rendaElegibilidade;
      const isentoPorRenda = c.rendaIsencao !== null && renda >= c.rendaIsencao;
      const elegivelPorInvest = c.investElegibilidade !== null && investimentoMaximo >= c.investElegibilidade;
      const isentoPorInvestDentroOrcamento = c.investIsencao !== null && investimentoMaximo >= c.investIsencao;

      const isentoGratis = isentoPorGasto || isentoPorRenda;
      // Cartões "fechados" (investimentoObrigatorio) só existem pra quem bate alguma elegibilidade;
      // os demais sempre têm a via normal de solicitar e pagar a anuidade cheia.
      const elegivel = !c.investimentoObrigatorio || eligivelPorGasto || eligivelPorRenda || elegivelPorInvest;

      let via = "gasto";
      let viavel = true;
      let custoOportunidade = 0;

      if (ov.ignorarOportunidade) {
        via = isentoGratis ? (isentoPorGasto ? "gasto" : "renda") : "investimento";
      } else if (isentoGratis) {
        via = isentoPorGasto ? "gasto" : "renda";
      } else if (!elegivel) {
        via = "inviável";
        viavel = false;
        custoOportunidade = c.anuidade;
      } else if (!isentoPorInvestDentroOrcamento) {
        via = "anuidade (orçamento insuficiente)";
        custoOportunidade = c.anuidade;
      } else {
        const custoInvest = Math.round(c.investIsencao * (oportunidadeFrac - proprioFrac));
        if (!c.investimentoObrigatorio && custoInvest > c.anuidade) {
          via = "anuidade (mais barato)";
          custoOportunidade = c.anuidade;
        } else {
          via = "investimento";
          custoOportunidade = custoInvest;
        }
      }
      if (c.investIsencao === 0 && !isentoGratis && via === "investimento") {
        via = "gratuito";
        custoOportunidade = 0;
      }

      let pontosAnual = 0;
      let valorRecompensa = 0;
      if (c.tipo === "pontos") {
        pontosAnual =
          c.baseCalculo === "real"
            ? gastoAnual * ov.taxaRecompensa
            : (gastoAnual / cotacaoDolar) * ov.taxaRecompensa;
        const valorPontoReais = (valoresPontos[c.programa] ?? 3.0) / 100;
        valorRecompensa = pontosAnual * valorPontoReais;
      } else {
        valorRecompensa = gastoAnual * ov.taxaRecompensa;
      }

      const acessosUsados = Math.min(acessosUsadosAno, ov.acessosVIP);
      const valorLounge = acessosUsados * valorAcessoVIP;
      const valorSeguroOutros = (valoresTier[c.redeTier] ?? 0) + ov.ajusteExtra;

      const totalBeneficios = valorRecompensa + valorLounge + valorSeguroOutros;
      const ganhoTotal = totalBeneficios - custoOportunidade;
      const anuidadePaga = via.startsWith("anuidade") || via === "inviável" ? c.anuidade : 0;

      return {
        ...c,
        ov,
        isentoGratis,
        via,
        viavel,
        custoOportunidade,
        pontosAnual,
        valorRecompensa,
        acessosUsados,
        valorLounge,
        valorSeguroOutros,
        totalBeneficios,
        ganhoTotal,
        anuidadePaga,
      };
    });

    return rows.sort((a, b) => {
      if (a.viavel !== b.viavel) return a.viavel ? -1 : 1;
      return b.ganhoTotal - a.ganhoTotal;
    });
  }, [gastoMensal, cdi, taxaOportunidade, cotacaoDolar, acessosUsadosAno, valorAcessoVIP, valoresTier, valoresPontos, investimentoMaximo, renda, overrides]);

  const tabelaOrdenada = useMemo(() => {
    const arr = [...results];
    arr.sort((a, b) => {
      let av = a[sortCol];
      let bv = b[sortCol];
      if (typeof av === "string") {
        av = av.toLowerCase();
        bv = bv.toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [results, sortCol, sortDir]);

  const handleSort = (col) => {
    if (col === sortCol) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir(col === "name" ? "asc" : "desc");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6 border-b border-stone-300 pb-4">
          <p className="text-xs uppercase tracking-widest text-amber-700 font-semibold mb-1">
            Ranking de cartões premium
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Qual cartão vale mais a pena pra você?
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Preencha os parâmetros e descubra qual cartão você pode conseguir e vale mais a pena para você.
          </p>
        </header>

        {/* Parâmetros gerais */}
        <section className="bg-white border border-stone-200 rounded-lg p-4 mb-5">
          <h2 className="font-serif font-semibold text-stone-800 mb-3">Parâmetros gerais</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <CampoManual label="Gasto mensal no cartão" value={gastoMensal} onChange={setGastoMensal} />
            <CampoManual label="Investimento máximo disponível" value={investimentoMaximo} onChange={setInvestimentoMaximo}
              desc="Investimento que você faria no banco emissor do cartão. Só será necessário se for a forma mais econômica de conseguir o cartão." />
            <CampoManual label="Renda mensal" value={renda} onChange={setRenda}
              desc="Alguns cartões liberam elegibilidade ou isenção com base na renda, em vez de gasto ou investimento. Sugestão inicial: o dobro do seu gasto mensal." />
            <Campo label="Cotação do dólar" valor={`R$ ${cotacaoDolar.toFixed(2)}`} min={4.5} max={6.0} step={0.01}
              onChange={setCotacaoDolar} desc="Câmbio usado para converter 'pontos por dólar' em pontos por real gasto, nos cartões que usam esse método de cálculo.">
              {cotacaoDolar}
            </Campo>
            <Campo label="Vezes/ano que você usaria salas VIP" valor={`${acessosUsadosAno}x`} min={0} max={12} step={1}
              onChange={setAcessosUsadosAno} desc="Quantos acessos você aproveitaria por ano.">
              {acessosUsadosAno}
            </Campo>
            <Campo label="Valor por acesso à sala VIP" valor={fmtBRL(valorAcessoVIP)} min={0} max={300} step={10}
              onChange={setValorAcessoVIP} desc="Quanto vale para você o acesso a uma sala VIP.">
              {valorAcessoVIP}
            </Campo>
          </div>
        </section>

        {/* Parâmetros avançados */}
        <section className="bg-white border border-stone-200 rounded-lg p-4 mb-5">
          <button
            onClick={() => setMostrarAvancado((v) => !v)}
            className="w-full flex items-center justify-between font-serif font-semibold text-stone-800"
          >
            <span>Parâmetros avançados</span>
            <span className="text-xs text-amber-700 font-mono">{mostrarAvancado ? "ocultar ▲" : "mostrar ▼"}</span>
          </button>

          {mostrarAvancado && (
            <div className="mt-4 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Campo label="CDI (% a.a.)" valor={`${cdi.toFixed(2)}%`} min={5} max={18} step={0.05}
                  onChange={setCdi} desc="Taxa básica de referência da renda fixa hoje — usada como base para calcular o rendimento do dinheiro investido.">
                  {cdi}
                </Campo>
                <Campo label="Taxa de oportunidade (% do CDI)" valor={`${taxaOportunidade}%`} min={90} max={130} step={1}
                  onChange={setTaxaOportunidade}
                  desc="Rendimento que seu dinheiro conseguiria fora do banco emissor. 100% do CDI é o padrão neutro; suba se você normalmente consegue taxas melhores em outro lugar.">
                  {taxaOportunidade}
                </Campo>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-1">Valor do pacote de seguro/benefícios por categoria de cartão</h3>
                <p className="text-xs text-stone-500 mb-3">
                  Cada categoria de cartão tem um pacote padrão de seguro viagem, proteção de compras,
                  concierge e cartão adicional. Ajuste o valor de cada categoria pra cima ou pra baixo se
                  achar que ela vale mais ou menos do que estimamos — afeta todos os cartões daquele grupo
                  de uma vez.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Campo label="Cartões básicos" valor={fmtBRL(valoresTier.basico)} min={0} max={1000} step={10}
                    onChange={(v) => setValoresTier((p) => ({ ...p, basico: v }))}
                    desc="Cartões de entrada, sem seguro viagem — só proteção de compras básica.">
                    {valoresTier.basico}
                  </Campo>
                  <Campo label="Mastercard Black" valor={fmtBRL(valoresTier.mastercard_black)} min={0} max={1000} step={10}
                    onChange={(v) => setValoresTier((p) => ({ ...p, mastercard_black: v }))}
                    desc="Pacote padrão dos cartões na bandeira Mastercard Black.">
                    {valoresTier.mastercard_black}
                  </Campo>
                  <Campo label="Visa Infinite" valor={fmtBRL(valoresTier.visa_infinite)} min={0} max={1000} step={10}
                    onChange={(v) => setValoresTier((p) => ({ ...p, visa_infinite: v }))}
                    desc="Pacote padrão dos cartões na bandeira Visa Infinite.">
                    {valoresTier.visa_infinite}
                  </Campo>
                  <Campo label="Nível mais elevado (Ultrablue, Aeternum...)" valor={fmtBRL(valoresTier.ultra)} min={0} max={1000} step={10}
                    onChange={(v) => setValoresTier((p) => ({ ...p, ultra: v }))}
                    desc="Cartões ultra-premium ligados a relacionamento private banking, com cobertura ampliada e concierge dedicado.">
                    {valoresTier.ultra}
                  </Campo>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-1">Valor do ponto por programa de fidelidade</h3>
                <p className="text-xs text-stone-500 mb-3">
                  Cada banco usa um programa diferente (Livelo, Esfera, Átomos, Iupp, Loop), e cada um tem
                  liquidez e parceiros de transferência diferentes — por isso o ponto de um vale mais que o
                  de outro. Ajuste conforme a sua experiência real de resgate.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(PROGRAMS).map(([key, p]) => (
                    <Campo key={key} label={p.label} valor={`R$ ${(valoresPontos[key] / 100).toFixed(3)}/pt`}
                      min={0.5} max={5.0} step={0.1} onChange={(v) => setPrograma(key, v)} desc={p.desc}>
                      {valoresPontos[key]}
                    </Campo>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Ranking */}
        <section className="space-y-3">
          {results.map((r, i) => {
            const isOpen = expanded === r.id;
            return (
              <div key={r.id} className={`border rounded-lg overflow-hidden ${
                i === 0 ? "border-amber-400 bg-amber-50" : "border-stone-200 bg-white"
              }`}>
                <button onClick={() => setExpanded(isOpen ? null : r.id)}
                  className="w-full flex items-center justify-between p-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className={`font-serif text-lg font-bold w-7 h-7 flex items-center justify-center rounded-full ${
                      i === 0 ? "bg-amber-600 text-white" : "bg-stone-200 text-stone-700"
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-stone-900 flex items-center gap-2">
                        {r.name}
                        {!r.viavel && (
                          <span className="text-[10px] uppercase tracking-wide bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
                            excede orçamento
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-stone-500">{r.banco}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-mono text-sm font-semibold ${
                      r.ganhoTotal >= 0 ? "text-emerald-700" : "text-rose-700"
                    }`}>
                      {fmtBRL(r.ganhoTotal)}/ano
                    </p>
                    <p className="text-xs text-stone-400">valor líquido total</p>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 text-sm text-stone-700 border-t border-stone-200 pt-3 space-y-4">
                    {/* Sliders específicos do cartão */}
                    <div className="grid sm:grid-cols-2 gap-4 bg-stone-50 rounded-md p-3">
                      <Campo label="Rendimento do CDB próprio (% do CDI)" valor={`${r.ov.rendimentoProprio}%`}
                        min={80} max={120} step={1} onChange={(v) => setOv(r.id, "rendimentoProprio", v)}
                        desc="Quanto o produto de renda fixa desse banco rende, comparado ao CDI — quanto maior, menor o custo de oportunidade de investir nele.">
                        {r.ov.rendimentoProprio}
                      </Campo>
                      <div className="sm:col-span-2 text-xs text-stone-500">
                        <span className="font-medium text-stone-700">Pacote padrão da categoria: </span>
                        {fmtBRL(valoresTier[r.redeTier] ?? 0)}/ano (ajustável na régua por categoria, em
                        Parâmetros avançados). {r.seguroOutrosDesc}
                      </div>
                      <Campo label="Valor adicional percebido nesse cartão" valor={fmtBRL(r.ov.ajusteExtra)}
                        min={-300} max={300} step={10} onChange={(v) => setOv(r.id, "ajusteExtra", v)}
                        desc={r.extraDesc || "Some (ou subtraia) aqui algo específico deste cartão que não faz parte do pacote padrão da categoria, ou uma desvantagem que você percebe nele. Aceita valores negativos."}>
                        {r.ov.ajusteExtra}
                      </Campo>
                      <Campo label="Nº de acessos à sala VIP por ano" valor={`${r.ov.acessosVIP}x/ano`}
                        min={0} max={12} step={1} onChange={(v) => setOv(r.id, "acessosVIP", v)}
                        desc="Quantas vezes por ano esse cartão especificamente permite entrar em salas VIP — o valor usado na conta é o menor entre isso e o que você realmente usaria.">
                        {r.ov.acessosVIP}
                      </Campo>
                      <Campo
                        label={r.tipo === "pontos" ? (r.baseCalculo === "real" ? "Pontos por real" : "Pontos por dólar") : "Cashback (%)"}
                        valor={r.tipo === "pontos" ? r.ov.taxaRecompensa.toFixed(1) : `${(r.ov.taxaRecompensa * 100).toFixed(2)}%`}
                        min={0} max={r.tipo === "pontos" ? 4 : 0.03} step={r.tipo === "pontos" ? 0.1 : 0.001}
                        onChange={(v) => setOv(r.id, "taxaRecompensa", v)}
                        desc="Taxa de acúmulo anunciada pelo banco para esse cartão — ajuste se seu perfil de gastos (nacional/internacional) render uma taxa diferente da padrão.">
                        {r.ov.taxaRecompensa}
                      </Campo>
                      <label className="flex items-start gap-2 text-xs sm:col-span-2 pt-1">
                        <input
                          type="checkbox"
                          checked={r.ov.ignorarOportunidade}
                          onChange={(e) => setOv(r.id, "ignorarOportunidade", e.target.checked)}
                          className="accent-amber-600 mt-0.5"
                        />
                        <span>Já tenho a isenção garantida, ignorar anuidade.</span>
                      </label>
                    </div>

                    {/* Aviso de inviabilidade */}
                    {!r.viavel && (
                      <div className="bg-rose-50 border border-rose-300 rounded-md p-2 text-xs text-rose-700">
                        Não alcançável com os parâmetros atuais: exige {fmtBRL(r.investElegibilidade)} de
                        investimento{r.gastoElegibilidade ? `, ${fmtBRL(r.gastoElegibilidade)}/mês de gasto` : ""}
                        {r.rendaElegibilidade ? ` ou ${fmtBRL(r.rendaElegibilidade)}/mês de renda` : ""} — nenhum
                        desses você atinge agora.
                      </div>
                    )}

                    {/* Detalhamento */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
                      {r.via.startsWith("anuidade") || r.via === "inviável" ? (
                        <>
                          <span>
                            Anuidade {r.via === "inviável" ? "(cobrada, hipotético)" : "paga"}
                            {r.via.includes("orçamento") ? " (investimento excede o teto)" : ""}
                            {r.via === "anuidade (mais barato)" ? " (mais barato que investir)" : ""}
                          </span>
                          <span className="text-right text-rose-700">-{fmtBRL(r.anuidade)}/ano</span>
                        </>
                      ) : (
                        <>
                          <span className="text-stone-400">Anuidade evitada (não entra na soma)</span>
                          <span className="text-right text-stone-400">{fmtBRL(r.anuidade)}/ano</span>
                        </>
                      )}
                      <span>Caminho usado</span>
                      <span className="text-right capitalize">{r.via}</span>
                      {!r.isentoGratis && !r.via.startsWith("anuidade") && r.via !== "gratuito" && r.via !== "inviável" && (
                        <>
                          <span>Capital para isenção{r.investimentoObrigatorio ? " (obrigatório)" : ""}</span>
                          <span className="text-right">{fmtBRL(r.investIsencao)}</span>
                          <span>Custo de oportunidade{r.ov.ignorarOportunidade ? " (ignorado)" : ""}</span>
                          <span className={`text-right ${r.ov.ignorarOportunidade ? "text-stone-400" : "text-rose-700"}`}>
                            -{fmtBRL(r.custoOportunidade)}/ano
                          </span>
                        </>
                      )}
                      {r.via === "inviável" && (
                        <>
                          <span>Capital p/ elegibilidade (acima do seu teto)</span>
                          <span className="text-right text-rose-700">{fmtBRL(r.investElegibilidade)}</span>
                        </>
                      )}
                      {r.tipo === "pontos" && (
                        <>
                          <span>Pontos por ano ({PROGRAMS[r.programa]?.label})</span>
                          <span className="text-right">{fmtNum(r.pontosAnual)} pts</span>
                        </>
                      )}
                      <span>{r.tipo === "pontos" ? "Valor dos pontos" : "Valor do cashback"}</span>
                      <span className="text-right text-emerald-700">+{fmtBRL(r.valorRecompensa)}/ano</span>
                      <span>Salas VIP ({r.acessosUsados}x usados de {r.ov.acessosVIP} disponíveis)</span>
                      <span className="text-right text-emerald-700">+{fmtBRL(r.valorLounge)}/ano</span>
                      <span>Seguro + outros</span>
                      <span className="text-right text-emerald-700">+{fmtBRL(r.valorSeguroOutros)}/ano</span>
                      <span className="font-semibold pt-1 border-t border-stone-200">Total líquido</span>
                      <span className={`text-right font-semibold pt-1 border-t border-stone-200 ${
                        r.ganhoTotal >= 0 ? "text-emerald-700" : "text-rose-700"
                      }`}>
                        {fmtBRL(r.ganhoTotal)}/ano
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 pt-1">{r.obs}</p>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Tabela comparativa ordenável */}
        <section className="bg-white border border-stone-200 rounded-lg p-4 mb-5 mt-5 overflow-x-auto">
          <h2 className="font-serif font-semibold text-stone-800 mb-3">Tabela comparativa</h2>
          <table className="w-full text-xs border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-stone-300">
                {[
                  { key: "name", label: "Cartão" },
                  { key: "valorRecompensa", label: "Cashback/Pontos" },
                  { key: "valorLounge", label: "Sala VIP" },
                  { key: "valorSeguroOutros", label: "Seguro/Outros" },
                  { key: "anuidadePaga", label: "Anuidade paga" },
                  { key: "ganhoTotal", label: "Total líquido" },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="cursor-pointer select-none px-2 py-2 text-left font-semibold text-stone-600 hover:text-amber-700 whitespace-nowrap"
                  >
                    {col.label} {sortCol === col.key ? (sortDir === "asc" ? "▲" : "▼") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabelaOrdenada.map((r) => (
                <tr key={r.id} className="border-b border-stone-100">
                  <td className={`px-2 py-2 font-medium whitespace-nowrap ${r.viavel ? "text-stone-800" : "text-rose-600"}`}>
                    {r.name}
                  </td>
                  <td className="px-2 py-2 font-mono text-emerald-700 whitespace-nowrap">{fmtBRL(r.valorRecompensa)}</td>
                  <td className="px-2 py-2 font-mono text-emerald-700 whitespace-nowrap">{fmtBRL(r.valorLounge)}</td>
                  <td className="px-2 py-2 font-mono text-emerald-700 whitespace-nowrap">{fmtBRL(r.valorSeguroOutros)}</td>
                  <td className="px-2 py-2 font-mono whitespace-nowrap">
                    {r.anuidadePaga > 0 ? (
                      <span className="text-rose-700">-{fmtBRL(r.anuidadePaga)}</span>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>
                  <td className={`px-2 py-2 font-mono font-semibold whitespace-nowrap ${
                    r.ganhoTotal >= 0 ? "text-emerald-700" : "text-rose-700"
                  }`}>
                    {fmtBRL(r.ganhoTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-stone-400 mt-2">
            <span className="text-rose-600 font-medium">Em vermelho</span>: cartões que exigem mais investimento do que o seu teto definido nos parâmetros gerais.
          </p>
        </section>

        <p className="text-xs text-stone-400 mt-6">
          Valores de anuidade, thresholds, taxas de pontos e estimativas de seguro/salas VIP são baseados
          em informações públicas de 2026 e sujeitos a mudança — confirme direto no app/site do banco.
          Não é recomendação de investimento.
        </p>
      </div>
    </div>
  );
}
