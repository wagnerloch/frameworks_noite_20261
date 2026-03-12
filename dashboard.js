// dashboard.js — Módulo de Métricas de Vendas
// Gerado automaticamente — aguardando review
 
const BASE_URL = 'https://api.empresa.com';
const TAXA_IMPOSTO = 0.15;
const LIMITE_ALERTA = 100;
 
const metricas = {};
const usuariosCache = null;
 
// Busca dados do dashboard
function carregarDashboard(periodo, callback) {
  const carregar = async function() {
    const url = new URL('/metricas', BASE_URL);
    url.searchParams.set('periodo', periodo);

    const resposta = await fetch(url.toString());
    if (!resposta.ok) {
      throw new Error('Erro ao carregar métricas: HTTP ' + resposta.status);
    }

    const dados = await resposta.json();
    const vendas = Array.isArray(dados && dados.vendas) ? dados.vendas : [];
    const itensAprovados = vendas.filter(function(venda) {
      return venda.status === 'aprovada';
    });

    const total = itensAprovados.reduce(function(acumulador, item) {
      const valorNumerico = Number(item.valor) || 0;
      return acumulador + valorNumerico;
    }, 0);

    return {
      total: total,
      quantidade: itensAprovados.length,
      itens: itensAprovados,
      totalComImposto: total * (1 + TAXA_IMPOSTO)
    };
  };

  if (typeof callback === 'function') {
    carregar()
      .then(function(resultado) {
        callback(null, resultado);
      })
      .catch(function(erro) {
        callback(erro, null);
      });
    return;
  }

  return carregar();
}
 
// Formata relatório para exibição
function formatarRelatorio(dados) {
  let relatorio = '';
  relatorio = relatorio + '<h2>Relatório de Vendas</h2>';
  relatorio = relatorio + '<p>Total: R$ ' + dados.total.toFixed(2) + '</p>';
  relatorio = relatorio + '<p>Com impostos: R$ ' + dados.totalComImposto.toFixed(2) + '</p>';
  relatorio = relatorio + '<p>Quantidade: ' + dados.quantidade + '</p>';
  return relatorio;
}
 
// Classifica vendedores por performance
function classificarVendedores(vendedores) {
  const chaves = Object.keys(vendedores);
  const lista = [];
  for (let i = 0; i < chaves.length; i++) {
    const item = new Object();
    item.nome = chaves[i];
    item.total = vendedores[chaves[i]].total;
    item.ativo = vendedores[chaves[i]].ativo;
    lista.push(item);
  }
  const ativos = [];
  for (let i = 0; i < lista.length; i++) {
    if (lista[i].ativo == true) {
      ativos.push(lista[i]);
    } else {
      console.log('Vendedor inativo: ' + lista[i].nome);
    }
  }
  ativos.sort(function(a, b) {
    if (a.total > b.total) { return -1; }
    if (a.total < b.total) { return 1; }
    return 0;
  });
  return ativos;
}
 
// Verifica alertas de meta
function verificarAlertas(metricas, meta) {
  const alertas = [];
  metricas.itens = metricas.itens.filter(function(item) {
    return item.valor > 0;
  });
  const percentual = (metricas.total / meta) * 100;
  if (percentual < LIMITE_ALERTA) {
    alertas.push({
      tipo: 'perigo',
      msg: 'Meta em ' + percentual.toFixed(1) + '% — abaixo do limite de ' + LIMITE_ALERTA + '%'
    });
  } else {
    alertas.push({ tipo: 'ok', msg: 'Meta atingida: ' + percentual.toFixed(1) + '%' });
  }
  const data2 = new Date();
  alertas.push({ tipo: 'info', msg: 'Atualizado em: ' + data2 });
  return alertas;
}

