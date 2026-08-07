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
    data: "03/08/2026",
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
      { nome: "Mahou", valor: 432383074 },
      { nome: "WolgraD", valor: 367259720 },
      { nome: "adri_wasd", valor: 353467308 },
      { nome: "TIAMAT_", valor: 314474168 },
      { nome: "YuuichiHeinhz", valor: 124354732 },
      { nome: "eilexnn", valor: 107824259 },
      { nome: "0luas", valor: 101723361 },
      { nome: "Juanfefe", valor: 98342746 },
      { nome: "Erustes5", valor: 90455785 },
      { nome: "andy", valor: 88615191 },
    ],
  },
  {
    data: "05/08/2026",
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
const resumoNumeroEl = document.getElementById("resumoNumero");
const resumoLegendaEl = document.getElementById("resumoLegenda");
const podiosWrapEl = document.getElementById("podiosWrap");
const subtituloEl = document.getElementById("subtitulo");
const barraHpKantoEl = document.getElementById("barraHpKanto");
const barraHpJohtoEl = document.getElementById("barraHpJohto");
const cartaoCampeaoEl = document.getElementById("cartaoCampeao");
const telaFlashEl = document.getElementById("telaFlash");
const btnTema = document.getElementById("btnTema");
const btnCopiarLink = document.getElementById("btnCopiarLink");

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


// Retorna o emoji de medalha para as 3 primeiras posições, ou string vazia para o resto
function obterMedalha(posicao) {
  if (posicao === 1) return "🥇 ";
  if (posicao === 2) return "🥈 ";
  if (posicao === 3) return "🥉 ";
  return "";
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
// usada só para calcular o selo de variação — ver calcularVariacao().
// "posicao" (1, 2, 3...) é usada só para mostrar a medalha nos 3 primeiros
function criarLinha(pessoa, corClasse, maiorValor, regiaoAnterior, posicao) {
  const linha = document.createElement("div");
  linha.className = "linha-grafico";

  // Nome da pessoa. Fica dentro de um <div> que reserva o espaço vertical, e um <span>
  // interno é o que realmente gira na diagonal (ver .nome-texto no CSS)
  const nome = document.createElement("div");
  nome.className = "nome-pessoa";

  const nomeTexto = document.createElement("span");
  nomeTexto.className = "nome-texto";
  nomeTexto.textContent = `${obterMedalha(posicao)}${pessoa.nome}`;
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
    containerGrafico.appendChild(criarLinha(regiaoA[i], "regiaoA", maiorValor, anterior?.regiaoA, i + 1));
    containerGrafico.appendChild(criarLinha(regiaoB[i], "regiaoB", maiorValor, anterior?.regiaoB, i + 1));
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

  todosComRegiao.forEach((pessoa, indice) => {
    // Cada pessoa precisa ser comparada com a lista da PRÓPRIA região no snapshot anterior
    const regiaoAnteriorMesma = pessoa.regiao === "regiaoA" ? anterior?.regiaoA : anterior?.regiaoB;
    containerGrafico.appendChild(criarLinha(pessoa, pessoa.regiao, maiorValor, regiaoAnteriorMesma, indice + 1));
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
      rotuloNome.textContent = `${obterMedalha(i + 1)}${pessoa.nome}`;
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
    texto.textContent = `${obterMedalha(i + 1)}${pessoa.nome} — ${porcentagem}%`;

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

  const tonsA = gerarTons(11, 82, 10); // Tons de vermelho, um por posição no ranking de Kanto
  const tonsB = gerarTons(41, 85, 10); // Tons de dourado, um por posição no ranking de Johto

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

  const tonsA = gerarTons(11, 82, 10);
  const tonsB = gerarTons(41, 85, 10);

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
// RESUMO COMPARATIVO
// Frase dinâmica no cabeçalho comparando o total das duas regiões no snapshot
// atualmente selecionado — atualiza toda vez que o snapshot muda
// ===================================================================
function atualizarResumoComparativo() {
  const { regiaoA, regiaoB } = snapshots[indiceSnapshotAtual];
  const totalA = regiaoA.reduce((soma, pessoa) => soma + pessoa.valor, 0);
  const totalB = regiaoB.reduce((soma, pessoa) => soma + pessoa.valor, 0);

  const kantoNaFrente = totalA >= totalB;
  const maiorNome = kantoNaFrente ? "Kanto" : "Johto";
  const menorNome = kantoNaFrente ? "Johto" : "Kanto";
  const maiorTotal = Math.max(totalA, totalB);
  const menorTotal = Math.min(totalA, totalB);

  const percentual = ((maiorTotal - menorTotal) / menorTotal) * 100;
  const percentualFormatado = percentual.toFixed(1).replace(".", ",");

  // Separado em dois elementos: o número grande vem primeiro (como uma citação em
  // destaque de reportagem), a legenda embaixo explica o que ele significa
  resumoNumeroEl.textContent = `${percentualFormatado}%`;
  resumoLegendaEl.textContent = `${maiorNome} à frente de ${menorNome} neste snapshot — Top 10 de cada região`;

  // Barras de HP: cada uma preenche proporcionalmente à fatia daquela região no
  // total combinado (as duas juntas somam 100%, como duas barras de vida numa
  // tela de batalha — a região "na frente" fica com a barra mais cheia)
  const totalCombinado = totalA + totalB;
  barraHpKantoEl.style.width = `${(totalA / totalCombinado) * 100}%`;
  barraHpJohtoEl.style.width = `${(totalB / totalCombinado) * 100}%`;
}

// ===================================================================
// SKINS PERSONALIZADAS
// O minotar.net (usado como reserva abaixo) busca a skin pela API oficial da
// Mojang — só funciona pra contas premium. Se esse for um servidor com contas
// "cracked"/offline, ele não vai achar a skin de ninguém e vai mostrar o Steve
// padrão pra todo mundo. Pra esses casos, adicione o jogador aqui manualmente,
// de duas formas:
//
// 1. Link de fora (ex: NameMC): ache a skin em https://namemc.com/skin/HASH e
//    use https://s.namemc.com/2d/skin/face.png?id=HASH&scale=4
// 2. Arquivo local: salve a imagem do ROSTO (não a skin inteira) numa pasta
//    "skins" dentro do repositório, e use só o caminho relativo (ex: "skins/nome.png")
//
// Quem não estiver nesta lista cai automaticamente no minotar.net (que funciona
// bem se o servidor usa contas oficiais da Mojang)
const skinsPersonalizadas = {
  Mahou: "https://s.namemc.com/2d/skin/face.png?id=3d817103f3ef3dc4&scale=4",
  TIAMAT_: "skinsTIAMAT_.png",
};

// Monta UM pódio (as 3 colunas com cabeça/medalha/nome/valor/degrau) a partir de
// uma lista de pessoas já ordenada — usa só as 3 primeiras. "titulo" é opcional,
// usado só no modo "Por Região" pra identificar de qual região é aquele pódio
function criarPodio(pessoas, titulo) {
  const grupo = document.createElement("div");
  grupo.className = "podio-grupo";

  if (titulo) {
    const tituloEl = document.createElement("h3");
    tituloEl.className = "podio-titulo";
    tituloEl.textContent = titulo;
    grupo.appendChild(tituloEl);
  }

  const podio = document.createElement("div");
  podio.className = "podio";

  pessoas.slice(0, 3).forEach((pessoa, indice) => {
    const posicao = indice + 1; // 1, 2 ou 3

    const lugar = document.createElement("div");
    lugar.className = `podio-lugar lugar-${posicao}`;

    // A cabeça da skin: primeiro olha se esse nome está em skinsPersonalizadas
    // (skins definidas manualmente); se não estiver, usa o minotar.net como reserva.
    // encodeURIComponent evita que nomes com caracteres estranhos (como o
    // "<impactor:account:name>" que apareceu nos dados) quebrem a URL da imagem.
    // Fica dentro de um wrapper porque o efeito "shiny" do 1º lugar usa pseudo-elementos
    // (::before/::after) pra desenhar os brilhinhos, e isso não funciona de forma
    // confiável direto numa tag <img> em todos os navegadores
    const cabecaWrap = document.createElement("div");
    cabecaWrap.className = posicao === 1 ? "podio-cabeca-wrap shiny" : "podio-cabeca-wrap";

    const cabeca = document.createElement("img");
    cabeca.className = "podio-cabeca";
    cabeca.src =
      skinsPersonalizadas[pessoa.nome] ||
      `https://minotar.net/avatar/${encodeURIComponent(pessoa.nome)}/64`;
    cabeca.alt = pessoa.nome;
    cabeca.loading = "lazy";
    cabecaWrap.appendChild(cabeca);

    const medalha = document.createElement("div");
    medalha.className = "podio-medalha";
    medalha.textContent = obterMedalha(posicao).trim();

    const nome = document.createElement("div");
    nome.className = "podio-nome";
    nome.textContent = pessoa.nome;

    const valor = document.createElement("div");
    valor.className = "podio-valor";
    const valorEmMilhoes = pessoa.valor / 1_000_000;
    valor.textContent = `${valorEmMilhoes.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} KK`;

    // O degrau do pedestal, colorido conforme a região (Kanto/Johto) do jogador
    const degrau = document.createElement("div");
    degrau.className = `podio-degrau ${pessoa.regiao}`;
    degrau.textContent = `${posicao}º`;

    lugar.appendChild(cabecaWrap);
    lugar.appendChild(medalha);
    lugar.appendChild(nome);
    lugar.appendChild(valor);
    lugar.appendChild(degrau);
    podio.appendChild(lugar);
  });

  grupo.appendChild(podio);
  return grupo;
}

// Decide QUANTOS pódios mostrar, conforme o modo atual:
// - "ranking" (Ranking geral): um pódio único com o top 3 combinado das duas regiões
// - "lado" (Por Região): dois pódios lado a lado, um para Kanto e outro para Johto
// - "evolucao": nenhum pódio (não existe um "top 3 atual" nesse modo)
function atualizarPodio() {
  const { regiaoA, regiaoB } = snapshots[indiceSnapshotAtual];
  podiosWrapEl.innerHTML = "";

  if (modoAtual === "evolucao") {
    return;
  }

  if (modoAtual === "ranking") {
    const todosComRegiao = [
      ...regiaoA.map((p) => ({ ...p, regiao: "regiaoA" })),
      ...regiaoB.map((p) => ({ ...p, regiao: "regiaoB" })),
    ];
    todosComRegiao.sort((a, b) => b.valor - a.valor);
    podiosWrapEl.appendChild(criarPodio(todosComRegiao, null));
  } else {
    const kanto = regiaoA.map((p) => ({ ...p, regiao: "regiaoA" }));
    const johto = regiaoB.map((p) => ({ ...p, regiao: "regiaoB" }));
    podiosWrapEl.appendChild(criarPodio(kanto, "Kanto"));
    podiosWrapEl.appendChild(criarPodio(johto, "Johto"));
  }
}

// ===================================================================
// CARD DE CAMPEÃO
// Só aparece no modo "Ranking geral": destaca o 1º lugar geral com uma cabeça
// maior e a contagem de quantas vezes essa pessoa já apareceu em 1º no
// histórico de snapshots (até e incluindo a data selecionada agora)
// ===================================================================

// Conta em quantos snapshots (do primeiro até o "ateIndice") essa pessoa foi
// o 1º lugar geral (comparando o maior valor entre as duas regiões)
function contarVezesCampeao(nome, ateIndice) {
  let contagem = 0;

  for (let i = 0; i <= ateIndice; i++) {
    const snap = snapshots[i];
    const todos = [...snap.regiaoA, ...snap.regiaoB];
    const maior = todos.reduce((a, b) => (b.valor > a.valor ? b : a));
    if (maior.nome === nome) contagem++;
  }

  return contagem;
}

function atualizarCartaoCampeao() {
  cartaoCampeaoEl.innerHTML = "";

  if (modoAtual !== "ranking") {
    return; // Só faz sentido no modo que junta as duas regiões numa lista só
  }

  const { regiaoA, regiaoB } = snapshots[indiceSnapshotAtual];
  const todosComRegiao = [
    ...regiaoA.map((p) => ({ ...p, regiao: "regiaoA" })),
    ...regiaoB.map((p) => ({ ...p, regiao: "regiaoB" })),
  ];
  const campeao = todosComRegiao.reduce((a, b) => (b.valor > a.valor ? b : a));

  const vezes = contarVezesCampeao(campeao.nome, indiceSnapshotAtual);

  const cabecaWrap = document.createElement("div");
  cabecaWrap.className = "podio-cabeca-wrap shiny"; // Reaproveita o mesmo efeito shiny do pódio

  const cabeca = document.createElement("img");
  cabeca.className = "podio-cabeca";
  cabeca.src =
    skinsPersonalizadas[campeao.nome] ||
    `https://minotar.net/avatar/${encodeURIComponent(campeao.nome)}/64`;
  cabeca.alt = campeao.nome;
  cabeca.loading = "lazy";
  cabecaWrap.appendChild(cabeca);

  const textos = document.createElement("div");
  textos.className = "cartao-campeao-textos";

  const titulo = document.createElement("div");
  titulo.className = "cartao-campeao-titulo";
  titulo.textContent = "🏆 CAMPEÃO";

  const nome = document.createElement("div");
  nome.className = "cartao-campeao-nome";
  nome.textContent = campeao.nome;

  const valor = document.createElement("div");
  valor.className = "cartao-campeao-valor";
  const valorEmMilhoes = campeao.valor / 1_000_000;
  valor.textContent = `${valorEmMilhoes.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} KK`;

  const historico = document.createElement("div");
  historico.className = "cartao-campeao-historico";
  historico.textContent = `${vezes}ª vez em 1º lugar no histórico`;

  textos.appendChild(titulo);
  textos.appendChild(nome);
  textos.appendChild(valor);
  textos.appendChild(historico);

  cartaoCampeaoEl.appendChild(cabecaWrap);
  cartaoCampeaoEl.appendChild(textos);
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


// ===================================================================
// TEMA CLARO/ESCURO
// Troca o atributo data-tema na tag <html>, que é o que as variáveis de cor no
// CSS (:root e html[data-tema="claro"]) usam para decidir a paleta inteira.
// A escolha fica salva no localStorage, então continua a mesma na próxima visita
// ===================================================================
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-tema", tema);
  btnTema.textContent = tema === "claro" ? "☀️" : "🌙";
  localStorage.setItem("baltop-tema", tema);
}

btnTema.addEventListener("click", () => {
  const temaAtual = document.documentElement.getAttribute("data-tema");
  aplicarTema(temaAtual === "claro" ? "escuro" : "claro");
});

// ===================================================================
// URL COMPARTILHÁVEL
// Guarda modo, data e tipo de gráfico na URL, e lê de volta ao carregar a página —
// assim um link copiado (ver btnCopiarLink) abre exatamente na mesma visualização
// ===================================================================
function atualizarURL() {
  const parametros = new URLSearchParams();
  parametros.set("modo", modoAtual);
  parametros.set("data", indiceSnapshotAtual);
  parametros.set("tipo", tipoGrafico);

  const novaURL = `${window.location.pathname}?${parametros.toString()}`;
  // replaceState (em vez de pushState) não cria uma entrada nova no histórico do
  // navegador a cada clique — senão o botão "voltar" ficaria inutilizável
  window.history.replaceState(null, "", novaURL);
}

// Lê o último modo/tipo de gráfico salvos de uma visita anterior (ver o
// localStorage.setItem em redesenharGraficoAtual). Chamada ANTES de
// restaurarEstadoDaURL(), pra um link compartilhado sempre ter prioridade
function restaurarPreferenciasSalvas() {
  const modoSalvo = localStorage.getItem("baltop-modo");
  const tipoSalvo = localStorage.getItem("baltop-tipo");

  if (["lado", "ranking", "evolucao"].includes(modoSalvo)) {
    modoAtual = modoSalvo;
  }
  if (["colunas", "pizza"].includes(tipoSalvo)) {
    tipoGrafico = tipoSalvo;
  }
}

// Lê o modo/data/tipo salvos na URL (se houver) e aplica ANTES do primeiro desenho.
// Chamado uma única vez, no carregamento da página
function restaurarEstadoDaURL() {
  const parametros = new URLSearchParams(window.location.search);
  const modoURL = parametros.get("modo");
  const dataURL = parametros.get("data");
  const tipoURL = parametros.get("tipo");

  if (["lado", "ranking", "evolucao"].includes(modoURL)) {
    modoAtual = modoURL;
  }
  if (dataURL !== null && snapshots[Number(dataURL)]) {
    indiceSnapshotAtual = Number(dataURL);
  }
  if (["colunas", "pizza"].includes(tipoURL)) {
    tipoGrafico = tipoURL;
  }

  // Sincroniza os botões e o seletor visualmente com o estado que acabou de ser lido
  seletorData.value = indiceSnapshotAtual;
  marcarBotaoAtivo(modoAtual === "lado" ? btnLado : modoAtual === "ranking" ? btnRanking : btnEvolucao);
  marcarBotaoTipoAtivo(tipoGrafico === "pizza" ? btnPizza : btnColunas);
}

btnCopiarLink.addEventListener("click", () => {
  navigator.clipboard.writeText(window.location.href).then(() => {
    // Feedback rápido no próprio botão, sem precisar de um alerta separado
    const textoOriginal = btnCopiarLink.textContent;
    btnCopiarLink.textContent = "Link copiado!";
    window.setTimeout(() => {
      btnCopiarLink.textContent = textoOriginal;
    }, 1500);
  });
});

// ===================================================================
// SUPORTE A TOQUE (celular/tablet)
// :hover não existe de verdade em telas de toque, então o destaque das colunas
// e fatias (pulsar, mostrar nome) não disparava sozinho. Aqui simulamos o mesmo
// efeito: tocar numa coluna/fatia adiciona a classe .toque-ativo (que o CSS já
// sabe animar, ver .toque-ativo no style.css), e tocar fora do gráfico limpa tudo
// ===================================================================
function limparDestaqueToque() {
  document.querySelectorAll(".toque-ativo").forEach((el) => el.classList.remove("toque-ativo"));
  document.querySelectorAll(".pizza-rotulo-hover.visivel").forEach((el) => el.classList.remove("visivel"));
}

// Delegação de evento: como as colunas/fatias são recriadas a cada redesenho,
// escutar no container (que sempre existe) evita ter que reanexar o listener toda vez
containerGrafico.addEventListener(
  "touchstart",
  (evento) => {
    const linha = evento.target.closest(".linha-grafico");
    const fatia = evento.target.closest(".fatia-pizza");

    limparDestaqueToque(); // Só uma coluna/fatia destacada por vez

    if (linha) {
      linha.classList.add("toque-ativo");
    } else if (fatia) {
      fatia.classList.add("toque-ativo");
      // Reaproveita o listener de "mouseenter" já existente em criarPizzaSvg,
      // que preenche e mostra o rótulo central com o nome e a porcentagem
      fatia.dispatchEvent(new Event("mouseenter"));
    }
  },
  { passive: true }
);

// Tocar em qualquer lugar FORA do gráfico limpa o destaque atual
document.addEventListener(
  "touchstart",
  (evento) => {
    if (!containerGrafico.contains(evento.target)) {
      limparDestaqueToque();
    }
  },
  { passive: true }
);


// ← → trocam a data selecionada; 1, 2, 3 trocam entre Lado a lado / Ranking / Evolução.
// Fica desligado enquanto o usuário está digitando em algum campo (busca, seletor)
// ===================================================================
document.addEventListener("keydown", (evento) => {
  const elementoAtivo = document.activeElement;
  const estaDigitando =
    elementoAtivo &&
    (elementoAtivo.tagName === "INPUT" || elementoAtivo.tagName === "SELECT" || elementoAtivo.tagName === "TEXTAREA");
  if (estaDigitando) return; // Não rouba as setas/números de quem está digitando

  if (evento.key === "ArrowLeft" && indiceSnapshotAtual > 0) {
    indiceSnapshotAtual -= 1;
    seletorData.value = indiceSnapshotAtual;
    redesenharGraficoAtual();
  } else if (evento.key === "ArrowRight" && indiceSnapshotAtual < snapshots.length - 1) {
    indiceSnapshotAtual += 1;
    seletorData.value = indiceSnapshotAtual;
    redesenharGraficoAtual();
  } else if (evento.key === "1") {
    modoAtual = "lado";
    marcarBotaoAtivo(btnLado);
    dispararFlash();
    redesenharGraficoAtual();
  } else if (evento.key === "2") {
    modoAtual = "ranking";
    marcarBotaoAtivo(btnRanking);
    dispararFlash();
    redesenharGraficoAtual();
  } else if (evento.key === "3") {
    modoAtual = "evolucao";
    marcarBotaoAtivo(btnEvolucao);
    dispararFlash();
    redesenharGraficoAtual();
  }
});

// Olha o modoAtual e o tipoGrafico e chama a função de desenho correspondente.
// É essa função que os botões, o seletor de data E o controle Colunas/Pizza usam
// para redesenhar a tela
function redesenharGraficoAtual() {
  // O controle Colunas/Pizza só faz sentido em "lado" e "ranking" — no modo evolução ele some
  controlesTipo.style.display = modoAtual === "evolucao" ? "none" : "flex";

  // No estilo de uma reportagem de dados, cada gráfico ganha uma legenda de figura
  // ("FIG. 01 — ..."), como as que aparecem embaixo de imagens em uma matéria
  const legendasFigura = {
    lado: "Fig. 01 — Por Região, Top 10 de cada uma",
    ranking: "Fig. 02 — Ranking geral, Top 20 combinado",
    evolucao: "Fig. 03 — Evolução histórica",
  };
  tituloGrafico.textContent = legendasFigura[modoAtual];

  // O subtítulo também muda por modo — "posição por posição" só faz sentido
  // comparando Kanto e Johto lado a lado, não nos outros dois modos
  const subtitulos = {
    lado: "Comparativo entre as duas regiões, posição por posição",
    ranking: "As 20 pessoas de Kanto e Johto combinadas, do maior para o menor valor",
    evolucao: "Como o total de cada região mudou ao longo das atualizações",
  };
  subtituloEl.textContent = subtitulos[modoAtual];

  // A frase comparativa depende só da data selecionada, não do modo/tipo de gráfico
  atualizarResumoComparativo();
  atualizarPodio();
  atualizarCartaoCampeao();

  // Guarda o estado atual (modo, data, tipo) na URL, pra dar pra compartilhar um link
  // direto que já abre nessa mesma visualização (ver atualizarURL e btnCopiarLink)
  atualizarURL();

  // Lembra o último modo/tipo visto, pra próxima vez que a página for aberta sem
  // um link específico (ver restaurarPreferenciasSalvas, chamada no carregamento)
  localStorage.setItem("baltop-modo", modoAtual);
  localStorage.setItem("baltop-tipo", tipoGrafico);

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

// ===================================================================
// FLASH DE BATALHA
// Um clarão branco rápido ao trocar de modo, como a tela que pisca quando um
// combate começa no jogo. Usado só nas trocas de MODO (Por Região/Ranking/
// Evolução) — trocar só a data ou o tipo de gráfico (Colunas/Pizza) não dispara
// ===================================================================
function dispararFlash() {
  // Remove e força um "reflow" antes de adicionar de novo — sem isso, clicar
  // duas vezes seguidas não reiniciaria a animação (o navegador ignora adicionar
  // uma classe que já está lá)
  telaFlashEl.classList.remove("ativo");
  void telaFlashEl.offsetWidth; // Essa leitura "força" o navegador a recalcular o layout
  telaFlashEl.classList.add("ativo");
}

// ===================================================================
// EFEITO DE CLIQUE
// O cursor em si é uma imagem parada (não dá pra animar via CSS), então esse é
// o "substituto": um pequeno estouro pixelado aparece exatamente onde o mouse
// clicou, em QUALQUER lugar da página, e se remove sozinho quando a animação termina
// ===================================================================
document.addEventListener("click", (evento) => {
  const efeito = document.createElement("div");
  efeito.className = "efeito-clique";
  efeito.style.left = `${evento.clientX}px`;
  efeito.style.top = `${evento.clientY}px`;
  document.body.appendChild(efeito);

  // "animationend" dispara assim que a animação CSS termina — é o gatilho pra
  // remover o elemento do DOM, senão ele ficaria acumulando pra sempre
  efeito.addEventListener("animationend", () => efeito.remove());
});

// Quando o botão "Lado a lado" é clicado, muda o modo e redesenha
btnLado.addEventListener("click", () => {
  modoAtual = "lado";
  marcarBotaoAtivo(btnLado);
  dispararFlash();
  redesenharGraficoAtual();
});

// Quando o botão "Ranking geral" é clicado, muda o modo e redesenha
btnRanking.addEventListener("click", () => {
  modoAtual = "ranking";
  marcarBotaoAtivo(btnRanking);
  dispararFlash();
  redesenharGraficoAtual();
});

// Quando o botão "Evolução" é clicado, muda o modo e redesenha
btnEvolucao.addEventListener("click", () => {
  modoAtual = "evolucao";
  marcarBotaoAtivo(btnEvolucao);
  dispararFlash();
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

  // Pega a cor de fundo do tema ATUAL (claro ou escuro), pra imagem sair coerente
  const corDeFundoAtual = getComputedStyle(document.documentElement).getPropertyValue("--fundo").trim();

  // html2canvas não é instantâneo — sem isso, o clique pareceria não ter feito nada
  const textoOriginalBotao = btnBaixarImagem.textContent;
  btnBaixarImagem.textContent = "Gerando imagem...";
  btnBaixarImagem.disabled = true;

  html2canvas(containerGrafico, { backgroundColor: corDeFundoAtual, scale: 2 })
    .then((canvas) => {
      const link = document.createElement("a");
      const dataDoSnapshot = snapshots[indiceSnapshotAtual].data.replaceAll("/", "-");
      link.download = `baltop-${modoAtual}-${dataDoSnapshot}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    })
    .finally(() => {
      // "finally" roda tanto se deu certo quanto se deu erro, garantindo que o
      // botão sempre volte ao normal
      btnBaixarImagem.textContent = textoOriginalBotao;
      btnBaixarImagem.disabled = false;
    });
});

// Aplica o tema salvo de uma visita anterior (ou "escuro" como padrão)
aplicarTema(localStorage.getItem("baltop-tema") || "escuro");

// Restaura o último modo/tipo salvos localmente — e, se a página foi aberta a
// partir de um link compartilhado, a URL tem prioridade e sobrescreve isso
restaurarPreferenciasSalvas();
restaurarEstadoDaURL();

// Desenha o gráfico pela primeira vez assim que a página carrega
redesenharGraficoAtual();