# Vitória em Foco

Webapp/PWA mobile-first para preparação de concursos públicos no Brasil. Nome provisório atual: **Vitória em Foco** (não tratar como marca final). O produto deve cobrir concursos federais, estaduais e municipais de todos os estados e municípios brasileiros, com fluxo extremamente simples para usuários pouco familiarizados com tecnologia.

DIREÇÃO VISUAL OBRIGATÓRIA:

- Não fazer landing page SaaS genérica de IA.
- Evitar estética padrão roxo/azul neon, excesso de glassmorphism genérico, cards repetitivos e hero centralizado sem personalidade.
- Queremos interface premium, tecnológica, viva, altamente interativa e animada.
- Usar React/TypeScript/Tailwind com componentes próprios; shadcn/ui apenas como base quando fizer sentido, nunca com aparência de template cru.
- Animações com Framer Motion e, onde fizer sentido, GSAP.
- Hero com WebGL/Three.js/React Three Fiber de qualidade, com função narrativa e não apenas objeto 3D decorativo aleatório.
- Scroll storytelling, word reveal, transições de cards, microinterações, feedback visual tátil, progresso e animações de conquista.
- Em mobile manter experiência rica: adaptar WebGL/partículas com engenharia, lazy-load, pausar fora da viewport e respeitar prefers-reduced-motion. Não transformar mobile em versão chapada.
- Criar design system próprio com tipografia, espaçamento, bordas, sombras, tokens, estados e componentes. Não usar estética de ‘AI slop’.

PRODUTO:
Fluxo inicial em poucos passos:

1. Escolher Estado.
2. Escolher Cidade.
3. Mostrar concursos daquela cidade dentro do próprio webapp.
4. Selecionar concurso/cargo.
5. Se não existir, opção simples ‘Enviar edital’.
6. Informar disponibilidade de estudo em blocos simples: manhã, almoço, transporte, noite e quantidade de tempo.
7. Diagnóstico inicial curto com questões.
8. Gerar ‘Plano Intensivo de Aprovação’ adaptado aos dias restantes.

O sistema futuramente analisará o edital inteiro, não só matérias: escolaridade, vagas, datas, banca, pesos, conteúdo, TAF, psicológico, médico, investigação social, títulos, redação, documentos e demais etapas. Nesta primeira versão visual, use dados simulados claramente separados da camada real de dados.

GAMIFICAÇÃO:

- Home logada deve parecer uma experiência de jogo/progresso, não dashboard corporativo.
- ‘Missão de hoje’ como elemento principal.
- XP, nível, sequência de dias, progresso até a prova, conquistas, metas, simulados como ‘desafios’ e feedback visual de acerto/erro.
- Explicações de questões devem ser curtas, didáticas e memoráveis, com possibilidade futura de analogias, mnemônicos e palácio de memória.
- Não infantilizar; é adulto, moderno, energético e divertido.

TELAS INICIAIS A CRIAR AGORA:

- Landing page/hero animado com CTA principal ‘Encontrar meu concurso’.
- Fluxo Estado > Cidade > Concurso > Cargo.
- Tela ‘Enviar edital’.
- Tela de disponibilidade de estudo.
- Diagnóstico de 10 questões com interação A/B/C/D.
- Dashboard do aluno com Missão de Hoje, XP, sequência, progresso, próximas etapas do concurso e CTA de continuar.
- Tela de questão com feedback visual e explicação.
- Tela de plano de 30 dias com visual de rota/progresso.
- Paywall visual após parte gratuita, com ‘Desbloquear plano completo’.

ARQUITETURA:

- Estruturar como PWA instalável.
- Componentes reutilizáveis e tipos fortes.
- Separar dados/mock de UI para futura integração com PostgreSQL/Supabase e serviço de IA.
- Preparar rotas separadas.
- Não implementar pagamento real nem banco real ainda.
- Não inventar métricas de aprovação nem depoimentos falsos.

Priorize a qualidade visual, UX e interação. Quero uma primeira versão navegável e coesa, não apenas wireframes.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vitoria-em-foco.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a6a598d5-fc7b-4344-96c6-dfa2b0c12fb2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
