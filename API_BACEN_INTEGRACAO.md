# Integração com API Oficial do BACEN (SGS)

## 📊 Visão Geral

A aplicação agora integra-se com a **API Oficial do Banco Central do Brasil (SGS - Sistema de Gerenciamento de Séries Temporais)** para obter dados de índices econômicos em tempo real e automatizado.

## 🔗 Endpoints da API

### Base URL
```
https://api.bcb.gov.br
```

### Séries Disponíveis

#### 1. **Poupança (Série 195)**
- **Nome**: Rentabilidade da Poupança
- **Período**: A partir de maio/2012
- **Tipo**: Diário
- **URL**: `https://api.bcb.gov.br/dados/serie/bcdata.sgs.195/dados?formato=json`

**Exemplo de Requisição:**
```
GET https://api.bcb.gov.br/dados/serie/bcdata.sgs.195/dados?formato=json&dataInicial=01/01/2023&dataFinal=31/12/2023
```

#### 2. **IGP-M (Série 189)**
- **Nome**: Índice Geral de Preços - Mercado
- **Período**: A partir de 1989
- **Tipo**: Mensal (divulgado no 1º dia útil do mês)
- **URL**: `https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados?formato=json`

**Exemplo de Requisição:**
```
GET https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados?formato=json&dataInicial=01/01/2023&dataFinal=31/12/2023
```

## 📋 Parâmetros de Consulta

| Parâmetro | Obrigatório | Descrição |
|-----------|------------|-----------|
| `formato` | Sim | `json` - Retorna dados em formato JSON |
| `dataInicial` | Sim para séries diárias | Data no formato `dd/mm/aaaa` |
| `dataFinal` | Não | Data no formato `dd/mm/aaaa`. Se não informada, retorna até hoje |

### ⚠️ Limitações da API

- **Janela Máxima**: 10 anos por requisição
- **Séries Diárias**: Obrigatório informar `dataInicial`
- **Séries Mensais**: Também requer `dataInicial` (IGP-M é divulgado no 1º dia útil do mês)

## 📊 Formato de Resposta

### Estrutura JSON

```json
[
  {
    "data": "01/01/2023",
    "valor": "0.5345"
  },
  {
    "data": "02/01/2023",
    "valor": "0.5343"
  }
]
```

### Campos
- **data**: Data do registro (dd/mm/yyyy)
- **valor**: Valor percentual do índice (em percentual, sem o símbolo %)

## 🔄 Fluxo de Integração na Aplicação

### 1. GET `/api/gerenciar-indices`

Busca dados atualizados da API do BACEN:

```typescript
// Retorna todos os índices
GET /api/gerenciar-indices

// Retorna apenas Poupança
GET /api/gerenciar-indices?indice=poupanca

// Retorna apenas IGP-M
GET /api/gerenciar-indices?indice=igpm
```

**Response 200:**
```json
{
  "Poupança": [
    {
      "mes": 1,
      "ano": 2023,
      "valor": 0.5345,
      "fonte": "BACEN - SGS API",
      "dataAtualizado": "2026-01-23T10:30:00.000Z"
    }
  ],
  "IGP-M": [
    {
      "mes": 1,
      "ano": 2023,
      "valor": 1.2345,
      "fonte": "BACEN - SGS API",
      "dataAtualizado": "2026-01-23T10:30:00.000Z"
    }
  ]
}
```

### 2. POST `/api/gerenciar-indices`

Atualiza um índice com valor customizado:

```json
{
  "indice": "Poupança",
  "mes": 1,
  "ano": 2023,
  "valor": 0.5500
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Índice Poupança 1/2023 atualizado para 0.55",
  "data": {
    "indice": "Poupança",
    "mes": 1,
    "ano": 2023,
    "valor": 0.55,
    "dataAtualizado": "2026-01-23T10:30:00.000Z"
  }
}
```

## 🔍 Tratamento de Dados

### Agregação Diária → Mensal

Como a API da Poupança retorna dados **diários**, a aplicação automaticamente:

1. **Agrupa**: Todos os registros do mesmo mês
2. **Seleciona**: O último valor do mês
3. **Armazena**: Um único registro por mês

**Exemplo:**
```
01/01/2023: 0.5340%
02/01/2023: 0.5343%
03/01/2023: 0.5345% ← Valor final de janeiro/2023
...
31/01/2023: 0.5345%
```

### Validação

- ✅ Mês: 1-12
- ✅ Ano: 1980 até ano atual + 1
- ✅ Valor: Número decimal válido
- ✅ Precision: Até 4 casas decimais

## 📈 Dados Obtidos em Testes

### Poupança (Série 195)
- **Registros Totais**: 3.359 (diários desde 2016)
- **Meses Únicos**: 121 (equivalente aos últimos 10 anos)
- **Última Atualização**: 21/01/2026 - 0.6728%

### IGP-M (Série 189)
- **Registros Totais**: 120 (mensais desde 2016)
- **Meses Únicos**: 120
- **Última Atualização**: 01/12/2025 - -0.01%

## 🚀 Uso na Interface

### Botão "Atualizar dos Índices Oficiais"

Na página de gerenciamento de índices (`/indices`), o botão "Atualizar do BACEN" executa:

```typescript
const response = await fetch('/api/gerenciar-indices?indice=all');
const novosDados = await response.json();
```

Automaticamente:
1. Busca dados do BACEN
2. Agrega dados diários em mensais
3. Atualiza a interface com os valores mais recentes
4. Exibe notificação de sucesso/erro

## 💾 Cache

- **Estratégia**: HTTP Cache Headers
- **Duração**: 1 hora (3600 segundos)
- **Objetivo**: Reduzir carga na API do BACEN e acelerar respostas

## ⚠️ Tratamento de Erros

### Cenários Tratados

| Erro | Ação |
|------|------|
| Timeout/Conexão | Log de erro + Fallback para dados locais |
| Parse inválido | Ignora registros problemáticos |
| Série não encontrada | Retorna array vazio |
| Data inválida | Aplica validação e sanitização |

## 🔗 Referências Oficiais

- **BACEN SGS**: https://www.bcb.gov.br/
- **Documentação da API**: https://www.bcb.gov.br/?id=4638

## 📝 Notas de Implementação

### Limitações Conhecidas

1. **Janela de 10 anos**: A API BACEN aceita máximo 10 anos de histórico por requisição
   - **Solução**: Aplicação usa período fixo (últimos 10 anos)

2. **Taxa de Limite (Rate Limiting)**: Sem limite explícito documentado
   - **Recomendação**: Cache de 1 hora implementado

3. **Disponibilidade**: API operacional 24/7 (mesmo feriados)
   - **Fallback**: Dados locais armazenados como backup

### Melhorias Futuras

- [ ] Suporte a mais séries (IPCA, INPC, CDI, SELIC)
- [ ] Sincronização automática em horários específicos
- [ ] Histórico de atualizações
- [ ] Alertas de anomalias nos dados
- [ ] Comparativo com APIs alternativas (Bacen Dados, IBGE)

## 🧪 Testes

Para testar a integração:

```bash
# Verificar última versão da API
curl "https://api.bcb.gov.br/dados/serie/bcdata.sgs.195/dados?formato=json&dataInicial=23/01/2026&dataFinal=23/01/2026"

# Requisição completa
curl "https://api.bcb.gov.br/dados/serie/bcdata.sgs.195/dados?formato=json&dataInicial=01/01/2023&dataFinal=31/12/2023" | jq '.' | head -20
```

## 📄 Commit

**Commit**: `60b2185`
**Data**: 23/01/2026
**Alterações**: 158 insertions(+), 82 deletions(-)

---

**Última Atualização**: 23/01/2026 - v1.0 (Integração BACEN SGS)
