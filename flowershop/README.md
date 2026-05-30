# FlowerShop — курсовой проект

Веб-приложение флористического магазина: распределённый монолит с `frontend/` (React + Vite) и `backend/` (Express + Prisma + PostgreSQL).

## Стек

| Часть | Технологии |
|-------|------------|
| Frontend | React 18, JavaScript, Vite, Zustand, Axios, React Router v6, чистый CSS |
| Backend | Node.js 20, Express, Prisma, JWT, bcrypt, Zod |
| БД | PostgreSQL 15 |
| Запуск | Docker Compose |

## Быстрый старт (Docker)

```bash
cp .env.example .env
docker-compose up --build
```

- Сайт: http://localhost:8080  
- API: http://localhost:3001/api/health  

При первом запуске backend выполняет `prisma db push` и `seed` с тестовыми данными.

### Тестовые пользователи

| Роль | Email | Пароль |
|------|-------|--------|
| Админ | admin@flowers.com | admin123 |
| Клиент | client@example.com | client123 |

## Разработка без Docker

### 1. PostgreSQL

Запустите PostgreSQL 15 и создайте БД `flowershop` (или используйте URL из `.env.example`).

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

API: http://localhost:3001

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Сайт: http://localhost:5173 (прокси `/api` → backend).

Переменная `VITE_API_URL` по умолчанию `/api` (через Vite proxy). Для прямого обращения к API: `VITE_API_URL=http://localhost:3001/api`.

## Структура проекта

```
flowershop/
├── backend/          # Express API, Prisma
│   ├── prisma/
│   └── src/
├── frontend/         # React SPA
│   └── src/
│       ├── styles/   # global, components, admin, responsive
│       ├── pages/
│       └── store/
├── docker-compose.yml
└── README.md
```

## Основные маршруты

### Клиент
- `/` — каталог с фильтрами и пагинацией
- `/product/:id` — карточка товара
- `/favorites`, `/cart`, `/checkout`, `/profile`, `/login`

### Админ (`role: admin`)
- `/admin/flowers` — CRUD цветов, сорта, связи
- `/admin/suppliers`, `/admin/sellers`
- `/admin/lists` — сводные таблицы
- `/admin/reports` — 6 аналитических запросов
- `/admin/supplier-flowers` — привязка цветов к поставщику
- `/admin/orders` — управление заказами

## API (префикс `/api`)

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET /catalog/flowers`, `GET /catalog/flowers/:id`
- `GET|POST|PUT|DELETE /cart` (JWT)
- `GET|POST|DELETE /favorites` (JWT)
- `POST /orders/checkout`, `GET /orders/my` (JWT)
- `/admin/*` — админские эндпоинты (JWT + role admin)

Все ответы в формате JSON.
