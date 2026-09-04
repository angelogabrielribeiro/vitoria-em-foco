# Vitória em Foco

PWA mobile-first para preparação de concursos públicos, combinando organização de estudos, diagnóstico, gamificação e experiência visual interativa.

🔗 **Demo:** https://vitoria-em-foco.lovable.app

## Sobre o projeto

O Vitória em Foco foi pensado para simplificar a preparação para concursos públicos no Brasil. O usuário percorre um fluxo de localização, concurso, cargo, disponibilidade de estudo e diagnóstico inicial para chegar a um plano de preparação mais direcionado.

A interface utiliza elementos de jogo para transformar progresso, questões e metas em uma experiência menos burocrática e mais envolvente.

## Principais recursos

- Experiência mobile-first / PWA
- Fluxo Estado → Cidade → Concurso → Cargo
- Diagnóstico inicial por questões
- Missão diária e progresso de estudo
- XP, níveis, sequência e conquistas
- Plano de estudo apresentado como rota de progresso
- Estrutura preparada para upload e futura análise de editais
- Separação entre dados simulados e futura camada real de dados
- Experiências 3D e animações adaptadas para mobile

## Stack

- React 19
- TypeScript
- TanStack Start / Router / Query
- Vite
- Tailwind CSS
- Three.js
- React Three Fiber
- Drei
- Framer Motion
- Zod

## Arquitetura

O projeto prioriza componentes reutilizáveis e separação entre interface e dados, permitindo a futura conexão com PostgreSQL/Supabase e serviços de IA sem reconstruir toda a experiência.

## Rodando localmente

```bash
git clone <url-do-repositorio>
cd vitoria-em-foco
npm install
npm run dev
```

## Status

🚧 **Em desenvolvimento.** A versão atual funciona como base navegável e demonstração do produto, enquanto a camada de dados reais e automação de editais continua planejada para etapas posteriores.

## Objetivos técnicos

O projeto é utilizado para explorar PWA, gamificação, UX mobile-first, arquitetura de produto, animações, WebGL e construção de interfaces voltadas a fluxos complexos de forma simples para o usuário.
