// ===================================================================
// HISTÓRICO DE DADOS (SNAPSHOTS)
// Cada objeto aqui é uma "foto" do baltop numa data específica.
// Sempre que for atualizar o gráfico (uma vez por semana), NÃO apague o snapshot
// antigo — adicione um NOVO objeto no final desta lista. Assim o histórico vai
// se acumulando sozinho, e o seletor de data no site passa a mostrar essa semana
// nova como opção, sem perder as anteriores.
// regiaoA = Kanto (lista do Mandaleri), regiaoB = Johto (lista do Mahou)
// ===================================================================
const snapshots = [
  {
    data: "05/08/2026",
    regiaoA: [
      { nome: "Mandaleri", valor: 2452695562 },
      { nome: "Diig_Uchis", valor: 820464560 },
      { nome: "am4ymon", valor: 277295770 },
      { nome: "piricius", valor: 269528879 },
      { nome: "H0llyWo0D_", valor: 250895509 },
      { nome: "h0llow", valor: 177809204 },
      { nome: "ColT_98", valor: 173253298 },
      { nome: "RuivozX", valor: 151910556 },
      { nome: "PamelaTsukino", valor: 151249460 },
      { nome: "Nynx", valor: 141648035 },
    ],
    regiaoB: [
      { nome: "Mahou", valor: 475141074 },
      { nome: "WolgraD", valor: 364804280 },
      { nome: "adri_wasd", valor: 353317158 },
      { nome: "TIAMAT_", valor: 314974168 },
      { nome: "YuuichiHeinhz", valor: 124354732 },
      { nome: "eilexnn", valor: 107804259 },
      { nome: "0luas", valor: 101989051 },
      { nome: "Juanfefe", valor: 97264216 },
      { nome: "Erustes5", valor: 91426535 },
      { nome: "andy", valor: 88615191 },
    ],
  },
  {
    data: "06/08/2026",
    regiaoA: [
      { nome: "Mandaleri", valor: 2600547562 },
      { nome: "Diig_Uchis", valor: 816164561 },
      { nome: "am4ymon", valor: 310295770 },
      { nome: "piricius", valor: 267060878 },
      { nome: "H0llyWo0D_", valor: 251058149 },
      { nome: "<impactor:account:name>", valor: 173254298 },
      { nome: "h0llow", valor: 169677610 },
      { nome: "RuivoZx", valor: 152689826 },
      { nome: "Nynx", valor: 141648035 },
      { nome: "CikoskiCraft", valor: 130905272 },
    ],
    regiaoB: [
      { nome: "Mahou", valor: 479432074 },
      { nome: "adri_wasd", valor: 352002872 },
      { nome: "TIAMAT_", valor: 314474168 },
      { nome: "Hirosakee", valor: 213092927 },
      { nome: "YuuichiHeinhz", valor: 124354732 },
      { nome: "eilexnn", valor: 109106369 },
      { nome: "0luas", valor: 103486427 },
      { nome: "WolgraD", valor: 102869220 },
      { nome: "Juanfefe", valor: 93825048 },
      { nome: "Erustes5", valor: 92047980 },
    ],
  },
];

// Pega a referência do elemento HTML onde o gráfico será desenhado
const containerGrafico = document.getElementById("grafico");

// Pega a referência dos três botões de alternância de modo, e do seletor de data
const btnLado = document.getElementById("btnLado");
const btnRanking = document.getElementById("btnRanking");
const btnEvolucao = document.getElementById("btnEvolucao");
const seletorData = document.getElementById("seletorData");

// Guarda em qual modo ("lado", "ranking" ou "evolucao") e em qual snapshot (data) o
// gráfico está agora. São essas duas variáveis que decidem o que desenhar na tela
let modoAtual = "lado";
let indiceSnapshotAtual = snapshots.length - 1; // Começa sempre no snapshot mais recente

// Descobre qual é o maior valor dentro do snapshot recebido.
// Isso é usado para calcular a altura das barras em proporção (regra de três),
// assim a barra maior sempre ocupa 100% do espaço disponível.
function obterMaiorValor(regiaoA, regiaoB) {
  const todosValores = [...regiaoA, ...regiaoB].map((pessoa) => pessoa.valor);
  return Math.max(...todosValores);
}

// Cria o elemento HTML de uma única linha do gráfico (nome + barra + valor)
function criarLinha(pessoa, corClasse, maiorValor) {
  const linha = document.createElement("div");
  linha.className = "linha-grafico";

  // Nome da pessoa. Fica dentro de um <div> que reserva o espaço vertical, e um <span>
  // interno é o que realmente gira na diagonal (ver .nome-texto no CSS)
  const nome = document.createElement("div");
  nome.className = "nome-pessoa";

  const nomeTexto = document.createElement("span");
  nomeTexto.className = "nome-texto";
  nomeTexto.textContent = pessoa.nome;
  nome.appendChild(nomeTexto);

  // A "trilha" é o fundo por onde a barra corre — ela que dá o respiro
  // entre a base da coluna e o início da barra colorida
  const trilha = document.createElement("div");
  trilha.className = "trilha-barra";

  // A barra em si: a altura é calculada em % com base no maior valor do gráfico
  const barra = document.createElement("div");
  barra.className = `barra ${corClasse}`;

  // Texto com o valor numérico, flutuando acima do topo da barra.
  // Os dados brutos estão na unidade cheia, mas nos jogos o costume é abreviar
  // milhões como "KK" — por isso dividimos por 1.000.000 antes de formatar.
  const valorTexto = document.createElement("span");
  valorTexto.className = "valor-barra";
  const valorEmMilhoes = pessoa.valor / 1_000_000;
  valorTexto.textContent = `${valorEmMilhoes.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} KK`;
  barra.appendChild(valorTexto);

  trilha.appendChild(barra); // A barra colorida vai dentro da trilha
  linha.appendChild(trilha); // A trilha (com a barra) fica em cima
  linha.appendChild(nome); // O nome da pessoa fica embaixo, como um "eixo X"

  // A altura começa em 0 e só é definida depois de o elemento já estar na tela,
  // isso é o que cria o efeito de "animação de crescimento" da barra (ver transition no CSS)
  requestAnimationFrame(() => {
    const porcentagem = (pessoa.valor / maiorValor) * 100;
    barra.style.height = `${porcentagem}%`;
  });

  return linha;
}

// Modo 1: mostra as duas regiões lado a lado, posição por posição no ranking (1º com 1º, 2º com 2º...)
function desenharLadoALado() {
  const { regiaoA, regiaoB } = snapshots[indiceSnapshotAtual]; // Pega os dados do snapshot escolhido
  containerGrafico.innerHTML = ""; // Limpa o gráfico atual antes de redesenhar
  const maiorValor = obterMaiorValor(regiaoA, regiaoB);

  for (let i = 0; i < 10; i++) {
    containerGrafico.appendChild(criarLinha(regiaoA[i], "regiaoA", maiorValor));
    containerGrafico.appendChild(criarLinha(regiaoB[i], "regiaoB", maiorValor));
  }
}

// Modo 2: junta as duas regiões numa lista só e ordena do maior para o menor valor,
// permitindo ver quem realmente está "na frente" entre as 20 posições no total
function desenharRankingGeral() {
  const { regiaoA, regiaoB } = snapshots[indiceSnapshotAtual]; // Pega os dados do snapshot escolhido
  containerGrafico.innerHTML = "";
  const maiorValor = obterMaiorValor(regiaoA, regiaoB);

  // Junta as duas listas, guardando também de qual região cada pessoa é (para pintar a cor certa)
  const todosComRegiao = [
    ...regiaoA.map((p) => ({ ...p, regiao: "regiaoA" })),
    ...regiaoB.map((p) => ({ ...p, regiao: "regiaoB" })),
  ];

  // Ordena a lista combinada do maior valor para o menor
  todosComRegiao.sort((a, b) => b.valor - a.valor);

  todosComRegiao.forEach((pessoa) => {
    containerGrafico.appendChild(criarLinha(pessoa, pessoa.regiao, maiorValor));
  });
}

// Modo 3: gráfico de linhas mostrando a evolução do total de cada região ao longo
// de todas as datas salvas no histórico (o array "snapshots"). Diferente dos outros
// dois modos, este usa TODOS os snapshots de uma vez, não só o selecionado no dropdown
function desenharEvolucao() {
  containerGrafico.innerHTML = "";

  // Para cada snapshot, soma o valor dos 10 jogadores de cada região.
  // Isso dá um único número por região por data, que é o que o gráfico de linha plota
  const pontos = snapshots.map((snapshot) => ({
    data: snapshot.data,
    totalA: snapshot.regiaoA.reduce((soma, pessoa) => soma + pessoa.valor, 0),
    totalB: snapshot.regiaoB.reduce((soma, pessoa) => soma + pessoa.valor, 0),
  }));

  // ===================================================================
  // DADOS FICTÍCIOS — só para você visualizar como o gráfico fica com mais pontos.
  // Eles NÃO entram no array "snapshots" lá em cima, então não aparecem no seletor
  // de data nem nos modos "Lado a lado"/"Ranking geral" — só aqui na Evolução.
  // Apague estas duas linhas de "pontos.push" quando não precisar mais delas.
  // ===================================================================
  pontos.push(
    { data: "13/08/2026 (fictício)", totalA: 5300000000, totalB: 2100000000 },
    { data: "20/08/2026 (fictício)", totalA: 5550000000, totalB: 1950000000 }
  );

  const maiorTotal = Math.max(...pontos.map((p) => Math.max(p.totalA, p.totalB)));

  // Medidas do "papel" onde o SVG desenha (não são pixels reais da tela — é um sistema
  // de coordenadas próprio que o navegador estica/encolhe sozinho para caber em qualquer tela).
  // A margem esquerda é bem maior que as outras de propósito: é o espaço que os números
  // das linhas de referência (ex: "2.600 KK") precisam para não serem cortados
  const largura = 1000;
  const altura = 420;
  const margem = { topo: 30, baixo: 50, esquerda: 130, direita: 70 };
  const areaLargura = largura - margem.esquerda - margem.direita;
  const areaAltura = altura - margem.topo - margem.baixo;

  // Converte a posição de um snapshot na linha do tempo (0, 1, 2...) numa coordenada X
  function calcularX(indice) {
    if (pontos.length === 1) return margem.esquerda + areaLargura / 2;
    return margem.esquerda + (indice / (pontos.length - 1)) * areaLargura;
  }

  // Converte um valor numa coordenada Y — quanto maior o valor, mais para cima no desenho
  function calcularY(valor) {
    return margem.topo + (1 - valor / maiorTotal) * areaAltura;
  }

  // Monta a string "x,y x,y x,y..." que o atributo "points" da <polyline> espera
  function montarPontos(chave) {
    return pontos.map((p, i) => `${calcularX(i)},${calcularY(p[chave])}`).join(" ");
  }

  // Elementos de SVG não podem ser criados com document.createElement comum — eles
  // pertencem a um "namespace" diferente do HTML, por isso o createElementNS abaixo
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${largura} ${altura}`);
  svg.setAttribute("class", "grafico-linha");

  // Linhas horizontais de referência (25%, 50%, 75%, 100% do maior valor), cada uma
  // com o valor escrito do lado esquerdo — é isso que dá a "escala" do gráfico
  [0.25, 0.5, 0.75, 1].forEach((fracao) => {
    const valorLinha = maiorTotal * fracao;
    const y = calcularY(valorLinha);

    const linhaGuia = document.createElementNS(svgNS, "line");
    linhaGuia.setAttribute("x1", margem.esquerda);
    linhaGuia.setAttribute("x2", largura - margem.direita);
    linhaGuia.setAttribute("y1", y);
    linhaGuia.setAttribute("y2", y);
    linhaGuia.setAttribute("class", "linha-guia");
    svg.appendChild(linhaGuia);

    // O valor da linha, formatado em KK, escrito à esquerda dela
    const rotuloValor = document.createElementNS(svgNS, "text");
    rotuloValor.setAttribute("x", margem.esquerda - 10);
    rotuloValor.setAttribute("y", y - 6);
    rotuloValor.setAttribute("class", "rotulo-valor");
    const valorFormatado = (valorLinha / 1_000_000).toLocaleString("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    rotuloValor.textContent = `${valorFormatado} KK`;
    svg.appendChild(rotuloValor);
  });

  // Desenha a linha de evolução de cada região (uma <polyline> por cor)
  ["totalA", "totalB"].forEach((chave) => {
    const cor = chave === "totalA" ? "regiaoA" : "regiaoB";
    const linha = document.createElementNS(svgNS, "polyline");
    linha.setAttribute("points", montarPontos(chave));
    linha.setAttribute("class", `linha-evolucao ${cor}`);
    svg.appendChild(linha);
  });

  // Desenha os pontos (círculos) em cima da linha e os rótulos de data embaixo
  pontos.forEach((ponto, i) => {
    const x = calcularX(i);

    // Linha vertical tracejada marcando essa data — vai do eixo X até o topo do gráfico,
    // destacando visualmente cada atualização registrada no histórico
    const linhaData = document.createElementNS(svgNS, "line");
    linhaData.setAttribute("x1", x);
    linhaData.setAttribute("x2", x);
    linhaData.setAttribute("y1", margem.topo);
    linhaData.setAttribute("y2", altura - margem.baixo);
    linhaData.setAttribute("class", "linha-data");
    svg.appendChild(linhaData);

    ["totalA", "totalB"].forEach((chave) => {
      const cor = chave === "totalA" ? "regiaoA" : "regiaoB";
      const y = calcularY(ponto[chave]);

      const circulo = document.createElementNS(svgNS, "circle");
      circulo.setAttribute("cx", x);
      circulo.setAttribute("cy", y);
      circulo.setAttribute("class", `ponto-evolucao ${cor}`);

      // O <title> dentro de um elemento SVG faz o navegador mostrar uma dica (tooltip)
      // nativa ao passar o mouse em cima — sem precisar de nenhum código extra para isso
      const dica = document.createElementNS(svgNS, "title");
      const valorEmMilhoes = (ponto[chave] / 1_000_000).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      dica.textContent = `${ponto.data}: ${valorEmMilhoes} KK`;
      circulo.appendChild(dica);

      svg.appendChild(circulo);
    });

    // Rótulo com a data, alinhado embaixo do eixo X nessa posição
    const rotulo = document.createElementNS(svgNS, "text");
    rotulo.setAttribute("x", x);
    rotulo.setAttribute("y", altura - 15);
    rotulo.setAttribute("class", "rotulo-eixo");
    rotulo.textContent = ponto.data;
    svg.appendChild(rotulo);
  });

  containerGrafico.appendChild(svg);
}

// Olha o modoAtual e chama a função de desenho correspondente.
// É essa função que tanto os botões quanto o seletor de data usam para redesenhar a tela
function redesenharGraficoAtual() {
  if (modoAtual === "lado") {
    desenharLadoALado();
  } else if (modoAtual === "ranking") {
    desenharRankingGeral();
  } else {
    desenharEvolucao();
  }

  // No modo evolução o gráfico já mostra TODAS as datas de uma vez, então o seletor
  // de data individual não se aplica — ele fica desabilitado (mas continua visível)
  seletorData.disabled = modoAtual === "evolucao";
}

// Alterna a classe "ativo" entre os três botões, para indicar visualmente qual modo está selecionado
function marcarBotaoAtivo(botaoSelecionado) {
  document.querySelectorAll(".controles .botao").forEach((botao) => botao.classList.remove("ativo"));
  botaoSelecionado.classList.add("ativo");
}

// Quando o botão "Lado a lado" é clicado, muda o modo e redesenha
btnLado.addEventListener("click", () => {
  modoAtual = "lado";
  marcarBotaoAtivo(btnLado);
  redesenharGraficoAtual();
});

// Quando o botão "Ranking geral" é clicado, muda o modo e redesenha
btnRanking.addEventListener("click", () => {
  modoAtual = "ranking";
  marcarBotaoAtivo(btnRanking);
  redesenharGraficoAtual();
});

// Quando o botão "Evolução" é clicado, muda o modo e redesenha
btnEvolucao.addEventListener("click", () => {
  modoAtual = "evolucao";
  marcarBotaoAtivo(btnEvolucao);
  redesenharGraficoAtual();
});

// ===================================================================
// SELETOR DE DATA (o "backup" pedido)
// Preenche o <select> com uma opção para cada snapshot da lista lá em cima,
// e troca o gráfico exibido sempre que o usuário escolhe uma data diferente
// ===================================================================
snapshots.forEach((snapshot, indice) => {
  const opcao = document.createElement("option");
  opcao.value = indice;
  opcao.textContent = snapshot.data;
  seletorData.appendChild(opcao);
});

// Deixa a data mais recente pré-selecionada ao carregar a página
seletorData.value = indiceSnapshotAtual;

// Quando o usuário escolhe outra data no seletor, troca o snapshot exibido
seletorData.addEventListener("change", () => {
  indiceSnapshotAtual = Number(seletorData.value);
  redesenharGraficoAtual();
});

// Desenha o gráfico pela primeira vez assim que a página carrega
redesenharGraficoAtual();