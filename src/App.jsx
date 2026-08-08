import { useState, useMemo } from "react";

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
    gastoNecessario: 3500,
    investNecessario: 20000,
    tipo: "pontos",
    programa: "atomos",
    pontosPorDolar: 2.5,
    acessosVIP: 2,
    seguro: 150,
    outros: 50,
    obs: "Isenção da anuidade alcançada só com o gasto mensal informado. Pontos Átomos: 2,5/US$ no crédito (base, sem exigências extras).",
  },
  {
    id: "c6carbon",
    name: "C6 Carbon",
    banco: "C6 Bank",
    anuidade: 1176,
    gastoNecessario: 8000,
    investNecessario: 50000,
    tipo: "pontos",
    programa: "atomos",
    pontosPorDolar: 2.5,
    acessosVIP: 4,
    seguro: 300,
    outros: 100,
    obs: "Meta de gasto (R$ 8 mil/mês) fica acima do perfil — isenção via investimento em CDB próprio. Pontos Átomos sobem a 2,7-3,5/US$ só com R$ 250 mil a R$ 1 milhão investidos (fora do orçamento de R$ 200 mil).",
  },
  {
    id: "btgblack",
    name: "BTG Black",
    banco: "BTG Pactual",
    anuidade: 480,
    gastoNecessario: 4000,
    investNecessario: 40000,
    tipo: "pontos",
    programa: "livelo",
    pontosPorDolar: 2.2,
    acessosVIP: 4,
    seguro: 150,
    outros: 80,
    obs: "Anuidade proporcional: cada R$1.000 gasto ou R$10.000 investido desconta R$10/mês. Alternativa: 1% de cashback direto em vez de pontos. Programa exato do BTG varia por fonte — tratamos como equivalente à Livelo.",
  },
  {
    id: "santanderunique",
    name: "Santander Unique",
    banco: "Santander",
    anuidade: 1155,
    gastoNecessario: 8000,
    investNecessario: 50000,
    tipo: "pontos",
    programa: "esfera",
    pontosPorDolar: 2.2,
    acessosVIP: 4,
    seguro: 350,
    outros: 120,
    obs: "Isenção exige cumprir 2 de 3 critérios: ser correntista com pacote de serviços ativo, gastar R$ 8 mil/fatura ou ter R$ 50 mil investidos (aqui simplificamos assumindo que o correntista já cumpre o primeiro). Pontuação Esfera varia bastante por segmento (2 a 2,6/US$ nacional); usamos uma média conservadora.",
  },
  {
    id: "santanderunlimited",
    name: "Santander Unlimited",
    banco: "Santander",
    anuidade: 2200,
    gastoNecessario: null,
    investNecessario: 100000,
    tipo: "pontos",
    programa: "esfera",
    pontosPorDolar: 2.6,
    acessosVIP: 10,
    seguro: 450,
    outros: 200,
    obs: "Isenção principal é por renda (R$ 15-20 mil/mês, fora do perfil) — o valor de investimento aqui é uma estimativa, já que o banco não divulga um threshold claro só por investimento. Pontuação Esfera sobe para clientes Select/Agro/Especial (até 3,6/US$ internacional). Salas VIP ilimitadas (Priority Pass + LoungeKey); modelamos como 10x/ano.",
  },
  {
    id: "bradesco",
    name: "Bradesco Visa Infinite",
    banco: "Bradesco",
    anuidade: 1200,
    gastoNecessario: 5000,
    investNecessario: 50000,
    tipo: "pontos",
    programa: "livelo",
    pontosPorDolar: 1.8,
    acessosVIP: 4,
    seguro: 300,
    outros: 100,
    obs: "Isenção por investimento (R$ 50 mil) costuma valer só no 1º ano de campanhas promocionais; a partir do 2º ano o banco cobra gasto mensal recorrente (fontes variam entre R$ 3 mil e R$ 5 mil). Pontuação Livelo: 1,8/US$ em compras nacionais, 2,5/US$ em internacionais — aqui usamos a taxa nacional.",
  },
  {
    id: "bradesconanquim",
    name: "Bradesco Elo Nanquim",
    banco: "Bradesco",
    anuidade: 1600,
    gastoNecessario: 5000,
    investNecessario: 50000,
    tipo: "pontos",
    programa: "livelo",
    pontosPorDolar: 1.8,
    acessosVIP: 2,
    seguro: 250,
    outros: 80,
    obs: "Fontes divergem: há quem diga que não existe isenção total permanente por gasto/investimento fora de campanhas promocionais para novas contas — vale confirmar direto com o gerente antes de contar com isso todo ano.",
  },
  {
    id: "bradescoaeternum",
    name: "Bradesco Aeternum Visa Infinite",
    banco: "Bradesco",
    anuidade: 3000,
    gastoNecessario: null,
    investNecessario: 5000000,
    tipo: "pontos",
    programa: "livelo",
    pontosPorDolar: 4.0,
    acessosVIP: 12,
    seguro: 500,
    outros: 200,
    obs: "Cartão ultra-premium: isenção exige R$ 5 milhões investidos no banco — bem acima do orçamento de R$ 200 mil do perfil. Anuidade exata não é divulgada publicamente (estimativa). Salas VIP próprias (Bradesco Lounge) têm acesso e Dragonpass; modelamos como 12x/ano por não haver limite claro. Use a opção de ignorar custo de oportunidade só se você já se qualifica por outro caminho (ex.: Private Banking).",
  },
  {
    id: "itaupersonnalite",
    name: "Itaú Personnalité Black / Visa Infinite (versão Pontos)",
    banco: "Itaú",
    anuidade: 1200,
    gastoNecessario: 5000,
    investNecessario: 50000,
    tipo: "pontos",
    programa: "iupp",
    pontosPorDolar: 2.5,
    acessosVIP: 4,
    seguro: 300,
    outros: 100,
    obs: "Isenção por investimento caiu de R$ 250 mil para R$ 50 mil em 2026; ou gasto mensal de R$ 5 mil a R$ 20 mil, dependendo do cartão. Existe também uma versão sem programa de pontos/cashback com anuidade zero permanente, não modelada aqui. Taxa de pontos (Iupp) estimada — confirme no app.",
  },
  {
    id: "xpinfinite50",
    name: "XP Visa Infinite (R$ 50 mil investidos)",
    banco: "XP Investimentos",
    anuidade: 0,
    gastoNecessario: null,
    investNecessario: 50000,
    tipo: "cashback",
    cashbackPercent: 0.01,
    acessosVIP: 4,
    seguro: 250,
    outros: 100,
    investimentoObrigatorio: true,
    obs: "Anuidade é zero mesmo sem investir — os R$ 50 mil aqui destravam 4 acessos VIP/ano (2 acessos exigem só R$ 5 mil). Como não há anuidade pra 'pagar em vez de investir', o investimento é obrigatório pra ter esse nível de benefício. Existe alternativa de pontos (até 2,2/dólar, só em compras internacionais), não modelada aqui.",
  },
  {
    id: "xpone",
    name: "XP One Visa Infinite (R$ 5 mil investidos)",
    banco: "XP Investimentos",
    anuidade: 0,
    gastoNecessario: null,
    investNecessario: 5000,
    tipo: "cashback",
    cashbackPercent: 0.008,
    acessosVIP: 2,
    seguro: 150,
    outros: 50,
    investimentoObrigatorio: true,
    obs: "Versão de entrada: anuidade zero, investimento mínimo bem menor — mas, assim como no XP Visa Infinite, esse investimento é obrigatório pra ter o benefício, não uma alternativa à anuidade. Também dá pra escolher pontos Livelo em vez de cashback.",
  },
  {
    id: "nubankultravioleta",
    name: "Nubank Ultravioleta",
    banco: "Nubank",
    anuidade: 0,
    gastoNecessario: null,
    investNecessario: 0,
    tipo: "cashback",
    cashbackPercent: 0.0125,
    acessosVIP: 4,
    seguro: 200,
    outros: 100,
    obs: "Anuidade zero permanente, sem exigência de gasto ou investimento — é liberado por convite/relacionamento (bom score e histórico), não por valor investido. Alternativa: 2,2 pontos por dólar em vez de 1,25% de cashback. Saldo de cashback rende 200% do CDI até ser usado.",
  },
  {
    id: "interblack",
    name: "Inter Black (Win)",
    banco: "Banco Inter",
    anuidade: 0,
    gastoNecessario: null,
    investNecessario: 150000,
    tipo: "pontos",
    programa: "loop",
    baseCalculo: "real",
    pontosPorDolar: 0.5,
    acessosVIP: 10,
    seguro: 300,
    outros: 150,
    investimentoObrigatorio: true,
    obs: "Anuidade zero permanente, mas o pacote completo de benefícios (salas VIP ilimitadas, CDB Mais Limite) pede de R$ 150 mil a R$ 1 milhão investido no Inter — por isso o investimento é obrigatório aqui, não uma alternativa à anuidade. Pontuação do Inter Loop é direto por real gasto (1 ponto a cada R$ 2, ou seja 0,5 ponto/R$), não por dólar como os outros — bem mais baixa que C6 Carbon ou Nubank Ultravioleta, mas compensada pelo custo zero.",
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
        seguroOutros: c.seguro + c.outros,
        acessosVIP: c.acessosVIP,
        taxaRecompensa: c.tipo === "pontos" ? c.pontosPorDolar : c.cashbackPercent,
        ignorarOportunidade: false,
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
  const [cdi, setCdi] = useState(14.15);
  const [cotacaoDolar, setCotacaoDolar] = useState(5.08);
  const [acessosUsadosAno, setAcessosUsadosAno] = useState(4);
  const [valorAcessoVIP, setValorAcessoVIP] = useState(150);

  const [taxaOportunidade, setTaxaOportunidade] = useState(100);
  const [pesoSeguro, setPesoSeguro] = useState(100);
  const [valoresPontos, setValoresPontos] = useState(initValoresPontos);
  const [investimentoMaximo, setInvestimentoMaximo] = useState(10000);

  const [overrides, setOverrides] = useState(initOverrides);
  const [expanded, setExpanded] = useState(null);
  const [mostrarAvancado, setMostrarAvancado] = useState(false);

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
      const cobrePorGasto = c.gastoNecessario !== null && gastoMensal >= c.gastoNecessario;
      const proprioFrac = (ov.rendimentoProprio / 100) * cdiFrac;
      let custoOportunidade = 0;
      let via = "gasto";
      let viavel = true;
      if (!cobrePorGasto) {
        via = "investimento";
        const excedeOrcamento = c.investNecessario > investimentoMaximo;

        custoOportunidade = ov.ignorarOportunidade
          ? 0
          : Math.round(c.investNecessario * (oportunidadeFrac - proprioFrac));

        if (c.investimentoObrigatorio) {
          if (excedeOrcamento && !ov.ignorarOportunidade) {
            via = "inviável";
            viavel = false;
          }
        } else {
          if (!ov.ignorarOportunidade && (excedeOrcamento || custoOportunidade > c.anuidade)) {
            custoOportunidade = c.anuidade;
            via = excedeOrcamento ? "anuidade (orçamento insuficiente)" : "anuidade (mais barato)";
          }
        }
        if (c.investNecessario === 0) via = "gratuito";
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
      const valorSeguroOutros = ov.seguroOutros * (pesoSeguro / 100);

      const totalBeneficios = valorRecompensa + valorLounge + valorSeguroOutros;
      const ganhoTotal = totalBeneficios - custoOportunidade;

      return {
        ...c,
        ov,
        cobrePorGasto,
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
      };
    });

    return rows.sort((a, b) => {
      if (a.viavel !== b.viavel) return a.viavel ? -1 : 1;
      return b.ganhoTotal - a.ganhoTotal;
    });
  }, [gastoMensal, cdi, taxaOportunidade, cotacaoDolar, acessosUsadosAno, valorAcessoVIP, pesoSeguro, valoresPontos, investimentoMaximo, overrides]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-6 border-b border-stone-300 pb-4">
          <p className="text-xs uppercase tracking-widest text-amber-700 font-semibold mb-1">
            Ranking em reais — editável por cartão
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Cartões premium: valor líquido por ano
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Total = − custo de oportunidade + pontos/cashback + salas VIP + seguro/outros. Quando investir
            custaria mais caro que a própria anuidade, o modelo assume que você paga a anuidade em vez de
            investir — o custo nunca passa do valor da anuidade cheia. A anuidade evitada por gasto
            aparece só como referência, fora da soma.
          </p>
        </header>

        {/* Parâmetros gerais */}
        <section className="bg-white border border-stone-200 rounded-lg p-4 mb-5">
          <h2 className="font-serif font-semibold text-stone-800 mb-3">Parâmetros gerais</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <CampoManual label="Gasto mensal no cartão" value={gastoMensal} onChange={setGastoMensal}
              desc="Quanto você gasta por mês no cartão — define se a isenção de anuidade sai de graça pelo gasto ou exige investimento." />
            <CampoManual label="Investimento máximo disponível" value={investimentoMaximo} onChange={setInvestimentoMaximo}
              desc="Teto de capital que você poderia realmente destinar pra isenção de anuidade. Cartões que exigem mais que isso não ficam mais disponíveis pela via de investimento." />
            <Campo label="Cotação do dólar" valor={`R$ ${cotacaoDolar.toFixed(2)}`} min={4.5} max={6.0} step={0.01}
              onChange={setCotacaoDolar} desc="Câmbio usado para converter 'pontos por dólar' em pontos por real gasto, nos cartões que usam esse método de cálculo.">
              {cotacaoDolar}
            </Campo>
            <Campo label="Vezes/ano que você usaria salas VIP" valor={`${acessosUsadosAno}x`} min={0} max={12} step={1}
              onChange={setAcessosUsadosAno} desc="Quantos acessos você realmente aproveitaria por ano — cada cartão usa o menor valor entre isso e o limite que ele oferece.">
              {acessosUsadosAno}
            </Campo>
            <Campo label="Valor por acesso à sala VIP" valor={fmtBRL(valorAcessoVIP)} min={0} max={300} step={10}
              onChange={setValorAcessoVIP} desc="Quanto vale pra você, em reais, cada visita a uma sala VIP (referência: preço avulso costuma ficar entre R$ 100 e R$ 200).">
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
                <Campo label="Peso do seguro (ajuste geral)" valor={`${pesoSeguro}%`} min={0} max={200} step={10}
                  onChange={setPesoSeguro}
                  desc="Escala pra cima ou pra baixo o valor de seguro/outros benefícios de todos os cartões de uma vez — útil pra testar 'e se eu valorizasse menos esse tipo de proteção?' sem mexer cartão por cartão.">
                  {pesoSeguro}
                </Campo>
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
                      <Campo label="Seguro + outros benefícios (R$/ano)" valor={fmtBRL(r.ov.seguroOutros)}
                        min={0} max={800} step={10} onChange={(v) => setOv(r.id, "seguroOutros", v)}
                        desc="Estimativa do valor anual de seguro viagem, proteção de compras, concierge e outros extras que não são pontos nem salas VIP.">
                        {r.ov.seguroOutros}
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
                        <span>
                          Já tenho a isenção garantida — ignorar custo de oportunidade. Marque se você já
                          investe o necessário em outro produto, ou já bate a meta de gasto por outro
                          motivo, então esse capital não é um custo extra pra ter este cartão.
                        </span>
                      </label>
                    </div>

                    {/* Aviso de inviabilidade */}
                    {!r.viavel && (
                      <div className="bg-rose-50 border border-rose-300 rounded-md p-2 text-xs text-rose-700">
                        Não alcançável com o seu investimento máximo: exige {fmtBRL(r.investNecessario)}, acima
                        do teto de {fmtBRL(investimentoMaximo)}. Os valores abaixo são hipotéticos (como se
                        você conseguisse investir o necessário) — na prática, esse nível de benefício fica fora
                        do seu orçamento.
                      </div>
                    )}

                    {/* Detalhamento */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
                      {r.via.startsWith("anuidade") ? (
                        <>
                          <span>
                            Anuidade paga
                            {r.via.includes("orçamento") ? " (investimento excede o teto)" : " (mais barato que investir)"}
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
                      {!r.cobrePorGasto && !r.via.startsWith("anuidade") && r.via !== "gratuito" && r.via !== "inviável" && (
                        <>
                          <span>Capital exigido{r.investimentoObrigatorio ? " (obrigatório)" : ""}</span>
                          <span className="text-right">{fmtBRL(r.investNecessario)}</span>
                          <span>Custo de oportunidade{r.ov.ignorarOportunidade ? " (ignorado)" : ""}</span>
                          <span className={`text-right ${r.ov.ignorarOportunidade ? "text-stone-400" : "text-rose-700"}`}>
                            -{fmtBRL(r.custoOportunidade)}/ano
                          </span>
                        </>
                      )}
                      {r.via === "inviável" && (
                        <>
                          <span>Capital exigido (acima do seu teto)</span>
                          <span className="text-right text-rose-700">{fmtBRL(r.investNecessario)}</span>
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

        <p className="text-xs text-stone-400 mt-6">
          Valores de anuidade, thresholds, taxas de pontos e estimativas de seguro/salas VIP são baseados
          em informações públicas de 2026 e sujeitos a mudança — confirme direto no app/site do banco.
          Não é recomendação de investimento.
        </p>
      </div>
    </div>
  );
}
