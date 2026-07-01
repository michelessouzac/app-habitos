# PROJECT RULES

Este projeto é um aplicativo pessoal de controle de hábitos, começando com ingestão de água e evoluindo futuramente para outros hábitos como corrida, sono, leitura e rotina diária.

O objetivo principal é criar uma experiência simples, rápida e extremamente fluida, inspirada em aplicativos nativos do iOS.

---

## 🎯 Objetivo do Produto

- Permitir registro rápido de hábitos diários.
- Fornecer visão clara de progresso (diário, semanal, mensal e anual).
- Ajudar na consistência de hábitos ao longo do tempo.
- Ser leve, rápido e agradável de usar diariamente.

---

## 📱 Experiência do Usuário (UX)

- Foco absoluto em rapidez de registro (máximo de 1-2 cliques).
- Interface mobile-first (prioridade total para uso em iPhone).
- Design limpo, minimalista e inspirado no iOS.
- Feedback visual imediato após ações do usuário.
- Evitar excesso de informações na tela.

---

## 🎨 Direção de Design

- Visual inspirado no Human Interface Guidelines da Apple.
- Bordas arredondadas.
- Tipografia clara e legível.
- Espaçamento generoso entre elementos.
- Uso moderado de cores (principalmente para status e progresso).
- Modo claro e escuro consistente com o sistema.

---

## 🧠 Regras de Lógica de Negócio

### Ingestão de Água

- Registro diário em mililitros (ml).
- Meta diária configurável.
- O usuário pode adicionar múltiplos registros no mesmo dia.
- O total diário é a soma de todos os registros do dia.

### Estatísticas

- Suporte a visualização por:
  - Semana
  - Mês
  - Ano

- Cálculo de média:
  - A média considera apenas dias com registro.
  - Dias sem registro NÃO entram como zero.

- Exibir também:
  - Total consumido no período
  - Número de dias registrados
  - Percentual de dias que atingiram a meta

---

## 📊 Regras de Cálculo

- Total diário = soma de registros do dia.
- Total do período = soma dos totais diários.
- Média = soma dos dias com registro ÷ número de dias com registro.
- Meta atingida = total diário >= meta definida.

---

## 🧩 Arquitetura do Código

- Código modular e organizado por responsabilidade.
- Componentes reutilizáveis sempre que possível.
- Separação clara entre:
  - UI (interface)
  - Lógica de negócio
  - Dados / armazenamento

- Evitar duplicação de código.
- Manter funções pequenas e claras.

---

## ⚙️ Regras de Desenvolvimento

- Não remover funcionalidades existentes sem solicitação explícita.
- Sempre preservar compatibilidade com dados já registrados.
- Novas funcionalidades devem ser adicionadas de forma incremental.
- Evitar refatorações grandes sem necessidade.

---

## 📦 Evolução do Produto

Este projeto deve evoluir em fases:

### Fase 1 - Base
- Registro de água
- Meta diária
- Persistência de dados

### Fase 2 - Estatísticas
- Histórico semanal, mensal e anual
- Média de consumo
- Resumo de performance

### Fase 3 - Engajamento
- Streak (dias consecutivos)
- Feedback visual de meta atingida
- Melhorias de UX

### Fase 4 - Expansão
- Novos hábitos:
  - Corrida
  - Sono
  - Leitura
  - Rotina diária

---

## 🚨 Regras para IA (Codex / Assistente)

- Sempre ler este arquivo antes de implementar mudanças.
- Nunca quebrar funcionalidades existentes.
- Sempre priorizar simplicidade e clareza.
- Manter consistência visual com padrão iOS.
- Implementações devem ser incrementais, não disruptivas.

---

## 🧭 Filosofia do Produto

Este não é um app complexo.

É um sistema pessoal de consistência.

Menos fricção → mais uso diário → melhores hábitos.
