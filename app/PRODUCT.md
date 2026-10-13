# SGDIT — contexto do produto

Sistema de Gestão de Denúncias de Infrações de Trânsito, para Moçambique (primeiro Maputo).

## O que faz

Um cidadão denuncia uma infração de trânsito com um vídeo gravado no telemóvel, a matrícula e o
local no mapa. O vídeo é analisado automaticamente; se a infração for confirmada, a denúncia segue
para o posto policial cuja jurisdição cobre o local, onde um agente de trânsito a aprova ou arquiva,
com justificação. Um acidente de viação não passa pela análise: vai directo ao posto da zona, cujo
administrador designa um agente. O fluxo do acidente termina aí.

## Quem usa

- **Cidadão**: denuncia e acompanha o estado. Usa sobretudo o telemóvel, muitas vezes na rua.
- **Agente de trânsito**: decide as denúncias confirmadas da jurisdição do seu posto.
- **Administrador do posto**: gere os agentes do posto e designa agentes para os acidentes.
- **Super Administrador**: gere postos, jurisdições, credenciais e vê os relatórios de todo o sistema.

## Tom e identidade

- Institucional e sóbrio: é um serviço público ligado à polícia, tem de inspirar confiança.
- Só branco e o azul `#1E40AF` com os seus tons. Estados distinguem-se pelo preenchimento, não por
  outras cores. Vermelho só em erros e em eliminar.
- Ícones sólidos (Font Awesome, via `src/components/icons.tsx`). Sem emojis, sem gradientes.
- Português de Moçambique, frases curtas, sem jargão técnico para o cidadão.
- Capturas reais da aplicação em vez de ilustrações.
- A página de login mantém o desenho original (círculo SGDIT, cartão centrado).

## Regras de interface

- Componentes partilhados em `src/components/app/` e classes em `src/utils/uiClasses.ts`: uma página
  nova usa-os em vez de repetir classes.
- Datas sempre por `src/utils/datas.ts`; estados e tipos sempre por `src/utils/estadoDenuncia.ts`.
- Listas da mais recente para a mais antiga, 10 por página; os painéis mostram as 3 mais recentes.
- Nunca mostrar números ou dados que não venham do servidor.
