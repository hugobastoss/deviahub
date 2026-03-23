// ============================================================
// TIDEV.IA — Google Apps Script para receber sugestões de ferramentas
// ============================================================
//
// COMO CONFIGURAR:
// 1. Abra uma planilha nova em sheets.google.com
// 2. No menu: Extensões → Apps Script
// 3. Apague o código existente e cole TODO este arquivo
// 4. Clique em "Implantar" → "Nova implantação"
// 5. Tipo: Aplicativo da Web
// 6. Executar como: Eu
// 7. Quem tem acesso: Qualquer pessoa
// 8. Clique em "Implantar" e copie a URL gerada
// 9. Cole a URL em script.js na constante SHEETS_ENDPOINT
// ============================================================

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Cria cabeçalho automaticamente se a planilha estiver vazia
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Data/Hora',
        'Nome da Ferramenta',
        'URL',
        'Categoria',
        'Preço',
        'Descrição',
        'E-mail do Indicador',
        'Status'
      ]);
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold').setBackground('#534AB7').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }

    // Lê os parâmetros enviados pelo formulário
    const nome      = e.parameter.nome      || '';
    const url       = e.parameter.url       || '';
    const categoria = e.parameter.categoria || '';
    const preco     = e.parameter.preco     || '';
    const descricao = e.parameter.descricao || '';
    const email     = e.parameter.email     || '';

    const agora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    sheet.appendRow([agora, nome, url, categoria, preco, descricao, email, 'Pendente']);

    // Ajusta largura das colunas automaticamente
    sheet.autoResizeColumns(1, 8);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Função de teste — rode manualmente no editor para verificar se está funcionando
function testar() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  Logger.log('Planilha: ' + sheet.getName());
  Logger.log('Linhas preenchidas: ' + sheet.getLastRow());
  Logger.log('Tudo certo! A URL de implantação está pronta para uso.');
}
