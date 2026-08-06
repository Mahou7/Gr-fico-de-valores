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

// Pega a referência do controle secundário (Colunas/Pizza)
const controlesTipo = document.getElementById("controlesTipo");
const btnColunas = document.getElementById("btnColunas");
const btnPizza = document.getElementById("btnPizza");

// Pega a referência dos elementos das 5 novas funcionalidades
const proximaAtualizacaoEl = document.getElementById("proximaAtualizacao");
const notaSaidas = document.getElementById("notaSaidas");
const inputBusca = document.getElementById("buscaJogador");
const btnBaixarImagem = document.getElementById("btnBaixarImagem");
const tituloGrafico = document.getElementById("tituloGrafico");

// Guarda em qual modo ("lado", "ranking" ou "evolucao"), em qual snapshot (data) e em
// qual tipo de gráfico ("colunas" ou "pizza") a tela está agora
let modoAtual = "lado";
let indiceSnapshotAtual = snapshots.length - 1; // Começa sempre no snapshot mais recente
let tipoGrafico = "colunas";

// ===================================================================
// COMPARAÇÃO COM A ATUALIZAÇÃO ANTERIOR (variação, selo "NOVO", quem saiu do Top 10)
// ===================================================================

// Retorna o snapshot imediatamente anterior ao que está selecionado agora,
// ou null se o snapshot atual já for o primeiro do histórico (não há o que comparar)
function obterSnapshotAnterior() {
  return indiceSnapshotAtual > 0 ? snapshots[indiceSnapshotAtual - 1] : null;
}

// Compara uma pessoa com a lista da MESMA região no snapshot anterior, procurando
// pelo nome. Retorna: null (sem snapshot anterior pra comparar), { novo: true }
// (não estava no Top 10 anterior) ou { novo: false, percentual } (a variação em %)
function calcularVariacao(pessoa, regiaoAnterior) {
  if (!regiaoAnterior) return null;
  const anterior = regiaoAnterior.find((p) => p.nome === pessoa.nome);
  if (!anterior) return { novo: true };
  const percentual = ((pessoa.valor - anterior.valor) / anterior.valor) * 100;
  return { novo: false, percentual };
}

// Transforma o resultado de calcularVariacao() num pequeno elemento visual:
// "▲ 12,4%" (verde), "▼ 3,1%" (vermelho) ou o selo "NOVO" (azul). Retorna null
// quando não há nada pra mostrar (sem snapshot anterior)
function criarSeloVariacao(variacao) {
  if (!variacao) return null;

  const selo = document.createElement("span");

  if (variacao.novo) {
    selo.className = "selo-variacao selo-novo";
    selo.textContent = "NOVO";
    return selo;
  }

  const subiu = variacao.percentual >= 0;
  selo.className = `selo-variacao ${subiu ? "selo-alta" : "selo-baixa"}`;
  const percentualFormatado = Math.abs(variacao.percentual).toFixed(1).replace(".", ",");
  selo.textContent = `${subiu ? "▲" : "▼"} ${percentualFormatado}%`;
  return selo;
}

// Descobre quem estava no Top 10 (de cada região) no snapshot anterior mas não
// está mais no snapshot atual — ou seja, quem "caiu" desde a última atualização
function calcularSaidas() {
  const anterior = obterSnapshotAnterior();
  if (!anterior) return [];

  const atual = snapshots[indiceSnapshotAtual];
  const saidas = [];

  [
    { chave: "regiaoA", nomeRegiao: "Kanto" },
    { chave: "regiaoB", nomeRegiao: "Johto" },
  ].forEach(({ chave, nomeRegiao }) => {
    const nomesAtuais = new Set(atual[chave].map((p) => p.nome));
    anterior[chave].forEach((pessoa) => {
      if (!nomesAtuais.has(pessoa.nome)) {
        saidas.push(`${pessoa.nome} (${nomeRegiao})`);
      }
    });
  });

  return saidas;
}

// Atualiza o aviso de quem saiu do Top 10. Só faz sentido nos modos "lado" e
// "ranking" — no modo evolução não existe um "Top 10 atual" pra comparar
function atualizarNotaSaidas() {
  const saidas = modoAtual === "evolucao" ? [] : calcularSaidas();

  if (saidas.length === 0) {
    notaSaidas.textContent = "";
    notaSaidas.style.display = "none";
    return;
  }

  notaSaidas.textContent = `Saíram do Top 10 desde a atualização anterior: ${saidas.join(", ")}`;
  notaSaidas.style.display = "block";
}


// Descobre qual é o maior valor dentro do snapshot recebido.
// Isso é usado para calcular a altura das barras em proporção (regra de três),
// assim a barra maior sempre ocupa 100% do espaço disponível.
function obterMaiorValor(regiaoA, regiaoB) {
  const todosValores = [...regiaoA, ...regiaoB].map((pessoa) => pessoa.valor);
  return Math.max(...todosValores);
}

// Cria o elemento HTML de uma única linha do gráfico (nome + barra + valor).
// "regiaoAnterior" é a lista da mesma região no snapshot anterior (ou undefined),
// usada só para calcular o selo de variação — ver calcularVariacao()
function criarLinha(pessoa, corClasse, maiorValor, regiaoAnterior) {
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

  // Selo de variação (▲/▼/NOVO) em relação à atualização anterior, embaixo do nome
  const selo = criarSeloVariacao(calcularVariacao(pessoa, regiaoAnterior));
  if (selo) nome.appendChild(selo);

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
  const anterior = obterSnapshotAnterior();
  containerGrafico.className = "grafico"; // Garante a classe certa, caso venha do modo pizza
  containerGrafico.innerHTML = ""; // Limpa o gráfico atual antes de redesenhar
  const maiorValor = obterMaiorValor(regiaoA, regiaoB);

  for (let i = 0; i < 10; i++) {
    containerGrafico.appendChild(criarLinha(regiaoA[i], "regiaoA", maiorValor, anterior?.regiaoA));
    containerGrafico.appendChild(criarLinha(regiaoB[i], "regiaoB", maiorValor, anterior?.regiaoB));
  }
}

// Modo 2: junta as duas regiões numa lista só e ordena do maior para o menor valor,
// permitindo ver quem realmente está "na frente" entre as 20 posições no total
function desenharRankingGeral() {
  const { regiaoA, regiaoB } = snapshots[indiceSnapshotAtual]; // Pega os dados do snapshot escolhido
  const anterior = obterSnapshotAnterior();
  containerGrafico.className = "grafico"; // Garante a classe certa, caso venha do modo pizza
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
    // Cada pessoa precisa ser comparada com a lista da PRÓPRIA região no snapshot anterior
    const regiaoAnteriorMesma = pessoa.regiao === "regiaoA" ? anterior?.regiaoA : anterior?.regiaoB;
    containerGrafico.appendChild(criarLinha(pessoa, pessoa.regiao, maiorValor, regiaoAnteriorMesma));
  });
}

// ===================================================================
// GRÁFICOS DE PIZZA (a mesma escolha de "Colunas" ou "Pizza" se aplica aos
// modos "Lado a lado" e "Ranking geral")
// ===================================================================

// Gera uma lista de cores em tons diferentes de um mesmo matiz (hue). Isso é o que
// diferencia visualmente as 10 fatias de uma mesma região — a fatia #1 (maior valor)
// fica mais escura, e vai clareando até a fatia #10 (menor valor)
function gerarTons(matiz, saturacao, quantidade) {
  const tons = [];
  for (let i = 0; i < quantidade; i++) {
    const leveza = quantidade === 1 ? 50 : 62 - (i * (62 - 28)) / (quantidade - 1);
    tons.push(`hsl(${matiz} ${saturacao}% ${leveza}%)`);
  }
  return tons;
}

// Converte um ângulo (0° = topo, girando no sentido horário) numa coordenada X/Y
// em cima da borda do círculo. É a base da matemática para desenhar as fatias
function pontoNoCirculo(cx, cy, raio, anguloGraus) {
  const anguloRad = ((anguloGraus - 90) * Math.PI) / 180;
  return { x: cx + raio * Math.cos(anguloRad), y: cy + raio * Math.sin(anguloRad) };
}

// Monta o "d" (o desenho) de uma única fatia, do centro até a borda e de volta,
// passando pelo arco entre o ângulo inicial e o final
function criarCaminhoFatia(cx, cy, raio, anguloInicial, anguloFinal) {
  const p1 = pontoNoCirculo(cx, cy, raio, anguloInicial);
  const p2 = pontoNoCirculo(cx, cy, raio, anguloFinal);
  const arcoGrande = anguloFinal - anguloInicial > 180 ? 1 : 0; // Fatias de mais de 180° precisam desse ajuste
  return `M ${cx},${cy} L ${p1.x},${p1.y} A ${raio},${raio} 0 ${arcoGrande} 1 ${p2.x},${p2.y} Z`;
}

// Monta uma pizza completa em SVG (as fatias + o rótulo central que aparece no hover)
// a partir de uma lista de pessoas e uma lista de cores (uma cor por pessoa, na mesma ordem)
function criarPizzaSvg(pessoas, cores, tamanho) {
  const total = pessoas.reduce((soma, pessoa) => soma + pessoa.valor, 0);
  const cx = tamanho / 2;
  const cy = tamanho / 2;
  const raio = tamanho / 2 - 12;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${tamanho} ${tamanho}`);
  svg.setAttribute("class", "pizza-svg");

  // O rótulo que aparece centralizado ao passar o mouse numa fatia. Fica escondido
  // (opacity 0) até o JavaScript mostrar ele no "mouseenter" de alguma fatia
  const rotuloGrupo = document.createElementNS(svgNS, "g");
  rotuloGrupo.setAttribute("class", "pizza-rotulo-hover");

  const rotuloFundo = document.createElementNS(svgNS, "circle");
  rotuloFundo.setAttribute("cx", cx);
  rotuloFundo.setAttribute("cy", cy);
  rotuloFundo.setAttribute("r", raio * 0.42);
  rotuloFundo.setAttribute("class", "pizza-rotulo-fundo");

  const rotuloNome = document.createElementNS(svgNS, "text");
  rotuloNome.setAttribute("x", cx);
  rotuloNome.setAttribute("y", cy - 4);
  rotuloNome.setAttribute("class", "pizza-rotulo-nome");

  const rotuloPorcentagem = document.createElementNS(svgNS, "text");
  rotuloPorcentagem.setAttribute("x", cx);
  rotuloPorcentagem.setAttribute("y", cy + 16);
  rotuloPorcentagem.setAttribute("class", "pizza-rotulo-porcentagem");

  rotuloGrupo.appendChild(rotuloFundo);
  rotuloGrupo.appendChild(rotuloNome);
  rotuloGrupo.appendChild(rotuloPorcentagem);

  // Desenha cada fatia, indo de ângulo em ângulo proporcional ao valor de cada pessoa
  let anguloAcumulado = 0;
  pessoas.forEach((pessoa, i) => {
    const porcentagem = (pessoa.valor / total) * 100;
    const anguloInicial = anguloAcumulado;
    anguloAcumulado += (pessoa.valor / total) * 360;
    const anguloFinal = anguloAcumulado;

    const fatia = document.createElementNS(svgNS, "path");
    fatia.setAttribute("d", criarCaminhoFatia(cx, cy, raio, anguloInicial, anguloFinal));
    fatia.setAttribute("fill", cores[i]);
    fatia.setAttribute("class", "fatia-pizza");
    fatia.dataset.nome = pessoa.nome; // Usado pela busca de jogador (ver aplicarBusca)

    // Ao passar o mouse: preenche e mostra o rótulo central com o nome e a porcentagem
    // dessa fatia específica. O "pulsar" e o "crescer/encolher" ficam por conta do CSS
    // (a animação de :hover em .fatia-pizza), aqui só cuidamos do texto
    fatia.addEventListener("mouseenter", () => {
      rotuloNome.textContent = pessoa.nome;
      rotuloPorcentagem.textContent = `${porcentagem.toFixed(1).replace(".", ",")}%`;
      rotuloGrupo.classList.add("visivel");
    });

    fatia.addEventListener("mouseleave", () => {
      rotuloGrupo.classList.remove("visivel");
    });

    svg.appendChild(fatia);
  });

  svg.appendChild(rotuloGrupo); // Por último, para o rótulo ficar sempre por cima das fatias
  return svg;
}

// Monta a legenda (lista de nomes) de uma pizza — uma linha por pessoa, com o
// quadradinho colorido, o nome, a porcentagem e o selo de variação.
// "resolverAnterior" é uma função que recebe a pessoa e devolve a lista da região
// certa no snapshot anterior — precisa ser uma função (não uma lista fixa) porque
// no modo "Ranking geral" cada pessoa pode ser de uma região diferente
function criarPizzaLegenda(pessoas, cores, resolverAnterior) {
  const total = pessoas.reduce((soma, pessoa) => soma + pessoa.valor, 0);

  const legenda = document.createElement("ul");
  legenda.className = "pizza-legenda";
  pessoas.forEach((pessoa, i) => {
    const item = document.createElement("li");
    item.dataset.nome = pessoa.nome; // Usado pela busca de jogador (ver aplicarBusca)

    const swatch = document.createElement("span");
    swatch.className = "pizza-swatch";
    swatch.style.background = cores[i];

    const texto = document.createElement("span");
    const porcentagem = ((pessoa.valor / total) * 100).toFixed(1).replace(".", ",");
    texto.textContent = `${pessoa.nome} — ${porcentagem}%`;

    item.appendChild(swatch);
    item.appendChild(texto);

    if (resolverAnterior) {
      const selo = criarSeloVariacao(calcularVariacao(pessoa, resolverAnterior(pessoa)));
      if (selo) item.appendChild(selo);
    }

    legenda.appendChild(item);
  });

  return legenda;
}

// Junta a pizza (SVG) e a legenda dentro de um grupo, com o título opcional em cima.
// "ladoLegenda" decide de que lado a legenda fica: "esquerda" ou "direita" da pizza —
// é isso que permite cada região "olhar" para o centro do gráfico no modo Lado a lado
function criarPizza(pessoas, cores, titulo, tamanho, ladoLegenda, resolverAnterior) {
  const grupo = document.createElement("div");
  grupo.className = "pizza-grupo";

  if (titulo) {
    const tituloEl = document.createElement("h3");
    tituloEl.className = "pizza-titulo";
    tituloEl.textContent = titulo;
    grupo.appendChild(tituloEl);
  }

  const linha = document.createElement("div");
  linha.className = "pizza-linha";
  if (ladoLegenda === "direita") {
    linha.classList.add("pizza-linha-invertida"); // Inverte a ordem visual, sem mudar o HTML
  }

  const pizzaSvg = criarPizzaSvg(pessoas, cores, tamanho);
  pizzaSvg.classList.add(tamanho > 220 ? "pizza-svg-grande" : "pizza-svg-normal");

  const legenda = criarPizzaLegenda(pessoas, cores, resolverAnterior);

  // A legenda é sempre adicionada primeiro no HTML; quando "invertida", o CSS
  // (flex-direction: row-reverse) que se encarrega de exibir ela do outro lado
  linha.appendChild(legenda);
  linha.appendChild(pizzaSvg);

  grupo.appendChild(linha);
  return grupo;
}

// Modo 1 (pizza): duas pizzas lado a lado, uma para cada região — cada uma mostra
// como o valor está dividido entre os 10 jogadores DAQUELA região. A legenda de Kanto
// fica à esquerda da sua pizza, e a de Johto à direita da sua — cada uma "de um lado"
function desenharLadoALadoPizza() {
  const { regiaoA, regiaoB } = snapshots[indiceSnapshotAtual];
  const anterior = obterSnapshotAnterior();
  containerGrafico.className = "grafico-pizzas";
  containerGrafico.innerHTML = "";

  const tonsA = gerarTons(0, 68, 10); // Tons de vermelho, um por posição no ranking de Kanto
  const tonsB = gerarTons(42, 75, 10); // Tons de dourado, um por posição no ranking de Johto

  containerGrafico.appendChild(criarPizza(regiaoA, tonsA, "Kanto", 220, "esquerda", () => anterior?.regiaoA));
  containerGrafico.appendChild(criarPizza(regiaoB, tonsB, "Johto", 220, "direita", () => anterior?.regiaoB));
}

// Modo 2 (pizza): uma única pizza com as 20 pessoas juntas, mostrando a fatia de
// cada uma dentro do total combinado das duas regiões. Como só existe uma pizza,
// a legenda fica obrigatoriamente de um lado só (à direita, por padrão)
function desenharRankingGeralPizza() {
  const { regiaoA, regiaoB } = snapshots[indiceSnapshotAtual];
  const anterior = obterSnapshotAnterior();
  containerGrafico.className = "grafico-pizzas";
  containerGrafico.innerHTML = "";

  const tonsA = gerarTons(0, 68, 10);
  const tonsB = gerarTons(42, 75, 10);

  // Guarda a posição original de cada pessoa dentro da própria região (0 a 9) e a
  // própria região — a posição decide o tom de cor, e a região decide com qual
  // lista do snapshot anterior comparar na hora de calcular a variação
  const todosComCor = [
    ...regiaoA.map((p, i) => ({ ...p, cor: tonsA[i], regiao: "regiaoA" })),
    ...regiaoB.map((p, i) => ({ ...p, cor: tonsB[i], regiao: "regiaoB" })),
  ];

  // Ordena do maior para o menor valor, para as fatias ficarem em ordem decrescente na pizza
  todosComCor.sort((a, b) => b.valor - a.valor);

  const cores = todosComCor.map((pessoa) => pessoa.cor);
  const resolverAnterior = (pessoa) => (pessoa.regiao === "regiaoA" ? anterior?.regiaoA : anterior?.regiaoB);
  containerGrafico.appendChild(criarPizza(todosComCor, cores, null, 280, "direita", resolverAnterior));
}

// Modo 3: gráfico de linhas mostrando a evolução do total de cada região ao longo
// de todas as datas salvas no histórico (o array "snapshots"). Diferente dos outros
// dois modos, este usa TODOS os snapshots de uma vez, não só o selecionado no dropdown
function desenharEvolucao() {
  containerGrafico.className = "grafico-evolucao"; // Garante a classe certa, caso venha do modo pizza
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

// ===================================================================
// BUSCA DE JOGADOR
// Destaca (com o mesmo efeito de pulso do hover) a coluna, fatia e item de legenda
// cujo nome bate com o que foi digitado, em qualquer gráfico que estiver na tela
// ===================================================================
function aplicarBusca() {
  const termo = inputBusca.value.trim().toLocaleLowerCase("pt-BR");

  // Colunas: cada .linha-grafico tem o nome dentro de um .nome-texto
  document.querySelectorAll(".linha-grafico").forEach((linha) => {
    const nomeTexto = linha.querySelector(".nome-texto");
    const nome = nomeTexto ? nomeTexto.textContent.toLocaleLowerCase("pt-BR") : "";
    linha.classList.toggle("destaque-busca", termo.length > 0 && nome.includes(termo));
  });

  // Fatias de pizza — usam o data-nome guardado em criarPizzaSvg
  document.querySelectorAll(".fatia-pizza").forEach((fatia) => {
    const nome = (fatia.dataset.nome || "").toLocaleLowerCase("pt-BR");
    fatia.classList.toggle("destaque-busca", termo.length > 0 && nome.includes(termo));
  });

  // Itens da legenda da pizza — usam o data-nome guardado em criarPizzaLegenda
  document.querySelectorAll(".pizza-legenda li").forEach((item) => {
    const nome = (item.dataset.nome || "").toLocaleLowerCase("pt-BR");
    item.classList.toggle("destaque-busca-legenda", termo.length > 0 && nome.includes(termo));
  });
}

// ===================================================================
// PRÓXIMA ATUALIZAÇÃO
// Calcula 7 dias após a data mais recente do histórico, e compara com a data de
// hoje no computador de quem está vendo a página (não com a data do histórico)
// ===================================================================
function calcularDiasProximaAtualizacao() {
  const maisRecente = snapshots[snapshots.length - 1].data; // formato "dd/mm/aaaa"
  const [dia, mes, ano] = maisRecente.split("/").map(Number);

  const proxima = new Date(ano, mes - 1, dia);
  proxima.setDate(proxima.getDate() + 7);
  proxima.setHours(0, 0, 0, 0);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  return Math.round((proxima - hoje) / (1000 * 60 * 60 * 24));
}

// Preenche o texto de contagem regressiva. Só precisa rodar uma vez ao carregar a
// página — não muda conforme o usuário troca de modo, data ou tipo de gráfico
function exibirProximaAtualizacao() {
  const dias = calcularDiasProximaAtualizacao();

  if (dias > 1) {
    proximaAtualizacaoEl.textContent = `Próxima atualização em ${dias} dias`;
  } else if (dias === 1) {
    proximaAtualizacaoEl.textContent = "Próxima atualização amanhã";
  } else if (dias === 0) {
    proximaAtualizacaoEl.textContent = "Próxima atualização é hoje";
  } else {
    proximaAtualizacaoEl.textContent = `Atualização atrasada há ${Math.abs(dias)} dia(s)`;
  }
}


// Olha o modoAtual e o tipoGrafico e chama a função de desenho correspondente.
// É essa função que os botões, o seletor de data E o controle Colunas/Pizza usam
// para redesenhar a tela
function redesenharGraficoAtual() {
  // O controle Colunas/Pizza só faz sentido em "lado" e "ranking" — no modo evolução ele some
  controlesTipo.style.display = modoAtual === "evolucao" ? "none" : "flex";

  // Só o modo "Ranking geral" ganha um título — é o único gráfico que junta as
  // duas regiões numa lista só, então vale deixar isso explícito (20 pessoas no total)
  tituloGrafico.textContent = modoAtual === "ranking" ? "Top 20 — Ranking Geral" : "";

  // No modo evolução o gráfico já mostra TODAS as datas de uma vez, então o seletor
  // de data individual não se aplica — ele fica desabilitado (mas continua visível)
  seletorData.disabled = modoAtual === "evolucao";

  // Transição suave: o gráfico atual desaparece rapidamente, o novo é montado
  // "por baixo" enquanto invisível, e só então reaparece — evita a troca seca e
  // instantânea de um gráfico pro outro. Usamos "style.opacity" (não uma classe)
  // porque as funções de desenho abaixo sobrescrevem o className do container inteiro
  containerGrafico.style.opacity = "0";

  window.setTimeout(() => {
    if (modoAtual === "lado") {
      tipoGrafico === "pizza" ? desenharLadoALadoPizza() : desenharLadoALado();
    } else if (modoAtual === "ranking") {
      tipoGrafico === "pizza" ? desenharRankingGeralPizza() : desenharRankingGeral();
    } else {
      desenharEvolucao();
    }

    atualizarNotaSaidas(); // Quem saiu do Top 10 desde a atualização anterior
    aplicarBusca(); // Reaplica o destaque da busca, já que o gráfico foi todo reconstruído

    // O requestAnimationFrame garante que o navegador "perceba" o gráfico novo antes
    // de começar a animar a opacidade de volta para 1, senão a transição não roda
    requestAnimationFrame(() => {
      containerGrafico.style.opacity = "1";
    });
  }, 180); // Combina com a duração da transição de opacity definida no CSS (ver #grafico)
}

// Alterna a classe "ativo" entre os três botões, para indicar visualmente qual modo está selecionado
function marcarBotaoAtivo(botaoSelecionado) {
  document.querySelectorAll(".controles-principal .botao").forEach((botao) => botao.classList.remove("ativo"));
  botaoSelecionado.classList.add("ativo");
}

// Mesma ideia do marcarBotaoAtivo, mas só entre os dois botões do controle secundário
function marcarBotaoTipoAtivo(botaoSelecionado) {
  btnColunas.classList.remove("ativo");
  btnPizza.classList.remove("ativo");
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

// Quando o botão "Colunas" é clicado, muda o tipo de gráfico e redesenha
btnColunas.addEventListener("click", () => {
  tipoGrafico = "colunas";
  marcarBotaoTipoAtivo(btnColunas);
  redesenharGraficoAtual();
});

// Quando o botão "Pizza" é clicado, muda o tipo de gráfico e redesenha
btnPizza.addEventListener("click", () => {
  tipoGrafico = "pizza";
  marcarBotaoTipoAtivo(btnPizza);
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

// Toda vez que o texto da busca muda, reaplica o destaque nos elementos que baterem
inputBusca.addEventListener("input", aplicarBusca);

// Preenche a contagem regressiva pra próxima atualização, uma única vez
exibirProximaAtualizacao();

// ===================================================================
// BAIXAR GRÁFICO COMO IMAGEM
// Usa a biblioteca html2canvas (carregada via <script> no index.html) para
// converter o conteúdo atual de #grafico numa imagem PNG e baixar automaticamente
// ===================================================================
btnBaixarImagem.addEventListener("click", () => {
  // Se a página foi aberta sem internet, a biblioteca externa não carrega
  if (typeof html2canvas === "undefined") {
    alert("Não foi possível gerar a imagem — verifique sua conexão com a internet.");
    return;
  }

  html2canvas(containerGrafico, { backgroundColor: "#0f1115", scale: 2 }).then((canvas) => {
    const link = document.createElement("a");
    const dataDoSnapshot = snapshots[indiceSnapshotAtual].data.replaceAll("/", "-");
    link.download = `baltop-${modoAtual}-${dataDoSnapshot}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});

// Desenha o gráfico pela primeira vez assim que a página carrega
redesenharGraficoAtual();