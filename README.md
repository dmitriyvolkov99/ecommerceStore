# Онлайн-магазин (E-Commerce Store)

Современный онлайн-магазин с полноценным Backend на .NET и Frontend на Angular, поддерживающий работу с базой данных, кэшированием и платежной системой Stripe.

## 🛠 Стек технологий

### Backend
* **Язык:** C# 10
* **Платформа:** ASP.NET Core
* **База данных:** SQL Server
* **Кэширование:** Redis

### Frontend
* **Фреймворк:** Angular
* **Язык:** TypeScript
* **Стилизация:** TailwindCSS

---

## ⚙️ Настройки конфигурации

Перед запуском Backend-приложения добавьте следующие настройки в ваш файл конфигурации (`appsettings.json` или `appsettings.Development.json` / секреты пользователя):

```json
{
  "Token": {
    "Key": "your_data"
  },
  "StripeSettings": {
    "WhSecret": "your_data",
    "SecretKey": "your_data",
    "PublishableKey": "your_data"
  },
  "ConnectionStrings": {
    "Redis": "localhost",
    "IdentityConnection": "Server=(localdb)\\MSSQLLocalDB;Database=EcommerceIdentity;Trusted_Connection=True;",
    "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=Ecommerce;Trusted_Connection=True;"
  }
}
```

---

## 🚀 Как запустить проект

### 1. Запуск инфраструктуры (Redis)
Для работы кэша запустите Redis в Docker-контейнере:
```bash
docker compose up -d --build
```

### 2. Запуск Backend
Перейдите в папку с проектом API и запустите команду автоматического отслеживания изменений (hot reload):
```bash
dotnet watch run
```
*(Или просто `dotnet run`, если автоперезагрузка не требуется).*

### 3. Запуск Frontend
Перейдите в папку с фронтенд-приложением, установите зависимости (если запускаете впервые) и запустите сервер:
```bash
npm install
npm run start
```

---

## 🌐 Ссылки

После успешного запуска всех компонентов приложение будет доступно по адресу:
👉 **[http://localhost:4200/](http://localhost:4200/)**
